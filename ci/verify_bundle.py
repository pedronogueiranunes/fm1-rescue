"""Exercise the extracted distribution with a clean data directory and real renderer."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import time
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    # A path containing spaces catches quoting and executable-location regressions.
    with tempfile.TemporaryDirectory(prefix="FM1 standalone check ") as temp:
        folder = Path(temp)
        if sys.platform == "win32":
            archive = ROOT / "standalone/FM1-Rescue-Windows-x64.zip"
            with zipfile.ZipFile(archive) as bundle:
                bundle.extractall(folder)
            executable = folder / "FM1-Rescue/FM1-Rescue.exe"
        else:
            archive = ROOT / "standalone/FM1-Rescue-Linux-x64.tar.gz"
            with tarfile.open(archive) as bundle:
                bundle.extractall(folder, filter="data")
            executable = folder / "FM1-Rescue/FM1-Rescue"
        data = folder / "user data"
        data.mkdir()
        env = dict(os.environ, FM1_RESCUE_DATA=str(data), FM1_RESCUE_CI_HEADLESS="1", CI="true")
        env.pop("PYTHONPATH", None)
        process = subprocess.Popen([str(executable), "--dry-run"], cwd=folder, env=env)
        try:
            record = data / "desktop-data/session.json"
            deadline = time.monotonic() + 90
            while not record.exists():
                if process.poll() is not None or time.monotonic() > deadline:
                    log = data / "desktop-data/desktop.log"
                    raise RuntimeError(log.read_text() if log.exists() else "Standalone failed to start")
                time.sleep(.2)
            url = json.loads(record.read_text())["url"]
            result = ROOT / "test-results"
            result.mkdir(exist_ok=True)
            subprocess.run([
                "node", str(ROOT / "ci/ui_smoke.cjs"), url,
                str(data / "desktop-data/profile"), str(result),
            ], env=env, check=True, timeout=180)
            process.wait(timeout=15)
            if process.returncode:
                raise RuntimeError("Standalone exited with " + str(process.returncode))
            if record.exists():
                raise RuntimeError("Desktop session was not cleaned up")
            (result / "PASS.txt").write_text(
                "PASS on " + sys.platform + "\nExtracted executable started without external Python or upstream folders.\n"
                "Bundled browser rendered the UI. Synthetic backup, V16 refusal, V15 plan, WRITE gate, final verify, and close passed.\n"
            )
        finally:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=8)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
            log = data / "desktop-data/desktop.log"
            if log.exists():
                # Keep diagnostic logs as CI artifacts, never in a git commit.
                result = ROOT / "test-results"
                result.mkdir(exist_ok=True)
                (result / "desktop.log").write_bytes(log.read_bytes())


if __name__ == "__main__":
    main()
