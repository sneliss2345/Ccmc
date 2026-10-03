"""A small voxel builder that produces Minecraft 1.20.1 structure templates.

Coordinates are template-local: x grows east, y grows up, z grows south.
Positions that are never set stay out of the template entirely, which in
game behaves like a structure void: the original terrain is kept there.
Set "air" explicitly wherever terrain has to be cleared (room interiors).
"""

from . import nbt

DATA_VERSION = 3465  # Minecraft 1.20.1

HORIZONTAL = ("north", "east", "south", "west")
OFFSETS = {"north": (0, 0, -1), "south": (0, 0, 1), "east": (1, 0, 0), "west": (-1, 0, 0)}
OPPOSITE = {"north": "south", "south": "north", "east": "west", "west": "east"}
CLOCKWISE = {"north": "east", "east": "south", "south": "west", "west": "north"}


class State:
    """An immutable block state such as ``oak_stairs[facing=east]``."""

    __slots__ = ("name", "props")

    def __init__(self, name, props=None):
        if ":" not in name:
            name = "minecraft:" + name
        self.name = name
        self.props = dict(sorted((props or {}).items()))

    @classmethod
    def parse(cls, text):
        if isinstance(text, State):
            return text
        if "[" in text:
            name, rest = text.split("[", 1)
            props = {}
            for pair in rest.rstrip("]").split(","):
                if pair:
                    key, value = pair.split("=")
                    props[key.strip()] = value.strip()
            return cls(name.strip(), props)
        return cls(text.strip())

    @property
    def id(self):
        return self.name.split(":", 1)[1]

    def with_props(self, **props):
        merged = dict(self.props)
        merged.update({k: str(v).lower() if isinstance(v, bool) else str(v) for k, v in props.items()})
        return State(self.name, merged)

    def key(self):
        return (self.name, tuple(self.props.items()))

    def __eq__(self, other):
        return isinstance(other, State) and self.key() == other.key()

    def __hash__(self):
        return hash(self.key())

    def __repr__(self):
        if not self.props:
            return self.id
        return self.id + "[" + ",".join(f"{k}={v}" for k, v in self.props.items()) + "]"


# --- block classification helpers -------------------------------------------------

_NON_FULL_SUFFIXES = (
    "_stairs", "_slab", "_fence", "_fence_gate", "_wall", "_pane", "_door", "_trapdoor",
    "_carpet", "_bed", "_candle", "_skull", "_head", "_button", "_pressure_plate", "_sign",
    "_banner", "_sapling", "_tulip", "_torch", "_lichen",
)
_NON_FULL = {
    "air", "cave_air", "water", "lava", "ladder", "torch", "wall_torch", "soul_torch",
    "soul_wall_torch", "chest", "trapped_chest", "cobweb", "candle", "flower_pot", "campfire",
    "soul_campfire", "chain", "lever", "cauldron", "water_cauldron", "brewing_stand", "anvil",
    "chipped_anvil", "damaged_anvil", "lectern", "grindstone", "bell", "vine", "glass_pane",
    "iron_bars", "moss_carpet", "snow", "poppy", "dandelion", "fern", "grass", "tall_grass",
    "dead_bush", "sweet_berry_bush", "azalea", "flowering_azalea", "composter", "spawner",
    "lily_pad", "hanging_roots", "large_fern", "brown_mushroom", "red_mushroom", "end_rod",
    "lilac", "rose_bush", "peony", "oxeye_daisy", "cornflower", "allium", "azure_bluet",
    "lantern", "soul_lantern", "mangrove_roots", "skeleton_skull", "skeleton_wall_skull",
    "bell", "lightning_rod", "decorated_pot", "glow_lichen", "lily_of_the_valley", "sea_pickle",
    "carrots", "wheat", "potatoes", "beetroots", "pumpkin_stem", "melon_stem",
}


def is_full_solid(state):
    """Rough 'is a full, sturdy cube' test used for connections and light."""
    if state is None:
        return True  # unknown terrain around the template: assume solid
    bid = state.id
    if bid in _NON_FULL or bid.startswith("potted_"):
        return False
    if bid.endswith(_NON_FULL_SUFFIXES):
        return False
    if "glass" in bid or "leaves" in bid:
        return False
    return True


def is_fence(bid):
    return bid.endswith("_fence")


def is_pane(bid):
    return bid.endswith("glass_pane") or bid == "iron_bars"


def is_wall(bid):
    return bid.endswith("_wall")


def is_fence_gate(bid):
    return bid.endswith("_fence_gate")


LIGHT_EMISSION = {
    "lantern": 15, "soul_lantern": 10, "torch": 14, "wall_torch": 14, "soul_torch": 10,
    "soul_wall_torch": 10, "glowstone": 15, "jack_o_lantern": 15, "sea_lantern": 15,
    "shroomlight": 15, "end_rod": 14, "redstone_torch": 7, "redstone_wall_torch": 7,
    "magma_block": 3, "brewing_stand": 1, "fire": 15, "glow_lichen": 7,
}


def light_emission(state):
    bid = state.id
    if bid in ("campfire", "soul_campfire"):
        if state.props.get("lit", "true") == "true":
            return 15 if bid == "campfire" else 10
        return 0
    if bid in ("furnace", "smoker", "blast_furnace"):
        return 13 if state.props.get("lit") == "true" else 0
    if bid == "candle" or bid.endswith("_candle"):
        if state.props.get("lit") == "true":
            return 3 * int(state.props.get("candles", "1"))
        return 0
    return LIGHT_EMISSION.get(bid, 0)


class Template:
    def __init__(self, name, size):
        self.name = name
        self.size = size
        self.blocks = {}  # (x, y, z) -> State
        self.block_nbt = {}  # (x, y, z) -> dict

    # --- basic editing ------------------------------------------------------------

    def in_bounds(self, x, y, z):
        sx, sy, sz = self.size
        return 0 <= x < sx and 0 <= y < sy and 0 <= z < sz

    def set(self, x, y, z, state, nbt_data=None):
        if not self.in_bounds(x, y, z):
            raise ValueError(f"{self.name}: ({x},{y},{z}) outside template size {self.size}")
        pos = (x, y, z)
        self.blocks[pos] = State.parse(state)
        if nbt_data is not None:
            self.block_nbt[pos] = nbt_data
        else:
            self.block_nbt.pop(pos, None)

    def get(self, x, y, z):
        return self.blocks.get((x, y, z))

    def remove(self, x, y, z):
        self.blocks.pop((x, y, z), None)
        self.block_nbt.pop((x, y, z), None)

    def fill(self, x1, y1, z1, x2, y2, z2, state, only_empty=False):
        state = State.parse(state)
        for x in range(min(x1, x2), max(x1, x2) + 1):
            for y in range(min(y1, y2), max(y1, y2) + 1):
                for z in range(min(z1, z2), max(z1, z2) + 1):
                    if only_empty and (x, y, z) in self.blocks:
                        continue
                    self.set(x, y, z, state)

    def air(self, x1, y1, z1, x2, y2, z2):
        self.fill(x1, y1, z1, x2, y2, z2, "air")

    def walls(self, x1, z1, x2, z2, y1, y2, state):
        """Hollow rectangle of walls (perimeter only) between two corners."""
        for y in range(y1, y2 + 1):
            for x in range(x1, x2 + 1):
                self.set(x, y, z1, state)
                self.set(x, y, z2, state)
            for z in range(z1, z2 + 1):
                self.set(x1, y, z, state)
                self.set(x2, y, z, state)

    # --- furniture helpers --------------------------------------------------------

    def chest(self, x, y, z, facing, loot_table, block="chest"):
        self.set(x, y, z, f"{block}[facing={facing},type=single,waterlogged=false]",
                 {"id": "minecraft:chest", "LootTable": loot_table})

    def barrel(self, x, y, z, facing="up", loot_table=None):
        data = {"id": "minecraft:barrel"}
        if loot_table:
            data["LootTable"] = loot_table
        self.set(x, y, z, f"barrel[facing={facing},open=false]", data)

    def spawner(self, x, y, z, mob):
        entity = {"id": f"minecraft:{mob}"}
        self.set(x, y, z, "spawner", {
            "id": "minecraft:mob_spawner",
            "SpawnData": {"entity": entity},
            "SpawnPotentials": nbt.List(nbt.TAG_COMPOUND, [
                {"weight": nbt.Int(1), "data": {"entity": dict(entity)}},
            ]),
            "Delay": nbt.Short(20),
            "MinSpawnDelay": nbt.Short(200),
            "MaxSpawnDelay": nbt.Short(800),
            "SpawnCount": nbt.Short(4),
            "MaxNearbyEntities": nbt.Short(6),
            "RequiredPlayerRange": nbt.Short(16),
            "SpawnRange": nbt.Short(4),
        })

    def brushable(self, x, y, z, block, loot_table):
        self.set(x, y, z, f"{block}[dusted=0]",
                 {"id": "minecraft:brushable_block", "LootTable": loot_table})

    def door(self, x, y, z, block, facing, hinge="left"):
        base = f"{block}[facing={facing},hinge={hinge},open=false,powered=false"
        self.set(x, y, z, base + ",half=lower]")
        self.set(x, y + 1, z, base + ",half=upper]")

    def bed(self, x, y, z, color, facing):
        """Bed whose head is at (x, y, z); the foot extends opposite to facing."""
        dx, _, dz = OFFSETS[facing]
        self.set(x, y, z, f"{color}_bed[facing={facing},occupied=false,part=head]")
        self.set(x - dx, y, z - dz, f"{color}_bed[facing={facing},occupied=false,part=foot]")

    def ladder(self, x, y1, y2, z, facing):
        for y in range(y1, y2 + 1):
            self.set(x, y, z, f"ladder[facing={facing},waterlogged=false]")

    # --- roofs --------------------------------------------------------------------

    def pyramid_ring(self, x1, z1, x2, z2, y, stairs, corner=None, half="bottom"):
        """One ring of inward-facing stairs; used to build hipped/pyramid roofs."""
        for x in range(x1 + 1, x2):
            self.set(x, y, z1, f"{stairs}[facing=south,half={half},shape=straight,waterlogged=false]")
            self.set(x, y, z2, f"{stairs}[facing=north,half={half},shape=straight,waterlogged=false]")
        for z in range(z1 + 1, z2):
            self.set(x1, y, z, f"{stairs}[facing=east,half={half},shape=straight,waterlogged=false]")
            self.set(x2, y, z, f"{stairs}[facing=west,half={half},shape=straight,waterlogged=false]")
        if corner:
            for x, z in ((x1, z1), (x2, z1), (x1, z2), (x2, z2)):
                self.set(x, y, z, corner)
        else:
            # Outer corner stairs whose raised quarter points at the middle.
            self.set(x1, y, z1, f"{stairs}[facing=east,half={half},shape=outer_right,waterlogged=false]")
            self.set(x2, y, z1, f"{stairs}[facing=south,half={half},shape=outer_right,waterlogged=false]")
            self.set(x2, y, z2, f"{stairs}[facing=west,half={half},shape=outer_right,waterlogged=false]")
            self.set(x1, y, z2, f"{stairs}[facing=north,half={half},shape=outer_right,waterlogged=false]")

    # --- finishing ----------------------------------------------------------------

    def _connects(self, bid, neighbor, direction):
        if neighbor is None:
            return False
        nid = neighbor.id
        if is_full_solid(neighbor):
            return True
        if is_fence(bid):
            if is_fence(nid):
                return (nid == "nether_brick_fence") == (bid == "nether_brick_fence")
            if is_fence_gate(nid):
                return neighbor.props.get("facing") in (CLOCKWISE[direction], OPPOSITE[CLOCKWISE[direction]])
            return False
        if is_pane(bid):
            return is_pane(nid) or is_wall(nid)
        if is_wall(bid):
            if is_wall(nid) or is_pane(nid):
                return True
            if is_fence_gate(nid):
                return neighbor.props.get("facing") in (CLOCKWISE[direction], OPPOSITE[CLOCKWISE[direction]])
            return False
        return False

    def connect_shapes(self):
        """Fill in north/east/south/west connection properties of fences, panes and walls."""
        updated = {}
        for (x, y, z), state in self.blocks.items():
            bid = state.id
            if not (is_fence(bid) or is_pane(bid) or is_wall(bid)):
                continue
            links = {}
            for direction in HORIZONTAL:
                dx, _, dz = OFFSETS[direction]
                links[direction] = self._connects(bid, self.blocks.get((x + dx, y, z + dz)), direction)
            if is_wall(bid):
                above = self.blocks.get((x, y + 1, z))
                straight_ns = links["north"] and links["south"] and not links["east"] and not links["west"]
                straight_ew = links["east"] and links["west"] and not links["north"] and not links["south"]
                post_above = above is not None and above.id not in ("air", "cave_air") and not is_full_solid(above)
                up = not (straight_ns or straight_ew) or post_above
                height = "low"
                props = {d: (height if links[d] else "none") for d in HORIZONTAL}
                props["up"] = "true" if up else "false"
            else:
                props = {d: ("true" if links[d] else "false") for d in HORIZONTAL}
            props["waterlogged"] = "false"
            updated[(x, y, z)] = state.with_props(**props)
        self.blocks.update(updated)

    def block_light(self):
        """Approximate block-light levels inside the template (terrain counts as opaque)."""
        level = {}
        queue = []
        for pos, state in self.blocks.items():
            emit = light_emission(state)
            if emit:
                level[pos] = emit
                queue.append(pos)
        head = 0
        while head < len(queue):
            x, y, z = queue[head]
            head += 1
            value = level[(x, y, z)] - 1
            if value <= 0:
                continue
            for dx, dy, dz in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)):
                npos = (x + dx, y + dy, z + dz)
                if is_full_solid(self.blocks.get(npos)):
                    continue
                if level.get(npos, 0) < value:
                    level[npos] = value
                    queue.append(npos)
        return level

    def spawners(self):
        return [pos for pos, s in self.blocks.items() if s.id == "spawner"]

    def to_nbt(self):
        self.connect_shapes()
        palette = []
        index = {}
        blocks = []
        for pos in sorted(self.blocks, key=lambda p: (p[1], p[2], p[0])):
            state = self.blocks[pos]
            key = state.key()
            if key not in index:
                index[key] = len(palette)
                entry = {"Name": state.name}
                if state.props:
                    entry["Properties"] = dict(state.props)
                palette.append(entry)
            block = {"pos": nbt.List(nbt.TAG_INT, [nbt.Int(c) for c in pos]), "state": nbt.Int(index[key])}
            if pos in self.block_nbt:
                block["nbt"] = self.block_nbt[pos]
            blocks.append(block)
        return {
            "DataVersion": nbt.Int(DATA_VERSION),
            "size": nbt.List(nbt.TAG_INT, [nbt.Int(c) for c in self.size]),
            "palette": nbt.List(nbt.TAG_COMPOUND, palette),
            "blocks": nbt.List(nbt.TAG_COMPOUND, blocks),
            "entities": nbt.List(nbt.TAG_COMPOUND, []),
        }
