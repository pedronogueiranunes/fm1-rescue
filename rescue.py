"""Local FM-1 Rescue interface for MvaveFM1Unbricker 0edc5ad."""
import argparse
from collections import deque
from datetime import datetime
from functools import partial
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import logging
import os
from pathlib import Path
import secrets
import signal
import subprocess
import sys
import threading

from platform_support import KeepAwake
from app_paths import RESOURCES, DATA_ROOT, UPSTREAM

ROOT = RESOURCES
sys.dont_write_bytecode = True
sys.path.insert(0, str(UPSTREAM))
import fm1_transporter_recover as tool

V15 = ROOT.parent / "FM1Backups" / "V15-FM-1.fwsc"
if not V15.is_file():
    V15 = ROOT / "firmware" / "V15-FM-1.fwsc"  # bundled with the standalone app; hash is still checked
if not V15.is_file():
    V15 = DATA_ROOT / "firmware" / "V15-FM-1.fwsc"
V15_HASH = "db1642b2b6fa5c2cccb11ffd13878068bb28601678d3644049f99dc40e7edb8a"
V16_HASH = "d017fb65e70aca97ee29d944470c3515a74581df5c0576bf70de917c7b2b61d5"
UF2 = UPSTREAM / "transporter" / "fm1_transporter.uf2"
if not UF2.is_file():
    UF2 = DATA_ROOT / "firmware" / "fm1_transporter.uf2"
MAX_UPLOAD = 1024 * 1024


def digest(data):
    return hashlib.sha256(data).hexdigest()


class Issue(Exception):
    pass


class Log(logging.Handler):
    def __init__(self, lines):
        super().__init__(logging.DEBUG)
        self.lines = lines

    def emit(self, record):
        if record.levelno >= logging.INFO or record.getMessage().startswith("console: "):
            self.lines.append(record.getMessage())


class FreshRead:
    """Check the full reference on the upstream restore's first read."""
    def __init__(self, transport, reference):
        self.transport = transport
        self.reference = reference
        self.checked = False

    def __getattr__(self, name):
        return getattr(self.transport, name)

    def read_flash(self, address, length, label):
        data = self.transport.read_flash(address, length, label)
        if not self.checked:
            if address != 0 or length != tool.FLASH_SIZE or data != self.reference:
                raise Issue("changed")
            self.checked = True
        return data


class Session:
    def __init__(self, dry_run, mock_flash, root=DATA_ROOT):
        self.dry_run = dry_run
        self.root = root
        self.output = root / ("test-backups" if dry_run else "backups")
        logdir = root / ("test-logs" if dry_run else "logs")
        flags = ["--log-dir", str(logdir)]
        if dry_run:
            flags += ["--dry-run"]
            if mock_flash:
                flags += ["--mock-flash", str(mock_flash)]
        self.args = tool.build_parser().parse_args(flags + ["wizard"])
        tool.setup_logging("fm1-rescue-ui", logdir)
        self.lines = deque(maxlen=450)
        self.handler = Log(self.lines)
        for logger in (tool.log, tool.fu.log):
            logger.addHandler(self.handler)
        self.lock = threading.Lock()
        self.phase = "board"
        self.busy = False
        self.protect = False
        self.closing = False
        self.error = ""
        self.board = ""
        self.booted = False
        self.transport = self.plan = self.reference = self.backup = None

    def state(self):
        with self.lock:
            plan = self.plan
            return dict(phase=self.phase, busy=self.busy, error=self.error, dry=self.dry_run,
                        board=self.board, booted=self.booted, protect=self.protect,
                        bundled_v15=V15.is_file(), uf2_ready=UF2.is_file(),
                        backup=self.backup.name if self.backup else "",
                        plan=dict(sectors=len(plan.write), identity=plan.pkg.identity,
                                  range="0x4000–0x92FFF", hash=V15_HASH) if plan else None,
                        log=self.lines.copy())

    def close_connection(self):
        if self.transport is not None:
            self.transport.close()
            self.transport = None
        tool.stop_console_drain()

    def close(self):
        self.close_connection()
        tool.close_logging()

    def prepare(self, upload):
        path = UF2
        if upload:
            if digest(upload) != tool.TRANSPORTER_UF2_SHA256:
                raise Issue("uf2")
            path = self.root / "firmware" / "fm1_transporter.uf2"
            path.parent.mkdir(parents=True, exist_ok=True)
            tool.write_atomic(path, upload)
        if not path.is_file() and self.dry_run:
            tool.log.info("DRY RUN: simulating XIAO preparation without an external UF2.")
            return
        if not path.is_file() or digest(path.read_bytes()) != tool.TRANSPORTER_UF2_SHA256:
            raise Issue("uf2")
        self.args.uf2 = str(path)
        ports = [] if self.dry_run else tool.rp2_ports()
        if len({p.serial_number or p.device for p in ports}) > 1:
            raise Issue("board")
        if self.dry_run or not any(p.pid == 0x000A for p in ports):
            if tool.cmd_flash_xiao(self.args) != tool.EXIT_OK:
                raise Issue("board")
            tool.stop_console_drain()

    def wire(self, _):
        self.close_connection()
        try:
            self.transport = tool.connect(self.args)
            if not self.dry_run:
                drain = tool._drain
                if not drain or not tool.wait_for(lambda: drain.opens, 8):
                    raise Issue("transporter")
        except Exception:
            self.close_connection()
            raise

    def power(self, _):
        tool.ready(self.transport, self.args)
        tool.check_info(self.transport)

    def dump(self, _):
        self.plan = self.backup = self.reference = None
        data = tool.double_read(self.transport)
        self.backup = tool.save_dump(data, self.output, self.transport.mock)
        self.reference = data

    def check_backup(self):
        if self.reference is None or self.backup is None:
            raise Issue("backup")
        try:
            matches = self.backup.read_bytes() == self.reference
        except OSError:
            matches = False
        if not matches:
            raise Issue("backup")

    def review(self, upload):
        self.check_backup()
        data = upload or V15.read_bytes()
        checksum = digest(data)
        if checksum == V16_HASH:
            raise Issue("v16")
        if checksum != V15_HASH:
            raise Issue("v15")
        package_path = self.output / "packages" / "V15-FM-1.fwsc"
        package_path.parent.mkdir(exist_ok=True)
        tool.write_atomic(package_path, data)
        package = tool.load_restore_package(package_path, True)
        plan = tool.Plan(package, self.reference, self.backup)
        plan.report()
        tool.restore_session(FreshRead(self.transport, self.reference), plan, self.args, False)
        self.plan = plan

    def apply(self, _):
        self.check_backup()
        if digest(self.plan.pkg.path.read_bytes()) != V15_HASH:
            raise Issue("v15")
        awake = KeepAwake(self.dry_run)
        armed = False

        def confirm(args, lines, phrase):
            nonlocal armed
            if phrase != "WRITE":
                raise Issue("awake")
            try:
                awake.check()
            except OSError as exc:
                raise Issue("awake") from exc
            for line in lines:
                tool.log.info(line)
            armed = True

        try:
            try:
                awake.__enter__()
            except OSError as exc:
                raise Issue("awake") from exc
            rc = tool.restore_session(FreshRead(self.transport, self.reference),
                                      self.plan, self.args, True, confirm=confirm)
            if rc != tool.EXIT_OK:
                raise Issue("verify")
        except Exception as exc:
            if armed:
                raise Issue("verify") from exc
            raise
        finally:
            awake.__exit__(None, None, None)

    def start(self, action, body=b""):
        transitions = {
            ("board", "prepare"): (self.prepare, "wire"),
            ("board", "prepare-upload"): (self.prepare, "wire"),
            ("wire", "wire"): (self.wire, "power"),
            ("power", "power"): (self.power, "backup"),
            ("power", "rewire"): (self.wire, "power"),
            ("backup", "backup"): (self.dump, "firmware"),
            ("firmware", "bundled"): (self.review, "review"),
            ("firmware", "upload"): (self.review, "review"),
            ("review", "apply"): (self.apply, "done"),
            ("danger", "backup"): (self.dump, "firmware"),
        }
        with self.lock:
            transition = transitions.get((self.phase, action))
            if self.busy or self.closing or transition is None:
                return False
            if action == "apply" and self.plan.write and body != b"WRITE":
                return False
            if action in ("upload", "prepare-upload") and not body:
                return False
            self.busy, self.error = True, ""
            threading.Thread(target=self.run, args=(*transition, body)).start()
            return True

    def run(self, operation, target, body):
        error = ""
        try:
            operation(body)
            if target == "done":
                try:
                    self.close_connection()
                except Exception:
                    tool.log.exception("Transporter cleanup after verified recovery")
        except Exception as exc:
            tool.log.exception("Operation failed")
            if isinstance(exc, Issue):
                error = str(exc)
            elif "the two reads DIFFER" in str(exc):
                error = "reads"
            else:
                error = {"wire": "board", "power": "transporter",
                         "backup": "uboot"}.get(target, "unknown")
        finally:
            with self.lock:
                if not error:
                    self.phase = target
                    if target == "done":
                        self.protect = False
                elif error == "verify":
                    self.phase = "danger"
                    self.protect = True
                elif error in {"changed", "backup"}:
                    self.phase = "backup"
                self.error, self.busy = error, False

    def detect(self):
        if self.dry_run:
            self.board = "simulated"
            self.booted = self.phase == "done"
            return
        if self.phase == "board" and not self.busy:
            try:
                if tool.find_rp2_volumes():
                    self.board = "rp2"
                elif any(p.pid == 0x000A for p in tool.rp2_ports()):
                    self.board = "transporter"
                else:
                    self.board = ""
            except (OSError, tool.fu.UnbrickError):
                self.board = ""
        if self.phase == "done" and sys.platform == "darwin":
            try:
                usb = subprocess.check_output(["/usr/sbin/ioreg", "-p", "IOUSB", "-l", "-w", "0"],
                                              text=True, timeout=3)
                self.booted = any('"idVendor" = 19530' in block and
                                  ('"USB Product Name" = "FM-1"' in block or
                                   '"USB Product Name" = "Felucca"' in block)
                                  for block in usb.split("+-o "))
            except (OSError, subprocess.SubprocessError):
                self.booted = False

    def backups(self):
        items = []
        for folder in (self.output, UPSTREAM / "backups"):
            for path in sorted(folder.glob("*.bin"), reverse=True):
                try:
                    data = path.read_bytes()
                    if len(data) == tool.FLASH_SIZE:
                        items.append(dict(name=path.name, size=len(data), hash=digest(data),
                                          date=datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
                                          old=folder != self.output))
                except OSError:
                    continue
        return items


class Handler(BaseHTTPRequestHandler):
    def __init__(self, *args, session, token, **kwargs):
        self.session, self.token = session, token
        super().__init__(*args, **kwargs)

    def log_message(self, *_):
        pass

    def response(self, body, mime, status=200):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(body)

    def json(self, value, status=200):
        self.response(json.dumps(value, default=list).encode(), "application/json", status)

    def local(self):
        return self.headers.get("Host") == f"127.0.0.1:{self.server.server_port}"

    def authorized(self):
        return self.local() and secrets.compare_digest(self.headers.get("X-Rescue-Token", ""),
                                                        self.token)

    def do_GET(self):
        if not self.local():
            return self.json({}, 403)
        if self.path == "/api/state" and self.authorized():
            return self.json(self.session.state())
        if self.path == "/api/backups" and self.authorized():
            return self.json(self.session.backups())
        files = {"/": (ROOT / "index.html", "text/html; charset=utf-8"),
                 "/logo.svg": (ROOT / "logo.svg", "image/svg+xml"),
                 "/app.js": (ROOT / "app.js", "text/javascript; charset=utf-8"),
                 "/style.css": (ROOT / "style.css", "text/css; charset=utf-8"),
                 "/wiring.svg": (UPSTREAM / "transporter" / "xiao-wiring.svg", "image/svg+xml")}
        for font in ("manrope-latin-700-normal.woff2", "hanken-grotesk-latin-400-normal.woff2",
                     "hanken-grotesk-latin-500-normal.woff2", "silkscreen-latin-400-normal.woff2"):
            files["/assets/fonts/" + font] = (ROOT / "assets" / "fonts" / font, "font/woff2")
        if self.path not in files:
            return self.json({}, 404)
        path, mime = files[self.path]
        self.response(path.read_bytes(), mime)

    def do_POST(self):
        origin = self.headers.get("Origin")
        if not self.authorized() or origin != "http://" + self.headers["Host"]:
            return self.json({}, 403)
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self.json({}, 400)
        if not 0 <= size <= MAX_UPLOAD:
            return self.json({}, 413)
        action = self.path.removeprefix("/api/")
        if action == "external":
            links = {
                b"author": "https://pedronogueira.dev",
                b"board": "https://www.seeedstudio.com/Seeed-Studio-XIAO-RP2040-Pre-Soldered-p-6333.html",
                b"parts": "https://github.com/Quixotic7/MvaveFM1Unbricker/blob/main/TRANSPORTER-GUIDE.md#parts",
                b"video": "https://www.youtube.com/watch?v=-zk3BxrubBM",
                b"illustrated": "https://quixotic7.github.io/MvaveFM1Unbricker/",
                b"dummies": "https://github.com/GoodPerson42/FM1-Unbricking-For-Dummies",
                b"rescuebox": "https://thefirmwarehub.com/tools/rescue/",
                b"official": "https://www.m-vave.com/download",
                b"backups": "https://github.com/Quixotic7/FM1Backups",
                b"upstream": "https://github.com/Quixotic7/MvaveFM1Unbricker",
                b"help": "https://github.com/Quixotic7/MvaveFM1Unbricker/issues",
                b"transporter": "https://github.com/kurogedelic/FM-1-transporter#hardware",
            }
            destination = links.get(self.rfile.read(size))
            if destination is None:
                return self.json({}, 400)
            import webbrowser
            return self.json({}, 200 if webbrowser.open(destination) else 503)
        if action == "close":
            with self.session.lock:
                if self.session.busy or self.session.protect:
                    return self.json({}, 409)
                self.session.closing = True
                threading.Thread(target=self.server.shutdown).start()
            return self.json({})
        if action in ("folder", "old-folder"):
            folder = self.session.output if action == "folder" else UPSTREAM / "backups"
            if action == "folder":
                folder.mkdir(exist_ok=True)
            try:
                if sys.platform == "win32":
                    os.startfile(str(folder))
                elif sys.platform == "darwin":
                    subprocess.Popen(["/usr/bin/open", str(folder)])
                else:
                    subprocess.Popen(["xdg-open", str(folder)])
            except OSError:
                return self.json({}, 503)
            return self.json({})
        if self.session.start(action, self.rfile.read(size)):
            return self.json({}, 202)
        return self.json({}, 409)


def parse_options(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true", help="enable real hardware")
    parser.add_argument("--dry-run", action="store_true", help="simulate (default)")
    parser.add_argument("--mock-flash", type=Path)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args(argv)
    if args.live and (args.dry_run or args.mock_flash):
        parser.error("--live cannot be combined with simulation options")
    return args


def main(argv=None, opener=None):
    args = parse_options(argv)
    mock_flash = args.mock_flash
    if not args.live and mock_flash is None:
        mock_flash = next(iter(sorted((UPSTREAM / "backups").glob("*.bin"))), None)
    session = Session(not args.live, mock_flash)
    token = secrets.token_hex(32)
    with ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, session=session, token=token)) as http:
        url = f"http://127.0.0.1:{http.server_port}/#{token}"
        print(url, flush=True)
        def stop(*_):
            with session.lock:
                if session.busy or session.protect:
                    print("Leave the FM-1 connected until recovery is complete.", flush=True)
                    return
                session.closing = True
                threading.Thread(target=http.shutdown).start()

        signal.signal(signal.SIGINT, stop)
        signal.signal(signal.SIGTERM, stop)
        stop_detection = threading.Event()

        def detect():
            while not stop_detection.is_set():
                session.detect()
                stop_detection.wait(2)

        detector = threading.Thread(target=detect, daemon=True)
        detector.start()
        try:
            if opener is not None:
                opener(url, http, session)
            elif not args.no_browser:
                import webbrowser
                webbrowser.open(url)
            http.serve_forever()
        finally:
            if opener is not None:
                opener.close()
            stop_detection.set()
            detector.join()
            session.close()


if __name__ == "__main__":
    main()
