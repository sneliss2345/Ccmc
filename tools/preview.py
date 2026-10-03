"""Render textured isometric previews of every structure (needs Pillow).

Usage:  python3 -m tools.preview [name ...]

Block models, blockstates and textures come from the vanilla 1.20.1 assets
(misode/mcmeta mirror, cached in tools/.cache/assets), so stairs, fences,
doors, plants and so on are drawn with their real shapes and textures.
Each image shows the structure on a patch of terrain next to a cut-away
view of its interior.
"""

import io
import json
import math
import pathlib
import sys
import urllib.request

from PIL import Image

from . import datapack
from .build import ROOT, build_templates
from .builder import State, is_full_solid

ASSETS = "https://raw.githubusercontent.com/misode/mcmeta/1.20.1-assets/assets/minecraft"
CACHE = pathlib.Path(__file__).resolve().parent / ".cache" / "assets"
OUT = ROOT / "previews"
SCALE = 16
COS30 = math.cos(math.radians(30))
BACKGROUND = (30, 34, 42, 255)

GRASS = (124, 189, 107)
FOLIAGE = (89, 174, 48)
TINTS = {
    "grass_block": GRASS, "grass": GRASS, "fern": GRASS, "tall_grass": GRASS, "large_fern": GRASS,
    "potted_fern": GRASS, "sugar_cane": GRASS, "vine": FOLIAGE, "oak_leaves": FOLIAGE,
    "jungle_leaves": FOLIAGE, "dark_oak_leaves": FOLIAGE, "acacia_leaves": FOLIAGE,
    "mangrove_leaves": (141, 177, 39), "spruce_leaves": (97, 153, 97), "birch_leaves": (128, 167, 85),
    "water": (63, 118, 228), "lily_pad": (32, 128, 48), "water_cauldron": (63, 118, 228),
}
# How far below/around the template the preview terrain reaches.
TERRAIN_DEPTH = 2
TERRAIN_MARGIN = 2
# Highest template layer shown in the cut-away view.
CUTAWAY = {"swamp_hut": 9, "wayside_shrine": 5, "overgrown_ruin": 5, "desert_ruin": 4, "watchtower": 21, "crypt": 3}


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


_textures = {}


def texture(tid):
    name = tid.split(":")[-1]
    if name not in _textures:
        raw = _get(f"textures/{name}.png")
        img = Image.open(io.BytesIO(raw)).convert("RGBA") if raw else None
        if img is not None and name.startswith("block/") and img.height > img.width:
            img = img.crop((0, 0, img.width, img.width))  # first animation frame
        _textures[name] = img
    return _textures[name]


_models = {}


def load_model(mid):
    name = mid.split(":")[-1]
    if name not in _models:
        raw = _get(f"models/{name}.json")
        if not raw:
            _models[name] = {"textures": {}, "elements": []}
        else:
            model = json.loads(raw)
            parent = load_model(model["parent"]) if "parent" in model else {"textures": {}, "elements": []}
            textures = dict(parent["textures"])
            textures.update(model.get("textures", {}))
            _models[name] = {"textures": textures, "elements": model.get("elements", parent["elements"])}
    return _models[name]


def resolve(textures, ref):
    for _ in range(10):
        if not ref.startswith("#"):
            return ref
        ref = textures.get(ref[1:], ref)
    return None


_blockstates = {}


def blockstate(bid):
    if bid not in _blockstates:
        raw = _get(f"blockstates/{bid}.json")
        _blockstates[bid] = json.loads(raw) if raw else None
    return _blockstates[bid]


def _matches(cond, props):
    if "OR" in cond:
        return any(_matches(c, props) for c in cond["OR"])
    if "AND" in cond:
        return all(_matches(c, props) for c in cond["AND"])
    return all(str(props.get(k, "")) in str(v).split("|") for k, v in cond.items())


def models_for(state):
    data = blockstate(state.id)
    if not data:
        return []
    chosen = []
    if "variants" in data:
        for key, value in data["variants"].items():
            want = dict(pair.split("=") for pair in key.split(",") if pair)
            if all(state.props.get(k) == v for k, v in want.items()):
                chosen.append(value[0] if isinstance(value, list) else value)
                break
    for part in data.get("multipart", []):
        if "when" not in part or _matches(part["when"], state.props):
            apply = part["apply"]
            chosen.append(apply[0] if isinstance(apply, list) else apply)
    return chosen


# --- geometry -------------------------------------------------------------------------

def _rot_axis(p, origin, axis, angle):
    a = math.radians(angle)
    c, s = math.cos(a), math.sin(a)
    x, y, z = (p[0] - origin[0], p[1] - origin[1], p[2] - origin[2])
    if axis == "x":
        y, z = y * c - z * s, y * s + z * c
    elif axis == "y":
        x, z = x * c + z * s, -x * s + z * c
    else:
        x, y = x * c - y * s, x * s + y * c
    return (x + origin[0], y + origin[1], z + origin[2])


def _rot_x90(p, steps):
    x, y, z = p
    for _ in range(steps % 4):
        y, z = z, 16 - y
    return (x, y, z)


def _rot_y90(p, steps):
    x, y, z = p
    for _ in range(steps % 4):
        x, z = 16 - z, x
    return (x, y, z)


def _face_corners(direction, f, t):
    x0, y0, z0 = f
    x1, y1, z1 = t
    return {
        "up": ((x0, y1, z0), (x1, y1, z0), (x0, y1, z1)),
        "down": ((x0, y0, z1), (x1, y0, z1), (x0, y0, z0)),
        "north": ((x1, y1, z0), (x0, y1, z0), (x1, y0, z0)),
        "south": ((x0, y1, z1), (x1, y1, z1), (x0, y0, z1)),
        "west": ((x0, y1, z0), (x0, y1, z1), (x0, y0, z0)),
        "east": ((x1, y1, z1), (x1, y1, z0), (x1, y0, z1)),
    }[direction]


def _default_uv(direction, f, t):
    x0, y0, z0 = f
    x1, y1, z1 = t
    return {
        "up": (x0, z0, x1, z1), "down": (x0, 16 - z1, x1, 16 - z0),
        "north": (16 - x1, 16 - y1, 16 - x0, 16 - y0), "south": (x0, 16 - y1, x1, 16 - y0),
        "west": (z0, 16 - y1, z1, 16 - y0), "east": (16 - z1, 16 - y1, 16 - z0, 16 - y0),
    }[direction]


def _box(f, t, tex, uv=None, faces=("up", "down", "north", "south", "east", "west")):
    return {"from": f, "to": t, "faces": {d: {"texture": tex, **({"uv": uv[d]} if uv else {})} for d in faces}}


FACING_STEPS = {"north": 0, "east": 1, "south": 2, "west": 3}


def special_parts(state):
    """Hand-made geometry for blocks that the game draws as entities."""
    bid, p = state.id, state.props
    steps = FACING_STEPS.get(p.get("facing", "north"), 0)
    if bid in ("chest", "trapped_chest"):
        tex = "entity/chest/normal" if bid == "chest" else "entity/chest/trapped"
        side, lid_side = (14, 33, 28, 43), (14, 14, 28, 19)
        base = _box((1, 0, 1), (15, 10, 15), tex, {d: side for d in ("north", "south", "east", "west", "down", "up")})
        lid = _box((1, 10, 1), (15, 14, 15), tex, {**{d: lid_side for d in ("north", "south", "east", "west")},
                                                   "up": (14, 0, 28, 14), "down": (14, 0, 28, 14)})
        lock = _box((7, 7, 0), (9, 11, 1), tex, {d: (1, 1, 3, 5) for d in ("north", "south", "east", "west", "up", "down")})
        return [(e, 0, steps) for e in (base, lid, lock)]
    if bid.endswith("_bed"):
        color = bid[: -len("_bed")]
        parts = [_box((0, 3, 0), (16, 9, 16), f"block/{color}_wool")]
        if p.get("part") == "head":
            parts.append(_box((2, 9, 1), (14, 10, 7), "block/white_wool"))
        return [(e, 0, steps) for e in parts]
    if bid in ("skeleton_skull", "skeleton_wall_skull"):
        tex = "entity/skeleton/skeleton"
        y0 = 4 if bid == "skeleton_wall_skull" else 0
        z0 = 8 if bid == "skeleton_wall_skull" else 4
        uv = {"north": (8, 8, 16, 16), "south": (24, 8, 32, 16), "east": (0, 8, 8, 16), "west": (16, 8, 24, 16),
              "up": (8, 0, 16, 8), "down": (16, 0, 24, 8)}
        rot = int(p.get("rotation", "0")) // 4 + 2
        return [(_box((4, y0, z0), (12, y0 + 8, z0 + 8), tex, uv), 0, steps if bid.endswith("wall_skull") else rot)]
    if bid.endswith("_wall_banner"):
        color = bid[: -len("_wall_banner")]
        return [(_box((1, -14, 14), (15, 14, 15.5), f"block/{color}_wool"), 0, steps + 2)]
    if bid.endswith("_banner"):
        color = bid[: -len("_banner")]
        rot = int(p.get("rotation", "0")) // 4
        return [(_box((7, 0, 7), (9, 30, 9), "block/stripped_oak_log"), 0, 0),
                (_box((1, 4, 6.5), (15, 30, 7.5), f"block/{color}_wool"), 0, rot)]
    if bid == "bell":
        return [(_box((4, 2, 4), (12, 11, 12), "block/gold_block"), 0, 0)]
    if bid == "water":
        return [(_box((0, 0, 0), (16, 14, 16), "block/water_still", faces=("up", "south", "east")), 0, 0)]
    return []


def block_parts(state):
    """[(element, textures, x_steps, y_steps)] for one block state."""
    result = []
    for variant in models_for(state):
        model = load_model(variant["model"])
        xs, ys = variant.get("x", 0) // 90, variant.get("y", 0) // 90
        for element in model["elements"]:
            result.append((element, model["textures"], xs, ys))
    for element, xs, ys in special_parts(state):
        result.append((element, {}, xs, ys))
    return result


def _opaque(state):
    return state is not None and is_full_solid(state) and "glass" not in state.id and "leaves" not in state.id \
        and state.id not in ("spawner", "water", "barrier")


_patch_cache = {}


def _face_image(tex_id, uv, rotation, tint, shade, alpha):
    key = (tex_id, uv, rotation, tint, round(shade, 2), alpha)
    if key in _patch_cache:
        return _patch_cache[key]
    img = texture(tex_id)
    if img is None:
        _patch_cache[key] = None
        return None
    k = img.width / 16.0
    u0, v0, u1, v1 = uv
    box = (int(round(min(u0, u1) * k)), int(round(min(v0, v1) * k)),
           int(round(max(u0, u1) * k)), int(round(max(v0, v1) * k)))
    if box[2] <= box[0]:
        box = (box[0], box[1], box[0] + 1, box[3])
    if box[3] <= box[1]:
        box = (box[0], box[1], box[2], box[1] + 1)
    crop = img.crop(box)
    if u1 < u0:
        crop = crop.transpose(Image.FLIP_LEFT_RIGHT)
    if v1 < v0:
        crop = crop.transpose(Image.FLIP_TOP_BOTTOM)
    if rotation:
        crop = crop.rotate(-rotation, expand=True)
    r, g, b, a = crop.split()
    tr, tg, tb = tint if tint else (255, 255, 255)
    r = r.point(lambda v: int(v * tr / 255 * shade))
    g = g.point(lambda v: int(v * tg / 255 * shade))
    b = b.point(lambda v: int(v * tb / 255 * shade))
    if alpha < 1:
        a = a.point(lambda v: int(v * alpha))
    crop = Image.merge("RGBA", (r, g, b, a))
    # One pixel of edge padding hides seams between neighbouring faces.
    w, h = crop.size
    padded = Image.new("RGBA", (w + 2, h + 2))
    padded.paste(crop, (1, 1))
    padded.paste(crop.crop((0, 0, w, 1)), (1, 0))
    padded.paste(crop.crop((0, h - 1, w, h)), (1, h + 1))
    padded.paste(padded.crop((1, 0, 2, h + 2)), (0, 0))
    padded.paste(padded.crop((w, 0, w + 1, h + 2)), (w + 1, 0))
    _patch_cache[key] = (padded, w, h)
    return _patch_cache[key]


def project(p):
    x, y, z = p
    return ((x - z) * COS30 * SCALE, (x + z) * 0.5 * SCALE - y * SCALE)


def collect_faces(blocks):
    faces = []
    for (bx, by, bz), state in blocks.items():
        if state.id in ("air", "cave_air", "structure_void"):
            continue
        tint = TINTS.get(state.id)
        alpha = 0.78 if state.id == "water" else 1.0
        for element, textures, xs, ys in block_parts(state):
            f, t = element["from"], element["to"]
            rot = element.get("rotation")
            for direction, face in element.get("faces", {}).items():
                tex_ref = face.get("texture", "")
                tex_id = resolve(textures, tex_ref) if tex_ref.startswith("#") else tex_ref
                if not tex_id:
                    continue
                corners = list(_face_corners(direction, f, t))
                if rot:
                    corners = [_rot_axis(c, rot["origin"], rot["axis"], rot["angle"]) for c in corners]
                corners = [_rot_y90(_rot_x90(c, xs), ys) for c in corners]
                tl, tr, bl = [(bx + c[0] / 16, by + c[1] / 16, bz + c[2] / 16) for c in corners]
                e1 = (tr[0] - tl[0], tr[1] - tl[1], tr[2] - tl[2])
                e2 = (bl[0] - tl[0], bl[1] - tl[1], bl[2] - tl[2])
                n = (e2[1] * e1[2] - e2[2] * e1[1], e2[2] * e1[0] - e2[0] * e1[2], e2[0] * e1[1] - e2[1] * e1[0])
                length = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) or 1
                n = (n[0] / length, n[1] / length, n[2] / length)
                facing_camera = n[0] + n[1] + n[2]
                if facing_camera <= 1e-6:
                    if not rot:
                        continue
                    # Cross-shaped plants: draw the back of the plane instead.
                    tl, tr = tr, tl
                    e1 = (-e1[0], -e1[1], -e1[2])
                    n = (-n[0], -n[1], -n[2])
                if "cullface" in face or (not rot and abs(max(n, key=abs)) > 0.99):
                    axis = max(range(3), key=lambda i: abs(n[i]))
                    sign = 1 if n[axis] > 0 else -1
                    plane = tl[axis]
                    boundary = (bx, by, bz)[axis] + (1 if sign > 0 else 0)
                    if abs(plane - boundary) < 1e-6:
                        nb = [bx, by, bz]
                        nb[axis] += sign
                        if _opaque(blocks.get(tuple(nb))):
                            continue
                if n[1] > 0.7:
                    shade = 1.0
                elif abs(n[2]) >= abs(n[0]):
                    shade = 0.82
                else:
                    shade = 0.64
                if rot:
                    shade = 0.9
                uv = tuple(face.get("uv") or _default_uv(direction, f, t))
                face_tint = tint if ("tintindex" in face or state.id == "water") else None
                patch = _face_image(tex_id, uv, face.get("rotation", 0), face_tint, shade, alpha)
                if patch is None:
                    continue
                cx = (tl[0] + tr[0] + bl[0] + (tr[0] + bl[0] - tl[0])) / 4
                cy = (tl[1] + tr[1] + bl[1] + (tr[1] + bl[1] - tl[1])) / 4
                cz = (tl[2] + tr[2] + bl[2] + (tr[2] + bl[2] - tl[2])) / 4
                depth = cx + cy + cz + (0.001 if state.id == "water" else 0)
                faces.append((depth, tl, tr, bl, patch))
    return faces


def render(blocks):
    faces = collect_faces(blocks)
    if not faces:
        return Image.new("RGBA", (10, 10), BACKGROUND)
    pts = []
    for _, tl, tr, bl, _ in faces:
        pts.extend(project(p) for p in (tl, tr, bl))
    min_x = min(p[0] for p in pts) - 8
    min_y = min(p[1] for p in pts) - 8
    width = int(max(p[0] for p in pts) - min_x) + 16
    height = int(max(p[1] for p in pts) - min_y) + 24
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for _, tl, tr, bl, (padded, w, h) in sorted(faces, key=lambda item: item[0]):
        a = project(tl)
        b = project(tr)
        c = project(bl)
        ax, ay = a[0] - min_x, a[1] - min_y
        ux, uy = b[0] - a[0], b[1] - a[1]
        vx, vy = c[0] - a[0], c[1] - a[1]
        det = ux * vy - uy * vx
        if abs(det) < 1e-6:
            continue
        xs = [ax, ax + ux, ax + vx, ax + ux + vx]
        ys = [ay, ay + uy, ay + vy, ay + uy + vy]
        x0, y0 = int(math.floor(min(xs))) - 1, int(math.floor(min(ys))) - 1
        x1, y1 = int(math.ceil(max(xs))) + 1, int(math.ceil(max(ys))) + 1
        ox, oy = ax - x0, ay - y0
        # Output pixel (px, py) -> texture coordinates of the padded patch.
        A, B = w * vy / det, -w * vx / det
        D, E = -h * uy / det, h * ux / det
        C = 1 - A * ox - B * oy
        F = 1 - D * ox - E * oy
        patch = padded.transform((x1 - x0, y1 - y0), Image.AFFINE, (A, B, C, D, E, F), resample=Image.NEAREST)
        img.alpha_composite(patch, (x0, y0))
    return img


def scene(template, ground_y, terrain, max_y=None, min_y=None, with_terrain=True):
    blocks = {}
    for pos, state in template.blocks.items():
        if max_y is not None and pos[1] > max_y:
            continue
        if min_y is not None and pos[1] < min_y:
            continue
        blocks[pos] = state
    if with_terrain:
        sx, _, sz = template.size
        top, below = terrain
        for x in range(-TERRAIN_MARGIN, sx + TERRAIN_MARGIN):
            for z in range(-TERRAIN_MARGIN, sz + TERRAIN_MARGIN):
                for y in range(ground_y - TERRAIN_DEPTH, ground_y + 1):
                    if max_y is not None and y > max_y:
                        continue
                    if (x, y, z) not in template.blocks:
                        blocks[(x, y, z)] = top if y == ground_y else below
    return blocks


def terrain_for(name):
    biomes = datapack.STRUCTURES[name]["biomes"]
    if "desert" in biomes:
        return State.parse("sand"), State.parse("sandstone")
    if "swamp" in biomes:
        return State.parse("water"), State.parse("mud")
    return State.parse("grass_block[snowy=false]"), State.parse("dirt")


def main(names=None):
    OUT.mkdir(exist_ok=True)
    for name, template in build_templates().items():
        if names and name not in names:
            continue
        template.connect_shapes()
        ground_y = -datapack.STRUCTURES[name]["start_height"]
        terrain = terrain_for(name)
        full = render(scene(template, ground_y, terrain, min_y=ground_y - TERRAIN_DEPTH))
        cut_y = CUTAWAY.get(name, ground_y + 3)
        underground = cut_y < ground_y
        cut = render(scene(template, ground_y, terrain, max_y=cut_y, with_terrain=not underground))
        gap = 32
        canvas = Image.new("RGBA", (full.width + cut.width + gap, max(full.height, cut.height)), BACKGROUND)
        canvas.alpha_composite(full, (0, canvas.height - full.height))
        canvas.alpha_composite(cut, (full.width + gap, canvas.height - cut.height))
        path = OUT / f"{name}.png"
        canvas.convert("RGB").save(path, optimize=True)
        print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    main(sys.argv[1:] or None)
