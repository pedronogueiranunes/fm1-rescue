"""Create portable desktop-client archives from the checked local sources."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent
COMMON = (
    "AGENTS.md", "README.md", "DESKTOP.md", "QUICK-START.md", "PLANO.md",
    "rescue.py", "desktop.py", "platform_support.py", "app_paths.py",
    "LICENSE", "THIRD_PARTY.md", "STANDALONE.md", "vendor",
    "index.html", "style.css", "app.js", "logo.svg",
    "test_rescue.py", "test_desktop.py",
)
LAUNCHERS = {
    "macOS": ("FM-1 Rescue.app", "macos", "FM1-Rescue.sh", "FM1-Rescue-Desktop.command", "FM1-Rescue.command"),
    "Windows": ("FM1-Rescue.cmd",),
    "Linux": ("FM1-Rescue.desktop", "FM1-Rescue.sh"),
}


def main():
    destination = ROOT / "releases"
    destination.mkdir(exist_ok=True)
    for platform, launchers in LAUNCHERS.items():
        entries = list(COMMON) + ["assets", "screenshots"] + list(launchers)
        path = destination / ("FM1-Rescue-" + platform + "-portable.zip")
        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
            for entry in entries:
                source = ROOT / entry
                files = sorted(source.rglob("*")) if source.is_dir() else [source]
                for file in files:
                    if file.is_file():
                        archive.write(file, Path("fm1-rescue-ui") / file.relative_to(ROOT))
        print(path.name)


if __name__ == "__main__":
    main()
