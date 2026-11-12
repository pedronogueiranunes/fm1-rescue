# Standalone desktop packages

## Windows x64

Extract the entire Windows ZIP and open FM1-Rescue.exe. Keep its _internal/ and browser/ folders beside it. Python, pyserial, the pinned upstream recovery engine, interface assets and browser runtime are included.

## Linux x64

Extract the Linux tar.gz, keep its directory together and run ./FM1-Rescue. The archive preserves executable permissions. The build targets Ubuntu 24.04-compatible desktop libraries. The renderer uses the operating system's normal sandbox facilities. USB serial permissions, xdg-open and systemd-inhibit are required for the corresponding desktop/hardware features.

## Simulation and hardware

The executable starts in simulation. Use --live to request hardware mode. The build verification always passes --dry-run and uses synthetic flash through the original mock Transporter.

Official V15 and the prepared Transporter UF2 are supplied separately. Choose the UF2 on the first screen for hardware preparation and upload V15 when asked. The app checks their original known hashes. The firmware images and embedded loader are excluded from downloads.

The application keeps backups and logs in per-user writable storage.

- Windows — %LOCALAPPDATA%/FM1Rescue
- Linux — $XDG_STATE_HOME/fm1-rescue, falling back to ~/.local/state/fm1-rescue

Use FM1_RESCUE_DATA to choose a different storage location. Bundled resources are read-only.

## Verification scope

The GitHub Actions build runs on Windows Server 2022 and Ubuntu 24.04. Automated verification extracts the packaged artifact into a clean directory, starts the executable, uses its included browser in headless mode and completes the simulated UI flow. Passing checks verify the packaged code, resources, startup, GUI rendering and mocked recovery. USB recovery and manual desktop interaction on end-user machines require separate hardware testing.

CI restricts its headless renderer flags to CI=true and simulated sessions. Distributed normal launches use the renderer's default sandbox.

The macOS native client currently uses the prepared Python environment and is documented in DESKTOP.md. The standalone workflow in this repository targets Windows/Linux.

## Building

Use the target OS with Python 3.12, install requirements-build.txt in an isolated build environment, and run python build_standalone.py. Run python ci/verify_bundle.py to verify the resulting extracted package after preparing the hash-verified test fixtures.

The workflow is manual so each build is visible and intentional. Downloadable test screenshots and build logs are attached to its run.
