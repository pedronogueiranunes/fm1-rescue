# Contributing

FM-1 Rescue is a UX wrapper around the pinned upstream recovery engine.

- Keep the upstream protocol implementation intact and retain its attribution.
- Develop and test with --dry-run. Hardware tests require explicit authorization.
- Preserve double-read backups, exact firmware/UF2 hashes, the same-session reference and typed WRITE gate.
- Preserve close protection and sleep inhibition during writing and verification.
- Never include device dumps, logs, private paths, firmware files or the separately obtained JieLi loader in commits or releases.
- Build standalone executables on the target OS and verify the extracted packages.
- Record the scope of test evidence. Simulation results and hardware validation are distinct checks.
