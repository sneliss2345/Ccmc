"""Block-by-block definitions of every structure in the pack.

Template conventions (see builder.py): y=0 is the layer flush with the
terrain surface unless the structure's start_height lowers it; every
structure's `meta` documents how it is placed in the world.
"""

import random

from .builder import Template

NS = "ccmc"


def loot(name):
    return f"{NS}:chests/{name}"


ARCHAEOLOGY_DESERT = "minecraft:archaeology/desert_pyramid"


# -----------------------------------------------------------------------------
# Small structures
# -----------------------------------------------------------------------------

def wayside_shrine():
    """A roadside stone shrine with candles and an offering chest."""
    t = Template("wayside_shrine", (7, 11, 7))

    t.fill(0, 0, 0, 6, 0, 6, "cobblestone")
    t.fill(1, 0, 1, 5, 0, 5, "stone_bricks")
    t.pyramid_ring(0, 0, 6, 6, 1, "stone_brick_stairs")
    t.fill(1, 1, 1, 5, 1, 5, "stone_bricks")
    t.set(3, 1, 3, "chiseled_stone_bricks")

    t.air(1, 2, 1, 5, 5, 5)
    for x, z in ((1, 1), (5, 1), (1, 5), (5, 5)):
        t.set(x, 2, z, "chiseled_stone_bricks")
        t.fill(x, 3, z, x, 5, z, "stone_brick_wall")

    # Altar against the back wall.
    t.set(2, 2, 1, "stone_bricks")
    t.set(3, 2, 1, "chiseled_stone_bricks")
    t.set(4, 2, 1, "stone_bricks")
    t.set(2, 3, 1, "candle[candles=3,lit=true,waterlogged=false]")
    t.set(3, 3, 1, "potted_allium")
    t.set(4, 3, 1, "candle[candles=2,lit=true,waterlogged=false]")
    t.chest(3, 2, 2, "south", loot("wayside_shrine"))
    t.set(1, 2, 3, "potted_poppy")
    t.set(5, 2, 3, "potted_cornflower")
    t.set(3, 5, 3, "lantern[hanging=true,waterlogged=false]")

    # Ceiling and a stepped stone roof with a lantern on top.
    t.fill(1, 6, 1, 5, 6, 5, "stone_bricks")
    t.pyramid_ring(0, 0, 6, 6, 7, "stone_brick_stairs")
    t.fill(1, 7, 1, 5, 7, 5, "stone_bricks")
    t.pyramid_ring(1, 1, 5, 5, 8, "stone_brick_stairs")
    t.fill(2, 8, 2, 4, 8, 4, "stone_bricks")
    t.pyramid_ring(2, 2, 4, 4, 9, "stone_brick_stairs")
    t.set(3, 9, 3, "chiseled_stone_bricks")
    t.set(3, 10, 3, "lantern[hanging=false,waterlogged=false]")
    return t


def hunter_cabin():
    """A spruce log cabin with a gable roof, a campfire and a wood pile."""
    t = Template("hunter_cabin", (11, 9, 11))

    # Foundation and floor (walls span x1..9, z1..7).
    t.fill(1, 0, 1, 9, 0, 7, "cobblestone")
    t.fill(2, 0, 2, 8, 0, 6, "spruce_planks")

    # Log walls.
    for y in range(1, 4):
        for x in range(2, 9):
            t.set(x, y, 1, "spruce_log[axis=x]")
            t.set(x, y, 7, "spruce_log[axis=x]")
        for z in range(2, 7):
            t.set(1, y, z, "spruce_log[axis=z]")
            t.set(9, y, z, "spruce_log[axis=z]")
        for x, z in ((1, 1), (9, 1), (1, 7), (9, 7)):
            t.set(x, y, z, "spruce_log[axis=y]")

    # Interior and attic space.
    t.air(2, 1, 2, 8, 3, 6)
    t.air(2, 4, 2, 8, 5, 6)
    t.air(2, 6, 3, 8, 6, 5)

    # Wall plates and gable ends.
    for x in range(1, 10):
        t.set(x, 4, 1, "stripped_spruce_log[axis=x]")
        t.set(x, 4, 7, "stripped_spruce_log[axis=x]")
    for gx in (1, 9):
        t.fill(gx, 4, 2, gx, 4, 6, "spruce_planks")
        t.fill(gx, 5, 2, gx, 5, 6, "spruce_planks")
        t.fill(gx, 6, 3, gx, 6, 5, "spruce_planks")
        t.set(gx, 5, 4, "glass_pane")

    # Gable roof along the x axis.
    for x in range(0, 11):
        for i, (y, z) in enumerate(((4, 0), (5, 1), (6, 2), (7, 3))):
            t.set(x, y, z, "spruce_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]")
            t.set(x, y, 8 - i, "spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]")
        t.set(x, 7, 4, "spruce_planks")
        t.set(x, 8, 4, "spruce_slab[type=bottom,waterlogged=false]")

    # Door and windows.
    t.door(5, 1, 7, "spruce_door", "north")
    for x, z in ((3, 1), (7, 1), (3, 7), (7, 7)):
        t.set(x, 2, z, "glass_pane")
    t.set(1, 2, 4, "glass_pane")
    t.set(9, 2, 4, "glass_pane")

    # Furniture.
    t.bed(2, 1, 2, "brown", "north")
    t.set(4, 1, 2, "crafting_table")
    t.set(5, 1, 2, "smoker[facing=south,lit=false]")
    t.chest(8, 1, 2, "west", loot("hunter_cabin"))
    t.barrel(8, 1, 3, "up", loot("supplies"))
    t.set(7, 1, 5, "spruce_fence")
    t.set(7, 2, 5, "spruce_pressure_plate[powered=false]")
    t.set(6, 1, 5, "spruce_stairs[facing=west,half=bottom,shape=straight,waterlogged=false]")
    t.set(8, 1, 5, "spruce_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]")
    for x in range(3, 6):
        for z in range(4, 6):
            t.set(x, 1, z, "brown_carpet")
    t.set(5, 6, 4, "chain[axis=y,waterlogged=false]")
    t.set(5, 5, 4, "chain[axis=y,waterlogged=false]")
    t.set(5, 4, 4, "lantern[hanging=true,waterlogged=false]")

    # Yard: path, campfire, wood pile.
    for z in range(8, 11):
        t.set(5, 0, z, "dirt_path")
    t.set(8, 1, 9, "campfire[facing=north,lit=true,signal_fire=false,waterlogged=false]")
    t.set(8, 1, 10, "spruce_log[axis=x]")
    t.set(1, 1, 9, "spruce_log[axis=x]")
    t.set(2, 1, 9, "spruce_log[axis=x]")
    t.set(1, 2, 9, "spruce_log[axis=x]")
    t.set(3, 1, 9, "spruce_log[axis=y]")
    return t


def desert_ruin():
    """A half-buried sandstone courtyard with an offering chest and suspicious sand."""
    rng = random.Random(1101)
    t = Template("desert_ruin", (11, 8, 11))
    # Placed 2 blocks down: y0..y2 are underground, y3 is the surface air layer.

    t.fill(1, 0, 1, 9, 0, 9, "cut_sandstone")
    t.fill(4, 0, 4, 6, 0, 6, "orange_terracotta")
    t.set(5, 0, 5, "blue_terracotta")
    for x, z in ((4, 4), (6, 4), (4, 6), (6, 6)):
        t.set(x, 0, z, "chiseled_sandstone")

    # Interior: cleared below and above the surface.
    t.air(2, 1, 2, 8, 6, 8)

    # Crumbling perimeter wall, taller at the corners.
    for x in range(1, 10):
        for z in range(1, 10):
            if x not in (1, 9) and z not in (1, 9):
                continue
            corner = x in (1, 9) and z in (1, 9)
            top = 6 if corner else rng.choice((2, 3, 3, 4, 4, 5))
            for y in range(1, top + 1):
                if y <= 2:
                    block = "sandstone"
                else:
                    block = "cut_sandstone" if rng.random() < 0.7 else "sandstone"
                t.set(x, y, z, block)
            if corner:
                t.set(x, 7, z, "chiseled_sandstone")
            elif top >= 3 and rng.random() < 0.35:
                t.set(x, top + 1, z, "sandstone_slab[type=bottom,waterlogged=false]")

    # Entrance trench and steps on the south side.
    t.air(5, 1, 9, 5, 7, 9)
    t.set(5, 2, 10, "sandstone_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]")
    t.set(5, 1, 9, "sandstone_stairs[facing=south,half=bottom,shape=straight,waterlogged=false]")
    t.set(4, 3, 9, "chiseled_sandstone")
    t.set(6, 3, 9, "chiseled_sandstone")

    # Broken columns.
    for (x, z), height in (((3, 3), 6), ((7, 3), 3), ((3, 7), 4), ((7, 7), 5)):
        for y in range(1, height + 1):
            t.set(x, y, z, "cut_sandstone")
        t.set(x, height, z, "chiseled_sandstone")
    t.set(6, 1, 2, "cut_sandstone")  # fallen drum of the short column
    t.set(8, 1, 4, "sandstone_slab[type=bottom,waterlogged=false]")

    # Drifted sand, buried finds, the offering chest.
    for pos in ((2, 1, 2), (2, 1, 3), (3, 1, 2), (2, 2, 2), (8, 1, 8), (8, 1, 7), (7, 1, 8), (2, 1, 6)):
        t.set(*pos, "sand")
    t.set(2, 3, 2, "dead_bush")
    t.set(8, 2, 8, "sand")
    t.set(8, 3, 8, "dead_bush")
    for x, z in ((2, 7), (6, 8), (8, 2)):
        t.brushable(x, 1, z, "suspicious_sand", ARCHAEOLOGY_DESERT)
    t.chest(5, 1, 5, "south", loot("desert_ruin"))
    t.set(4, 1, 5, "sandstone_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]")
    t.set(6, 1, 5, "sandstone_stairs[facing=west,half=bottom,shape=straight,waterlogged=false]")
    return t


def swamp_hut():
    """A mangrove hut on stilts with a porch and a ladder."""
    t = Template("swamp_hut", (9, 15, 10))
    # Placed 3 blocks down: stilts reach 3 blocks into the ground/water,
    # the deck floats two blocks above the surface.

    for x, z in ((0, 0), (4, 0), (8, 0), (0, 4), (8, 4), (0, 8), (4, 8), (8, 8)):
        t.fill(x, 0, z, x, 5, z, "mangrove_log[axis=y]")
    t.fill(0, 6, 0, 8, 6, 8, "mangrove_planks")

    # Walls of the hut (x1..7, z1..6).
    t.walls(1, 1, 7, 6, 7, 9, "mangrove_planks")
    for x, z in ((1, 1), (7, 1), (1, 6), (7, 6)):
        t.fill(x, 7, z, x, 9, z, "mangrove_log[axis=y]")
    t.air(2, 7, 2, 6, 9, 5)
    t.door(4, 7, 6, "mangrove_door", "north")
    for x, y, z in ((3, 8, 1), (5, 8, 1), (1, 8, 3), (1, 8, 4), (7, 8, 3), (7, 8, 4), (2, 8, 6), (6, 8, 6)):
        t.set(x, y, z, "glass_pane")

    # Gable roof with the ridge along z.
    for z in range(1, 7):
        t.set(1, 10, z, "mangrove_planks")
        t.set(7, 10, z, "mangrove_planks")
    for gz in (1, 6):
        t.fill(2, 10, gz, 6, 10, gz, "mangrove_planks")
        t.fill(2, 11, gz, 6, 11, gz, "mangrove_planks")
        t.fill(3, 12, gz, 5, 12, gz, "mangrove_planks")
    t.air(2, 10, 2, 6, 11, 5)
    t.air(3, 12, 2, 5, 12, 5)
    for z in range(0, 8):
        for i, y in enumerate((10, 11, 12, 13)):
            t.set(i, y, z, "dark_oak_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]")
            t.set(8 - i, y, z, "dark_oak_stairs[facing=west,half=bottom,shape=straight,waterlogged=false]")
        t.set(4, 13, z, "dark_oak_planks")
        t.set(4, 14, z, "dark_oak_slab[type=bottom,waterlogged=false]")

    # Interior.
    t.set(2, 7, 2, "water_cauldron[level=3]")
    t.set(6, 7, 2, "brewing_stand[has_bottle_0=false,has_bottle_1=false,has_bottle_2=false]")
    t.barrel(4, 7, 2, "up", loot("supplies"))
    t.chest(2, 7, 5, "east", loot("swamp_hut"))
    t.set(6, 7, 5, "potted_red_mushroom")
    t.set(6, 7, 4, "potted_brown_mushroom")
    for y in (10, 11, 12):
        t.set(4, y, 3, "chain[axis=y,waterlogged=false]")
    t.set(4, 9, 3, "lantern[hanging=true,waterlogged=false]")

    # Porch railing (gap at x=4 for the ladder) and lanterns.
    for x in range(0, 9):
        if x != 4:
            t.set(x, 7, 8, "mangrove_fence")
    t.set(0, 7, 7, "mangrove_fence")
    t.set(8, 7, 7, "mangrove_fence")
    t.set(0, 8, 8, "lantern[hanging=false,waterlogged=false]")
    t.set(8, 8, 8, "lantern[hanging=false,waterlogged=false]")
    t.ladder(4, 2, 6, 9, "south")

    # Vines creeping up the stilts and walls.
    for y in range(2, 6):
        t.set(1, y, 0, "vine[east=false,north=false,south=false,up=false,west=true]")
        t.set(7, y, 8, "vine[east=true,north=false,south=false,up=false,west=false]")
    for y in (8, 9):
        t.set(6, y, 0, "vine[east=false,north=false,south=true,up=false,west=false]")
        t.set(0, y, 5, "vine[east=true,north=false,south=false,up=false,west=false]")
    return t


def overgrown_ruin():
    """Mossy remains of a small stone house deep in the forest."""
    rng = random.Random(2202)
    t = Template("overgrown_ruin", (11, 7, 11))

    floor_mix = ["cobblestone"] * 3 + ["mossy_cobblestone"] * 3 + ["moss_block"] * 2 + ["coarse_dirt", "gravel"]
    for x in range(1, 10):
        for z in range(1, 10):
            t.set(x, 0, z, rng.choice(floor_mix))

    t.air(2, 1, 2, 8, 5, 8)
    wall_mix = ["cobblestone", "mossy_cobblestone", "mossy_cobblestone", "stone_bricks",
                "mossy_stone_bricks", "cracked_stone_bricks"]
    tall = {(1, 5), (9, 5), (1, 1), (9, 1), (1, 9), (9, 9)}
    doorway = {(5, 9), (9, 3)}
    for x in range(1, 10):
        for z in range(1, 10):
            if x not in (1, 9) and z not in (1, 9):
                continue
            if (x, z) in doorway:
                t.air(x, 1, z, x, 3, z)
                continue
            top = 4 if (x, z) in tall else rng.choice((0, 1, 1, 2, 2, 3, 3, 4))
            for y in range(1, top + 1):
                t.set(x, y, z, rng.choice(wall_mix))
            if top == 4 and (x, z) not in tall and rng.random() < 0.5:
                t.set(x, 3, z, "air")  # an empty window frame
    t.set(4, 4, 9, "stone_bricks")  # lintel stub next to the doorway
    t.set(4, 1, 9, "mossy_cobblestone")
    t.fill(4, 2, 9, 4, 3, 9, "mossy_stone_bricks")
    t.fill(6, 1, 9, 6, 4, 9, "mossy_cobblestone")

    # The one surviving roof beam.
    t.fill(1, 5, 5, 9, 5, 5, "stripped_oak_log[axis=x]")
    t.set(3, 6, 5, "oak_slab[type=bottom,waterlogged=false]")
    t.set(7, 6, 5, "oak_slab[type=bottom,waterlogged=false]")

    # Loot and leftovers.
    t.chest(7, 1, 7, "west", loot("overgrown_ruin"))
    t.set(3, 1, 3, "chipped_anvil[facing=north]")
    t.set(3, 1, 7, "cauldron")
    t.set(2, 1, 8, "flower_pot")
    for pos in ((2, 4, 2), (8, 4, 2), (8, 3, 8), (2, 2, 7)):
        t.set(*pos, "cobweb")

    # Moss carpet and plants on soft floor blocks.
    for x in range(2, 9):
        for z in range(2, 9):
            if t.get(x, 1, z) is not None and t.get(x, 1, z).id != "air":
                continue
            below = t.get(x, 0, z).id
            roll = rng.random()
            if below in ("moss_block", "coarse_dirt") and roll < 0.5:
                t.set(x, 1, z, rng.choice(("fern", "grass", "grass")))
            elif roll < 0.25:
                t.set(x, 1, z, "moss_carpet")

    # Vines on the outside faces of the taller wall sections.
    for x in range(1, 10):
        for z in range(1, 10):
            if x not in (1, 9) and z not in (1, 9):
                continue
            for y in range(1, 5):
                wall = t.get(x, y, z)
                if wall is None or wall.id == "air" or rng.random() > 0.3:
                    continue
                if z == 1:
                    t.set(x, y, 0, "vine[east=false,north=false,south=true,up=false,west=false]")
                elif z == 9:
                    t.set(x, y, 10, "vine[east=false,north=true,south=false,up=false,west=false]")
                elif x == 1:
                    t.set(0, y, z, "vine[east=true,north=false,south=false,up=false,west=false]")
                elif x == 9:
                    t.set(10, y, z, "vine[east=false,north=false,south=false,up=false,west=true]")

    # Fallen stones around the ruin.
    for x, z in ((0, 3), (10, 7), (4, 10), (0, 9), (10, 1)):
        t.set(x, 1, z, rng.choice(("mossy_cobblestone", "cobblestone", "mossy_stone_bricks")))
    return t


# -----------------------------------------------------------------------------
# Large structures
# -----------------------------------------------------------------------------

def watchtower():
    """A 26 block tall stone watchtower with a signal fire on top.

    Floors: 1 entrance/storage, 2 dark spawner floor (skeletons),
    3 barracks, 4 lookout with the main chest, then the roof deck.
    """
    t = Template("watchtower", (11, 26, 11))

    t.fill(1, 0, 1, 9, 0, 9, "cobblestone")
    t.fill(3, 0, 3, 7, 0, 7, "stone_bricks")
    t.pyramid_ring(1, 1, 9, 9, 1, "stone_brick_stairs")

    # Shaft walls (x2..8, z2..8), cobble base and andesite belts at floor levels.
    for y in range(1, 24):
        block = "cobblestone" if y <= 3 else "stone_bricks"
        if y in (6, 12, 18):
            block = "polished_andesite"
        t.walls(2, 2, 8, 8, y, y, block)
    t.air(3, 1, 3, 7, 23, 7)

    for y in (6, 12, 18):
        t.fill(3, y, 3, 7, y, 7, "spruce_planks")
    t.ladder(7, 1, 24, 3, "south")

    # Entrance arch on the south side.
    t.air(5, 1, 8, 5, 2, 8)
    t.set(5, 1, 9, "air")
    t.set(5, 3, 8, "chiseled_stone_bricks")

    # Arrow slits on floors 1, 3 and 4 (floor 2 stays dark for its spawner).
    for y in (3, 15, 20, 21):
        for x, z in ((5, 2), (2, 5), (8, 5), (5, 8)):
            if y == 3 and z == 8:
                continue
            t.set(x, y, z, "air")

    # Corbels, roof deck and battlements.
    t.pyramid_ring(1, 1, 9, 9, 23, "stone_brick_stairs", corner="stone_bricks", half="top")
    t.fill(1, 24, 1, 9, 24, 9, "stone_bricks")
    t.set(7, 24, 3, "ladder[facing=south,waterlogged=false]")
    for i in range(9):
        if i % 2 == 0:
            for x, z in ((1 + i, 1), (1 + i, 9), (1, 1 + i), (9, 1 + i)):
                t.set(x, 25, z, "stone_bricks")
    t.set(5, 24, 5, "hay_block[axis=y]")
    t.set(5, 25, 5, "campfire[facing=north,lit=true,signal_fire=true,waterlogged=false]")

    # Floor 1: storage.
    t.barrel(3, 1, 3, "up", loot("supplies"))
    t.barrel(3, 1, 4, "up")
    t.set(4, 1, 3, "barrel[facing=north,open=false]")
    t.set(3, 2, 3, "barrel[facing=up,open=false]")
    t.set(7, 1, 7, "crafting_table")
    t.set(3, 1, 7, "grindstone[face=floor,facing=north]")
    t.set(6, 4, 7, "cobweb")

    # Floor 2: the skeleton spawner in the dark.
    t.spawner(5, 7, 5, "skeleton")
    for pos in ((3, 10, 3), (3, 11, 7), (6, 11, 7), (4, 7, 7), (7, 8, 7)):
        t.set(*pos, "cobweb")
    t.set(3, 7, 6, "bone_block[axis=y]")
    t.set(3, 7, 7, "skeleton_skull[rotation=6]")

    # Floor 3: barracks.
    t.bed(3, 13, 3, "red", "north")
    t.bed(3, 13, 7, "red", "south")
    t.barrel(7, 13, 7, "up", loot("supplies"))
    t.set(5, 13, 7, "chest[facing=north,type=single,waterlogged=false]",
          {"id": "minecraft:chest", "LootTable": loot("watchtower_barracks")})

    # Floor 4: the lookout.
    t.chest(3, 19, 7, "east", loot("watchtower"))
    t.set(3, 19, 3, "cartography_table")
    t.set(4, 19, 3, "lectern[facing=south,has_book=false,powered=false]")
    t.set(6, 19, 7, "lantern[hanging=false,waterlogged=false]")
    return t


def abandoned_fort():
    """A palisade fort with four corner towers, a stone keep, tents and a well."""
    rng = random.Random(3303)
    t = Template("abandoned_fort", (31, 13, 31))

    # Palisade between the corner towers, with spiked tops.
    def stake(x, z, i):
        top = 5 if i % 2 == 0 else 4
        t.fill(x, 0, z, x, top, z, "spruce_log[axis=y]")

    for i, v in enumerate(range(5, 26)):
        stake(v, 2, i)
        stake(2, v, i)
        stake(28, v, i)
        if not 13 <= v <= 17:
            stake(v, 28, i)

    # Gatehouse frame on the south wall.
    for x in (13, 17):
        t.fill(x, 0, 28, x, 6, 28, "spruce_log[axis=y]")
    t.fill(13, 7, 28, 17, 7, 28, "stripped_spruce_log[axis=x]")
    t.air(14, 1, 28, 16, 6, 28)
    t.set(14, 1, 28, "spruce_fence_gate[facing=south,in_wall=false,open=true,powered=false]")

    # Corner towers.
    towers = {(2, 2): (3, 4, "north"), (28, 2): (27, 4, "north"),
              (2, 28): (3, 26, "south"), (28, 28): (27, 26, "south")}
    for (cx, cz), (dx, dz, door_facing) in towers.items():
        x1, x2, z1, z2 = cx - 2, cx + 2, cz - 2, cz + 2
        t.fill(x1, 0, z1, x2, 0, z2, "cobblestone")
        t.walls(x1, z1, x2, z2, 1, 5, "cobblestone")
        t.air(x1 + 1, 1, z1 + 1, x2 - 1, 5, z2 - 1)
        t.door(dx, 1, dz, "spruce_door", door_facing)
        t.fill(x1, 6, z1, x2, 6, z2, "spruce_planks")
        t.ladder(cx - 1, 1, 6, cz, "east")
        for x, z in ((x1, z1), (x2, z1), (x1, z2), (x2, z2)):
            t.fill(x, 7, z, x, 9, z, "spruce_log[axis=y]")
        for x in range(x1 + 1, x2):
            t.set(x, 7, z1, "spruce_fence")
            t.set(x, 7, z2, "spruce_fence")
        for z in range(z1 + 1, z2):
            t.set(x1, 7, z, "spruce_fence")
            t.set(x2, 7, z, "spruce_fence")
        t.air(x1 + 1, 7, z1 + 1, x2 - 1, 9, z2 - 1)
        t.pyramid_ring(x1, z1, x2, z2, 10, "spruce_stairs")
        t.fill(x1 + 1, 10, z1 + 1, x2 - 1, 10, z2 - 1, "spruce_planks")
        t.pyramid_ring(x1 + 1, z1 + 1, x2 - 1, z2 - 1, 11, "spruce_stairs")
        t.set(cx, 11, cz, "spruce_planks")
        t.set(cx, 12, cz, "spruce_slab[type=bottom,waterlogged=false]")

    # Tower contents: a dark skeleton spawner in the north-east tower.
    t.spawner(28, 1, 2, "skeleton")
    t.chest(3, 1, 1, "south", loot("fort_storage"))
    t.barrel(27, 1, 29, "up", loot("supplies"))
    t.set(3, 1, 29, "barrel[facing=up,open=false]")

    # The keep: walls x9..21, z5..13; two storeys and a battlemented roof.
    t.fill(9, 0, 5, 21, 0, 13, "cobblestone")
    t.fill(10, 0, 6, 20, 0, 12, "stone_bricks")
    for y in range(1, 10):
        t.walls(9, 5, 21, 13, y, y, "cobblestone" if y <= 2 else "stone_bricks")
    t.air(10, 1, 6, 20, 4, 12)
    t.fill(10, 5, 6, 20, 5, 12, "spruce_planks")
    t.air(10, 6, 6, 20, 8, 12)
    t.fill(9, 9, 5, 21, 9, 13, "stone_bricks")
    for i in range(13):
        if i % 2 == 0:
            t.set(9 + i, 10, 5, "stone_bricks")
            t.set(9 + i, 10, 13, "stone_bricks")
    for i in range(9):
        if i % 2 == 0:
            t.set(9, 10, 5 + i, "stone_bricks")
            t.set(21, 10, 5 + i, "stone_bricks")
    t.door(15, 1, 13, "spruce_door", "north")
    t.set(15, 3, 13, "chiseled_stone_bricks")

    # Staircase to the upper floor along the west wall.
    for i, z in enumerate(range(12, 8, -1)):
        y = 1 + i
        if y > 1:
            t.fill(10, 1, z, 10, y - 1, z, "spruce_planks")
        t.set(10, y, z, "spruce_stairs[facing=north,half=bottom,shape=straight,waterlogged=false]")
    t.air(10, 5, 9, 10, 5, 12)

    # Ground floor: dark storage hall guarded by a zombie spawner.
    t.spawner(16, 1, 9, "zombie")
    t.chest(20, 1, 6, "west", loot("fort_storage"))
    t.barrel(20, 1, 7, "up", loot("supplies"))
    t.barrel(19, 1, 6, "up")
    t.set(20, 1, 12, "barrel[facing=up,open=false]")
    t.set(13, 1, 7, "spruce_fence")
    t.set(13, 2, 7, "spruce_pressure_plate[powered=false]")
    for pos in ((11, 4, 6), (20, 4, 12), (19, 4, 6), (14, 4, 12)):
        t.set(*pos, "cobweb")

    # Upper floor: officers' quarters with the main chest.
    for x, z in ((12, 5), (15, 5), (18, 5), (12, 13), (18, 13), (9, 11), (21, 11)):
        t.set(x, 7, z, "air")
    t.bed(18, 6, 6, "blue", "north")
    t.bed(16, 6, 6, "blue", "north")
    t.chest(20, 6, 12, "west", loot("fort_keep"))
    t.set(13, 6, 6, "bookshelf")
    t.set(14, 6, 6, "lectern[facing=south,has_book=false,powered=false]")
    t.set(12, 6, 6, "bookshelf")
    t.set(15, 6, 10, "spruce_fence")
    t.set(15, 7, 10, "spruce_pressure_plate[powered=false]")
    t.set(14, 6, 10, "spruce_stairs[facing=west,half=bottom,shape=straight,waterlogged=false]")
    t.set(16, 6, 10, "spruce_stairs[facing=east,half=bottom,shape=straight,waterlogged=false]")
    t.set(19, 8, 11, "lantern[hanging=true,waterlogged=false]")
    t.ladder(20, 6, 9, 9, "west")

    # Courtyard: path, tents, campfire, well, archery range.
    for z in range(14, 31):
        for x in (14, 15, 16):
            t.set(x, 0, z, "dirt_path" if rng.random() < 0.75 else "coarse_dirt")
    for (x1, wool) in ((5, "white_wool"), (23, "brown_wool")):
        for z in range(18, 22):
            t.set(x1, 1, z, wool)
            t.set(x1 + 2, 1, z, wool)
            t.set(x1 + 1, 2, z, wool)
        t.set(x1 + 1, 1, 18, wool)
        t.bed(x1 + 1, 1, 19, "white" if wool == "white_wool" else "brown", "north")
        t.set(x1 + 1, 1, 21, "air")
    t.set(20, 1, 21, "campfire[facing=north,lit=true,signal_fire=false,waterlogged=false]")
    t.set(20, 1, 23, "spruce_log[axis=x]")
    t.set(18, 1, 21, "spruce_log[axis=z]")
    t.fill(9, 0, 23, 11, 1, 25, "cobblestone")
    t.set(10, 0, 24, "water")
    t.set(10, 1, 24, "water")
    t.set(9, 2, 23, "spruce_fence")
    t.set(11, 2, 25, "spruce_fence")
    t.set(25, 1, 10, "hay_block[axis=y]")
    t.set(25, 2, 10, "target[power=0]")
    t.set(24, 1, 11, "hay_block[axis=x]")
    t.set(5, 1, 9, "hay_block[axis=y]")
    t.set(5, 1, 10, "hay_block[axis=z]")
    t.barrel(5, 1, 12, "up", loot("supplies"))
    t.set(6, 1, 12, "barrel[facing=up,open=false]")
    return t


def crypt():
    """An underground crypt below a small mausoleum, reached by a ladder shaft."""
    rng = random.Random(4404)
    t = Template("crypt", (25, 21, 25))
    # Placed 12 blocks down: y0..y11 underground, y12 is the surface block
    # layer (mausoleum floor) and y13+ is above ground.

    rooms = [
        (8, 1, 8, 16, 5, 16),     # central hall
        (17, 1, 11, 19, 3, 13),   # east corridor
        (5, 1, 11, 7, 3, 13),     # west corridor
        (11, 1, 5, 13, 3, 7),     # north corridor
        (11, 1, 17, 13, 3, 19),   # south corridor
        (20, 1, 6, 23, 4, 18),    # east gallery
        (1, 1, 6, 4, 4, 18),      # west gallery
        (6, 1, 1, 18, 4, 4),      # north treasury
        (6, 1, 20, 18, 4, 23),    # south tomb
        (12, 6, 12, 12, 11, 12),  # ladder shaft
    ]
    interior = set()
    for x1, y1, z1, x2, y2, z2 in rooms:
        for x in range(x1, x2 + 1):
            for y in range(y1, y2 + 1):
                for z in range(z1, z2 + 1):
                    interior.add((x, y, z))

    # Walls, floor and ceiling hug the carved rooms; the rest stays natural.
    for (x, y, z) in interior:
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    n = (x + dx, y + dy, z + dz)
                    if n not in interior and t.in_bounds(*n) and n not in t.blocks:
                        t.set(*n, "stone_bricks")
    for pos in interior:
        t.set(*pos, "air")

    # Hall: floor pattern, pillars, the ladder pillar.
    for x in range(8, 17):
        for z in range(8, 17):
            if (x + z) % 2 == 0:
                t.set(x, 0, z, "polished_andesite")
    for x, z in ((9, 9), (15, 9), (9, 15), (15, 15)):
        t.fill(x, 1, z, x, 5, z, "stone_bricks")
        t.set(x, 1, z, "chiseled_stone_bricks")
        t.set(x, 5, z, "chiseled_stone_bricks")
    t.fill(12, 1, 11, 12, 5, 11, "chiseled_stone_bricks")
    t.ladder(12, 1, 11, 12, "south")
    t.set(11, 1, 15, "candle[candles=2,lit=true,waterlogged=false]")
    t.set(13, 1, 15, "candle[candles=2,lit=true,waterlogged=false]")
    t.set(10, 1, 10, "skeleton_skull[rotation=8]")
    t.set(14, 1, 10, "bone_block[axis=y]")

    # Burial niches: the outer column of each gallery becomes a wall of recesses.
    def niche_wall(cells, niche_cells):
        for pos in cells:
            t.set(*pos, "stone_bricks")
        for pos in niche_cells:
            roll = rng.random()
            if roll < 0.45:
                t.set(*pos, f"skeleton_skull[rotation={rng.randrange(16)}]")
            elif roll < 0.7:
                t.set(*pos, "bone_block[axis=y]")
            elif roll < 0.85:
                t.set(*pos, "cobweb")
            else:
                t.set(*pos, "air")

    niche_wall([(1, y, z) for y in range(1, 5) for z in range(6, 19)],
               [(1, y, z) for y in (1, 3) for z in range(7, 18, 2)])
    niche_wall([(23, y, z) for y in range(1, 5) for z in range(6, 19)],
               [(23, y, z) for y in (1, 3) for z in range(7, 18, 2)])
    niche_wall([(x, y, 1) for y in range(1, 5) for x in range(6, 19)],
               [(x, y, 1) for y in (1, 3) for x in range(7, 18, 2) if x not in (11, 12, 13)])

    # West gallery: zombies and a tomb chest.
    t.spawner(3, 1, 8, "zombie")
    t.chest(2, 1, 17, "east", loot("crypt_tomb"))
    # East gallery: a tomb chest among cobwebs.
    t.chest(22, 1, 17, "west", loot("crypt_tomb"))
    for pos in ((21, 4, 6), (22, 4, 18), (21, 3, 12), (2, 4, 18), (4, 4, 6)):
        t.set(*pos, "cobweb")

    # North treasury: skeleton spawner between the two main chests.
    t.spawner(12, 1, 2, "skeleton")
    t.chest(6, 1, 3, "east", loot("crypt"))
    t.chest(18, 1, 3, "west", loot("crypt"))
    t.set(7, 4, 2, "cobweb")
    t.set(17, 4, 4, "cobweb")

    # South tomb: two sarcophagi and a candle-lit chest.
    for x in (8, 16):
        t.fill(x, 1, 21, x, 1, 22, "polished_andesite")
        t.set(x, 2, 21, "polished_andesite_slab[type=bottom,waterlogged=false]")
        t.set(x, 2, 22, "polished_andesite_slab[type=bottom,waterlogged=false]")
        t.set(x, 1, 20, "chiseled_stone_bricks")
    t.chest(12, 1, 23, "north", loot("crypt_tomb"))
    t.set(11, 1, 23, "candle[candles=3,lit=true,waterlogged=false]")
    t.set(13, 1, 23, "candle[candles=1,lit=false,waterlogged=false]")
    t.set(6, 4, 23, "cobweb")
    t.set(18, 4, 20, "cobweb")

    # Mausoleum on the surface (x9..15, z9..15).
    for x in range(9, 16):
        for z in range(9, 16):
            if x in (9, 15) or z in (9, 15):
                t.fill(x, 9, z, x, 11, z, "stone_bricks")
    t.fill(9, 12, 9, 15, 12, 15, "stone_bricks")
    t.set(12, 12, 12, "spruce_trapdoor[facing=south,half=top,open=false,powered=false,waterlogged=false]")
    t.walls(9, 9, 15, 15, 13, 16, "stone_bricks")
    for x, z in ((9, 9), (15, 9), (9, 15), (15, 15)):
        t.fill(x, 13, z, x, 16, z, "polished_andesite")
    t.air(10, 13, 10, 14, 16, 14)
    t.air(12, 13, 15, 12, 14, 15)
    t.set(12, 15, 15, "chiseled_stone_bricks")
    for x, z in ((10, 10), (14, 10), (10, 14), (14, 14)):
        t.set(x, 13, z, "chiseled_stone_bricks")
        t.set(x, 14, z, "candle[candles=2,lit=true,waterlogged=false]")
    t.set(12, 13, 10, "chiseled_stone_bricks")
    t.set(12, 14, 10, "skeleton_skull[rotation=0]")

    t.fill(10, 17, 10, 14, 17, 14, "stone_bricks")
    t.pyramid_ring(9, 9, 15, 15, 17, "stone_brick_stairs")
    t.fill(11, 18, 11, 13, 18, 13, "stone_bricks")
    t.pyramid_ring(10, 10, 14, 14, 18, "stone_brick_stairs")
    t.pyramid_ring(11, 11, 13, 13, 19, "stone_brick_stairs")
    t.set(12, 19, 12, "stone_bricks")
    t.set(12, 20, 12, "stone_brick_wall")

    # Graveyard in front of the entrance.
    for z in range(16, 25):
        t.set(12, 12, z, "gravel" if z % 3 else "cobblestone")
    for x, z in ((8, 18), (10, 18), (14, 18), (16, 18), (8, 21), (16, 21)):
        t.set(x, 13, z, "mossy_stone_brick_wall" if rng.random() < 0.5 else "stone_brick_wall")
        t.set(x, 12, z + 1, "coarse_dirt")
        t.set(x, 12, z + 2, "coarse_dirt")
    return t


SMALL = [wayside_shrine, hunter_cabin, desert_ruin, swamp_hut, overgrown_ruin]
LARGE = [watchtower, abandoned_fort, crypt]
ALL = SMALL + LARGE
