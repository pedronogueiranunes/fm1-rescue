import os
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

from rescue import Session, UPSTREAM, V15, tool


class RescueTest(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(dir=Path(__file__).parent)
        self.addCleanup(temp.cleanup)
        root = Path(temp.name)
        (Path(__file__).parent / "test-logs").mkdir(exist_ok=True)
        dump = next((UPSTREAM / "backups").glob("*.bin"), None)
        self.v15 = Path(os.environ.get("FM1_TEST_V15", V15))
        self.v16 = Path(os.environ.get("FM1_TEST_V16", V15.with_name("V16-FM-1.fwsc")))
        self.firmware_path = patch("rescue.V15", self.v15)
        self.firmware_path.start()
        self.addCleanup(self.firmware_path.stop)
        self.session = Session(True, dump, root)
        self.addCleanup(self.session.close)

    def step(self, action, phase, body=b"", error=""):
        self.assertTrue(self.session.start(action, body))
        deadline = time.monotonic() + 10
        while self.session.state()["busy"] and time.monotonic() < deadline:
            time.sleep(.01)
        self.assertFalse(self.session.state()["busy"])
        self.assertEqual(self.session.phase, phase)
        self.assertEqual(self.session.error, error)

    def backup(self):
        self.step("prepare", "wire")
        self.step("wire", "power")
        self.step("power", "backup")
        self.step("backup", "firmware")

    def test_full_flow_requires_explicit_write(self):
        self.assertFalse(self.session.start("apply", b"WRITE"))
        self.backup()
        self.step("bundled", "review")
        self.assertGreater(len(self.session.plan.write), 0)
        self.assertFalse(self.session.start("apply", b"write"))
        self.assertFalse(self.session.start("apply"))
        self.step("apply", "done", b"WRITE")
        self.assertTrue(any("Final full read EQUALS" in line for line in self.session.lines))

    def test_v16_and_upload(self):
        self.backup()
        v16 = self.v16.read_bytes()
        self.step("upload", "firmware", v16, "v16")
        self.step("upload", "firmware", b"invalid", "v15")
        self.step("upload", "review", self.v15.read_bytes())

    def test_reference_must_be_intact(self):
        self.backup()
        self.step("bundled", "review")
        self.session.backup.write_bytes(b"damaged")
        self.step("apply", "backup", b"WRITE", "backup")

    def test_full_flash_change_blocks_write(self):
        self.backup()
        self.step("bundled", "review")
        data = bytearray(self.session.reference)
        data[-1] ^= 1
        with patch.object(self.session.transport, "read_flash", return_value=bytes(data)), \
                patch.object(self.session.transport, "write_sector") as write:
            self.step("apply", "backup", b"WRITE", "changed")
            write.assert_not_called()

    def test_failed_verification_requires_new_backup(self):
        self.backup()
        old = self.session.backup
        self.step("bundled", "review")
        with patch.object(self.session.transport, "write_sector", return_value="ERROR"):
            self.step("apply", "danger", b"WRITE", "verify")
        self.assertTrue(self.session.protect)
        self.assertFalse(self.session.start("apply", b"WRITE"))
        self.step("backup", "firmware")
        self.assertTrue(old.exists())
        self.assertNotEqual(old, self.session.backup)
        self.assertTrue(self.session.protect)
        self.step("bundled", "review")
        self.step("apply", "done", b"WRITE")
        self.assertFalse(self.session.protect)
