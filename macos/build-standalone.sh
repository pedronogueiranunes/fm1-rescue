#!/bin/sh
# Builds a self-contained macOS app (Python, pyserial and the pinned engine bundled).
# Uses an isolated build venv; never touches the recovery venv. Unsigned (ad-hoc signed).
set -eu
cd -- "$(dirname -- "$0")/.."
ROOT=$PWD
VENV=build-cache/venv-build
[ -x $VENV/bin/python ] || python3 -m venv $VENV
$VENV/bin/pip install --quiet -r requirements-build.txt
rm -rf build-dist-mac build-work-mac
mkdir -p build-work-mac
set -- --noconfirm --clean --onedir --name FM1-Rescue-backend --distpath build-dist-mac --workpath build-work-mac --specpath build-work-mac \
  --paths vendor/MvaveFM1Unbricker --hidden-import fm1_transporter_recover --hidden-import fm1_unbrick --collect-submodules serial
for f in index.html app.js style.css logo.svg; do set -- "$@" --add-data "$ROOT/$f:."; done
# Official V15 travels with the app (hash re-checked here and again by the app at runtime).
V15=../FM1Backups/V15-FM-1.fwsc
if [ -f "$V15" ] && [ "$(shasum -a 256 "$V15" | cut -d' ' -f1)" = db1642b2b6fa5c2cccb11ffd13878068bb28601678d3644049f99dc40e7edb8a ]; then
  mkdir -p build-cache/fw && cp "$V15" build-cache/fw/V15-FM-1.fwsc
  set -- "$@" --add-data "$ROOT/build-cache/fw:firmware"
else echo "V15 not found or hash mismatch: building without it" >&2; fi
set -- "$@" --add-data "$ROOT/assets:assets" --add-data "$ROOT/vendor:vendor" rescue.py
$VENV/bin/python -m PyInstaller "$@"
APP="build-dist-mac/FM-1 Rescue.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" .review/swift-cache
swiftc -module-cache-path "$ROOT/.review/swift-cache" -framework AppKit -framework WebKit macos/RescueApp.swift -o "$APP/Contents/MacOS/FM1-Rescue"
cp -R build-dist-mac/FM1-Rescue-backend "$APP/Contents/Resources/backend"
cp "FM-1 Rescue.app/Contents/Resources/Rescue.icns" "$APP/Contents/Resources/"
for f in README.md LICENSE THIRD_PARTY.md; do cp $f "$APP/Contents/Resources/"; done
python3 - <<'PY'
import plistlib
info = {"CFBundleName": "FM-1 Rescue", "CFBundleDisplayName": "FM-1 Rescue",
  "CFBundleIdentifier": "dev.pedronogueira.fm1rescue.standalone", "CFBundleExecutable": "FM1-Rescue",
  "CFBundlePackageType": "APPL", "CFBundleShortVersionString": "0.3.0", "CFBundleVersion": "3",
  "CFBundleIconFile": "Rescue", "NSHighResolutionCapable": True, "LSMinimumSystemVersion": "12.0",
  "NSAppTransportSecurity": {"NSAllowsLocalNetworking": True}}
open("build-dist-mac/FM-1 Rescue.app/Contents/Info.plist", "wb").write(plistlib.dumps(info))
PY
codesign --force --deep -s - "$APP"
mkdir -p standalone
(cd build-dist-mac && ditto -c -k --keepParent "FM-1 Rescue.app" "$ROOT/standalone/FM1-Rescue-macOS-arm64.zip")
(cd standalone && shasum -a 256 FM1-Rescue-macOS-arm64.zip > FM1-Rescue-macOS-arm64.zip.sha256)
echo "$ROOT/standalone/FM1-Rescue-macOS-arm64.zip"
