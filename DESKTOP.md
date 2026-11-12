# FM-1 Rescue desktop

The macOS .app opens the local recovery interface in its own native WebKit window. Windows and Linux use a dedicated Chrome, Edge or Chromium app window. It uses the same Python recovery engine as the browser version.

## Open the app

| System | Open |
| --- | --- |
| macOS | **FM-1 Rescue.app** |
| Windows | **FM1-Rescue.cmd** |
| Linux | **FM1-Rescue.desktop**, or **FM1-Rescue.sh** |

Keep these files inside **fm1-rescue-ui**. The macOS app has a native executable and uses the prepared recovery files. It locates fm1-rescue-ui beside the app or at its configured project location. If the folder moves, it asks you to locate it. Keep the Linux shortcut next to its shell launcher. Your desktop environment may ask you to allow launching a local shortcut.

All launchers start in **simulation**. English is the initial language. To use hardware after reviewing the simulation, launch with `--live`. For example, use `FM1-Rescue.cmd --live` on Windows or `./FM1-Rescue.sh --live` on Linux/macOS. On macOS, `open "FM-1 Rescue.app" --args --live` starts the app in hardware mode. Close an existing session before changing modes.

## Required on each computer

- Python 3.10 or newer and the prepared MvaveFM1Unbricker recovery environment. On Windows the launcher first looks for `../venv/Scripts/pythonw.exe`. On macOS/Linux it first looks for `../venv/bin/python`. It then checks the system Python launcher.
- On Windows/Linux, an installed Chrome, Edge or Chromium browser. macOS uses the built-in WebKit engine.
- The sibling folders `MvaveFM1Unbricker` and `FM1Backups`, the prepared Transporter UF2 and verified official V15 file described in the main README. pyserial is required for hardware use.
- On Linux, a graphical session, `xdg-open` for folder opening, and working `systemd-inhibit` for sleep protection during a real write. USB/serial permissions must already allow access to the Transporter.

The desktop client uses Python's standard library. It does not install software. Each portable ZIP includes the interface and its platform launcher. Supply the prepared recovery folders and Python environment separately on the target computer.

## Window and session behavior

- Each app folder owns one desktop session. Opening it again reuses the session. Separate copies of the folder can run separate sessions, so keep a single copy open for hardware recovery.
- Close assistant shuts down both the local server and its app window.
- Closing the window while idle shuts down its desktop server. On macOS, opening the app again from Finder or the Dock brings its own window to the front.
- On macOS, the close button and Quit action check recovery state and refuse to close during an operation or after a failed write. On Windows/Linux, if the window process exits during an operation or after a failed write, the backend keeps the session active and tries to reopen the window. Keep the computer powered on.
- During real writing and verification, macOS uses caffeinate, Windows requests the system and display stay awake, and Linux uses systemd-inhibit.
- External links open in the system browser. Runtime profile and startup logs stay in `desktop-data/`. Backups stay in their existing folders.

The operating system can force termination. Browser close warnings are controlled by the browser. The client cannot prevent shutdown or process termination by the operating system.

## Brand

Orange **#FF5A1F**, warm **#F5F1EA**, charcoal **#232625**, Manrope and Hanken Grotesk come from [pedronogueira.dev](https://pedronogueira.dev). Buttons use the site’s Silkscreen CTA font. A small sidebar link points to pedronogueira.dev. Small text uses a darker orange for contrast. Font files are local for offline use, with their SIL Open Font licenses in `assets/fonts/`.

## Verification

Verified on this Apple Silicon Mac in simulation: Finder double-click opens the native WebKit window, the first recovery action completes, reopening restores the minimized window, Command-Q closes the app safely, and double-click opens a fresh session after quitting. The macOS executable included here is built for Apple Silicon. The build source is in macos/ and can be rebuilt with macos/build.sh using Apple Command Line Tools. Thirteen automated tests cover the recovery guards, desktop lifecycle, browser discovery and mocked platform sleep APIs.

Windows and Linux launchers still need on-device verification. Real USB recovery, platform sleep behavior during a real write, and code signing/notarization have not been verified. The portable bundles are unsigned and depend on the runtimes listed above.

## Português

Abra **FM-1 Rescue.app** no macOS, **FM1-Rescue.cmd** no Windows ou **FM1-Rescue.desktop / FM1-Rescue.sh** no Linux. Os launchers começam em simulação. Mantenha o cliente na pasta fm1-rescue-ui, junto das outras pastas do projeto.

Cada computador precisa do Python, do ambiente de recuperação preparado e de Chrome, Edge ou Chromium. O cliente abre uma janela própria e usa o servidor local existente. O .app do macOS usa WebKit nativo e reapresenta a janela ao ser aberto novamente. Para usar equipamento real depois de revisar a simulação, feche o assistente e abra o launcher com `--live`.

Os testes de interface e de inicialização foram feitos no Mac em simulação. A verificação nos sistemas Windows/Linux e com equipamento real continua pendente.
