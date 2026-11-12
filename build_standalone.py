"""Build a self-contained Windows/Linux client on its target operating system."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent
CHROME_VERSION = "157.0.8103.78"
UPSTREAM = ROOT / "vendor/MvaveFM1Unbricker"


def fetch_browser(distribution):
    platform = "win64" if sys.platform == "win32" else "linux64"
    name = "chrome-" + platform
    url = "https://storage.googleapis.com/chrome-for-testing-public/" + CHROME_VERSION + "/" + platform + "/" + name + ".zip"
    cache = ROOT / "build-cache"
    cache.mkdir(exist_ok=True)
    archive = cache / (name + ".zip")
    if not archive.exists():
        with urllib.request.urlopen(url, timeout=180) as response, archive.open("wb") as output:
            shutil.copyfileobj(response, output)
    folder = distribution / "browser"
    folder.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as bundle:
        for member in bundle.infolist():
            destination = (folder / member.filename).resolve()
            if not destination.is_relative_to(folder.resolve()):
                raise ValueError("Browser archive path escapes distribution")
            bundle.extract(member, folder)
            mode = member.external_attr >> 16
            if os.name != "nt" and mode:
                destination.chmod(stat.S_IMODE(mode))
    binary = folder / name / ("chrome.exe" if os.name == "nt" else "chrome")
    if not binary.is_file():
        raise FileNotFoundError(binary)
    return {
        "version": CHROME_VERSION, "source": url,
        "download_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
    }


def main():
    if sys.platform not in ("win32", "linux"):
        raise SystemExit("Build this executable on Windows or Linux.")
    command = [
        sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean", "--onedir",
        "--name", "FM1-Rescue", "--distpath", "build-dist", "--workpath", "build-work",
        "--specpath", "build-work", "--paths", str(UPSTREAM),
        "--hidden-import", "fm1_transporter_recover", "--hidden-import", "fm1_unbrick",
        "--collect-submodules", "serial",
    ]
    for source in ("index.html", "app.js", "style.css", "logo.svg", "assets", "vendor"):
        command.extend(["--add-data", str(ROOT / source) + os.pathsep + source])
    # Console mode leaves errors available to automated checks. The desktop client
    # redirects logs to its per-user data directory immediately at startup.
    if os.name == "nt":
        command.append("--windowed")
    command.append(str(ROOT / "desktop.py"))
    subprocess.run(command, cwd=ROOT, check=True)
    distribution = ROOT / "build-dist/FM1-Rescue"
    browser = fetch_browser(distribution)
    for name in ("README.md", "LICENSE", "THIRD_PARTY.md", "QUICK-START.md", "STANDALONE.md"):
        shutil.copy2(ROOT / name, distribution / name)
    manifest = {
        "platform": sys.platform, "architecture": "x86_64",
        "python": sys.version.split()[0], "upstream_commit": "0edc5add5e1412e7e68eefe2f84f2805e4b780fa",
        "browser": browser, "firmware_included": False,
    }
    (distribution / "BUILD-INFO.json").write_text(json.dumps(manifest, indent=2))
    destination = ROOT / "standalone"
    destination.mkdir(exist_ok=True)
    if os.name == "nt":
        path = destination / "FM1-Rescue-Windows-x64.zip"
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as output:
            for file in sorted(distribution.rglob("*")):
                if file.is_file():
                    output.write(file, file.relative_to(distribution.parent))
    else:
        path = destination / "FM1-Rescue-Linux-x64.tar.gz"
        with tarfile.open(path, "w:gz") as output:
            output.add(distribution, arcname="FM1-Rescue")
    checksum = hashlib.sha256(path.read_bytes()).hexdigest()
    path.with_name(path.name + ".sha256").write_text(checksum + "  " + path.name + "\n")
    print(path)


if __name__ == "__main__":
    main()
