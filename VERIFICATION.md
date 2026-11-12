# Standalone verification

Windows and Linux standalone packages were built and exercised in GitHub Actions.

[Successful workflow run](https://github.com/pedronogueiranunes/fm1-rescue/actions/runs/43131719224)

The verified executable source revision is edf527e. Later documentation/macOS-build changes do not change the Windows/Linux executable code.

| Check | Windows Server 2022 x64 | Ubuntu 24.04 x64 |
| --- | --- | --- |
| 14 wrapper/desktop safety unit tests | Passed | Passed |
| Build Python, upstream engine, serial support and browser into package | Passed | Passed |
| Extract the actual distribution in a clean path containing spaces | Passed | Passed |
| Launch packaged executable with --dry-run | Passed | Passed |
| Render local UI and CTA font with bundled browser | Passed | Passed |
| Save double-read backup using upstream synthetic flash | Passed | Passed |
| Refuse official V16 | Passed | Passed |
| Accept verified V15 and show write plan | Passed | Passed |
| Require exact uppercase WRITE | Passed | Passed |
| Write mock application sectors and verify final full read | Passed | Passed |
| List the saved backup | Passed | Passed |
| Close the desktop process and release distribution files | Passed | Passed |

The workflow retains screenshots, diagnostic logs and PASS.txt evidence. It fetches hash-verified firmware test inputs into temporary runner storage. Those firmware files and synthetic dumps are excluded from source commits and application downloads.

Automated UI checks use the bundled browser in headless mode. Manual desktop interaction on end-user Windows/Linux machines and recovery over real USB hardware remain separate, pending validation.

The release contains the exact archives produced by this workflow, with SHA-256 checksum files.
