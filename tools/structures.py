"""Block-by-block definitions of every structure in the pack.

Template conventions (see builder.py): x grows east, y up, z south. The
layer y = -start_height (see datapack.STRUCTURES) is flush with the terrain
surface; everything below it is buried. Unset positions keep the original
terrain, so "air" is set explicitly wherever terrain must be cleared.
"""

import random

from .builder import Template

NS = "ccmc"
ARCHAEOLOGY_DESERT = "minecraft:archaeology/desert_pyramid"


def loot(name):
    return f"{NS}:chests/{name}"


# --- block state shorthands ------------------------------------------------------------

def st(block, facing, half="bottom", shape="straight"):
    return f"{block}[facing={facing},half={half},shape={shape},waterlogged=false]"


def sl(block, kind="bottom"):
    return f"{block}[type={kind},waterlogged=false]"


def lg(block, axis="y"):
    return f"{block}[axis={axis}]"


def trap(block, facing, half="bottom", is_open=False):
    return f"{block}[facing={facing},half={half},open={str(is_open).lower()},powered=false,waterlogged=false]"


def leaves(block="oak_leaves"):
    return f"{block}[distance=1,persistent=true,waterlogged=false]"


def lantern(hanging=False, soul=False):
    return f"{'soul_' if soul else ''}lantern[hanging={str(hanging).lower()},waterlogged=false]"


def candle(count=1, lit=True):
    return f"candle[candles={count},lit={str(lit).lower()},waterlogged=false]"


def vine(*sides):
    flags = {side: ("true" if side in sides else "false") for side in ("north", "south", "east", "west", "up")}
    return "vine[" + ",".join(f"{k}={v}" for k, v in flags.items()) + "]"


def lichen(*sides):
    flags = {s: ("true" if s in sides else "false") for s in ("north", "south", "east", "west", "up", "down")}
    return "glow_lichen[" + ",".join(f"{k}={v}" for k, v in flags.items()) + ",waterlogged=false]"


def wall_banner(color, facing):
    return f"{color}_wall_banner[facing={facing}]"


def bookshelf(facing, filled):
    slots = ",".join(f"slot_{i}_occupied={'true' if i in filled else 'false'}" for i in range(6))
    return f"chiseled_bookshelf[facing={facing},{slots}]"


OPPOSITE = {"north": "south", "south": "north", "east": "west", "west": "east"}
STEP = {"north": (0, -1), "south": (0, 1), "east": (1, 0), "west": (-1, 0)}


# --- roof and shape helpers --------------------------------------------------------------

def gable(t, axis, along, across, y0, stairs, ridge_slab, ridge_beam, skip=lambda x, y, z: False):
    """1:1 gable roof. axis='x' runs the ridge along x (slopes face north/south)."""
    a0, a1 = along
    b0, b1 = across
    i = 0
    while True:
        lo, hi, y = b0 + i, b1 - i, y0 + i
        if lo > hi:
            break
        for a in range(a0, a1 + 1):
            if axis == "x":
                cells = [(a, y, lo, "south"), (a, y, hi, "north")]
            else:
                cells = [(lo, y, a, "east"), (hi, y, a, "west")]
            if lo == hi:
                x, _, z, _ = cells[0]
                if not skip(x, y, z):
                    t.set(x, y, z, sl(ridge_slab))
                    t.set(x, y - 1, z, ridge_beam)
                continue
            for x, yy, z, facing in cells:
                if not skip(x, yy, z):
                    t.set(x, yy, z, st(stairs, facing))
        i += 1


def gable_fill(t, axis, plane, across, y0, block, first_row=1):
    """Fill the triangular gable end under a gable() roof."""
    b0, b1 = across
    i = first_row
    while b0 + i + 1 <= b1 - i - 1:
        for b in range(b0 + i + 1, b1 - i):
            if axis == "x":
                t.set(plane, y0 + i, b, block)
            else:
                t.set(b, y0 + i, plane, block)
        i += 1


def gable_air(t, axis, along, across, y0, first_row=0):
    """Clear the attic space under a gable() roof."""
    a0, a1 = along
    b0, b1 = across
    i = first_row
    while b0 + i + 1 <= b1 - i - 1:
        for a in range(a0, a1 + 1):
            for b in range(b0 + i + 1, b1 - i):
                if axis == "x":
                    t.set(a, y0 + i, b, "air")
                else:
                    t.set(b, y0 + i, a, "air")
        i += 1


def flower_bed(t, cells, rng, flowers):
    for x, z in cells:
        t.set(x, 0, z, "grass_block[snowy=false]")
        t.set(x, 1, z, rng.choice(flowers))


def octagon(r, cut=2):
    """Cells (dx, dz) of a filled octagon of 'radius' r with corners cut by `cut`."""
    return {(dx, dz) for dx in range(-r, r + 1) for dz in range(-r, r + 1) if abs(dx) + abs(dz) <= 2 * r - cut}


def boundary(cells):
    return {(x, z) for x, z in cells
            if any((x + dx, z + dz) not in cells for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)))}


def toward(cells, x, z):
    """Direction from (x, z) to a neighbouring cell that is inside `cells`."""
    for facing, (dx, dz) in STEP.items():
        if (x + dx, z + dz) in cells:
            return facing
    return "north"


# =========================================================================================
# Small structures
# =========================================================================================

def wayside_shrine():
    """A timber-framed roadside shrine with a bell, an altar and a flower garden."""
    rng = random.Random(1001)
    t = Template("wayside_shrine", (13, 13, 13))
    flowers = ["poppy", "dandelion", "cornflower", "oxeye_daisy", "azure_bluet", "allium", "lily_of_the_valley"]

    # Garden corners with a bush in each, path and lamp posts at the entrance.
    for cx, cz, bx, bz in ((0, 0, 0, 0), (11, 0, 12, 0), (0, 11, 0, 12), (11, 11, 12, 12)):
        flower_bed(t, [(cx + dx, cz + dz) for dx in (0, 1) for dz in (0, 1)], rng, flowers)
        t.set(bx, 1, bz, leaves("oak_leaves"))
        t.set(bx, 2, bz, leaves("flowering_azalea_leaves"))
    for z in (11, 12):
        t.set(6, 0, z, "dirt_path")
        t.set(5, 0, z, rng.choice(("dirt_path", "coarse_dirt")))
        t.set(7, 0, z, rng.choice(("dirt_path", "coarse_dirt")))
    for x in (4, 8):
        t.fill(x, 1, 11, x, 2, 11, "dark_oak_fence")
        t.set(x, 3, 11, lantern())

    # Stepped platform.
    t.fill(2, 0, 2, 10, 0, 10, "stone_bricks")
    t.pyramid_ring(2, 2, 10, 10, 1, "stone_brick_stairs")
    t.fill(3, 1, 3, 9, 1, 9, "stone_bricks")
    t.fill(4, 1, 4, 8, 1, 8, "polished_andesite")
    t.set(6, 1, 6, "chiseled_stone_bricks")
    t.air(3, 2, 3, 9, 6, 9)

    # Posts, brackets, beams and a back wall.
    for x, z in ((3, 3), (9, 3), (3, 9), (9, 9)):
        t.set(x, 2, z, "chiseled_stone_bricks")
        t.fill(x, 3, z, x, 7, z, lg("dark_oak_log"))
    for x in range(4, 9):
        t.set(x, 7, 3, lg("stripped_dark_oak_log", "x"))
        t.set(x, 7, 9, lg("stripped_dark_oak_log", "x"))
        t.set(x, 7, 6, lg("stripped_dark_oak_log", "x"))
    for z in range(4, 9):
        t.set(3, 7, z, lg("stripped_dark_oak_log", "z"))
        t.set(9, 7, z, lg("stripped_dark_oak_log", "z"))
    for x, z, facing in ((4, 3, "west"), (8, 3, "east"), (4, 9, "west"), (8, 9, "east"),
                         (3, 4, "north"), (9, 4, "north"), (3, 8, "south"), (9, 8, "south")):
        t.set(x, 6, z, st("dark_oak_stairs", facing, "top"))
    t.fill(4, 2, 3, 8, 5, 3, "dark_oak_planks")
    t.fill(4, 2, 3, 8, 2, 3, "stone_bricks")
    t.set(6, 5, 4, wall_banner("white", "south"))
    for z in range(4, 9):
        t.set(3, 2, z, "dark_oak_fence")
        t.set(9, 2, z, "dark_oak_fence")
    t.set(4, 2, 9, "dark_oak_fence")
    t.set(8, 2, 9, "dark_oak_fence")

    # Altar, offering chest, benches and the bell.
    t.set(5, 2, 4, "polished_andesite")
    t.set(6, 2, 4, "chiseled_stone_bricks")
    t.set(7, 2, 4, "polished_andesite")
    t.set(5, 3, 4, candle(3))
    t.set(6, 3, 4, "potted_lily_of_the_valley")
    t.set(7, 3, 4, candle(2))
    t.chest(6, 2, 5, "south", loot("wayside_shrine"))
    for x in (4, 5, 7, 8):
        t.set(x, 2, 7, st("dark_oak_stairs", "south"))
    for z in range(6, 10):
        t.set(6, 2, z, "red_carpet")
    t.set(6, 6, 6, "bell[attachment=ceiling,facing=north,powered=false]")

    # Hipped deepslate roof with a copper finial; lanterns under the eaves.
    for i in range(4):
        t.pyramid_ring(2 + i, 2 + i, 10 - i, 10 - i, 7 + i, "deepslate_tile_stairs")
    t.set(6, 11, 6, "deepslate_tiles")
    t.set(6, 12, 6, "lightning_rod[facing=up,powered=false,waterlogged=false]")
    for x, z in ((2, 2), (10, 2), (2, 10), (10, 10)):
        t.set(x, 6, z, lantern(hanging=True))
    return t


def hunter_cabin():
    """A log cabin with crossed corner logs, a stone chimney, a porch and a yard."""
    rng = random.Random(1002)
    t = Template("hunter_cabin", (15, 12, 15))
    # Cabin walls: x2..10, z3..9. Stone plinth at y0..y1, floor y1, logs y2..y5.

    t.fill(2, 0, 3, 10, 0, 9, "cobblestone")
    t.walls(2, 3, 10, 9, 1, 1, "cobblestone")
    t.fill(3, 1, 4, 9, 1, 8, "spruce_planks")
    t.fill(9, 1, 5, 9, 1, 7, "stone_bricks")  # hearth
    for y in range(2, 6):
        if y % 2 == 0:
            for x in range(1, 12):
                t.set(x, y, 3, lg("spruce_log", "x"))
                t.set(x, y, 9, lg("spruce_log", "x"))
            for z in range(4, 9):
                t.set(2, y, z, lg("spruce_log", "z"))
                t.set(10, y, z, lg("spruce_log", "z"))
        else:
            for z in range(2, 11):
                t.set(2, y, z, lg("spruce_log", "z"))
                t.set(10, y, z, lg("spruce_log", "z"))
            for x in range(3, 10):
                t.set(x, y, 3, lg("spruce_log", "x"))
                t.set(x, y, 9, lg("spruce_log", "x"))
    t.air(3, 2, 4, 9, 4, 8)

    # Gable roof (ridge along x) with an open, beamed attic.
    chimney = lambda x, y, z: x == 11 and z == 6
    gable_air(t, "x", (3, 9), (2, 10), 5)
    gable(t, "x", (1, 11), (2, 10), 5, "dark_oak_stairs", "dark_oak_slab",
          lg("stripped_spruce_log", "x"), skip=chimney)
    for gx in (2, 10):
        gable_fill(t, "x", gx, (2, 10), 5, "spruce_planks")
    t.set(2, 7, 6, "glass_pane")
    for x in (4, 8):
        t.fill(x, 5, 4, x, 5, 8, lg("stripped_spruce_log", "z"))

    # Windows with open shutters, and the door.
    for x, z, out in ((4, 3, "north"), (8, 3, "north"), (4, 9, "south"), (8, 9, "south"), (2, 6, "west")):
        t.set(x, 3, z, "glass_pane")
        dx, dz = STEP[out]
        if out in ("north", "south"):
            sides = ((x - 1, z + dz), (x + 1, z + dz))
        else:
            sides = ((x + dx, z - 1), (x + dx, z + 1))
        for sx, sz in sides:
            t.set(sx, 3, sz, trap("spruce_trapdoor", out, is_open=True))
    t.door(6, 2, 9, "spruce_door", "north")

    # Chimney with a fireplace inside.
    t.fill(11, 0, 5, 12, 4, 7, "cobblestone")
    t.fill(11, 5, 6, 12, 9, 6, "cobblestone")
    t.fill(11, 10, 6, 12, 10, 6, "stone_bricks")
    t.fill(10, 2, 5, 10, 4, 7, "cobblestone")
    t.set(10, 2, 6, "campfire[facing=west,lit=true,signal_fire=false,waterlogged=false]")
    t.set(9, 4, 5, sl("spruce_slab", "top"))
    t.set(9, 4, 6, sl("spruce_slab", "top"))
    t.set(9, 4, 7, sl("spruce_slab", "top"))

    # Porch.
    t.fill(3, 1, 10, 9, 1, 11, "spruce_planks")
    for x in (3, 9):
        t.fill(x, 2, 11, x, 3, 11, lg("stripped_spruce_log"))
    for x in range(3, 10):
        t.set(x, 4, 10, lg("stripped_spruce_log", "x"))
        t.set(x, 4, 11, st("dark_oak_stairs", "north"))
    for x in (4, 5, 7, 8):
        t.set(x, 2, 11, "spruce_fence")
    t.set(4, 3, 11, lantern())
    t.set(8, 3, 11, lantern())
    t.set(6, 1, 12, st("spruce_stairs", "north"))
    t.set(4, 2, 10, st("spruce_stairs", "north"))
    t.set(5, 2, 10, st("spruce_stairs", "north"))
    t.barrel(8, 2, 10, "up", loot("supplies"))

    # Interior.
    t.bed(3, 2, 4, "brown", "north")
    t.chest(3, 2, 7, "east", loot("hunter_cabin"))
    t.barrel(3, 2, 8, "up")
    t.set(5, 2, 4, "crafting_table")
    t.set(6, 2, 4, "fletching_table")
    t.set(7, 2, 4, "smoker[facing=south,lit=false]")
    t.barrel(8, 2, 4, "up", loot("supplies"))
    t.set(4, 4, 4, wall_banner("brown", "south"))
    t.set(6, 2, 7, "spruce_fence")
    t.set(6, 3, 7, "spruce_pressure_plate[powered=false]")
    t.set(5, 2, 7, st("spruce_stairs", "west"))
    t.set(7, 2, 7, st("spruce_stairs", "east"))
    for x in range(4, 9):
        for z in (5, 6):
            t.set(x, 2, z, "brown_carpet")
    t.set(6, 7, 6, "chain[axis=y,waterlogged=false]")
    t.set(6, 6, 6, "chain[axis=y,waterlogged=false]")
    t.set(6, 5, 6, lantern(hanging=True))

    # Yard: path, wood pile under the eaves, campfire, drying rack, berries.
    for z in (12, 13, 14):
        t.set(6, 0, z, "dirt_path")
        t.set(rng.choice((5, 7)), 0, z, "coarse_dirt")
    for z in range(4, 9):
        t.set(0, 1, z, lg("spruce_log", "z"))
        t.set(1, 1, z, lg("spruce_log", "z"))
        if z < 8:
            t.set(1, 2, z, lg("spruce_log", "z"))
        if 5 <= z <= 6:
            t.set(1, 3, z, lg("spruce_log", "z"))
    t.set(0, 1, 10, lg("spruce_log"))  # chopping block
    t.set(13, 1, 12, "campfire[facing=north,lit=true,signal_fire=false,waterlogged=false]")
    t.set(13, 1, 14, lg("stripped_spruce_log", "x"))
    t.set(11, 1, 12, lg("stripped_spruce_log", "z"))
    for x in (12, 14):
        t.fill(x, 1, 9, x, 2, 9, "spruce_fence")
    t.set(13, 2, 9, "spruce_fence")
    t.barrel(12, 1, 2, "up")
    t.set(13, 1, 2, "barrel[facing=east,open=false]")
    t.set(12, 2, 2, "barrel[facing=up,open=false]")
    for x, z in ((0, 13), (1, 14), (2, 13), (14, 5)):
        t.set(x, 0, z, "grass_block[snowy=false]")
        t.set(x, 1, z, "sweet_berry_bush[age=3]")
    return t


def desert_ruin():
    """A half-buried sandstone temple courtyard behind a pylon gate, with an obelisk."""
    rng = random.Random(1003)
    t = Template("desert_ruin", (15, 13, 17))
    # Placed 2 down: y2 is the sand surface layer, y0 the sunken courtyard floor.
    # Courtyard x2..12, z2..12; pylon gate on the south side (z13..15).

    for x in range(2, 13):
        for z in range(2, 13):
            t.set(x, 0, z, "smooth_sandstone" if (x + z) % 2 else "cut_sandstone")
    for x in range(5, 10):
        for z in range(6, 11):
            ring = max(abs(x - 7), abs(z - 8))
            t.set(x, 0, z, ("blue_terracotta", "orange_terracotta", "cut_sandstone")[ring])
    t.air(2, 1, 2, 12, 10, 12)

    # Enclosure wall: two courses above the sand, capped, with a few collapses.
    collapsed = {(1, 5), (1, 6), (13, 9), (13, 10), (13, 4), (9, 1)}
    for x in range(1, 14):
        for z in range(1, 14):
            if x not in (1, 13) and z not in (1, 13) or z == 13 and 5 <= x <= 9:
                continue
            if (x, z) in collapsed:
                t.fill(x, 1, z, x, 2, z, "sandstone")
                t.set(x, 3, z, "sand")
                continue
            t.fill(x, 1, z, x, 3, z, "sandstone")
            t.set(x, 4, z, "cut_sandstone")
            t.set(x, 5, z, sl("cut_sandstone_slab"))
    for x, z in ((1, 1), (13, 1), (1, 13), (13, 13)):
        t.fill(x, 4, z, x, 5, z, "chiseled_sandstone")
        t.set(x, 6, z, sl("smooth_sandstone_slab"))

    # Pylon gate: two battered towers with a terracotta band and a cornice.
    for x0, x1, top in ((1, 5, 9), (9, 13, 7)):
        for x in range(x0, x1 + 1):
            for z in range(13, 16):
                edge = x in (x0, x1)
                for y in range(1, top + 1):
                    t.set(x, y, z, "cut_sandstone" if edge else "sandstone")
            t.set(x, 6, 15, ("orange_terracotta", "blue_terracotta")[(x - x0) % 2])
            t.set(x, 5, 15, "chiseled_sandstone" if x in (x0, x1) else "smooth_sandstone")
            if top == 9:
                t.set(x, 9, 16, st("smooth_sandstone_stairs", "north", "top"))
                t.set(x, 10, 15, sl("smooth_sandstone_slab"))
                t.set(x, 10, 13, sl("smooth_sandstone_slab"))
        if top != 9:
            for x, z in ((9, 13), (10, 14), (11, 15), (12, 13)):
                t.set(x, 8, z, "sandstone")  # jagged collapsed top
            t.set(14, 3, 16, "sandstone")
            t.set(14, 3, 14, sl("cut_sandstone_slab"))
    t.air(6, 1, 13, 8, 7, 16)
    for x in range(5, 10):
        t.set(x, 6, 14, "cut_sandstone")
    t.set(7, 7, 14, "chiseled_sandstone")
    for x in (6, 7, 8):
        t.set(x, 2, 16, st("sandstone_stairs", "south"))
        t.set(x, 1, 15, st("sandstone_stairs", "south"))
        t.set(x, 0, 14, "cut_sandstone")
        t.set(x, 0, 13, "cut_sandstone")
        t.set(x, 0, 15, "cut_sandstone")

    # Sanctuary with a columned porch against the north wall.
    t.walls(3, 1, 11, 4, 1, 6, "sandstone")
    t.fill(3, 1, 4, 11, 6, 4, "sandstone")
    t.air(4, 1, 2, 10, 6, 3)
    t.air(7, 1, 4, 7, 3, 4)
    t.set(7, 4, 4, "chiseled_sandstone")
    for x in range(3, 12):
        t.set(x, 5, 4, "orange_terracotta" if x % 2 else "blue_terracotta")
    t.fill(3, 7, 1, 11, 7, 6, "smooth_sandstone")
    for x in range(3, 12):
        t.set(x, 7, 7, st("smooth_sandstone_stairs", "north", "top"))
    for z in range(1, 7):
        t.set(2, 7, z, st("smooth_sandstone_stairs", "east", "top"))
        t.set(12, 7, z, st("smooth_sandstone_stairs", "west", "top"))
    for x in (4, 10):
        t.set(x, 1, 6, "smooth_sandstone")
        t.fill(x, 2, 6, x, 5, 6, "cut_sandstone")
        t.set(x, 6, 6, "chiseled_sandstone")
    t.air(9, 7, 5, 11, 7, 7)  # collapsed corner of the porch roof
    t.set(12, 7, 6, "air")
    t.set(12, 7, 5, "air")
    t.set(10, 1, 7, "smooth_sandstone")
    t.set(11, 1, 6, sl("smooth_sandstone_slab"))
    t.chest(7, 1, 2, "south", loot("desert_ruin"))
    t.set(5, 1, 2, "decorated_pot[cracked=false,facing=south,waterlogged=false]")
    t.set(9, 1, 2, "decorated_pot[cracked=false,facing=south,waterlogged=false]")
    t.set(4, 1, 3, "skeleton_skull[rotation=7]")
    for pos in ((10, 1, 3), (10, 1, 2), (10, 2, 2), (9, 1, 3)):
        t.set(*pos, "sand")
    t.brushable(4, 1, 2, "suspicious_sand", ARCHAEOLOGY_DESERT)
    t.set(6, 1, 5, "decorated_pot[cracked=false,facing=south,waterlogged=false]")
    t.set(8, 1, 5, "decorated_pot[cracked=false,facing=south,waterlogged=false]")

    # Obelisk on a stepped base in the middle of the mosaic.
    t.pyramid_ring(6, 7, 8, 9, 1, "smooth_sandstone_stairs")
    t.set(7, 1, 8, "smooth_sandstone")
    t.fill(7, 2, 8, 7, 8, 8, "smooth_sandstone")
    for y in (3, 6):
        t.set(7, y, 8, "chiseled_sandstone")
    t.set(7, 9, 8, "sandstone_wall")

    # Colonnades along the side walls.
    for x in (3, 11):
        for z, height in zip((8, 11), (6, 6) if x == 3 else (6, 3)):
            t.set(x, 1, z, "smooth_sandstone")
            t.fill(x, 2, z, x, height, z, "cut_sandstone")
            if height == 6:
                t.set(x, 6, z, "chiseled_sandstone")
    t.fill(3, 7, 8, 3, 7, 11, sl("smooth_sandstone_slab"))
    t.set(10, 1, 10, "cut_sandstone")
    t.set(10, 1, 11, sl("cut_sandstone_slab"))

    # Drifted sand, buried finds, dead bushes, bones.
    drifts = [(2, 1, 5), (2, 1, 6), (2, 1, 7), (2, 2, 6), (3, 1, 6), (12, 1, 8), (12, 1, 9),
              (12, 1, 10), (12, 2, 9), (12, 2, 10), (11, 1, 9), (2, 1, 12), (3, 1, 12), (2, 2, 12)]
    for pos in drifts:
        t.set(*pos, "sand")
    for pos in ((2, 1, 8), (12, 1, 11), (4, 1, 12)):
        t.brushable(*pos, "suspicious_sand", ARCHAEOLOGY_DESERT)
    for pos in ((2, 3, 6), (12, 3, 9), (1, 4, 5)):
        t.set(*pos, "dead_bush")
    t.set(9, 1, 11, lg("bone_block", "x"))
    t.set(5, 1, 11, "skeleton_skull[rotation=5]")

    # Debris on the dunes outside.
    for x, z, block in ((0, 4, "cut_sandstone"), (0, 10, sl("sandstone_slab")), (14, 7, "chiseled_sandstone"),
                        (6, 0, sl("cut_sandstone_slab"))):
        t.set(x, 3, z, block)
    return t


def swamp_hut():
    """A mud-and-mangrove stilt hut with a moss-grown roof, a storage shed and a dock."""
    rng = random.Random(1004)
    t = Template("swamp_hut", (16, 17, 14))
    # Placed 3 down: y3 is the water/ground surface, the deck floats at y6.

    stilts = [(0, 0), (9, 0), (0, 9), (9, 9), (0, 4), (9, 4), (4, 0), (4, 9),
              (12, 2), (15, 2), (12, 7), (15, 7)]
    for x, z in stilts:
        t.fill(x, 0, z, x, 5, z, lg("mangrove_log"))
        for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if rng.random() < 0.55 and t.in_bounds(x + dx, 3, z + dz):
                t.set(x + dx, 3, z + dz, "mangrove_roots[waterlogged=false]")
                if rng.random() < 0.4:
                    t.set(x + dx, 4, z + dz, "mangrove_roots[waterlogged=false]")
    t.fill(0, 6, 0, 9, 6, 9, "mangrove_planks")
    for x in range(1, 9):
        for z in range(1, 9):
            if rng.random() < 0.15 and (x, z) not in stilts:
                t.set(x, 5, z, "hanging_roots[waterlogged=false]")

    # Hut walls x1..8, z1..7: mud brick sill, plank walls, log frame.
    t.walls(1, 1, 8, 7, 7, 7, "mud_bricks")
    t.walls(1, 1, 8, 7, 8, 9, "mangrove_planks")
    for x in range(1, 9):
        t.set(x, 10, 1, lg("stripped_mangrove_log", "x"))
        t.set(x, 10, 7, lg("stripped_mangrove_log", "x"))
    for z in range(1, 8):
        t.set(1, 10, z, lg("stripped_mangrove_log", "z"))
        t.set(8, 10, z, lg("stripped_mangrove_log", "z"))
    for x, z in ((1, 1), (8, 1), (1, 7), (8, 7), (1, 4), (8, 4)):
        t.fill(x, 7, z, x, 10, z, lg("mangrove_log"))
    t.air(2, 7, 2, 7, 10, 6)

    # Steep roof, ridge along z, with moss creeping over it.
    gable_air(t, "z", (2, 6), (0, 9), 11)
    gable(t, "z", (0, 8), (0, 9), 11, "dark_oak_stairs", "dark_oak_slab", "dark_oak_planks")
    for gz in (1, 7):
        gable_fill(t, "z", gz, (0, 9), 11, "mangrove_planks", first_row=0)
    t.set(4, 13, 1, "glass_pane")
    t.set(5, 13, 1, "glass_pane")
    for i, y in enumerate(range(11, 16)):
        for x in (i, 9 - i):
            for z in range(0, 9):
                if rng.random() < 0.18 and y < 15:
                    t.set(x, y + 1, z, "moss_carpet")

    # Windows with shutters, door.
    for x, z, out in ((3, 1, "north"), (6, 1, "north"), (1, 3, "west"), (1, 6, "west"),
                      (8, 3, "east"), (8, 6, "east"), (2, 7, "south"), (6, 7, "south")):
        t.fill(x, 8, z, x, 9, z, "glass_pane")
        dx, dz = STEP[out]
        if out in ("north", "south"):
            sides = ((x - 1, z + dz), (x + 1, z + dz))
        else:
            sides = ((x + dx, z - 1), (x + dx, z + 1))
        for sx, sz in sides:
            if t.get(sx, 8, sz) is None:
                t.set(sx, 8, sz, trap("mangrove_trapdoor", out, is_open=True))
                t.set(sx, 9, sz, trap("mangrove_trapdoor", out, is_open=True))
    t.door(4, 7, 7, "mangrove_door", "north")

    # Interior: the witch's workshop.
    t.set(2, 7, 2, "water_cauldron[level=3]")
    t.set(3, 7, 2, "brewing_stand[has_bottle_0=true,has_bottle_1=false,has_bottle_2=true]")
    t.set(4, 7, 2, bookshelf("south", {0, 2, 3}))
    t.set(5, 7, 2, bookshelf("south", {1, 4, 5}))
    t.set(4, 8, 2, "potted_red_mushroom")
    t.set(5, 8, 2, candle(2))
    t.set(6, 7, 2, "lectern[facing=south,has_book=false,powered=false]")
    t.barrel(7, 7, 2, "up", loot("supplies"))
    t.chest(2, 7, 5, "east", loot("swamp_hut"))
    t.set(2, 7, 6, "barrel[facing=up,open=false]")
    t.set(2, 8, 6, "potted_crimson_fungus")
    t.set(7, 7, 5, "mangrove_fence")
    t.set(7, 8, 5, "mangrove_pressure_plate[powered=false]")
    t.set(6, 7, 5, st("mangrove_stairs", "west"))
    t.set(7, 7, 4, "potted_brown_mushroom")
    for x, z in ((3, 4), (4, 4), (5, 4), (4, 5), (3, 5)):
        t.set(x, 7, z, "green_carpet")
    for y in range(11, 15):
        t.set(4, y, 4, "chain[axis=y,waterlogged=false]")
    t.set(4, 10, 4, lantern(hanging=True, soul=True))

    # Deck railing (gaps for the ladder and the bridge), porch furniture.
    for x in range(0, 10):
        if x != 4:
            t.set(x, 7, 9, "mangrove_fence")
        t.set(x, 7, 0, "mangrove_fence")
    for z in range(0, 10):
        t.set(0, 7, z, "mangrove_fence")
        if z not in (4, 5):
            t.set(9, 7, z, "mangrove_fence")
    for x, z in ((0, 0), (9, 0), (0, 9), (9, 9)):
        t.set(x, 8, z, lantern(soul=True))
    t.set(1, 7, 8, "barrel[facing=up,open=false]")
    t.set(2, 7, 8, "composter[level=4]")
    t.set(7, 7, 8, st("mangrove_stairs", "north"))
    t.ladder(4, 2, 6, 10, "south")

    # Bridge and storage shed to the east.
    t.fill(10, 6, 4, 11, 6, 5, "mangrove_planks")
    for x in (10, 11):
        t.set(x, 7, 3, "mangrove_fence")
        t.set(x, 7, 6, "mangrove_fence")
    t.fill(12, 6, 2, 15, 6, 7, "mangrove_planks")
    for x, z in ((12, 2), (15, 2), (12, 7), (15, 7)):
        t.fill(x, 7, z, x, 9, z, lg("mangrove_log"))
    t.fill(13, 7, 2, 14, 8, 2, "mangrove_planks")
    t.fill(15, 7, 3, 15, 8, 6, "mangrove_planks")
    t.fill(13, 7, 7, 14, 8, 7, "mangrove_planks")
    t.fill(12, 10, 1, 15, 10, 8, sl("dark_oak_slab"))
    t.barrel(14, 7, 3, "up", loot("supplies"))
    t.set(14, 7, 4, "barrel[facing=up,open=false]")
    t.set(14, 8, 3, "barrel[facing=up,open=false]")
    t.set(14, 7, 6, "dried_kelp_block")
    t.set(13, 7, 6, "dried_kelp_block")
    t.set(14, 8, 6, "dried_kelp_block")

    # A small dock at water level below the ladder.
    t.fill(3, 3, 11, 5, 3, 13, sl("mangrove_slab", "top"))
    for x in (3, 5):
        t.fill(x, 0, 13, x, 4, 13, lg("mangrove_log"))
    t.set(3, 5, 13, lantern(soul=True))

    # Vines on stilts and walls.
    for y in range(2, 6):
        t.set(1, y, 0, vine("west"))
        t.set(8, y, 9, vine("east"))
        t.set(13, y, 7, vine("west"))
    for y in (8, 9):
        t.set(0, y, 5, vine("east"))
        t.set(9, y, 2, vine("west"))
    return t


def overgrown_ruin():
    """A ruined manor house with an old oak growing through its collapsed east wing."""
    rng = random.Random(1005)
    t = Template("overgrown_ruin", (15, 15, 15))
    stone = ["stone_bricks", "mossy_stone_bricks", "mossy_stone_bricks", "cracked_stone_bricks",
             "cobblestone", "mossy_cobblestone"]

    # Floors: worn flagstones in the west room, roots and moss in the east one.
    for x in range(2, 13):
        for z in range(2, 11):
            if x <= 7:
                t.set(x, 0, z, rng.choice(("cobblestone", "mossy_cobblestone", "stone_bricks",
                                           "mossy_stone_bricks", "moss_block")))
            else:
                t.set(x, 0, z, rng.choice(("moss_block", "rooted_dirt", "coarse_dirt", "mossy_cobblestone")))
    t.air(3, 1, 3, 11, 9, 9)

    # Walls: the west room keeps two storeys, the east wing has mostly collapsed.
    def wall_column(x, z, top):
        for y in range(1, top + 1):
            t.set(x, y, z, rng.choice(stone) if y > 1 else "mossy_cobblestone")

    for z in range(2, 11):
        wall_column(2, z, 8 if 4 <= z <= 8 else 7)
    for x in range(3, 8):
        wall_column(x, 2, 7)
        wall_column(x, 10, 6)
    for z in range(3, 10):
        wall_column(7, z, rng.choice((4, 5, 5)))
    for x in range(8, 13):
        wall_column(x, 2, rng.choice((1, 2, 2, 3)))
        wall_column(x, 10, rng.choice((0, 1, 2, 3)))
    for z in range(3, 10):
        wall_column(12, z, rng.choice((0, 1, 1, 2)))
    t.set(2, 9, 6, "mossy_stone_bricks")

    # Openings: front door, arches, windows.
    t.air(4, 1, 10, 4, 3, 10)
    t.set(4, 4, 10, "chiseled_stone_bricks")
    t.air(7, 1, 5, 7, 3, 7)
    t.set(7, 4, 5, st("stone_brick_stairs", "south", "top"))
    t.set(7, 4, 7, st("stone_brick_stairs", "north", "top"))
    for x in (4, 6):
        t.air(x, 2, 2, x, 3, 2)
        t.set(x, 4, 2, "chiseled_stone_bricks")
        t.air(x, 6, 2, x, 6, 2)
    t.air(2, 6, 4, 2, 6, 4)
    t.air(2, 6, 8, 2, 6, 8)
    t.air(2, 2, 6, 2, 3, 6)

    # Remains of the upper floor: joists and a few planks.
    for x in (3, 5):
        t.fill(x, 4, 3, x, 4, 9, lg("stripped_oak_log", "z"))
    for x, z in ((3, 3), (4, 3), (4, 4), (3, 8), (4, 8), (5, 9), (6, 9), (3, 9), (4, 9)):
        t.set(x, 4, z, "oak_planks")
    t.fill(4, 1, 6, 6, 1, 6, lg("stripped_oak_log", "x"))  # fallen beam

    # The old oak.
    tx, tz = 10, 6
    t.fill(tx, 1, tz, tx, 9, tz, lg("oak_log"))
    for x in range(tx - 1, tx + 2):
        for z in range(tz - 1, tz + 2):
            t.set(x, 0, z, "rooted_dirt")
    for pos, axis in (((11, 6, 6), "x"), ((12, 7, 6), "x"), ((10, 7, 7), "z"), ((10, 8, 8), "z"),
                      ((9, 7, 5), "x"), ((8, 8, 4), "x"), ((11, 1, 6), "x"), ((10, 1, 7), "z")):
        t.set(*pos, lg("oak_log", axis))
    blobs = [((10, 10, 6), 3.0, 2.2), ((8, 9, 4), 2.3, 1.8), ((12, 9, 7), 2.3, 1.8),
             ((10, 11, 8), 2.2, 1.6), ((11, 11, 4), 2.0, 1.5), ((8, 10, 7), 1.8, 1.5)]
    for x in range(tx - 5, tx + 5):
        for y in range(6, 14):
            for z in range(tz - 5, tz + 5):
                existing = t.get(x, y, z) if t.in_bounds(x, y, z) else "out"
                if existing == "out" or (existing is not None and existing.id != "air"):
                    continue
                inside = min(((x - cx) / r) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / r) ** 2
                             for (cx, cy, cz), r, ry in blobs)
                if inside <= 1.0 and (inside < 0.6 or rng.random() < 0.7):
                    t.set(x, y, z, leaves("oak_leaves"))
    for x, z in ((7, 3), (13, 6), (10, 2), (12, 9), (8, 9)):
        for y in range(5, 10):
            above, here = t.get(x, y + 1, z), t.get(x, y, z)
            if above is not None and above.id.endswith("leaves") and (here is None or here.id == "air"):
                t.set(x, y, z, "hanging_roots[waterlogged=false]")
                break

    # Furnishings left behind.
    t.chest(3, 1, 9, "east", loot("overgrown_ruin"))
    t.set(6, 1, 3, "chipped_anvil[facing=east]")
    t.set(3, 1, 3, "bookshelf")
    t.set(3, 2, 3, "bookshelf")
    t.set(4, 1, 3, "lectern[facing=south,has_book=false,powered=false]")
    t.set(6, 1, 9, "decorated_pot[cracked=false,facing=north,waterlogged=false]")
    t.set(3, 5, 3, "barrel[facing=up,open=false]")
    for pos in ((3, 3, 4), (6, 3, 3), (3, 7, 9), (6, 6, 3)):
        t.set(*pos, "cobweb")
    for x, y, z, side in ((5, 2, 3, "north"), (3, 5, 5, "west"), (6, 3, 9, "south"), (3, 2, 7, "west")):
        t.set(x, y, z, lichen(side))

    # Ground cover inside.
    for x in range(3, 12):
        for z in range(3, 10):
            if t.get(x, 1, z) is None or t.get(x, 1, z).id != "air":
                continue
            below = t.get(x, 0, z).id
            roll = rng.random()
            if below in ("moss_block", "rooted_dirt", "coarse_dirt") and roll < 0.45:
                t.set(x, 1, z, rng.choice(("fern", "grass", "grass", "brown_mushroom", "red_mushroom")))
            elif roll < 0.2:
                t.set(x, 1, z, "moss_carpet")

    # Ivy on the outside of the tall walls.
    for z in range(2, 11):
        for y in range(2, 8):
            if rng.random() < 0.35 and t.get(2, y, z) is not None and t.get(2, y, z).id != "air":
                t.set(1, y, z, vine("east"))
    for x in range(2, 8):
        for y in range(2, 7):
            if rng.random() < 0.3 and t.get(x, y, 2) is not None and t.get(x, y, 2).id != "air":
                t.set(x, y, 1, vine("south"))

    # Overgrown garden: path, broken fence, dry well, flowers and azaleas.
    for z in range(11, 15):
        t.set(4, 0, z, rng.choice(("mossy_cobblestone", "gravel", "cobblestone")))
    for x in (0, 1, 2, 6, 7, 9, 13, 14):
        if rng.random() < 0.75:
            t.set(x, 1, 13, "oak_fence")
    t.walls(10, 11, 12, 13, 1, 1, "mossy_cobblestone")
    t.set(11, 1, 12, "air")
    t.set(11, 0, 12, "water")
    t.set(10, 2, 11, "oak_fence")
    t.set(12, 2, 11, "oak_fence")
    for x, z in ((1, 11), (2, 12), (6, 12), (7, 11), (13, 2), (14, 4), (0, 6), (0, 2)):
        t.set(x, 0, z, "grass_block[snowy=false]")
        t.set(x, 1, z, rng.choice(("poppy", "azure_bluet", "oxeye_daisy", "lily_of_the_valley")))
    for x, z in ((0, 9), (14, 12), (13, 0)):
        t.set(x, 0, z, "grass_block[snowy=false]")
        t.set(x, 1, z, rng.choice(("azalea", "flowering_azalea")))
    for x, z, block in ((1, 4, "mossy_stone_bricks"), (13, 8, "mossy_cobblestone"),
                        (9, 12, "cracked_stone_bricks")):
        t.set(x, 1, z, block)
    return t



# =========================================================================================
# Large structures
# =========================================================================================

def watchtower():
    """An octagonal stone tower with a timber lookout, a wrap-around gallery and a signal fire.

    Floors: 1 storage, 2 dark spawner floor (skeletons), 3 barracks, 4 lookout with
    the main chest and a door onto the gallery. The signal fire burns on the roof apex.
    """
    rng = random.Random(2001)
    t = Template("watchtower", (15, 31, 15))
    c = 7
    tower = octagon(4)
    wall = boundary(tower)
    inner = tower - wall
    plinth = octagon(5)
    gallery = octagon(6)

    def at(dx, dz):
        return c + dx, c + dz

    # Plinth: stepped cobblestone skirt.
    for dx, dz in plinth:
        x, z = at(dx, dz)
        t.set(x, 0, z, "cobblestone")
    for dx, dz in plinth - tower:
        x, z = at(dx, dz)
        if (dx, dz) in boundary(plinth):
            if abs(dx) == 5:
                t.set(x, 1, z, st("cobblestone_stairs", "west" if dx > 0 else "east"))
            elif abs(dz) == 5:
                t.set(x, 1, z, st("cobblestone_stairs", "north" if dz > 0 else "south"))
            else:
                t.set(x, 1, z, sl("cobblestone_slab"))
        else:
            t.set(x, 1, z, "cobblestone")

    # Stone shaft with andesite belts at floor levels.
    for y in range(1, 18):
        block = "cobblestone" if y <= 3 else ("polished_andesite" if y in (6, 12) else "stone_bricks")
        for dx, dz in wall:
            x, z = at(dx, dz)
            t.set(x, y, z, block)
        for dx, dz in inner:
            x, z = at(dx, dz)
            t.set(x, y, z, "air")
    for dx, dz in inner:
        x, z = at(dx, dz)
        t.set(x, 0, z, "stone_bricks")
        t.set(x, 6, z, "spruce_planks")
        t.set(x, 12, z, "spruce_planks")

    # Entrance with torches; arrow slits on floors 1 and 3.
    t.air(c, 1, c + 5, c, 2, c + 5)
    t.door(c, 1, c + 4, "spruce_door", "north")
    t.set(c, 3, c + 4, "chiseled_stone_bricks")
    for x in (c - 1, c + 1):
        t.set(x, 2, c + 5, "wall_torch[facing=south]")
    for dx, dz in ((4, 0), (-4, 0), (0, -4)):
        x, z = at(dx, dz)
        t.set(x, 3, z, "air")
    for dx, dz in ((4, 0), (-4, 0), (0, -4), (0, 4)):
        x, z = at(dx, dz)
        t.fill(x, 14, z, x, 15, z, "air")

    # Banners under the gallery.
    for dx, dz, facing in ((0, 5, "south"), (0, -5, "north"), (5, 0, "east"), (-5, 0, "west")):
        x, z = at(dx, dz)
        t.set(x, 16, z, wall_banner("red", facing))

    # Gallery: brackets, plank floor, railing and posts.
    for dx, dz in octagon(5) - tower:
        x, z = at(dx, dz)
        if any((dx + ox, dz + oz) in tower for ox, oz in STEP.values()):
            t.set(x, 17, z, st("spruce_stairs", toward(tower, dx, dz), "top"))
    for dx, dz in gallery:
        x, z = at(dx, dz)
        t.set(x, 18, z, "spruce_planks")
    vertices = {(6, 2), (6, -2), (-6, 2), (-6, -2), (2, 6), (-2, 6), (2, -6), (-2, -6)}
    for dx, dz in boundary(gallery):
        x, z = at(dx, dz)
        if (dx, dz) in vertices:
            t.fill(x, 19, z, x, 22, z, lg("stripped_spruce_log"))
        else:
            t.set(x, 19, z, "spruce_fence")

    # Timber lookout room.
    room_vertices = {(4, 2), (4, -2), (-4, 2), (-4, -2), (2, 4), (-2, 4), (2, -4), (-2, -4)}
    for dx, dz in wall:
        x, z = at(dx, dz)
        block = lg("stripped_spruce_log") if (dx, dz) in room_vertices else "spruce_planks"
        t.fill(x, 19, z, x, 22, z, block)
    for dx, dz in inner:
        x, z = at(dx, dz)
        t.fill(x, 19, z, x, 22, z, "air")
    for dx, dz in ((4, 0), (-4, 0), (0, 4), (0, -4)):
        x, z = at(dx, dz)
        t.fill(x, 19, z, x, 20, z, "air")
    for dx, dz in ((3, 3), (3, -3), (-3, 3), (-3, -3)):
        x, z = at(dx, dz)
        t.fill(x, 20, z, x, 21, z, "glass_pane")

    # Steep deepslate roof over room and gallery; signal fire on the apex.
    t.fill(c - 5, 23, c - 5, c + 5, 23, c + 5, "spruce_planks")
    for k in range(6):
        h = 6 - k
        t.pyramid_ring(c - h, c - h, c + h, c + h, 23 + k, "deepslate_tile_stairs")
    t.set(c, 28, c, "deepslate_tiles")
    t.set(c, 29, c, "hay_block[axis=y]")
    t.set(c, 30, c, "campfire[facing=north,lit=true,signal_fire=true,waterlogged=false]")

    # Ladder through all floors (cut through the floors and the gallery floor).
    t.ladder(c + 2, 1, 18, c - 3, "south")

    # Floor 1: storage.
    t.barrel(c - 3, 1, c - 1, "up", loot("supplies"))
    t.barrel(c - 3, 1, c, "up")
    t.set(c - 3, 2, c - 1, "barrel[facing=up,open=false]")
    t.set(c - 3, 1, c + 1, "hay_block[axis=y]")
    t.set(c + 3, 1, c - 1, "crafting_table")
    t.set(c + 3, 1, c, "grindstone[face=floor,facing=west]")
    t.set(c + 3, 1, c + 1, "smithing_table")
    for pos in ((c - 2, 5, c - 2), (c + 2, 5, c + 2), (c - 3, 4, c)):
        t.set(*pos, "cobweb")

    # Floor 2: skeleton spawner in the dark.
    t.spawner(c, 7, c, "skeleton")
    for pos in ((c - 2, 9, c + 2), (c + 2, 10, c + 2), (c - 3, 8, c), (c - 1, 11, c - 2), (c + 3, 8, c + 1)):
        t.set(*pos, "cobweb")
    t.set(c - 3, 7, c + 1, lg("bone_block", "x"))
    t.set(c - 2, 7, c + 2, "skeleton_skull[rotation=10]")
    t.set(c + 3, 7, c - 1, "barrel[facing=north,open=false]")

    # Floor 3: barracks.
    t.bed(c - 3, 13, c - 1, "red", "north")
    t.bed(c + 3, 13, c - 1, "red", "north")
    t.set(c, 13, c + 3, "chest[facing=north,type=single,waterlogged=false]",
          {"id": "minecraft:chest", "LootTable": loot("watchtower_barracks")})
    t.barrel(c - 2, 13, c + 2, "up", loot("supplies"))
    for x in range(c - 1, c + 2):
        for z in range(c - 1, c + 2):
            t.set(x, 13, z, "red_carpet")

    # Floor 4: lookout.
    t.chest(c - 3, 19, c, "east", loot("watchtower"))
    t.set(c - 3, 19, c - 1, "cartography_table")
    t.set(c - 3, 19, c + 1, "lectern[facing=east,has_book=false,powered=false]")
    t.set(c + 3, 19, c + 1, st("spruce_stairs", "east"))
    t.set(c + 3, 19, c - 1, st("spruce_stairs", "east"))
    t.set(c, 22, c, lantern(hanging=True))

    # Yard: path, hay and barrels, a lamp post.
    for z in range(c + 6, 15):
        t.set(c, 0, z, "dirt_path")
        t.set(c + rng.choice((-1, 1)), 0, z, rng.choice(("dirt_path", "coarse_dirt")))
    t.set(c - 3, 1, c + 6, "hay_block[axis=y]")
    t.set(c - 4, 1, c + 6, "hay_block[axis=x]")
    t.set(c - 3, 2, c + 6, "hay_block[axis=z]")
    t.barrel(c - 4, 1, c + 7, "up")
    t.fill(c + 3, 1, c + 6, c + 3, 2, c + 6, "spruce_fence")
    t.set(c + 3, 3, c + 6, lantern())
    return t


def abandoned_fort():
    """A palisade fort: corner towers, a covered gatehouse, a keep, stable, smithy and camp."""
    rng = random.Random(2002)
    t = Template("abandoned_fort", (33, 16, 33))
    lo, hi = 3, 29  # palisade lines

    # Courtyard ground: worn dirt and gravel patches.
    for x in range(lo + 1, hi):
        for z in range(lo + 1, hi):
            if rng.random() < 0.12:
                t.set(x, 0, z, rng.choice(("coarse_dirt", "gravel", "dirt")))

    # Palisade with alternating spikes, a broken stretch in the east wall, and a walkway.
    broken = set(range(15, 18))
    for i, v in enumerate(range(lo + 3, hi - 2)):
        cells = [(v, lo), (lo, v), (hi, v)]
        if not 12 <= v <= 20:
            cells.append((v, hi))
        for x, z in cells:
            top = 7 if i % 2 == 0 else 6
            if x == hi and z in broken:
                top = rng.choice((1, 2))
            t.fill(x, 0, z, x, top, z, lg("spruce_log"))
    for z in broken:
        t.set(hi + 1, 1, z, lg("spruce_log", "x"))
        t.set(hi + 2, 1, z - 1, lg("spruce_log", "x"))
    walk = []
    for v in range(lo + 3, hi - 2):
        walk += [(v, lo + 1), (lo + 1, v)]
        if v not in broken:
            walk.append((hi - 1, v))
        if not 12 <= v <= 20:
            walk.append((v, hi - 1))
    for x, z in walk:
        t.set(x, 4, z, sl("spruce_slab", "top"))
        if (x + z) % 4 == 0:
            t.fill(x, 1, z, x, 3, z, "spruce_fence")
    for x, z, facing in ((10, lo + 1, "south"), (lo + 1, 22, "east"), (hi - 1, 10, "west")):
        t.ladder(x, 1, 4, z, facing)

    # Corner towers: stone base, timber top, overhanging roof, banners outside.
    towers = {(lo, lo): (lo + 1, lo + 2, "north"), (hi, lo): (hi - 1, lo + 2, "north"),
              (lo, hi): (lo + 1, hi - 2, "south"), (hi, hi): (hi - 1, hi - 2, "south")}
    for (cx, cz), (dx, dz, door_facing) in towers.items():
        x1, x2, z1, z2 = cx - 2, cx + 2, cz - 2, cz + 2
        t.fill(x1, 0, z1, x2, 0, z2, "cobblestone")
        t.walls(x1, z1, x2, z2, 1, 7, "cobblestone")
        t.air(x1 + 1, 1, z1 + 1, x2 - 1, 7, z2 - 1)
        t.door(dx, 1, dz, "spruce_door", door_facing)
        t.fill(x1, 8, z1, x2, 8, z2, "spruce_planks")
        t.ladder(cx - 1, 1, 8, cz, "east")
        for x, z in ((x1, z1), (x2, z1), (x1, z2), (x2, z2)):
            t.fill(x, 9, z, x, 11, z, lg("stripped_spruce_log"))
        for x in range(x1 + 1, x2):
            t.set(x, 9, z1, "spruce_fence")
            t.set(x, 9, z2, "spruce_fence")
        for z in range(z1 + 1, z2):
            t.set(x1, 9, z, "spruce_fence")
            t.set(x2, 9, z, "spruce_fence")
        t.air(x1 + 1, 9, z1 + 1, x2 - 1, 11, z2 - 1)
        t.fill(cx - 2, 12, cz - 2, cx + 2, 12, cz + 2, "spruce_planks")
        for k in range(3):
            t.pyramid_ring(cx - 3 + k, cz - 3 + k, cx + 3 - k, cz + 3 - k, 12 + k, "dark_oak_stairs")
        t.set(cx, 14, cz, "dark_oak_planks")
        t.set(cx, 15, cz, sl("dark_oak_slab"))
        outward = ("north" if cz == lo else "south", "west" if cx == lo else "east")
        for facing in outward:
            ox, oz = STEP[facing]
            t.set(cx + 3 * ox, 6, cz + 3 * oz, wall_banner("red", facing))
    t.spawner(hi, 1, lo, "skeleton")
    t.chest(lo + 1, 1, lo - 1, "south", loot("fort_storage"))
    t.barrel(hi - 1, 1, hi + 1, "up", loot("supplies"))
    t.set(lo + 1, 1, hi + 1, "barrel[facing=up,open=false]")

    # Gatehouse: stone towers, a raised portcullis and a covered loft under a gable roof.
    for x0 in (12, 18):
        t.fill(x0, 0, 28, x0 + 2, 7, 30, "cobblestone")
        t.fill(x0, 5, 28, x0 + 2, 7, 30, "stone_bricks")
    t.air(15, 1, 28, 17, 5, 30)
    t.fill(15, 6, 28, 17, 7, 30, "stone_bricks")
    t.set(16, 5, 30, "chiseled_stone_bricks")
    for x in (15, 16, 17):
        t.set(x, 5, 29, "iron_bars")
        t.set(x, 0, 29, "gravel")
    t.fill(12, 8, 28, 20, 8, 30, "spruce_planks")
    for x in (12, 16, 20):
        for z in (28, 30):
            t.fill(x, 9, z, x, 10, z, lg("stripped_spruce_log"))
    for x in range(13, 20):
        if x != 16:
            t.set(x, 9, 28, "spruce_fence")
            t.set(x, 9, 30, "spruce_fence")
    for x in range(12, 21):
        t.set(x, 11, 28, lg("stripped_spruce_log", "x"))
        t.set(x, 11, 30, lg("stripped_spruce_log", "x"))
    gable(t, "x", (11, 21), (27, 31), 11, "dark_oak_stairs", "dark_oak_slab", lg("stripped_spruce_log", "x"))
    for gx in (12, 20):
        gable_fill(t, "x", gx, (27, 31), 11, "spruce_planks", first_row=0)
    for x in (13, 19):
        t.set(x, 3, 31, "wall_torch[facing=south]")
    t.set(16, 6, 31, wall_banner("red", "south"))
    t.fill(13, 1, 27, 13, 7, 27, "air")
    t.ladder(13, 1, 8, 27, "north")

    # Keep: x10..22, z6..14, two storeys, battlements and an inner gable roof.
    t.fill(10, 0, 6, 22, 0, 14, "cobblestone")
    t.fill(11, 0, 7, 21, 0, 13, "stone_bricks")
    for y in range(1, 10):
        t.walls(10, 6, 22, 14, y, y, "cobblestone" if y <= 2 else "stone_bricks")
    t.air(11, 1, 7, 21, 4, 13)
    t.fill(11, 5, 7, 21, 5, 13, "spruce_planks")
    t.air(11, 6, 7, 21, 8, 13)
    t.fill(10, 9, 6, 22, 9, 14, "stone_bricks")
    for i in range(0, 13, 2):
        t.set(10 + i, 10, 6, "stone_bricks")
        t.set(10 + i, 10, 14, "stone_bricks")
    for i in range(0, 9, 2):
        t.set(10, 10, 6 + i, "stone_bricks")
        t.set(22, 10, 6 + i, "stone_bricks")
    gable(t, "x", (12, 20), (8, 12), 10, "dark_oak_stairs", "dark_oak_slab", "dark_oak_planks")
    for gx in (12, 20):
        gable_fill(t, "x", gx, (8, 12), 10, "stone_bricks", first_row=0)
    # Buttresses.
    for x, z, facing in ((13, 15, "north"), (19, 15, "north"), (13, 5, "south"), (19, 5, "south"),
                         (9, 9, "east"), (9, 11, "east"), (23, 9, "west"), (23, 11, "west")):
        t.fill(x, 0, z, x, 2, z, "stone_bricks")
        t.set(x, 3, z, st("stone_brick_stairs", facing))
    t.door(16, 1, 14, "spruce_door", "north")
    t.set(16, 3, 14, "chiseled_stone_bricks")
    t.set(16, 5, 15, wall_banner("red", "south"))
    for x, z, out in ((13, 14, "south"), (19, 14, "south"), (13, 6, "north"), (16, 6, "north"),
                      (19, 6, "north"), (10, 10, "west"), (22, 12, "east")):
        t.set(x, 7, z, "glass_pane")
        dx, dz = STEP[out]
        sides = ((x - 1, z + dz), (x + 1, z + dz)) if out in ("north", "south") else ((x + dx, z - 1), (x + dx, z + 1))
        for sx, sz in sides:
            if t.get(sx, 7, sz) is None:
                t.set(sx, 7, sz, trap("spruce_trapdoor", out, is_open=True))
    # Staircase along the west wall.
    for i, z in enumerate(range(13, 9, -1)):
        y = 1 + i
        if y > 1:
            t.fill(11, 1, z, 11, y - 1, z, "spruce_planks")
        t.set(11, y, z, st("spruce_stairs", "north"))
    t.air(11, 5, 10, 11, 5, 13)
    # Ground floor: dark storage hall guarded by a zombie spawner.
    t.spawner(17, 1, 10, "zombie")
    t.chest(21, 1, 7, "west", loot("fort_storage"))
    t.barrel(21, 1, 8, "up", loot("supplies"))
    t.barrel(20, 1, 7, "up")
    t.set(21, 1, 13, "barrel[facing=up,open=false]")
    t.set(21, 2, 13, "barrel[facing=up,open=false]")
    t.set(14, 1, 8, "spruce_fence")
    t.set(14, 2, 8, "spruce_pressure_plate[powered=false]")
    for pos in ((12, 4, 7), (21, 4, 13), (20, 4, 7), (15, 4, 13)):
        t.set(*pos, "cobweb")
    # Upper floor: officers' quarters.
    t.bed(19, 6, 7, "blue", "north")
    t.bed(17, 6, 7, "blue", "north")
    t.chest(21, 6, 13, "west", loot("fort_keep"))
    t.set(13, 6, 7, "bookshelf")
    t.set(14, 6, 7, "bookshelf")
    t.set(15, 6, 7, "lectern[facing=south,has_book=false,powered=false]")
    t.set(16, 6, 11, "spruce_fence")
    t.set(16, 7, 11, "spruce_pressure_plate[powered=false]")
    t.set(15, 6, 11, st("spruce_stairs", "west"))
    t.set(17, 6, 11, st("spruce_stairs", "east"))
    for x in range(14, 19):
        t.set(x, 6, 10, "blue_carpet")
    t.set(19, 8, 12, lantern(hanging=True))
    t.ladder(21, 6, 9, 10, "west")

    # Stable between the west walkway and the keep.
    for x, z in ((8, 7), (8, 11), (8, 15), (5, 7), (5, 15)):
        t.fill(x, 1, z, x, 3, z, lg("stripped_spruce_log"))
    t.fill(5, 4, 6, 8, 4, 16, sl("spruce_slab"))
    for x in range(5, 8):
        for z in range(8, 15):
            t.set(x, 0, z, "coarse_dirt")
    t.fill(6, 1, 11, 7, 1, 11, "spruce_fence")
    for z in (8, 10, 12, 14):
        t.set(8, 1, z, "spruce_fence")
    for z in (9, 13):
        t.set(8, 1, z, "spruce_fence_gate[facing=east,in_wall=false,open=false,powered=false]")
    t.set(5, 1, 8, "hay_block[axis=y]")
    t.set(5, 1, 9, "water_cauldron[level=3]")
    t.set(5, 1, 13, "hay_block[axis=z]")
    t.set(5, 2, 13, "hay_block[axis=x]")
    t.set(5, 1, 14, "water_cauldron[level=2]")

    # Smithy on the east side.
    t.fill(22, 0, 17, 26, 0, 22, "cobblestone")
    for x, z in ((22, 17), (26, 17), (22, 22), (26, 22)):
        t.fill(x, 1, z, x, 3, z, lg("stripped_spruce_log"))
    for z in range(17, 23):
        t.set(22, 4, z, lg("stripped_spruce_log", "z"))
        t.set(26, 4, z, lg("stripped_spruce_log", "z"))
    gable(t, "z", (16, 23), (21, 27), 4, "spruce_stairs", "spruce_slab", lg("stripped_spruce_log", "z"))
    t.set(24, 1, 18, "anvil[facing=east]")
    t.set(26, 1, 19, "furnace[facing=west,lit=false]")
    t.set(26, 1, 20, "blast_furnace[facing=west,lit=false]")
    t.set(26, 1, 21, "grindstone[face=floor,facing=west]")
    t.set(23, 1, 21, "smithing_table")
    t.set(22, 1, 20, "water_cauldron[level=3]")
    t.barrel(23, 1, 18, "up", loot("supplies"))

    # Training yard: dummies and archery butts.
    for x in (23, 26):
        t.set(x, 1, 25, "spruce_fence")
        t.set(x, 2, 25, "hay_block[axis=y]")
        t.set(x, 3, 25, "carved_pumpkin[facing=north]")
    for x in (21, 24):
        t.set(x, 1, 27, "hay_block[axis=y]")
        t.set(x, 2, 27, "target[power=0]")

    # Camp: two tents with a banner pole, campfire with log seats, a roofed well.
    for x0, wool, bed_color in ((6, "white_wool", "white"), (10, "brown_wool", "brown")):
        for z in range(21, 25):
            t.set(x0, 1, z, wool)
            t.set(x0 + 2, 1, z, wool)
            t.set(x0 + 1, 2, z, wool)
        t.set(x0 + 1, 1, 21, wool)
        t.bed(x0 + 1, 1, 22, bed_color, "north")
        t.set(x0 + 1, 1, 24, "air")
    t.fill(9, 1, 26, 9, 2, 26, "spruce_fence")
    t.set(9, 3, 26, "red_banner[rotation=8]")
    t.set(8, 1, 18, "campfire[facing=north,lit=true,signal_fire=false,waterlogged=false]")
    t.set(8, 1, 20, lg("stripped_spruce_log", "x"))
    t.set(6, 1, 18, lg("stripped_spruce_log", "z"))
    t.set(10, 1, 18, lg("stripped_spruce_log", "z"))
    t.fill(12, 0, 18, 14, 1, 20, "cobblestone")
    t.set(13, 0, 19, "water")
    t.set(13, 1, 19, "water")
    for x, z in ((12, 18), (14, 18), (12, 20), (14, 20)):
        t.fill(x, 2, z, x, 3, z, "spruce_fence")
    t.fill(12, 4, 18, 14, 4, 20, sl("spruce_slab"))

    # Paths and crates.
    for z in range(15, 33):
        for x in (15, 16, 17):
            if t.get(x, 0, z) is None or t.get(x, 0, z).id in ("coarse_dirt", "gravel", "dirt"):
                t.set(x, 0, z, "dirt_path" if rng.random() < 0.8 else "coarse_dirt")
    for x in range(18, 22):
        t.set(x, 0, 19, "dirt_path" if rng.random() < 0.7 else "coarse_dirt")
    for x in range(9, 15):
        t.set(x, 0, 16, "dirt_path" if rng.random() < 0.7 else "coarse_dirt")
    for pos in ((19, 1, 24), (20, 1, 24), (19, 2, 24), (12, 1, 26)):
        t.set(*pos, "barrel[facing=up,open=false]")
    return t


def crypt():
    """A mausoleum in a walled graveyard; a spiral stair leads down to deepslate catacombs."""
    rng = random.Random(2003)
    t = Template("crypt", (31, 25, 31))
    c, F = 15, 12  # centre column, surface layer
    # Placed 12 down: y0..y11 underground, y12 is the surface layer.

    rooms = [
        (9, 1, 9, 21, 4, 21),     # ambulatory around the stair core
        (14, 1, 5, 16, 3, 8), (14, 1, 22, 16, 3, 25),   # north / south corridors
        (5, 1, 14, 8, 3, 16), (22, 1, 14, 25, 3, 16),   # west / east corridors
        (9, 1, 2, 21, 4, 4),      # north treasury
        (9, 1, 26, 21, 4, 28),    # south tomb
        (2, 1, 9, 4, 4, 21),      # west catacomb
        (26, 1, 9, 28, 4, 21),    # east catacomb
    ]
    ring = [(15, 16), (14, 16), (14, 15), (14, 14), (15, 14), (16, 14), (16, 15), (16, 16)]
    interior = set()
    for x1, y1, z1, x2, y2, z2 in rooms:
        for x in range(x1, x2 + 1):
            for y in range(y1, y2 + 1):
                for z in range(z1, z2 + 1):
                    if not (13 <= x <= 17 and 13 <= z <= 17):
                        interior.add((x, y, z))
    for x, z in ring:
        for y in range(1, F + 1):
            interior.add((x, y, z))
    for x, y, z in interior:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    n = (x + dx, y + dy, z + dz)
                    if n not in interior and t.in_bounds(*n) and n not in t.blocks and n[1] < F:
                        t.set(*n, "deepslate_bricks")
    for pos in interior:
        t.set(*pos, "air")
    for x in range(0, 31):
        for z in range(0, 31):
            if t.get(x, 0, z) is not None and t.get(x, 1, z) is not None and t.get(x, 1, z).id == "air":
                t.set(x, 0, z, "polished_deepslate" if (x + z) % 4 == 0 else "deepslate_tiles")
    t.fill(c, 1, c, c, F - 1, c, "polished_deepslate")

    # Spiral stair: one step down per cell, 1.5 turns, exit to the north.
    previous = (15, 17)
    for i in range(F):
        x, z = ring[i % 8]
        px, pz = previous
        facing = {(0, 1): "south", (0, -1): "north", (1, 0): "east", (-1, 0): "west"}[(px - x, pz - z)]
        t.set(x, F - i, z, st("deepslate_brick_stairs", facing))
        previous = (x, z)
    t.air(15, 1, 13, 15, 3, 13)
    t.set(15, 4, 13, "chiseled_deepslate")

    # Ambulatory: pillars, vaulted edges, a few candles.
    for x, z in ((11, 11), (19, 11), (11, 19), (19, 19)):
        t.fill(x, 1, z, x, 4, z, "polished_deepslate")
        t.set(x, 4, z, "chiseled_deepslate")
    for x in range(9, 22):
        for z in range(9, 22):
            if (x, 4, z) not in interior:
                continue
            for facing, (dx, dz) in STEP.items():
                n = (x + dx, 4, z + dz)
                if t.get(*n) is not None and t.get(*n).id == "deepslate_bricks" and not (13 <= n[0] <= 17 and 13 <= n[2] <= 17):
                    t.set(x, 4, z, st("deepslate_brick_stairs", facing, "top"))
                    break
    for x, z in ((12, 20), (18, 20), (20, 18), (10, 18)):
        t.set(x, 1, z, candle(2))
    t.set(11, 1, 12, "skeleton_skull[rotation=6]")
    t.set(19, 1, 12, lg("bone_block", "y"))

    # Corridors: chamfered vaults and an iron gate before the treasury.
    for z in range(5, 9):
        t.set(14, 3, z, st("deepslate_brick_stairs", "west", "top"))
        t.set(16, 3, z, st("deepslate_brick_stairs", "east", "top"))
    for z in range(22, 26):
        t.set(14, 3, z, st("deepslate_brick_stairs", "west", "top"))
        t.set(16, 3, z, st("deepslate_brick_stairs", "east", "top"))
    for x in list(range(5, 9)) + list(range(22, 26)):
        t.set(x, 3, 14, st("deepslate_brick_stairs", "north", "top"))
        t.set(x, 3, 16, st("deepslate_brick_stairs", "south", "top"))
    for x in (14, 16):
        t.fill(x, 1, 5, x, 2, 5, "iron_bars")

    # Burial niches in the outer walls of the four chambers.
    def niche(pos):
        roll = rng.random()
        if roll < 0.45:
            t.set(*pos, f"skeleton_skull[rotation={rng.randrange(16)}]")
        elif roll < 0.7:
            t.set(*pos, lg("bone_block", "y"))
        elif roll < 0.85:
            t.set(*pos, "cobweb")
        else:
            t.set(*pos, candle(rng.randint(1, 3), lit=False))

    for v in range(10, 21, 2):
        for y in (1, 3):
            niche((1, y, v))
            niche((29, y, v))
            if v not in (14, 16):
                niche((v, y, 1))
                niche((v, y, 29))

    # North treasury: skeleton spawner between the two main chests.
    t.spawner(15, 1, 3, "skeleton")
    t.chest(10, 1, 3, "east", loot("crypt"))
    t.chest(20, 1, 3, "west", loot("crypt"))
    for x in (12, 18):
        t.fill(x, 1, 2, x, 4, 2, "polished_deepslate")
    for pos in ((9, 4, 2), (21, 4, 4), (13, 4, 4)):
        t.set(*pos, "cobweb")
    # West catacomb: zombies.
    t.spawner(3, 1, 11, "zombie")
    t.chest(3, 1, 20, "north", loot("crypt_tomb"))
    for pos in ((2, 4, 9), (4, 4, 21), (2, 4, 16)):
        t.set(*pos, "cobweb")
    # East catacomb: candle-lit tomb chest.
    t.chest(27, 1, 10, "south", loot("crypt_tomb"))
    for z in (12, 18):
        t.set(28, 1, z, candle(3))
    for pos in ((28, 4, 9), (26, 4, 21)):
        t.set(*pos, "cobweb")
    # South tomb: sarcophagi under soul lanterns.
    for x in (11, 18):
        t.fill(x, 1, 27, x + 1, 1, 27, "polished_deepslate")
        t.fill(x, 2, 27, x + 1, 2, 27, sl("deepslate_tile_slab"))
        t.set(x, 1, 26, "chiseled_deepslate")
    t.chest(15, 1, 28, "north", loot("crypt_tomb"))
    t.set(14, 1, 28, candle(3))
    t.set(16, 1, 28, candle(2))
    for x in (12, 18):
        t.set(x, 4, 27, lantern(hanging=True, soul=True))

    # Mausoleum: platform, walls with pilasters, columned portico, gabled roof.
    for x in range(10, 21):
        for z in range(10, 23):
            if x in (10, 20) or z in (10, 22):
                t.fill(x, 9, z, x, 11, z, "stone_bricks")
            t.set(x, F, z, "stone_bricks")
    for x, z in ring:
        t.set(x, F, z, "air")
    t.set(15, F, 16, st("deepslate_brick_stairs", "south"))
    t.walls(11, 11, 19, 19, F + 1, F + 5, "stone_bricks")
    t.air(12, F + 1, 12, 18, F + 5, 18)
    for x, z in ((11, 11), (19, 11), (11, 19), (19, 19), (13, 11), (17, 11), (11, 15), (19, 15)):
        t.fill(x, F + 1, z, x, F + 5, z, "polished_andesite")
    t.air(14, F + 1, 19, 16, F + 3, 19)
    for x in (14, 16):
        t.fill(x, F + 1, 19, x, F + 3, 19, "iron_bars")
    t.set(14, F + 4, 19, st("stone_brick_stairs", "east", "top"))
    t.set(16, F + 4, 19, st("stone_brick_stairs", "west", "top"))
    t.set(15, F + 4, 19, "chiseled_stone_bricks")
    for x in (11, 13, 17, 19):
        t.set(x, F + 1, 21, "polished_andesite")
        t.fill(x, F + 2, 21, x, F + 4, 21, "stone_brick_wall")
        t.set(x, F + 5, 21, "chiseled_stone_bricks")
    for x in range(11, 20):
        for z in (20, 21):
            if t.get(x, F + 5, z) is None:
                t.set(x, F + 5, z, sl("stone_brick_slab", "top"))
    gable_air(t, "z", (12, 18), (10, 20), F + 6)
    for z in range(11, 22):
        t.set(11, F + 6, z, "stone_bricks")
        t.set(19, F + 6, z, "stone_bricks")
    gable(t, "z", (10, 22), (10, 20), F + 6, "deepslate_tile_stairs", "deepslate_tile_slab", "deepslate_tiles")
    for gz in (11, 21):
        gable_fill(t, "z", gz, (10, 20), F + 6, "stone_bricks", first_row=0)
    t.set(15, F + 8, 21, "chiseled_stone_bricks")
    t.set(15, F + 8, 11, "chiseled_stone_bricks")
    # Inside: railing around the stairwell, candle pedestals, banners, soul lantern.
    for x in range(13, 18):
        for z in range(13, 18):
            if x in (13, 17) or z in (13, 17):
                if (x, z) != (15, 17):
                    t.set(x, F + 1, z, "stone_brick_wall")
    t.set(15, F + 1, 15, "chiseled_stone_bricks")
    t.set(15, F + 2, 15, candle(4))
    for x, z in ((12, 12), (18, 12), (12, 18), (18, 18)):
        t.set(x, F + 1, z, "chiseled_stone_bricks")
        t.set(x, F + 2, z, candle(2))
    t.set(12, F + 4, 15, wall_banner("black", "east"))
    t.set(18, F + 4, 15, wall_banner("black", "west"))
    for y in range(F + 6, F + 10):
        t.set(15, y, 15, "chain[axis=y,waterlogged=false]")
    t.set(15, F + 5, 15, lantern(hanging=True, soul=True))

    # Graveyard: low wall with a gate, paths, graves, lamp posts and a dead tree.
    for x in range(1, 30):
        for z in range(1, 30):
            if x not in (1, 29) and z not in (1, 29):
                continue
            if z == 29 and 13 <= x <= 17:
                continue
            t.set(x, F, z, "mossy_cobblestone")
            t.set(x, F + 1, z, "mossy_cobblestone_wall" if rng.random() < 0.5 else "cobblestone_wall")
    for x in (13, 17):
        t.fill(x, F, 29, x, F + 2, 29, "mossy_stone_bricks")
        t.set(x, F + 3, 29, lantern(soul=True))
    for z in range(23, 31):
        for x in (14, 15, 16):
            t.set(x, F, z, rng.choice(("gravel", "gravel", "cobblestone", "stone_bricks")))
    for x in range(4, 27):
        if not 10 <= x <= 20:
            t.set(x, F, 16, rng.choice(("gravel", "coarse_dirt")))
    stones = ["stone_brick_wall", "mossy_stone_brick_wall", "cobblestone_wall", "andesite_wall"]
    for x in (4, 7, 23, 26):
        for z in (4, 8, 12, 19, 23):
            t.set(x, F + 1, z, rng.choice(stones))
            if rng.random() < 0.3:
                t.set(x, F + 2, z, rng.choice(stones))
            for dz in (1, 2):
                t.set(x, F, z + dz, rng.choice(("coarse_dirt", "podzol[snowy=false]", "rooted_dirt")))
            if rng.random() < 0.5:
                t.set(x, F + 1, z + 2, rng.choice(("lily_of_the_valley", "azure_bluet", "poppy")))
    for x in (13, 17):
        t.set(x, F + 1, 25, "stone_brick_wall")
        t.set(x, F + 2, 25, lantern(soul=True))
    tx, tz = 26, 27
    t.fill(tx, F + 1, tz, tx, F + 5, tz, lg("dark_oak_log"))
    for pos, axis in (((27, F + 4, 27), "x"), ((28, F + 5, 27), "x"), ((25, F + 5, 27), "x"),
                      ((24, F + 6, 27), "x"), ((26, F + 6, 26), "z"), ((26, F + 7, 25), "z"),
                      ((26, F + 6, 28), "z")):
        t.set(*pos, lg("dark_oak_log", axis))
    return t


SMALL = [wayside_shrine, hunter_cabin, desert_ruin, swamp_hut, overgrown_ruin]
LARGE = [watchtower, abandoned_fort, crypt]
ALL = SMALL + LARGE
