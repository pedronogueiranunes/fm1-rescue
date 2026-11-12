"""Read-only application resources and writable per-user recovery data."""
import os
from pathlib import Path
import sys

RESOURCES = Path(__file__).resolve().parent
FROZEN = bool(getattr(sys, "frozen", False))


def data_root():
    override = os.environ.get("FM1_RESCUE_DATA")
    if override:
        return Path(override).expanduser().resolve()
    if not FROZEN:
        return RESOURCES
    if sys.platform == "win32":
        return Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData/Local")) / "FM1Rescue"
    if sys.platform == "darwin":
        return Path.home() / "Library/Application Support/FM1Rescue"
    return Path(os.environ.get("XDG_STATE_HOME", Path.home() / ".local/state")) / "fm1-rescue"


DATA_ROOT = data_root()
sibling = RESOURCES.parent / "MvaveFM1Unbricker"
UPSTREAM = sibling if not FROZEN and (sibling / "fm1_transporter_recover.py").is_file() else RESOURCES / "vendor/MvaveFM1Unbricker"
