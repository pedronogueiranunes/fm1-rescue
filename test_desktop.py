import io
from pathlib import Path
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import desktop
from platform_support import KeepAwake


class DesktopTest(unittest.TestCase):
    def test_browser_discovery_uses_windows_installation(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as temp:
            browser = Path(temp) / "Microsoft/Edge/Application/msedge.exe"
            browser.parent.mkdir(parents=True)
            browser.touch()
            self.assertEqual(desktop.find_browser(
                "win32", {"PROGRAMFILES": temp}, lambda _: None), str(browser))

    def test_browser_discovery_uses_linux_path(self):
        with patch.object(Path, "is_file", return_value=True):
            self.assertEqual(desktop.find_browser(
                "linux", {}, lambda name: "/usr/bin/chromium" if name == "chromium" else None),
                "/usr/bin/chromium")

    def test_window_uses_private_profile_and_local_session(self):
        command = desktop.window_command("chrome", "http://127.0.0.1:12345/#token")
        self.assertIn("--app=http://127.0.0.1:12345/#token", command)
        self.assertIn("--user-data-dir=" + str(desktop.PROFILE), command)
        with self.assertRaises(ValueError):
            desktop.window_command("chrome", "https://example.com/#token")

    def test_safe_window_close_stops_backend(self):
        window = desktop.DesktopWindow("chrome")
        window.session = SimpleNamespace(lock=threading.Lock(), busy=False,
                                         protect=False, closing=False)
        window.server = Mock()
        window.process = Mock()
        window.process.poll.return_value = 0
        window.stopping = Mock()
        window.stopping.wait.return_value = False
        window.watch()
        self.assertTrue(window.session.closing)
        window.server.shutdown.assert_called_once()

    def test_protected_window_close_keeps_backend_and_reopens_window(self):
        window = desktop.DesktopWindow("chrome")
        window.session = SimpleNamespace(lock=threading.Lock(), busy=True,
                                         protect=True, closing=False)
        window.server = Mock()
        window.process = Mock()
        window.process.poll.return_value = 0
        window.stopping = Mock()
        window.stopping.wait.side_effect = [False, False, True]
        window.spawn = Mock()
        window.watch()
        window.spawn.assert_called_once()
        window.server.shutdown.assert_not_called()
        self.assertFalse(window.session.closing)

    def test_simulated_sleep_protection_never_calls_os(self):
        with patch("platform_support.subprocess.Popen") as spawn:
            with KeepAwake(True) as awake:
                awake.check()
            spawn.assert_not_called()

    def test_windows_sleep_protection_restores_thread_state(self):
        kernel = Mock()
        with patch("platform_support.sys.platform", "win32"), \
                patch.dict("sys.modules", {"ctypes": SimpleNamespace(
                    windll=SimpleNamespace(kernel32=kernel))}):
            with KeepAwake(False):
                kernel.SetThreadExecutionState.assert_called_with(0x80000003)
            kernel.SetThreadExecutionState.assert_called_with(0x80000000)

    def test_linux_sleep_protection_requires_inhibitor_ready(self):
        process = Mock()
        process.stdout = io.BytesIO(b"READY")
        process.stdin = io.BytesIO()
        process.poll.return_value = None
        with patch("platform_support.sys.platform", "linux"), \
                patch("platform_support.subprocess.Popen", return_value=process):
            with KeepAwake(False):
                process.terminate.assert_not_called()
            process.terminate.assert_called_once()


if __name__ == "__main__":
    unittest.main()
