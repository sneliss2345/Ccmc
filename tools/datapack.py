"""JSON side of the datapack: worldgen, loot tables, tags and advancements."""

NS = "ccmc"
PACK_FORMAT = 15  # Minecraft 1.20 - 1.20.1


def mc(name):
    return name if ":" in name else f"minecraft:{name}"


# -----------------------------------------------------------------------------
# Placement of every structure
# -----------------------------------------------------------------------------

STRUCTURES = {
    "wayside_shrine": {
        "set": "small_structures",
        "biomes": ["plains", "sunflower_plains", "meadow", "flower_forest", "cherry_grove",
                   "forest", "birch_forest"],
        "start_height": 0, "terrain": "beard_thin", "step": "surface_structures",
        "processors": f"{NS}:weathered_stone",
    },
    "hunter_cabin": {
        "set": "small_structures",
        "biomes": ["taiga", "snowy_taiga", "old_growth_pine_taiga", "old_growth_spruce_taiga",
                   "grove", "snowy_plains", "windswept_forest"],
        "start_height": 0, "terrain": "beard_thin", "step": "surface_structures",
        "processors": f"{NS}:mossy_cobblestone",
    },
    "desert_ruin": {
        "set": "small_structures",
        "biomes": ["desert"],
        "start_height": -2, "terrain": "none", "step": "surface_structures",
        "processors": f"{NS}:desert_decay",
    },
    "swamp_hut": {
        "set": "small_structures",
        "biomes": ["swamp", "mangrove_swamp"],
        "start_height": -3, "terrain": "none", "step": "surface_structures",
        "processors": "minecraft:empty",
    },
    "overgrown_ruin": {
        "set": "small_structures",
        "biomes": ["forest", "birch_forest", "old_growth_birch_forest", "dark_forest", "jungle",
                   "sparse_jungle", "bamboo_jungle"],
        "start_height": 0, "terrain": "beard_thin", "step": "surface_structures",
        "processors": f"{NS}:ruin_decay",
    },
    "watchtower": {
        "set": "watchtowers",
        "biomes": ["plains", "sunflower_plains", "meadow", "savanna", "forest", "taiga",
                   "snowy_plains", "windswept_hills", "windswept_gravelly_hills", "windswept_forest"],
        "start_height": 0, "terrain": "beard_thin", "step": "surface_structures",
        "processors": f"{NS}:weathered_stone",
    },
    "abandoned_fort": {
        "set": "abandoned_forts",
        "biomes": ["plains", "sunflower_plains", "savanna", "savanna_plateau", "taiga",
                   "snowy_taiga", "snowy_plains", "meadow"],
        "start_height": 0, "terrain": "beard_thin", "step": "surface_structures",
        "processors": f"{NS}:weathered_stone",
    },
    "crypt": {
        "set": "crypts",
        "biomes": ["plains", "sunflower_plains", "forest", "birch_forest", "dark_forest", "taiga",
                   "old_growth_pine_taiga", "old_growth_spruce_taiga", "meadow", "snowy_plains"],
        "start_height": -12, "terrain": "none", "step": "underground_structures",
        "processors": f"{NS}:crypt_decay",
    },
}

# Spacing/separation are in chunks. Vanilla for comparison: villages 34/8,
# pillager outposts 32/8 (20% chance), shipwrecks 24/4.
STRUCTURE_SETS = {
    "small_structures": {"spacing": 18, "separation": 6, "salt": 1846032257, "avoid_villages": 4},
    "watchtowers": {"spacing": 34, "separation": 12, "salt": 2011734591, "avoid_villages": 6},
    "abandoned_forts": {"spacing": 46, "separation": 16, "salt": 1517265883, "avoid_villages": 8},
    "crypts": {"spacing": 40, "separation": 14, "salt": 902117459, "avoid_villages": 4},
}


def structure_json(name, meta):
    return {
        "type": "minecraft:jigsaw",
        "biomes": f"#{NS}:has_structure/{name}",
        "step": meta["step"],
        "spawn_overrides": {},
        "terrain_adaptation": meta["terrain"],
        "start_pool": f"{NS}:{name}/start",
        "size": 1,
        "start_height": {"absolute": meta["start_height"]},
        "project_start_to_heightmap": "WORLD_SURFACE_WG",
        "max_distance_from_center": 80,
        "use_expansion_hack": False,
    }


def template_pool_json(name, meta):
    return {
        "fallback": "minecraft:empty",
        "elements": [{
            "weight": 1,
            "element": {
                "element_type": "minecraft:single_pool_element",
                "location": f"{NS}:{name}",
                "processors": meta["processors"],
                "projection": "rigid",
            },
        }],
    }


def structure_set_json(set_name, conf):
    members = [n for n, m in STRUCTURES.items() if m["set"] == set_name]
    placement = {
        "type": "minecraft:random_spread",
        "spacing": conf["spacing"],
        "separation": conf["separation"],
        "salt": conf["salt"],
    }
    if conf.get("avoid_villages"):
        placement["exclusion_zone"] = {"other_set": "minecraft:villages", "chunk_count": conf["avoid_villages"]}
    return {
        "structures": [{"structure": f"{NS}:{n}", "weight": 1} for n in members],
        "placement": placement,
    }


# -----------------------------------------------------------------------------
# Processors
# -----------------------------------------------------------------------------

def _replace(block, output, probability):
    return {
        "input_predicate": {"predicate_type": "minecraft:random_block_match", "block": mc(block),
                            "probability": probability},
        "location_predicate": {"predicate_type": "minecraft:always_true"},
        "output_state": {"Name": mc(output)},
    }


def _rules(*rules):
    return {"processor_type": "minecraft:rule", "rules": list(rules)}


def _rot(integrity):
    return {"processor_type": "minecraft:block_rot", "integrity": integrity,
            "rottable_blocks": f"#{NS}:ruin_rottable"}


PROCESSOR_LISTS = {
    "weathered_stone": [_rules(
        _replace("stone_bricks", "mossy_stone_bricks", 0.15),
        _replace("stone_bricks", "cracked_stone_bricks", 0.1),
        _replace("cobblestone", "mossy_cobblestone", 0.2),
    )],
    "mossy_cobblestone": [_rules(_replace("cobblestone", "mossy_cobblestone", 0.25))],
    "crypt_decay": [_rules(
        _replace("stone_bricks", "cracked_stone_bricks", 0.2),
        _replace("stone_bricks", "mossy_stone_bricks", 0.15),
        _replace("polished_andesite", "andesite", 0.15),
        _replace("cobblestone", "mossy_cobblestone", 0.3),
    )],
    "ruin_decay": [_rot(0.88), _rules(
        _replace("stone_bricks", "mossy_stone_bricks", 0.3),
        _replace("cobblestone", "mossy_cobblestone", 0.3),
    )],
    "desert_decay": [_rot(0.92), _rules(_replace("cut_sandstone", "sandstone", 0.2))],
}

BLOCK_TAGS = {
    "ruin_rottable": ["cobblestone", "mossy_cobblestone", "stone_bricks", "mossy_stone_bricks",
                      "cracked_stone_bricks", "sandstone", "cut_sandstone"],
}


# -----------------------------------------------------------------------------
# Loot tables
# -----------------------------------------------------------------------------

def uniform(lo, hi):
    return {"type": "minecraft:uniform", "min": float(lo), "max": float(hi)}


def item(name, weight=1, count=None, *functions):
    entry = {"type": "minecraft:item", "name": mc(name)}
    if weight != 1:
        entry["weight"] = weight
    fns = []
    if count is not None:
        value = uniform(*count) if isinstance(count, tuple) else float(count)
        fns.append({"function": "minecraft:set_count", "count": value})
    fns.extend(functions)
    if fns:
        entry["functions"] = fns
    return entry


def empty(weight):
    return {"type": "minecraft:empty", "weight": weight}


def pool(rolls, *entries):
    value = uniform(*rolls) if isinstance(rolls, tuple) else float(rolls)
    return {"rolls": value, "bonus_rolls": 0.0, "entries": list(entries)}


def table(*pools):
    return {"type": "minecraft:chest", "pools": list(pools)}


ENCHANT_RANDOMLY = {"function": "minecraft:enchant_randomly"}


def enchant(lo, hi, treasure=False):
    return {"function": "minecraft:enchant_with_levels", "levels": uniform(lo, hi), "treasure": treasure}


def potion(name):
    return {"function": "minecraft:set_potion", "id": mc(name)}


def worn(lo, hi):
    return {"function": "minecraft:set_damage", "damage": uniform(lo, hi)}


CRYPT_MAP = item(
    "map", 1, None,
    {"function": "minecraft:exploration_map", "destination": f"{NS}:on_crypt_maps",
     "decoration": "red_x", "zoom": 2, "search_radius": 50, "skip_existing_chunks": False},
    {"function": "minecraft:set_name",
     "name": {"translate": f"filled_map.{NS}.crypt", "fallback": "Карта древнего склепа", "italic": False}},
)

LOOT_TABLES = {
    "supplies": table(pool(
        (2, 4),
        item("wheat", 10, (2, 6)), item("potato", 10, (2, 6)), item("carrot", 8, (2, 5)),
        item("bread", 8, (1, 3)), item("coal", 10, (2, 8)), item("stick", 8, (2, 8)),
        item("torch", 6, (2, 6)), item("arrow", 6, (2, 8)), item("leather", 5, (1, 3)),
        item("iron_nugget", 5, (2, 8)), item("string", 5, (1, 4)), item("apple", 6, (1, 3)),
    )),
    "wayside_shrine": table(
        pool((2, 5),
             item("bread", 15, (1, 3)), item("apple", 15, (1, 3)), item("candle", 10, (1, 3)),
             item("gold_nugget", 10, (2, 8)), item("emerald", 8, (1, 3)), item("lapis_lazuli", 8, (2, 6)),
             item("book", 5), item("experience_bottle", 5, (1, 3)),
             item("potion", 4, None, potion("healing")), item("potion", 2, None, potion("regeneration")),
             item("golden_apple", 3), item("name_tag", 2)),
        pool((0, 1), item("book", 1, None, ENCHANT_RANDOMLY), empty(3)),
    ),
    "hunter_cabin": table(
        pool((3, 6),
             item("cooked_rabbit", 10, (1, 3)), item("cooked_mutton", 10, (1, 3)),
             item("cooked_beef", 8, (1, 3)), item("sweet_berries", 12, (2, 8)),
             item("leather", 12, (1, 4)), item("rabbit_hide", 10, (1, 4)), item("rabbit_foot", 3),
             item("feather", 8, (2, 6)), item("arrow", 12, (4, 12)), item("string", 8, (1, 4)),
             item("lead", 4)),
        pool(1,
             item("bow", 3, None, enchant(5, 15)), item("crossbow", 2, None, worn(0.4, 0.9)),
             item("iron_axe", 3, None, worn(0.3, 0.8)), item("leather_chestplate", 2, None, ENCHANT_RANDOMLY),
             item("leather_boots", 2, None, ENCHANT_RANDOMLY), item("spyglass", 2), empty(4)),
    ),
    "desert_ruin": table(
        pool((2, 5),
             item("gold_nugget", 15, (3, 9)), item("gold_ingot", 10, (1, 3)), item("bone", 15, (2, 6)),
             item("rotten_flesh", 12, (2, 6)), item("emerald", 8, (1, 3)), item("iron_ingot", 8, (1, 3)),
             item("gunpowder", 8, (1, 4)), item("golden_apple", 3), item("diamond", 2),
             item("golden_horse_armor", 3), item("saddle", 3)),
        pool((0, 1), item("book", 2, None, ENCHANT_RANDOMLY), empty(4)),
    ),
    "swamp_hut": table(
        pool((3, 6),
             item("glass_bottle", 12, (1, 4)), item("spider_eye", 10, (1, 3)),
             item("fermented_spider_eye", 5), item("sugar", 8, (1, 4)), item("glowstone_dust", 8, (1, 4)),
             item("redstone", 10, (1, 4)), item("slime_ball", 8, (1, 3)), item("gunpowder", 6, (1, 3)),
             item("red_mushroom", 6, (1, 3)), item("brown_mushroom", 6, (1, 3)),
             item("nether_wart", 3, (1, 2)), item("blaze_powder", 2)),
        pool((1, 2),
             item("potion", 4, None, potion("healing")), item("potion", 3, None, potion("swiftness")),
             item("potion", 3, None, potion("water_breathing")), item("potion", 3, None, potion("night_vision")),
             item("splash_potion", 2, None, potion("slowness")), item("potion", 1, None, potion("invisibility"))),
    ),
    "overgrown_ruin": table(
        pool((2, 5),
             item("iron_ingot", 10, (1, 3)), item("iron_nugget", 12, (3, 9)), item("gold_nugget", 10, (2, 6)),
             item("coal", 12, (2, 6)), item("pumpkin_seeds", 6, (2, 4)), item("melon_seeds", 6, (2, 4)),
             item("glow_berries", 6, (2, 5)), item("bone", 8, (1, 4)), item("string", 8, (1, 3)),
             item("emerald", 5, (1, 2)), item("saddle", 3), item("name_tag", 3),
             item("iron_horse_armor", 3), item("golden_apple", 2)),
        pool((0, 1), item("book", 2, None, ENCHANT_RANDOMLY), item("music_disc_mellohi", 1), empty(5)),
    ),
    "watchtower": table(
        pool((3, 6),
             item("arrow", 15, (8, 20)), item("spectral_arrow", 5, (2, 8)), item("iron_ingot", 10, (1, 4)),
             item("gold_ingot", 6, (1, 3)), item("bread", 10, (2, 4)), item("cooked_beef", 6, (1, 3)),
             item("gunpowder", 6, (1, 3)), item("emerald", 8, (1, 4)), item("diamond", 2, (1, 2))),
        pool((1, 2),
             item("bow", 5, None, enchant(10, 25)), item("crossbow", 4, None, enchant(10, 25)),
             item("iron_helmet", 2, None, worn(0.5, 1.0)), item("iron_chestplate", 2, None, worn(0.5, 1.0)),
             item("iron_leggings", 2, None, worn(0.5, 1.0)), item("iron_boots", 2, None, worn(0.5, 1.0)),
             item("shield", 4, None, worn(0.5, 1.0)), item("spyglass", 4), item("iron_sword", 3, None, enchant(5, 15))),
        pool(1, CRYPT_MAP, empty(1)),
    ),
    "watchtower_barracks": table(pool(
        (2, 5),
        item("bread", 10, (1, 3)), item("cooked_porkchop", 8, (1, 3)), item("arrow", 12, (4, 12)),
        item("iron_nugget", 8, (3, 9)), item("leather", 6, (1, 3)), item("string", 6, (1, 3)),
        item("emerald", 4, (1, 2)), item("chainmail_helmet", 2), item("chainmail_boots", 2),
        item("iron_sword", 2, None, worn(0.3, 0.7)), item("compass", 2), item("paper", 6, (2, 6)),
    )),
    "fort_storage": table(
        pool((3, 6),
             item("arrow", 12, (6, 16)), item("bread", 10, (2, 4)), item("cooked_beef", 8, (1, 4)),
             item("iron_ingot", 10, (1, 4)), item("leather", 8, (2, 5)), item("coal", 10, (3, 9)),
             item("gunpowder", 6, (1, 4)), item("tnt", 2, (1, 2)), item("emerald", 5, (1, 3))),
        pool(1,
             item("crossbow", 3, None, worn(0.2, 0.8)), item("iron_sword", 3, None, worn(0.2, 0.8)),
             item("shield", 3, None, worn(0.2, 0.8)), item("chainmail_chestplate", 2),
             item("chainmail_leggings", 2), item("chainmail_helmet", 2), empty(3)),
    ),
    "fort_keep": table(
        pool((4, 8),
             item("gold_ingot", 10, (2, 5)), item("iron_ingot", 12, (2, 6)), item("emerald", 10, (2, 6)),
             item("diamond", 4, (1, 3)), item("golden_apple", 4), item("golden_carrot", 5, (2, 6)),
             item("saddle", 4), item("iron_horse_armor", 4), item("golden_horse_armor", 3),
             item("diamond_horse_armor", 1), item("tnt", 4, (1, 3)), item("gunpowder", 6, (2, 5)),
             item("name_tag", 3), item("experience_bottle", 5, (2, 5))),
        pool((1, 2),
             item("book", 4, None, ENCHANT_RANDOMLY), item("iron_sword", 3, None, enchant(10, 25)),
             item("crossbow", 3, None, enchant(10, 25)), item("iron_chestplate", 2, None, enchant(10, 25)),
             item("diamond_pickaxe", 1, None, worn(0.3, 0.7))),
    ),
    "crypt": table(
        pool((4, 8),
             item("bone", 15, (3, 9)), item("rotten_flesh", 12, (3, 8)), item("gold_ingot", 10, (2, 6)),
             item("gold_nugget", 8, (4, 12)), item("iron_ingot", 8, (2, 5)), item("emerald", 8, (2, 5)),
             item("diamond", 5, (1, 3)), item("golden_apple", 5, (1, 2)), item("enchanted_golden_apple", 1),
             item("experience_bottle", 6, (2, 6)), item("name_tag", 3), item("ender_pearl", 4, (1, 2)),
             item("music_disc_13", 2), item("music_disc_cat", 2)),
        pool((1, 2),
             item("book", 5, None, ENCHANT_RANDOMLY), item("iron_sword", 3, None, enchant(20, 30)),
             item("golden_sword", 2, None, enchant(20, 39, treasure=True)),
             item("diamond_sword", 1, None, enchant(15, 30))),
    ),
    "crypt_tomb": table(pool(
        (2, 5),
        item("bone", 15, (2, 6)), item("rotten_flesh", 12, (2, 6)), item("gold_nugget", 10, (2, 8)),
        item("iron_nugget", 8, (2, 8)), item("candle", 6, (1, 3)), item("string", 6, (1, 4)),
        item("arrow", 6, (2, 8)), item("emerald", 4, (1, 2)), item("golden_apple", 2),
        item("skeleton_skull", 1), item("book", 2, None, ENCHANT_RANDOMLY),
    )),
}


# -----------------------------------------------------------------------------
# Advancements (Russian text, shown in their own tab)
# -----------------------------------------------------------------------------

ADVANCEMENTS = [
    # name, icon, title, description, frame
    ("wayside_shrine", "candle", "Путник у алтаря", "Найдите придорожное святилище", "task"),
    ("hunter_cabin", "spruce_door", "Лесная глушь", "Найдите хижину охотника в тайге", "task"),
    ("desert_ruin", "chiseled_sandstone", "Пески времени", "Найдите полузасыпанные руины в пустыне", "task"),
    ("swamp_hut", "cauldron", "Дом на сваях", "Найдите хижину на сваях в болоте", "task"),
    ("overgrown_ruin", "mossy_cobblestone", "Заросшее прошлое", "Найдите заросшие руины в лесу", "task"),
    ("watchtower", "spyglass", "Дозорный", "Найдите сторожевую башню с сигнальным огнём", "goal"),
    ("abandoned_fort", "crossbow", "Взятие форта", "Найдите заброшенный форт", "goal"),
    ("crypt", "skeleton_skull", "Тишина склепа", "Найдите древний склеп", "goal"),
]


def _found(name):
    return {
        "trigger": "minecraft:location",
        "conditions": {"player": [{
            "condition": "minecraft:entity_properties",
            "entity": "this",
            "predicate": {"location": {"structure": f"{NS}:{name}"}},
        }]},
    }


def advancements():
    result = {
        "root": {
            "display": {
                "icon": {"item": "minecraft:filled_map"},
                "title": "Новые постройки",
                "description": "Исследуйте постройки датапака CCMC",
                "background": "minecraft:textures/block/mossy_stone_bricks.png",
                "frame": "task", "show_toast": False, "announce_to_chat": False, "hidden": False,
            },
            "criteria": {"tick": {"trigger": "minecraft:tick"}},
        },
    }
    for name, icon, title, description, frame in ADVANCEMENTS:
        result[f"find_{name}"] = {
            "parent": f"{NS}:root",
            "display": {
                "icon": {"item": mc(icon)}, "title": title, "description": description,
                "frame": frame, "show_toast": True, "announce_to_chat": True, "hidden": False,
            },
            "criteria": {"found": _found(name)},
        }
    result["find_all"] = {
        "parent": f"{NS}:find_crypt",
        "display": {
            "icon": {"item": "minecraft:compass"}, "title": "Великий исследователь",
            "description": "Найдите все 8 новых построек",
            "frame": "challenge", "show_toast": True, "announce_to_chat": True, "hidden": False,
        },
        "criteria": {name: _found(name) for name, *_ in ADVANCEMENTS},
        "requirements": [[name] for name, *_ in ADVANCEMENTS],
        "rewards": {"experience": 100},
    }
    return result


def pack_mcmeta():
    return {"pack": {
        "pack_format": PACK_FORMAT,
        "description": [
            {"text": "CCMC Structures", "color": "gold"},
            {"text": "\n8 новых построек · 1.20.1", "color": "gray"},
        ],
    }}


def files():
    """Yield (relative path, JSON object) for every JSON file in the pack."""
    yield "pack.mcmeta", pack_mcmeta()
    data = f"data/{NS}"
    for name, meta in STRUCTURES.items():
        yield f"{data}/worldgen/structure/{name}.json", structure_json(name, meta)
        yield f"{data}/worldgen/template_pool/{name}/start.json", template_pool_json(name, meta)
        yield f"{data}/tags/worldgen/biome/has_structure/{name}.json", {"values": [mc(b) for b in meta["biomes"]]}
    for set_name, conf in STRUCTURE_SETS.items():
        yield f"{data}/worldgen/structure_set/{set_name}.json", structure_set_json(set_name, conf)
    for name, processors in PROCESSOR_LISTS.items():
        yield f"{data}/worldgen/processor_list/{name}.json", {"processors": processors}
    for name, values in BLOCK_TAGS.items():
        yield f"{data}/tags/blocks/{name}.json", {"values": [mc(v) for v in values]}
    yield f"{data}/tags/worldgen/structure/on_crypt_maps.json", {"values": [f"{NS}:crypt"]}
    for name, loot_table in LOOT_TABLES.items():
        yield f"{data}/loot_tables/chests/{name}.json", loot_table
    for name, advancement in advancements().items():
        yield f"{data}/advancements/{name}.json", advancement
