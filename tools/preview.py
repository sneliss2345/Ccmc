"""Render isometric preview images of every structure (needs Pillow).

Usage:  python3 -m tools.preview

Colors are averaged from the vanilla 1.20.1 textures (downloaded once from
the misode/mcmeta mirror into tools/.cache). Each image shows the full
structure next to a cut-away view of its interior.
"""

import io
import json
import pathlib
import urllib.request

from PIL import Image, ImageDraw

from .build import ROOT, build_templates

ASSETS = "https://raw.githubusercontent.com/misode/mcmeta/1.20.1-assets/assets/minecraft"
CACHE = pathlib.Path(__file__).resolve().parent / ".cache" / "assets"
OUT = ROOT / "previews"

GRASS_TINT = (0.57, 0.74, 0.35)
FOLIAGE_TINT = (0.47, 0.67, 0.18)
TINTED = {"grass": GRASS_TINT, "fern": GRASS_TINT, "vine": FOLIAGE_TINT, "lily_pad": FOLIAGE_TINT}
MANUAL = {
    "water": (63, 118, 228), "chest": (163, 116, 47), "trapped_chest": (163, 116, 47),
    "spawner": (36, 46, 62), "cobweb": (220, 220, 220), "lantern": (230, 170, 80),
    "campfire": (240, 140, 40), "skeleton_skull": (200, 200, 190), "candle": (230, 220, 190),
}
CUTAWAY = {"wayside_shrine": 5, "hunter_cabin": 3, "desert_ruin": 3, "swamp_hut": 9, "overgrown_ruin": 3,
           "watchtower": 9, "abandoned_fort": 4, "crypt": 3}


def _get(path):
    CACHE.mkdir(parents=True, exist_ok=True)
    local = CACHE / path.replace("/", "__")
    if not local.exists():
        try:
            with urllib.request.urlopen(f"{ASSETS}/{path}") as response:
                local.write_bytes(response.read())
        except Exception:
            local.write_bytes(b"")
    return local.read_bytes()


def _model_textures(model_id):
    textures = {}
    while model_id:
        name = model_id.split(":")[-1]
        raw = _get(f"models/{name}.json")
        if not raw:
            break
        model = json.loads(raw)
        for key, value in model.get("textures", {}).items():
            textures.setdefault(key, value)
        model_id = model.get("parent")
    for _ in range(5):
        for key, value in list(textures.items()):
            if value.startswith("#"):
                textures[key] = textures.get(value[1:], value)
    return textures


def _avg(texture_id):
    raw = _get(f"textures/{texture_id.split(':')[-1]}.png")
    if not raw:
        return None
    img = Image.open(io.BytesIO(raw)).convert("RGBA")
    img = img.crop((0, 0, img.width, img.width))  # first animation frame
    r = g = b = n = 0
    for pr, pg, pb, pa in list(img.getdata()):
        if pa > 30:
            r, g, b, n = r + pr, g + pg, b + pb, n + 1
    return (r // n, g // n, b // n) if n else None


_colors = {}


def block_colors(bid):
    """(top, side) colors for a block id."""
    if bid in _colors:
        return _colors[bid]
    if bid in MANUAL:
        _colors[bid] = (MANUAL[bid], MANUAL[bid])
        return _colors[bid]
    raw = _get(f"blockstates/{bid}.json")
    model = None
    if raw:
        state = json.loads(raw)
        if "variants" in state:
            variant = next(iter(state["variants"].values()))
            model = (variant[0] if isinstance(variant, list) else variant)["model"]
        elif "multipart" in state:
            apply = state["multipart"][0]["apply"]
            model = (apply[0] if isinstance(apply, list) else apply)["model"]
    textures = _model_textures(model) if model else {}

    def pick(*keys):
        for key in keys:
            if key in textures and not textures[key].startswith("#"):
                color = _avg(textures[key])
                if color:
                    return color
        return None

    side = pick("side", "all", "texture", "cross", "plant", "wool", "pane", "front", "particle") or (150, 150, 150)
    top = pick("top", "end", "up", "all", "texture", "cross", "plant", "wool", "pane", "particle") or side
    if bid in TINTED:
        tint = TINTED[bid]
        side = tuple(int(c * t) for c, t in zip(side, tint))
        top = tuple(int(c * t) for c, t in zip(top, tint))
    _colors[bid] = (top, side)
    return _colors[bid]


def boxes_for(state):
    """Approximate the block shape with axis-aligned boxes in unit coordinates."""
    bid, p = state.id, state.props
    if bid.endswith("_slab"):
        return [(0, 0.5, 0, 1, 1, 1)] if p.get("type") == "top" else [(0, 0, 0, 1, 0.5, 1)]
    if bid.endswith("_carpet") or bid in ("moss_carpet", "spruce_pressure_plate"):
        return [(0.05, 0, 0.05, 0.95, 0.07, 0.95)]
    if bid.endswith("_fence") or bid.endswith("_wall") or bid.endswith("_pane") or bid == "iron_bars":
        thick = 0.25 if bid.endswith("_wall") else 0.12
        boxes = [(0.5 - thick, 0, 0.5 - thick, 0.5 + thick, 1, 0.5 + thick)]
        for side, (x0, z0, x1, z1) in {"north": (0.5 - thick / 2, 0, 0.5 + thick / 2, 0.5),
                                         "south": (0.5 - thick / 2, 0.5, 0.5 + thick / 2, 1),
                                         "west": (0, 0.5 - thick / 2, 0.5, 0.5 + thick / 2),
                                         "east": (0.5, 0.5 - thick / 2, 1, 0.5 + thick / 2)}.items():
            if p.get(side) in ("true", "low", "tall"):
                boxes.append((x0, 0.15 if bid.endswith("_fence") else 0, z0, x1, 0.85, z1))
        return boxes
    if bid in ("ladder", "vine") or bid.endswith("_door") or (bid.endswith("_trapdoor") and p.get("open") == "true"):
        f = p.get("facing", "north")
        if bid == "vine":
            f = next((OPP[s] for s in ("north", "south", "east", "west") if p.get(s) == "true"), "north")
        if bid.endswith("_door"):
            f = OPP[f]
        return [{"north": (0, 0, 0.85, 1, 1, 1), "south": (0, 0, 0, 1, 1, 0.15),
                 "east": (0, 0, 0, 0.15, 1, 1), "west": (0.85, 0, 0, 1, 1, 1)}[f]]
    if bid.endswith("_trapdoor"):
        return [(0, 0.82, 0, 1, 1, 1)] if p.get("half") == "top" else [(0, 0, 0, 1, 0.18, 1)]
    if bid.endswith("_bed"):
        return [(0, 0, 0, 1, 0.56, 1)]
    if bid in ("lantern", "soul_lantern"):
        return [(0.3, 0.1, 0.3, 0.7, 0.55, 0.7)] if p.get("hanging") == "true" else [(0.3, 0, 0.3, 0.7, 0.45, 0.7)]
    if bid == "chain":
        return [(0.42, 0, 0.42, 0.58, 1, 0.58)]
    if bid in ("candle", "flower_pot") or bid.startswith("potted_"):
        return [(0.35, 0, 0.35, 0.65, 0.4, 0.65)]
    if bid in ("skeleton_skull",):
        return [(0.25, 0, 0.25, 0.75, 0.5, 0.75)]
    if bid in ("chest", "trapped_chest"):
        return [(0.06, 0, 0.06, 0.94, 0.88, 0.94)]
    if bid in ("campfire",):
        return [(0, 0, 0, 1, 0.45, 1)]
    if bid in ("dead_bush", "fern", "grass", "cobweb") or bid.endswith("_mushroom"):
        return [(0.2, 0, 0.2, 0.8, 0.8, 0.8)]
    if bid == "dirt_path":
        return [(0, 0, 0, 1, 0.94, 1)]
    return [(0, 0, 0, 1, 1, 1)]


OPP = {"north": "south", "south": "north", "east": "west", "west": "east"}


def shade(color, factor):
    return tuple(max(0, min(255, int(c * factor))) for c in color)


def render(template, max_y=None, scale=14):
    cos30 = 0.8660254
    sx, sy, sz = template.size
    faces = []
    for (x, y, z), state in template.blocks.items():
        if state.id in ("air", "cave_air") or (max_y is not None and y > max_y):
            continue
        top, side = block_colors(state.id)
        for bx0, by0, bz0, bx1, by1, bz1 in boxes_for(state):
            X0, Y0, Z0, X1, Y1, Z1 = x + bx0, y + by0, z + bz0, x + bx1, y + by1, z + bz1
            depth = (X0 + X1) / 2 + (Y0 + Y1) / 2 + (Z0 + Z1) / 2
            faces.append((depth, [(X0, Y1, Z0), (X1, Y1, Z0), (X1, Y1, Z1), (X0, Y1, Z1)], top))
            faces.append((depth, [(X0, Y0, Z1), (X1, Y0, Z1), (X1, Y1, Z1), (X0, Y1, Z1)], shade(side, 0.8)))
            faces.append((depth, [(X1, Y0, Z0), (X1, Y0, Z1), (X1, Y1, Z1), (X1, Y1, Z0)], shade(side, 0.62)))

    def project(px, py, pz):
        return ((px - pz) * cos30 * scale, (px + pz) * 0.5 * scale - py * scale)

    xs = [project(*c)[0] for c in ((0, 0, sz), (sx, 0, 0))]
    ys = [project(*c)[1] for c in ((0, sy, 0), (sx, 0, sz))]
    margin = 12
    width = int(xs[1] - xs[0]) + 2 * margin
    height = int(ys[1] - ys[0]) + 2 * margin
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for _, quad, color in sorted(faces, key=lambda f: f[0]):
        pts = [project(*c) for c in quad]
        pts = [(px - xs[0] + margin, py - ys[0] + margin) for px, py in pts]
        draw.polygon(pts, fill=color + (255,), outline=shade(color, 0.85) + (255,))
    return img


def main():
    OUT.mkdir(exist_ok=True)
    for name, template in build_templates().items():
        template.connect_shapes()
        full = render(template)
        cut = render(template, max_y=CUTAWAY.get(name))
        gap = 24
        canvas = Image.new("RGBA", (full.width + cut.width + gap, max(full.height, cut.height)), (24, 26, 32, 255))
        canvas.alpha_composite(full, (0, canvas.height - full.height))
        canvas.alpha_composite(cut, (full.width + gap, canvas.height - cut.height))
        path = OUT / f"{name}.png"
        canvas.convert("RGB").save(path, optimize=True)
        print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
