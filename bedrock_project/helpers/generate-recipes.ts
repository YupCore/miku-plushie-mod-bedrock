import * as fs from "fs";
import * as path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShapelessRecipe {
  type: "shapeless";
  result: string;
  ingredients: string[];
  /** Items that unlock this recipe in the recipe book */
  unlock: string[];
}

interface ShapedRecipe {
  type: "shaped";
  result: string;
  pattern: string[];
  key: Record<string, string>;
  /** Items that unlock this recipe in the recipe book */
  unlock: string[];
}

type Recipe = ShapelessRecipe | ShapedRecipe;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FORMAT_VERSION = "1.21.50";
const NAMESPACE = "miku";

function ns(id: string): string {
  return id.includes(":") ? id : `${NAMESPACE}:${id}`;
}

function mc(id: string): string {
  return `minecraft:${id}`;
}

/**
 * Collapse a flat list of item IDs into deduplicated ingredient descriptors
 * using the `count` field for duplicates, per Bedrock shapeless recipe spec.
 */
function collapseIngredients(items: string[]): Record<string, unknown>[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  const result: Record<string, unknown>[] = [];
  for (const [item, count] of counts) {
    if (count > 1) {
      result.push({ item, count });
    } else {
      result.push({ item });
    }
  }
  return result;
}

// ─── Plush shapeless helper (matches Java's plushShapeless) ──────────────────

function plushShapeless(result: string, plush: string, ...ingredients: string[]): ShapelessRecipe {
  return {
    type: "shapeless",
    result: ns(result),
    ingredients: [ns(plush), ...ingredients.map((i) => (i.includes(":") ? i : mc(i)))],
    unlock: [ns(plush)],
  };
}

// ─── Simple shapeless helper (matches Java's simpleShapeless) ────────────────

function simpleShapeless(result: string, ...ingredients: string[]): ShapelessRecipe {
  const mapped = ingredients.map((i) => (i.includes(":") ? i : mc(i)));
  return {
    type: "shapeless",
    result: ns(result),
    ingredients: mapped,
    unlock: mapped,
  };
}

// ─── Shaped plush base helper ────────────────────────────────────────────────

function shapedPlush(result: string, pattern: string[], key: Record<string, string>, unlock: string[]): ShapedRecipe {
  const mappedKey: Record<string, string> = {};
  for (const [k, v] of Object.entries(key)) {
    mappedKey[k] = v.includes(":") ? v : mc(v);
  }
  return {
    type: "shaped",
    result: ns(result),
    pattern,
    key: mappedKey,
    unlock: unlock.map((u) => (u.includes(":") ? u : mc(u))),
  };
}

// ─── Pickaxe recipe helper (matches Java's pickaxeRecipe) ────────────────────

function pickaxeRecipe(result: string, plushIngredient: string): ShapedRecipe {
  return {
    type: "shaped",
    result: ns(result),
    pattern: ["121"],
    key: {
      "1": mc("diamond"),
      "2": ns(plushIngredient),
    },
    unlock: [ns(plushIngredient)],
  };
}

// ─── All Recipes ─────────────────────────────────────────────────────────────

const recipes: Recipe[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Food / misc items
  // ═══════════════════════════════════════════════════════════════════════════

  shapedPlush("canudinho", ["p", "p"], { p: "paper" }, ["paper"]),

  shapedPlush("baguette", ["www", "www"], { w: "wheat" }, ["wheat"]),

  simpleShapeless("akita_neru_phone", "minecraft:gold_ingot", "minecraft:redstone", "minecraft:black_stained_glass"),

  shapedPlush(
    "vocaloid_heart",
    ["LN", "BP"],
    { L: "miku:leek", N: "minecraft:note_block", B: "miku:baguette", P: "miku:akita_neru_phone" },
    ["miku:leek", "minecraft:note_block", "miku:baguette", "miku:akita_neru_phone"]
  ),

  // ═══════════════════════════════════════════════════════════════════════════
  // Base plushies (shaped)
  // ═══════════════════════════════════════════════════════════════════════════

  shapedPlush("aiko_plush", ["121", "131"], { "1": "blue_wool", "2": "white_wool", "3": "green_wool" }, [
    "blue_wool",
    "white_wool",
    "green_wool",
  ]),
  shapedPlush("akita_neru_plush", ["121", "131"], { "1": "yellow_wool", "2": "white_wool", "3": "brown_wool" }, [
    "yellow_wool",
    "white_wool",
    "brown_wool",
  ]),
  shapedPlush("rin_plush", ["121", "121"], { "1": "yellow_wool", "2": "white_wool" }, ["yellow_wool", "white_wool"]),
  shapedPlush("len_plush", ["121", "131"], { "1": "yellow_wool", "2": "white_wool", "3": "gray_wool" }, [
    "yellow_wool",
    "white_wool",
    "gray_wool",
  ]),
  shapedPlush("konoha_plush", ["121", "323"], { "1": "white_wool", "2": "light_gray_wool", "3": "lime_wool" }, [
    "white_wool",
    "light_gray_wool",
    "lime_wool",
  ]),
  shapedPlush("luka_plush", ["121", "131"], { "1": "pink_wool", "2": "yellow_wool", "3": "brown_wool" }, [
    "pink_wool",
    "yellow_wool",
    "brown_wool",
  ]),
  shapedPlush("miku_plush", ["121", "131"], { "1": "cyan_wool", "2": "white_wool", "3": "gray_wool" }, [
    "cyan_wool",
    "white_wool",
    "gray_wool",
  ]),
  shapedPlush(
    "miku_plush_ghost",
    ["121", "131"],
    { "1": "cyan_stained_glass", "2": "white_stained_glass", "3": "gray_stained_glass" },
    ["cyan_stained_glass", "white_stained_glass", "gray_stained_glass"]
  ),
  shapedPlush("teto_plush", ["121", "131"], { "1": "red_wool", "2": "white_wool", "3": "light_gray_wool" }, [
    "red_wool",
    "white_wool",
    "light_gray_wool",
  ]),
  shapedPlush("meiko_plush", ["121", " 3 "], { "1": "brown_wool", "2": "white_wool", "3": "red_wool" }, [
    "brown_wool",
    "white_wool",
    "red_wool",
  ]),
  shapedPlush("gumi_plush", ["121", " 3 "], { "1": "lime_wool", "2": "white_wool", "3": "orange_wool" }, [
    "lime_wool",
    "white_wool",
    "orange_wool",
  ]),
  shapedPlush("kaito_plush", ["121", " 3 "], { "1": "blue_wool", "2": "white_wool", "3": "orange_wool" }, [
    "blue_wool",
    "white_wool",
    "orange_wool",
  ]),

  // ═══════════════════════════════════════════════════════════════════════════
  // Neru variants (shapeless)
  // ═══════════════════════════════════════════════════════════════════════════

  plushShapeless("akita_neru_plush_tails", "akita_neru_plush", "yellow_wool", "redstone"),

  // ═══════════════════════════════════════════════════════════════════════════
  // Miku variants (shapeless)
  // ═══════════════════════════════════════════════════════════════════════════

  plushShapeless("miku_plush_br", "miku_plush", "yellow_wool", "green_wool"),
  plushShapeless("miku_plush_br_ba", "miku_plush", "red_wool", "white_wool", "blue_wool"),
  plushShapeless("miku_plush_bik", "miku_plush", "blue_wool", "water_bucket"),
  plushShapeless("miku_plush_br_beach", "miku_plush", "yellow_wool", "green_wool", "sand"),
  plushShapeless("miku_plush_br_braid", "miku_plush", "yellow_wool", "green_wool", "glowstone"),
  plushShapeless("miku_plush_br_ba_drum", "miku_plush", "red_wool", "white_wool", "blue_wool", "note_block"),
  plushShapeless("miku_plush_br_pa", "miku_plush", "white_wool", "cornflower"),
  plushShapeless("miku_plush_br_sp", "miku_plush", "white_wool", "red_wool", "black_wool", "gray_concrete"),
  plushShapeless("miku_plush_br_mg", "miku_plush", "brown_wool", "red_wool", "gold_nugget"),
  plushShapeless("miku_plush_br_brown_bro", "miku_plush", "brown_wool", "black_wool", "iron_nugget"),
  plushShapeless("miku_plush_br_electrician", "miku_plush", "brown_wool", "blue_wool", "redstone"),
  plushShapeless("miku_plush_br_bik_orange", "miku_plush", "orange_wool", "water_bucket"),
  plushShapeless("miku_plush_br_am", "miku_plush", "green_wool", "yellow_wool", "blue_wool", "jungle_sapling"),
  plushShapeless("miku_plush_br_fut_fla", "miku_plush", "red_wool", "black_wool"),
  plushShapeless("miku_plush_br_fut_cam", "miku_plush", "light_gray_wool", "black_wool"),
  plushShapeless("miku_plush_br_fut_crvg", "miku_plush", "white_wool", "black_wool", "cartography_table"),
  plushShapeless("miku_plush_br_go", "miku_plush", "yellow_wool", "green_wool", "lead"),
  plushShapeless("miku_plush_br_school_pe", "miku_plush", "white_wool", "blue_wool", "tube_coral_fan"),
  plushShapeless("miku_plush_br_rs", "miku_plush", "gray_wool", "red_wool", "moss_block"),
  plushShapeless("miku_plush_frog", "miku_plush", "light_blue_wool", "tadpole_bucket"),
  plushShapeless("miku_plush_mushroom", "miku_plush", "moss_block", "red_mushroom_block"),
  plushShapeless("miku_plush_senbonzakura", "miku_plush", "green_wool", "cherry_log"),
  plushShapeless("miku_plush_uraotomelovers", "miku_plush", "white_wool", "black_wool"),
  plushShapeless("miku_plush_personadancing", "miku_plush", "white_wool", "black_wool", "note_block"),
  plushShapeless("miku_plush_helloplanet", "miku_plush", "white_wool", "lime_wool", "magenta_wool"),
  plushShapeless("miku_plush_hachune", "miku_plush", "lily_of_the_valley"),
  plushShapeless("miku_plush_zatsune", "miku_plush", "black_wool", "black_wool"),
  plushShapeless("miku_plush_infinity", "miku_plush", "ender_eye"),
  plushShapeless("miku_plush_vampire", "miku_plush", "fermented_spider_eye"),
  plushShapeless("miku_plush_werewoman", "miku_plush", "bone", "mutton"),
  plushShapeless("miku_plush_jason", "miku_plush", "birch_planks", "brown_wool", "iron_sword"),
  plushShapeless("miku_plush_michael_myers", "miku_plush", "brown_wool", "blue_wool", "iron_sword"),
  plushShapeless("miku_plush_pumpkin", "miku_plush", "carved_pumpkin"),
  plushShapeless("miku_plush_ghostface", "miku_plush", "birch_planks", "black_wool", "iron_sword"),
  plushShapeless("miku_plush_frankenstein", "miku_plush", "brown_wool", "green_wool", "lightning_rod"),
  plushShapeless("miku_plush_mummy", "miku_plush", "black_wool", "paper", "paper"),
  plushShapeless("miku_plush_patati", "miku_plush", "yellow_wool", "light_blue_wool", "white_wool"),
  plushShapeless("miku_plush_patata", "miku_plush", "yellow_wool", "lime_wool", "red_wool"),
  plushShapeless("miku_plush_devil", "miku_plush", "magma_block", "netherrack"),
  plushShapeless("miku_plush_witch", "miku_plush", "purple_wool", "green_wool", "stick", "wheat"),
  plushShapeless("miku_plush_santa", "miku_plush", "red_wool", "white_wool", "snow_block"),
  plushShapeless("miku_plush_reindeer", "miku_plush", "brown_wool", "redstone_torch"),
  plushShapeless("miku_plush_santa_elf", "miku_plush", "lime_wool", "red_wool"),
  plushShapeless("miku_plush_xmas_tree", "miku_plush", "spruce_leaves", "red_wool"),
  plushShapeless("miku_plush_sonic_crossworlds", "miku_plush", "magenta_wool", "black_wool"),
  plushShapeless("miku_plush_fortnite_neko", "miku_plush", "pink_wool", "light_blue_wool"),
  plushShapeless("miku_plush_v4", "miku_plush", "iron_ingot"),
  plushShapeless("miku_plush_mesmerizer", "miku_plush", "light_blue_wool", "light_blue_wool"),
  plushShapeless("miku_plush_sonic", "miku_plush", "blue_wool", "redstone"),
  plushShapeless(
    "miku_plush_digital_stars_2025",
    "miku_plush",
    "note_block",
    "gold_nugget",
    "gold_nugget",
    "gold_nugget",
    "gold_nugget"
  ),
  plushShapeless("miku_plush_rotten_girl", "miku_plush", "rotten_flesh"),
  plushShapeless("miku_plush_psycho_mode", "miku_plush", "amethyst_shard"),
  plushShapeless("miku_plush_dont_believe_in_t", "miku_plush", "white_wool", "light_blue_wool"),
  plushShapeless("miku_plush_static", "miku_plush", "yellow_dye", "magenta_dye", "cyan_dye", "blue_wool"),
  plushShapeless("miku_plush_mochimochi", "miku_plush", "light_blue_wool", "pink_wool", "pink_petals"),
  plushShapeless("miku_plush_monitoring", "miku_plush", "brown_wool", "spyglass"),
  plushShapeless("miku_plush_hollow_knight", "miku_plush", "black_wool", "iron_sword", "bone_block"),
  plushShapeless("miku_plush_hornet", "miku_plush", "red_wool", "iron_sword", "bone_block"),
  plushShapeless("miku_plush_world_is_mine", "miku_plush", "white_wool", "gold_ingot", "cake"),
  plushShapeless("miku_plush_rolling_girl", "miku_plush", "white_wool", "brown_wool"),
  plushShapeless("miku_plush_deep_sea_girl", "miku_plush", "tube_coral", "bubble_coral"),
  plushShapeless("miku_plush_lucario_z", "miku_plush", "iron_bars", "white_wool", "redstone"),
  plushShapeless("miku_plush_pppp", "miku_plush", "cyan_wool", "white_wool"),
  plushShapeless("miku_plush_link", "miku_plush", "green_wool", "emerald"),
  plushShapeless("miku_plush_renaissance", "miku_plush", "white_wool", "writable_book"),

  // ═══════════════════════════════════════════════════════════════════════════
  // Teto variants
  // ═══════════════════════════════════════════════════════════════════════════

  plushShapeless("teto_plush_mesmerizer", "teto_plush", "red_wool", "red_wool"),
  plushShapeless("teto_plush_shadow", "teto_plush", "black_wool", "redstone"),
  plushShapeless("teto_plush_birdbrain", "teto_plush", "wheat_seeds", "egg"),
  plushShapeless("teto_plush_regret_rock", "teto_plush", "purple_dye"),

  // ── Conflict fix: both had identical shapeless ingredients (teto + white_wool + red_wool)
  // Now shaped with different vertical arrangements to disambiguate.
  {
    type: "shaped",
    result: "miku:teto_plush_dont_believe_in_t",
    pattern: ["P", "W", "R"],
    key: { P: "miku:teto_plush", W: "minecraft:white_wool", R: "minecraft:red_wool" },
    unlock: ["miku:teto_plush"],
  },
  {
    type: "shaped",
    result: "miku:teto_plush_pppp",
    pattern: ["P", "R", "W"],
    key: { P: "miku:teto_plush", R: "minecraft:red_wool", W: "minecraft:white_wool" },
    unlock: ["miku:teto_plush"],
  },

  plushShapeless("teto_plush_liar_dancer", "teto_plush", "black_stained_glass", "black_stained_glass", "white_wool"),
  plushShapeless("teto_plush_whatchacallitsname", "teto_plush", "glass", "glass", "red_wool", "orange_wool"),
  plushShapeless("teto_plush_some_more_of_that_song", "teto_plush", "light_blue_wool"),
  plushShapeless("teto_plush_lobster", "teto_plush", "seagrass", "seagrass"),
  plushShapeless("teto_plush_synthv", "teto_plush", "iron_ingot"),
  plushShapeless("teto_plush_spoken_for", "teto_plush", "pink_dye", "glowstone_dust"),
  plushShapeless("teto_plush_shrimp", "teto_plush", "kelp", "kelp"),

  // ═══════════════════════════════════════════════════════════════════════════
  // Teto pickaxes (shaped — pattern "121" where 1=diamond, 2=plush variant)
  // ═══════════════════════════════════════════════════════════════════════════

  pickaxeRecipe("teto_pickaxe", "teto_plush"),
  pickaxeRecipe("teto_pickaxe_mesmerizer", "teto_plush_mesmerizer"),
  pickaxeRecipe("teto_pickaxe_birdbrain", "teto_plush_birdbrain"),
  pickaxeRecipe("teto_pickaxe_regret_rock", "teto_plush_regret_rock"),
  pickaxeRecipe("teto_pickaxe_dont_believe_in_t", "teto_plush_dont_believe_in_t"),
  pickaxeRecipe("teto_pickaxe_liar_dancer", "teto_plush_liar_dancer"),
  pickaxeRecipe("teto_pickaxe_whatchacallitsname", "teto_plush_whatchacallitsname"),
  pickaxeRecipe("teto_pickaxe_some_more_of_that_song", "teto_plush_some_more_of_that_song"),
  pickaxeRecipe("teto_pickaxe_synthv", "teto_plush_synthv"),
  pickaxeRecipe("teto_pickaxe_spoken_for", "teto_plush_spoken_for"),
  pickaxeRecipe("teto_pickaxe_pppp", "teto_plush_pppp"),

  // ═══════════════════════════════════════════════════════════════════════════
  // Meiko variants (shapeless)
  // ═══════════════════════════════════════════════════════════════════════════

  plushShapeless("meiko_plush_v3", "meiko_plush", "iron_ingot"),
  plushShapeless("meiko_plush_v4", "meiko_plush", "iron_ingot", "iron_ingot"),

  // ═══════════════════════════════════════════════════════════════════════════
  // Gumi variants (shapeless)
  // ═══════════════════════════════════════════════════════════════════════════

  plushShapeless("gumi_plush_v3", "gumi_plush", "iron_ingot"),
  plushShapeless("gumi_plush_v4", "gumi_plush", "iron_ingot", "iron_ingot"),
  plushShapeless("gumi_plush_v6", "gumi_plush", "iron_ingot", "iron_ingot", "redstone"),

  // ═══════════════════════════════════════════════════════════════════════════
  // Kaito variants (shapeless)
  // ═══════════════════════════════════════════════════════════════════════════

  plushShapeless("kaito_plush_v3", "kaito_plush", "iron_ingot"),
  plushShapeless("kaito_plush_v4", "kaito_plush", "iron_ingot", "iron_ingot"),
];

// ─── Generate JSON files ─────────────────────────────────────────────────────

const recipesDir = path.join(__dirname, "../behavior_packs/miku_plushie/recipes");

for (const recipe of recipes) {
  const resultId = recipe.result.replace("miku:", "");
  const filePath = path.join(recipesDir, `${resultId}.json`);

  let recipeJson: Record<string, unknown>;

  if (recipe.type === "shapeless") {
    recipeJson = {
      format_version: FORMAT_VERSION,
      "minecraft:recipe_shapeless": {
        description: { identifier: recipe.result },
        tags: ["crafting_table"],
        ingredients: collapseIngredients(recipe.ingredients),
        unlock: recipe.unlock.map((item) => ({ item })),
        result: { item: recipe.result },
      },
    };
  } else {
    recipeJson = {
      format_version: FORMAT_VERSION,
      "minecraft:recipe_shaped": {
        description: { identifier: recipe.result },
        tags: ["crafting_table"],
        pattern: recipe.pattern,
        key: Object.fromEntries(Object.entries(recipe.key).map(([k, v]) => [k, { item: v }])),
        unlock: recipe.unlock.map((item) => ({ item })),
        result: { item: recipe.result },
      },
    };
  }

  fs.writeFileSync(filePath, JSON.stringify(recipeJson, null, 2) + "\n");
  console.log(`Generated: ${resultId}.json (${recipe.type})`);
}

console.log(`\nGenerated ${recipes.length} recipes total.`);
console.log(`  Shaped:    ${recipes.filter((r) => r.type === "shaped").length}`);
console.log(`  Shapeless: ${recipes.filter((r) => r.type === "shapeless").length}`);
