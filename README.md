# FM-1 Rescue

A desktop user interface and UX wrapper for recovering an M-VAVE FM-1 with the FM-1 Transporter.

FM-1 Rescue presents the recovery procedure as a guided, bilingual assistant with wiring instructions, verified backups, firmware checks, explicit write authorization, progress logs and final verification.

**The recovery engine is [Quixotic7/MvaveFM1Unbricker](https://github.com/Quixotic7/MvaveFM1Unbricker).** Its Transporter implementation performs the device communication, memory reads, writes and verification. This project wraps that implementation to make the unbrick process easier to follow. The vendored engine is pinned to commit [0edc5ad](https://github.com/Quixotic7/MvaveFM1Unbricker/tree/0edc5add5e1412e7e68eefe2f84f2805e4b780fa) and retains its original MIT license and copyright.

## Desktop versions

| Platform | Client | Verification |
| --- | --- | --- |
| Windows x64 | Standalone executable with Python, pyserial and browser runtime included | See the latest [standalone workflow](https://github.com/pedronogueiranunes/fm1-rescue/actions/workflows/standalone.yml) |
| Linux x64 | Standalone folder with Python, pyserial and browser runtime included | See the latest [standalone workflow](https://github.com/pedronogueiranunes/fm1-rescue/actions/workflows/standalone.yml) |
| macOS Apple Silicon | Native AppKit/WebKit client, using the prepared Python environment | Locally exercised in simulation. Build source is in macos/ |

The Windows/Linux workflow extracts each package into a fresh path containing spaces, launches its executable, renders the interface with its bundled browser, and runs the complete simulated recovery. It checks the backup, V16 rejection, case-sensitive WRITE gate, V15 write plan, final verification and shutdown.

The releases require their target operating system and normal desktop libraries. The Linux build targets Ubuntu 24.04 or a compatible desktop environment. Hardware use also requires serial-device permissions and working sleep inhibition.

See [STANDALONE.md](STANDALONE.md) for installation and runtime details. Builds are unsigned. Check the workflow result before treating a build as verified.

## Hardware and firmware

See the [short buying and recovery guide](QUICK-START.md) and the original [Transporter guide](https://github.com/Quixotic7/MvaveFM1Unbricker/blob/main/TRANSPORTER-GUIDE.md).

The app starts in simulation. Hardware mode is explicitly selected with --live. Actual recovery needs a Seeed XIAO RP2040, the prepared hash-verified Transporter UF2 and official V15 firmware. Supply those two files through the interface. Firmware and the embedded JieLi loader are obtained separately.

Every write requires a double-read backup made in the same session, an unchanged reference, official V15, and the user's explicit WRITE confirmation. The engine restricts application writes to 0x4000–0x92FFF. Real-hardware recovery through this UI still needs validation.

## Run from source

Use Python 3.10 or newer. The pinned engine is included under vendor/. The interface uses the Python standard library. Hardware operation uses pyserial.

Open FM1-Rescue.cmd on Windows or FM1-Rescue.sh on Linux. These source launchers use an installed Chrome, Edge or Chromium browser. The standalone Windows/Linux builds include their own runtime.

On macOS, build the native wrapper with macos/build.sh using Apple Command Line Tools, then open FM-1 Rescue.app. Keep the prepared venv folder beside this source folder. The build script creates the native app bundle and its metadata from this checkout.

The legacy browser interface can be started with python -B rescue.py --dry-run. Supply verified V15 through the file picker to exercise the final stages.

## Tests and builds

The manual GitHub Actions workflow builds each target on its own OS. It installs the pinned build dependencies in isolated runners. Firmware test inputs are fetched from the public FM1Backups project, checked against known SHA-256 hashes and excluded from source and downloadable packages. Synthetic flash data exercises the upstream mock Transporter. The workflow uses headless browser mode for automated rendering.

Run the unit tests locally with python -B -m unittest -v after setting FM1_TEST_V15 and FM1_TEST_V16 to the corresponding verified files.

## Attribution

- **Recovery software and protocol implementation** — [Quixotic7/MvaveFM1Unbricker](https://github.com/Quixotic7/MvaveFM1Unbricker), copyright Michael P Jones, MIT.
- **FM-1 Transporter board firmware and recovery method** — [Leo Kuroshita / Hügelton Instruments](https://github.com/kurogedelic/FM-1-transporter), MIT.
- **JieLi loader tooling** — [kagaimiq/jl-uboot-tool](https://github.com/kagaimiq/jl-uboot-tool), MIT. Obtained separately.
- **Interface and desktop wrapper** — [Pedro Nogueira](https://pedronogueira.dev), MIT.
- Fonts retain their SIL Open Font licenses in assets/fonts/. Bundled runtime notices are documented in [THIRD_PARTY.md](THIRD_PARTY.md).

This is an unofficial community recovery interface. M-VAVE owns its firmware. Original project attribution remains with its authors.

## Português

O FM-1 Rescue é uma **IU/wrapper do MvaveFM1Unbricker**, criada para melhorar a experiência do processo de unbrick do M-VAVE FM-1. O motor original continua responsável pelo protocolo, pelas leituras, pela gravação e pela verificação.

O assistente organiza as etapas, explica a ligação, cria e lista backups, exige a confirmação WRITE e mostra o progresso. Os testes automatizados usam o Transporter simulado. A validação desta interface com equipamento real continua pendente.
