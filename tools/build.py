"""Build the CCMC Structures datapack.

Usage (from the repository root):

    python3 -m tools.build

Writes the unpacked pack to ``datapack/`` and a ready-to-install zip to
``dist/``. The output is deterministic, so rebuilding without changes
produces identical files.
"""

import json
import pathlib
import shutil
import zipfile

from . import datapack, nbt, structures

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "datapack"
ZIP_PATH = ROOT / "dist" / "CCMC-Structures-1.20.1.zip"


def build_templates():
    """Return {name: Template} for every structure."""
    return {fn.__name__: fn() for fn in structures.ALL}


def main():
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    written = {}

    for rel, obj in datapack.files():
        written[rel] = (json.dumps(obj, indent=2, ensure_ascii=False) + "\n").encode("utf-8")

    templates = build_templates()
    for name, template in templates.items():
        written[f"data/{datapack.NS}/structures/{name}.nbt"] = nbt.dumps(template.to_nbt())

    for rel, payload in written.items():
        path = OUT_DIR / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)

    ZIP_PATH.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for rel in sorted(written):
            info = zipfile.ZipInfo(rel, date_time=(2023, 6, 12, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(info, written[rel])

    for name, template in templates.items():
        print(f"  {name:16s} size={template.size} blocks={len(template.blocks)}")
    print(f"Wrote {len(written)} files to {OUT_DIR.relative_to(ROOT)}/ and {ZIP_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
