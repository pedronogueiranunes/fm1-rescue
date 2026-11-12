"""FM-1 Rescue desktop launcher using an installed Chromium-family runtime."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import threading
import time
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from app_paths import RESOURCES, DATA_ROOT, FROZEN

ROOT = RESOURCES
DATA = DATA_ROOT / "desktop-data"
PROFILE = DATA / "profile"


def find_browser(platform=None, environ=None, which=shutil.which):
    platform = platform or sys.platform
    environ = os.environ if environ is None else environ
    distribution = Path(sys.executable).resolve().parent
    candidates = [
        distribution / "browser/chrome-win64/chrome.exe",
        distribution / "browser/chrome-linux64/chrome",
    ] if FROZEN else []
    if platform == "darwin":
        for folder in (Path("/Applications"), Path.home() / "Applications"):
            candidates.extend([
                folder / "Google Chrome.app/Contents/MacOS/Google Chrome",
                folder / "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
                folder / "Chromium.app/Contents/MacOS/Chromium",
            ])
    elif platform == "win32":
        for variable in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"):
            if environ.get(variable):
                folder = Path(environ[variable])
                candidates.extend([
                    folder / "Microsoft/Edge/Application/msedge.exe",
                    folder / "Google/Chrome/Application/chrome.exe",
                    folder / "Chromium/Application/chrome.exe",
                ])
    for name in ("microsoft-edge", "microsoft-edge-stable", "google-chrome",
                 "google-chrome-stable", "chromium", "chromium-browser", "msedge", "chrome"):
        path = which(name)
        if path:
            candidates.append(Path(path))
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    raise RuntimeError(
        "FM-1 Rescue needs an installed Chrome, Edge, or Chromium browser for its desktop window. "
        "Install one, or use FM1-Rescue.command to open the browser version."
    )


def window_command(browser, url):
    parsed = urlsplit(url)
    if parsed.scheme != "http" or parsed.hostname != "127.0.0.1" or not parsed.port or not parsed.fragment:
        raise ValueError("Desktop windows can only open this local recovery session.")
    command = [
        browser, "--app=" + url, "--user-data-dir=" + str(PROFILE),
        "--no-first-run", "--no-default-browser-check",
        "--disable-background-mode", "--disable-background-networking",
        "--disable-component-update", "--disable-sync",
        "--window-size=1240,940", "--class=FM1-Rescue",
    ]
    if os.environ.get("FM1_RESCUE_CI_HEADLESS") == "1":
        if os.environ.get("CI") != "true" or "--live" in sys.argv:
            raise RuntimeError("Headless test mode is restricted to simulated CI sessions.")
        command[1] = url
        command.extend(["--headless=new", "--no-sandbox", "--remote-debugging-port=0"])
    return command


class InstanceLock:
    """Keep exactly one desktop-owned hardware session per application folder."""
    def __init__(self):
        DATA.mkdir(parents=True, exist_ok=True)
        self.file = (DATA / "client.lock").open("a+b")
        if self.file.tell() == 0:
            self.file.write(b"0")
            self.file.flush()
        self.file.seek(0)
        self.owned = False

    def acquire(self):
        try:
            if sys.platform == "win32":
                import msvcrt
                msvcrt.locking(self.file.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(self.file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            self.owned = True
        except OSError:
            pass
        return self.owned

    def close(self):
        self.file.close()


def active_session():
    """The local server authenticates this record before a second launch uses it."""
    record = json.loads((DATA / "session.json").read_text())
    url = record["url"]
    window_command("", url)
    parsed = urlsplit(url)
    request = Request("http://" + parsed.netloc + "/api/state",
                      headers={"X-Rescue-Token": parsed.fragment})
    with urlopen(request, timeout=2) as response:
        state = json.load(response)
    return url, state


class DesktopWindow:
    def __init__(self, browser):
        self.browser = browser
        self.process = None
        self.stopping = threading.Event()
        self.monitor = None

    def spawn(self):
        self.process = subprocess.Popen(window_command(self.browser, self.url),
                                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def __call__(self, url, server, session):
        self.url, self.server, self.session = url, server, session
        temp = DATA / "session.tmp"
        temp.write_text(json.dumps({"url": url, "pid": os.getpid()}))
        if os.name != "nt":
            temp.chmod(0o600)
        temp.replace(DATA / "session.json")
        self.spawn()
        self.monitor = threading.Thread(target=self.watch, name="desktop-window", daemon=True)
        self.monitor.start()

    def watch(self):
        while not self.stopping.wait(.5):
            if self.process.poll() is None:
                continue
            with self.session.lock:
                if self.session.closing:
                    return
                protected = self.session.busy or self.session.protect
                if not protected:
                    self.session.closing = True
            if protected:
                # The backend owns the recovery even if the renderer goes away.
                # Reopen the window to expose its progress and recovery instructions.
                try:
                    self.spawn()
                except OSError:
                    print("Window could not reopen. Recovery remains active at " + self.url, flush=True)
                    return
                self.stopping.wait(2)
            else:
                self.server.shutdown()
                return

    def close(self):
        self.stopping.set()
        if self.monitor is not None:
            self.monitor.join(timeout=3)
        if self.process is not None and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                # Leave an unresponsive renderer to the OS. Recovery is already stopped safely.
                pass
        (DATA / "session.json").unlink(missing_ok=True)


def alert(message):
    if sys.platform == "darwin":
        subprocess.run([
            "/usr/bin/osascript", "-e",
            'on run argv\ndisplay alert "FM-1 Rescue" message (item 1 of argv) as warning\nend run',
            message
        ], check=False)
    elif sys.platform == "win32":
        import ctypes
        ctypes.windll.user32.MessageBoxW(None, message, "FM-1 Rescue", 0x30)
    else:
        program = shutil.which("zenity")
        if program:
            subprocess.run([program, "--error", "--title=FM-1 Rescue", "--text=" + message],
                           check=False)
        else:
            print(message, file=sys.stderr, flush=True)


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    original_stdout, original_stderr = sys.stdout, sys.stderr
    # pythonw and the macOS app have no terminal. Keep startup failures readable.
    with (DATA / "desktop.log").open("a", buffering=1) as log:
        sys.stdout = sys.stderr = log
        lock = InstanceLock()
        window = None
        try:
            import rescue
            args = rescue.parse_options()
            browser = find_browser()
            if not lock.acquire():
                last_error = None
                for _ in range(12):
                    try:
                        url, state = active_session()
                        if state["dry"] == args.live:
                            raise RuntimeError(
                                "FM-1 Rescue is already open in another mode. "
                                "Use Close assistant in that window before changing modes."
                            )
                        subprocess.Popen(window_command(browser, url),
                                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        return
                    except (OSError, ValueError, KeyError) as exc:
                        last_error = exc
                        time.sleep(.25)
                raise RuntimeError("The desktop session is starting. Try opening it again.") from last_error
            window = DesktopWindow(browser)
            if args.no_browser:
                rescue.main()
            else:
                rescue.main(opener=window)
        except Exception as exc:
            import traceback
            traceback.print_exc()
            alert(str(exc) + "\n\nDetails are saved in desktop-data/desktop.log.")
        finally:
            lock.close()
            sys.stdout, sys.stderr = original_stdout, original_stderr


if __name__ == "__main__":
    main()
