"""Fetch public, hash-verified test inputs into the runner; never publish them."""
import hashlib
import os
from pathlib import Path
import urllib.request

REVISION = "8cbc3b066ed15ec6a0d5a990efb78b56f6c17183"
FILES = {
    "V15-FM-1.fwsc": "db1642b2b6fa5c2cccb11ffd13878068bb28601678d3644049f99dc40e7edb8a",
    "V16-FM-1.fwsc": "d017fb65e70aca97ee29d944470c3515a74581df5c0576bf70de917c7b2b61d5",
}


def main():
    folder = Path(".ci-fixtures").resolve()
    folder.mkdir(exist_ok=True)
    for name, expected in FILES.items():
        url = "https://raw.githubusercontent.com/Quixotic7/FM1Backups/" + REVISION + "/" + name
        data = urllib.request.urlopen(url, timeout=60).read()
        if hashlib.sha256(data).hexdigest() != expected:
            raise ValueError("Unexpected firmware hash for " + name)
        path = folder / name
        path.write_bytes(data)
        variable = "FM1_TEST_V15" if name.startswith("V15") else "FM1_TEST_V16"
        with open(os.environ["GITHUB_ENV"], "a", encoding="utf-8") as output:
            output.write(variable + "=" + str(path) + "\n")


if __name__ == "__main__":
    main()
