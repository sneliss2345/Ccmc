"""Validate the built datapack against vanilla Minecraft 1.20.1 data.

Usage (after ``python3 -m tools.build``):

    python3 -m tools.validate

Reference data (block states, registries) comes from the misode/mcmeta
mirror of the official data generator output and is cached in
``tools/.cache``. Exits non-zero if any problem is found.
"""

import json
import pathlib
import sys
import urllib.request

from . import nbt
from .builder import State, is_full_solid
from .build import OUT_DIR, build_templates
from .datapack import NS

MCMETA = "https://raw.githubusercontent.com/misode/mcmeta/1.20.1-summary"
CACHE = pathlib.Path(__file__).resolve().parent / ".cache"

BLOCK_ENTITY_IDS = {
    "chest": "minecraft:chest", "trapped_chest": "minecraft:trapped_chest", "barrel": "minecraft:barrel",
    "spawner": "minecraft:mob_spawner", "suspicious_sand": "minecraft:brushable_block",
    "suspicious_gravel": "minecraft:brushable_block",
}
SPAWN_LIGHT_LIMIT = 0  # 1.18+ overworld monsters need block light 0


def fetch(name, url):
    CACHE.mkdir(exist_ok=True)
    path = CACHE / name
    if not path.exists():
        with urllib.request.urlopen(url) as response:
            path.write_bytes(response.read())
    return json.loads(path.read_text())


class Report:
    def __init__(self):
        self.errors = []
        self.notes = []

    def error(self, where, message):
        self.errors.append(f"{where}: {message}")

    def note(self, where, message):
        self.notes.append(f"{where}: {message}")


def check_states(report, where, palette, block_ids, block_states):
    for entry in palette:
        name = entry["Name"]
        bid = name.split(":", 1)[1]
        if bid not in block_ids:
            report.error(where, f"unknown block {name}")
            continue
        props = entry.get("Properties", {})
        allowed = block_states.get(bid, [{}, {}])[0]
        for key, value in props.items():
            if key not in allowed:
                report.error(where, f"{bid} has no property '{key}'")
            elif value not in allowed[key]:
                report.error(where, f"{bid}[{key}={value}] invalid; allowed {allowed[key]}")
        missing = set(allowed) - set(props)
        if missing and bid not in ("air",):
            report.note(where, f"{bid} leaves {sorted(missing)} at default")


def check_supports(report, t):
    """Placement sanity: things that would pop off or look broken in game."""
    b = t.blocks

    def solid(x, y, z):
        s = b.get((x, y, z))
        return s is None or is_full_solid(s)  # None = natural terrain

    def at(pos):
        return b.get(pos)

    offsets = {"north": (0, 0, -1), "south": (0, 0, 1), "east": (1, 0, 0), "west": (-1, 0, 0)}
    for (x, y, z), s in b.items():
        bid, p = s.id, s.props
        where = f"{t.name} ({x},{y},{z}) {bid}"
        if bid == "ladder":
            dx, _, dz = offsets[p["facing"]]
            if not solid(x - dx, y, z - dz):
                report.error(where, "ladder has nothing to hang on")
        elif bid in ("lantern", "soul_lantern"):
            if p.get("hanging") == "true":
                above = at((x, y + 1, z))
                if not (solid(x, y + 1, z) or (above and above.id == "chain")):
                    report.error(where, "hanging lantern without a block above")
            elif not solid(x, y - 1, z) and not (at((x, y - 1, z)) and at((x, y - 1, z)).id.endswith("_fence")):
                report.error(where, "standing lantern without support")
        elif bid.endswith("_door"):
            other = (x, y + 1, z) if p["half"] == "lower" else (x, y - 1, z)
            o = at(other)
            if not o or o.id != bid or o.props["half"] == p["half"]:
                report.error(where, "door half without its partner")
        elif bid.endswith("_bed"):
            dx, _, dz = offsets[p["facing"]]
            other = (x - dx, y, z - dz) if p["part"] == "head" else (x + dx, y, z + dz)
            o = at(other)
            if not o or o.id != bid or o.props["part"] == p["part"]:
                report.error(where, "bed part without its partner")
        elif bid == "vine":
            for side in ("north", "south", "east", "west"):
                if p.get(side) == "true":
                    dx, _, dz = offsets[side]
                    if not solid(x + dx, y, z + dz):
                        report.error(where, f"vine attached to air on its {side} side")
        elif bid in ("candle", "flower_pot", "brewing_stand", "campfire", "dead_bush", "fern", "grass",
                     "moss_carpet", "brown_carpet", "skeleton_skull", "spruce_pressure_plate") \
                or bid.startswith("potted_") or bid.endswith("_carpet"):
            below = at((x, y - 1, z))
            ok = solid(x, y - 1, z) or (below is not None and (below.id.endswith("_fence") or below.id == "spawner"))
            if not ok:
                report.error(where, "needs a block underneath")
        if bid in ("dead_bush",) and at((x, y - 1, z)) and at((x, y - 1, z)).id not in ("sand", "red_sand", "terracotta"):
            report.error(where, "dead bush must stand on sand")
        if bid in ("chest", "trapped_chest"):
            for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = at((x + dx, y, z + dz))
                if n and n.id == bid:
                    report.error(where, "adjacent chests would merge")


def check_spawner_light(report, t):
    light = t.block_light()
    for (x, y, z) in t.spawners():
        lit = []
        for dx in range(-4, 5):
            for dy in (-1, 0, 1):
                for dz in range(-4, 5):
                    pos = (x + dx, y + dy, z + dz)
                    s = t.blocks.get(pos)
                    below = t.blocks.get((pos[0], pos[1] - 1, pos[2]))
                    if s is None or s.id != "air" or below is None or not is_full_solid(below):
                        continue
                    if light.get(pos, 0) > SPAWN_LIGHT_LIMIT:
                        lit.append((pos, light[pos]))
        where = f"{t.name} spawner ({x},{y},{z})"
        if lit:
            worst = max(lit, key=lambda item: item[1])
            report.error(where, f"{len(lit)} spawn cells are lit (max level {worst[1]} at {worst[0]})")
        else:
            report.note(where, "spawn area fully dark")


def walk_json(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walk_json(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_json(item)


def main():
    blocks = fetch("blocks.json", f"{MCMETA}/blocks/data.min.json")
    registries = fetch("registries.json", f"{MCMETA}/registries/data.min.json")
    reg = {key: set(values) for key, values in registries.items()}
    report = Report()
    data = OUT_DIR / "data" / NS

    def exists(kind, rid):
        """Does resource `rid` of `kind` exist in vanilla or in this pack?"""
        ns, path = rid.split(":", 1) if ":" in rid else ("minecraft", rid)
        if ns == NS:
            folder = {"loot_table": "loot_tables", "processor_list": "worldgen/processor_list",
                      "template_pool": "worldgen/template_pool", "structure": "worldgen/structure",
                      "structure_set": "worldgen/structure_set"}[kind]
            return (data / folder / f"{path}.json").exists()
        if kind == "processor_list":
            return path == "empty"  # the only vanilla list this pack references
        return path in reg.get(kind, set())

    # --- structure templates --------------------------------------------------------
    templates = build_templates()
    for name, template in templates.items():
        path = data / "structures" / f"{name}.nbt"
        root = nbt.loads(path.read_bytes())
        where = f"structures/{name}.nbt"
        if root["DataVersion"] != 3465:
            report.error(where, "wrong DataVersion")
        size = list(root["size"])
        if max(size) > 48:
            report.note(where, f"size {size} exceeds 48 (fine for worldgen, too big for a structure block)")
        check_states(report, where, root["palette"], reg["block"], blocks)
        for block in root["blocks"]:
            pos = list(block["pos"])
            if not all(0 <= c < s for c, s in zip(pos, size)):
                report.error(where, f"block at {pos} outside size {size}")
            state = root["palette"][block["state"]]
            bid = state["Name"].split(":", 1)[1]
            tag = block.get("nbt")
            expected = BLOCK_ENTITY_IDS.get(bid)
            if tag is not None and expected and tag.get("id") != expected:
                report.error(where, f"{bid} at {pos} has block entity id {tag.get('id')}")
            if tag and "LootTable" in tag and not exists("loot_table", tag["LootTable"]):
                report.error(where, f"missing loot table {tag['LootTable']}")
            if bid == "spawner":
                mob = tag["SpawnData"]["entity"]["id"].split(":", 1)[1]
                if mob not in reg["entity_type"]:
                    report.error(where, f"unknown spawner mob {mob}")
        check_supports(report, template)
        check_spawner_light(report, template)

    # --- JSON files -------------------------------------------------------------------
    for path in sorted(OUT_DIR.rglob("*.json")) + [OUT_DIR / "pack.mcmeta"]:
        rel = path.relative_to(OUT_DIR).as_posix()
        try:
            obj = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            report.error(rel, f"invalid JSON: {exc}")
            continue
        if "/loot_tables/" in rel:
            for node in walk_json(obj):
                if node.get("type") == "minecraft:item" and node["name"].split(":")[1] not in reg["item"]:
                    report.error(rel, f"unknown item {node['name']}")
                if "function" in node:
                    fn = node["function"].split(":")[1]
                    if fn not in reg["loot_function_type"]:
                        report.error(rel, f"unknown loot function {fn}")
                    if fn == "set_potion" and node["id"].split(":")[1] not in reg["potion"]:
                        report.error(rel, f"unknown potion {node['id']}")
                    if fn == "exploration_map":
                        tag_path = data / "tags/worldgen/structure" / (node["destination"].split(":")[1] + ".json")
                        if not tag_path.exists():
                            report.error(rel, f"missing structure tag {node['destination']}")
        elif "/tags/worldgen/biome/" in rel:
            for biome in obj["values"]:
                if biome.split(":")[1] not in reg["worldgen/biome"]:
                    report.error(rel, f"unknown biome {biome}")
        elif "/tags/blocks/" in rel:
            for block_id in obj["values"]:
                if block_id.split(":")[1] not in reg["block"]:
                    report.error(rel, f"unknown block {block_id}")
        elif "/tags/worldgen/structure/" in rel:
            for structure in obj["values"]:
                if not exists("structure", structure):
                    report.error(rel, f"missing structure {structure}")
        elif "/worldgen/structure/" in rel:
            if not exists("template_pool", obj["start_pool"]):
                report.error(rel, f"missing start pool {obj['start_pool']}")
            tag = obj["biomes"].lstrip("#").split(":")[1]
            if not (data / "tags/worldgen/biome" / f"{tag}.json").exists():
                report.error(rel, f"missing biome tag {obj['biomes']}")
            extra = 0 if obj["terrain_adaptation"] == "none" else 12
            if obj["max_distance_from_center"] + extra > 128:
                report.error(rel, "max_distance_from_center plus terrain adaptation exceeds 128")
        elif "/worldgen/template_pool/" in rel:
            for element in obj["elements"]:
                el = element["element"]
                loc = el["location"].split(":")[1]
                if not (data / "structures" / f"{loc}.nbt").exists():
                    report.error(rel, f"missing template {el['location']}")
                proc = el["processors"]
                if not exists("processor_list", proc):
                    report.error(rel, f"missing processor list {proc}")
        elif "/worldgen/processor_list/" in rel:
            for node in walk_json(obj):
                for key in ("block", "Name"):
                    if key in node and isinstance(node[key], str) and node[key].split(":")[1] not in reg["block"]:
                        report.error(rel, f"unknown block {node[key]}")
                if "rottable_blocks" in node:
                    tag = node["rottable_blocks"].lstrip("#").split(":")[1]
                    if not (data / "tags/blocks" / f"{tag}.json").exists():
                        report.error(rel, f"missing block tag {node['rottable_blocks']}")
        elif "/worldgen/structure_set/" in rel:
            for entry in obj["structures"]:
                if not exists("structure", entry["structure"]):
                    report.error(rel, f"missing structure {entry['structure']}")
            placement = obj["placement"]
            if placement["separation"] >= placement["spacing"]:
                report.error(rel, "separation must be smaller than spacing")
        elif "/advancements/" in rel:
            icon = obj["display"]["icon"]["item"].split(":")[1]
            if icon not in reg["item"]:
                report.error(rel, f"unknown icon item {icon}")
            if "parent" in obj:
                parent = obj["parent"].split(":")[1]
                if not (data / "advancements" / f"{parent}.json").exists():
                    report.error(rel, f"missing parent {obj['parent']}")
            for node in walk_json(obj):
                loc = node.get("location")
                if isinstance(loc, dict) and "structure" in loc and not exists("structure", loc["structure"]):
                    report.error(rel, f"missing structure {loc['structure']}")

    mcmeta = json.loads((OUT_DIR / "pack.mcmeta").read_text(encoding="utf-8"))
    if mcmeta["pack"]["pack_format"] != 15:
        report.error("pack.mcmeta", "pack_format must be 15 for 1.20.1")

    for line in report.notes:
        print("note:", line)
    for line in report.errors:
        print("ERROR:", line)
    print(f"{len(report.errors)} error(s), {len(report.notes)} note(s)")
    return 1 if report.errors else 0


if __name__ == "__main__":
    sys.exit(main())
