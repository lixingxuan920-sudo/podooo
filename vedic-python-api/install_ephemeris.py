from __future__ import annotations

import hashlib
import time
import urllib.request
from pathlib import Path

import jhora


ASSETS = {
    "seas_18.se1": {
        "url": (
            "https://raw.githubusercontent.com/aloistr/swisseph/"
            "59ac051b5a5812c684973ca0fcedb1c8c3e9c5dc/ephe/seas_18.se1"
        ),
        "git_blob_sha": "8f900cab7e557e4c41f758a6bf3a3c3967e7e3db",
    },
    "sepl_18.se1": {
        "url": (
            "https://raw.githubusercontent.com/naturalstupid/PyJHora/"
            "68cb201f52d1df9865cfef8f7082030192df43de/"
            "src/jhora/data/ephe/sepl_18.se1"
        ),
        "git_blob_sha": "41a1e26c7223c4c74310d61a3d66aa6c24a77e9a",
    },
    "semo_18.se1": {
        "url": (
            "https://raw.githubusercontent.com/naturalstupid/PyJHora/"
            "68cb201f52d1df9865cfef8f7082030192df43de/"
            "src/jhora/data/ephe/semo_18.se1"
        ),
        "git_blob_sha": "9396778a5454f41f36f6d4eba4409005717986db",
    },
}


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode()
    return hashlib.sha1(header + data).hexdigest()


def download(url: str, attempts: int = 3) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "podooo-render-build"},
    )
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return response.read()
        except Exception:
            if attempt == attempts:
                raise
            time.sleep(attempt * 2)
    raise RuntimeError("unreachable")


def main() -> None:
    destination = Path(jhora.__file__).resolve().parent / "data" / "ephe"
    destination.mkdir(parents=True, exist_ok=True)

    for filename, asset in ASSETS.items():
        data = download(asset["url"])
        actual_sha = git_blob_sha(data)
        expected_sha = asset["git_blob_sha"]
        if actual_sha != expected_sha:
            raise RuntimeError(
                f"{filename} checksum mismatch: expected {expected_sha}, got {actual_sha}"
            )

        target = destination / filename
        temporary = target.with_suffix(target.suffix + ".tmp")
        temporary.write_bytes(data)
        temporary.replace(target)
        print(f"Installed {filename} ({len(data)} bytes, blob {actual_sha})")


if __name__ == "__main__":
    main()
