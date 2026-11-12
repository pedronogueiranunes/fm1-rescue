#!/bin/sh
set -eu
cd -- "$(dirname -- "$0")/.."
mkdir -p .review/swift-cache 'FM-1 Rescue.app/Contents/MacOS' 'FM-1 Rescue.app/Contents/Resources'
swiftc -module-cache-path "$PWD/.review/swift-cache" \
  -framework AppKit -framework WebKit \
  macos/RescueApp.swift -o 'FM-1 Rescue.app/Contents/MacOS/FM1-Rescue'
python3 - <<'PY'
from pathlib import Path
import plistlib
root = Path.cwd()
info = {
    "CFBundleName": "FM-1 Rescue",
    "CFBundleDisplayName": "FM-1 Rescue",
    "CFBundleIdentifier": "dev.pedronogueira.fm1rescue",
    "CFBundleExecutable": "FM1-Rescue",
    "CFBundlePackageType": "APPL",
    "CFBundleShortVersionString": "0.3.0",
    "CFBundleVersion": "3",
    "NSHighResolutionCapable": True,
    "NSAppTransportSecurity": {"NSAllowsLocalNetworking": True},
    "FM1ProjectRoot": str(root),
}
existing = root / "FM-1 Rescue.app/Contents/Resources/Rescue.icns"
if existing.is_file():
    info["CFBundleIconFile"] = "Rescue"
(root / "FM-1 Rescue.app/Contents/Info.plist").write_bytes(plistlib.dumps(info))
PY
