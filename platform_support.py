"""Operating-system sleep protection for an authorized firmware write."""
import subprocess
import sys
import threading


class KeepAwake:
    def __init__(self, simulate):
        self.simulate = simulate
        self.process = None
        self.windows = None

    def __enter__(self):
        if self.simulate:
            return self
        if sys.platform == "win32":
            import ctypes
            self.windows = ctypes.windll.kernel32
            if not self.windows.SetThreadExecutionState(0x80000003):
                raise OSError("Windows could not prevent sleep.")
        elif sys.platform == "darwin":
            self.process = subprocess.Popen(["/usr/bin/caffeinate", "-dims"])
        else:
            self.process = subprocess.Popen([
                "systemd-inhibit", "--what=sleep:idle", "--mode=block",
                "--who=FM-1 Rescue", "--why=Firmware write and verification",
                "sh", "-c", "printf READY; exec cat >/dev/null"
            ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            timer = threading.Timer(8, self.process.terminate)
            timer.start()
            try:
                ready = self.process.stdout.read(5)
            finally:
                timer.cancel()
            if ready != b"READY":
                self.__exit__(None, None, None)
                raise OSError("Linux could not prevent sleep. Check systemd-inhibit support.")
        self.check()
        return self

    def check(self):
        if self.process is not None and self.process.poll() is not None:
            raise OSError("Sleep protection stopped.")

    def __exit__(self, *_):
        if self.windows is not None:
            self.windows.SetThreadExecutionState(0x80000000)
        if self.process is not None:
            if self.process.stdin is not None:
                self.process.stdin.close()
            if self.process.poll() is None:
                self.process.terminate()
            try:
                self.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()
            if self.process.stdout is not None:
                self.process.stdout.close()
