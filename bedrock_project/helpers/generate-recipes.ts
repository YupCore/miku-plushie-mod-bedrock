import * as fs from "fs";
import * as path from "path";

interface ShapelessRecipe {
  result: string;
  plush: string;
  ingredients: string[];
}

const recipes: ShapelessRecipe[] = [
  // Neru variants
  { result: "miku:akita_neru_plush_tails", plush: "miku:akita_neru_plush", ingredients: ["minecraft:yellow_wool", "minecraft:redstone"] },

  // Miku variants
  { result: "miku:miku_plush_br", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_wool", "minecraft:green_wool"] },
  { result: "miku:miku_plush_br_ba", plush: "miku:miku_plush", ingredients: ["minecraft:red_wool", "minecraft:white_wool", "minecraft:blue_wool"] },
  { result: "miku:miku_plush_bik", plush: "miku:miku_plush", ingredients: ["minecraft:blue_wool", "minecraft:water_bucket"] },
  { result: "miku:miku_plush_br_beach", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_wool", "minecraft:green_wool", "minecraft:sand"] },
  { result: "miku:miku_plush_br_braid", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_wool", "minecraft:green_wool", "minecraft:glowstone"] },
  { result: "miku:miku_plush_br_ba_drum", plush: "miku:miku_plush", ingredients: ["minecraft:red_wool", "minecraft:white_wool", "minecraft:blue_wool", "minecraft:note_block"] },
  { result: "miku:miku_plush_br_pa", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:cornflower"] },
  { result: "miku:miku_plush_br_sp", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:red_wool", "minecraft:black_wool", "minecraft:gray_concrete"] },
  { result: "miku:miku_plush_br_mg", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:red_wool", "minecraft:gold_nugget"] },
  { result: "miku:miku_plush_br_brown_bro", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:black_wool", "minecraft:iron_nugget"] },
  { result: "miku:miku_plush_br_electrician", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:blue_wool", "minecraft:redstone"] },
  { result: "miku:miku_plush_br_bik_orange", plush: "miku:miku_plush", ingredients: ["minecraft:orange_wool", "minecraft:water_bucket"] },
  { result: "miku:miku_plush_br_am", plush: "miku:miku_plush", ingredients: ["minecraft:green_wool", "minecraft:yellow_wool", "minecraft:blue_wool", "minecraft:jungle_sapling"] },
  { result: "miku:miku_plush_br_fut_fla", plush: "miku:miku_plush", ingredients: ["minecraft:red_wool", "minecraft:black_wool"] },
  { result: "miku:miku_plush_br_fut_cam", plush: "miku:miku_plush", ingredients: ["minecraft:light_gray_wool", "minecraft:black_wool"] },
  { result: "miku:miku_plush_br_fut_crvg", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:black_wool", "minecraft:cartography_table"] },
  { result: "miku:miku_plush_br_go", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_wool", "minecraft:green_wool", "minecraft:lead"] },
  { result: "miku:miku_plush_br_school_pe", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:blue_wool", "minecraft:horn_coral_fan"] },
  { result: "miku:miku_plush_br_rs", plush: "miku:miku_plush", ingredients: ["minecraft:gray_wool", "minecraft:red_wool", "minecraft:moss_block"] },
  { result: "miku:miku_plush_frog", plush: "miku:miku_plush", ingredients: ["minecraft:light_blue_wool", "minecraft:tadpole_bucket"] },
  { result: "miku:miku_plush_mushroom", plush: "miku:miku_plush", ingredients: ["minecraft:moss_block", "minecraft:red_mushroom_block"] },
  { result: "miku:miku_plush_senbonzakura", plush: "miku:miku_plush", ingredients: ["minecraft:green_wool", "minecraft:cherry_log"] },
  { result: "miku:miku_plush_uraotomelovers", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:black_wool"] },
  { result: "miku:miku_plush_personadancing", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:black_wool", "minecraft:note_block"] },
  { result: "miku:miku_plush_helloplanet", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:lime_wool", "minecraft:magenta_wool"] },
  { result: "miku:miku_plush_hachune", plush: "miku:miku_plush", ingredients: ["minecraft:lily_of_the_valley"] },
  { result: "miku:miku_plush_zatsune", plush: "miku:miku_plush", ingredients: ["minecraft:black_wool", "minecraft:black_wool"] },
  { result: "miku:miku_plush_infinity", plush: "miku:miku_plush", ingredients: ["minecraft:ender_eye"] },
  { result: "miku:miku_plush_vampire", plush: "miku:miku_plush", ingredients: ["minecraft:fermented_spider_eye"] },
  { result: "miku:miku_plush_werewoman", plush: "miku:miku_plush", ingredients: ["minecraft:bone", "minecraft:mutton"] },
  { result: "miku:miku_plush_jason", plush: "miku:miku_plush", ingredients: ["minecraft:birch_planks", "minecraft:brown_wool", "minecraft:iron_sword"] },
  { result: "miku:miku_plush_michael_myers", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:blue_wool", "minecraft:iron_sword"] },
  { result: "miku:miku_plush_pumpkin", plush: "miku:miku_plush", ingredients: ["minecraft:carved_pumpkin"] },
  { result: "miku:miku_plush_ghostface", plush: "miku:miku_plush", ingredients: ["minecraft:birch_planks", "minecraft:black_wool", "minecraft:iron_sword"] },
  { result: "miku:miku_plush_frankenstein", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:green_wool", "minecraft:lightning_rod"] },
  { result: "miku:miku_plush_mummy", plush: "miku:miku_plush", ingredients: ["minecraft:black_wool", "minecraft:paper", "minecraft:paper"] },
  { result: "miku:miku_plush_patati", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_wool", "minecraft:light_blue_wool", "minecraft:white_wool"] },
  { result: "miku:miku_plush_patata", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_wool", "minecraft:lime_wool", "minecraft:red_wool"] },
  { result: "miku:miku_plush_devil", plush: "miku:miku_plush", ingredients: ["minecraft:magma_block", "minecraft:netherrack"] },
  { result: "miku:miku_plush_witch", plush: "miku:miku_plush", ingredients: ["minecraft:purple_wool", "minecraft:green_wool", "minecraft:stick", "minecraft:wheat"] },
  { result: "miku:miku_plush_santa", plush: "miku:miku_plush", ingredients: ["minecraft:red_wool", "minecraft:white_wool", "minecraft:snow_block"] },
  { result: "miku:miku_plush_reindeer", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:redstone_torch"] },
  { result: "miku:miku_plush_santa_elf", plush: "miku:miku_plush", ingredients: ["minecraft:lime_wool", "minecraft:red_wool"] },
  { result: "miku:miku_plush_xmas_tree", plush: "miku:miku_plush", ingredients: ["minecraft:spruce_leaves", "minecraft:red_wool"] },
  { result: "miku:miku_plush_sonic_crossworlds", plush: "miku:miku_plush", ingredients: ["minecraft:magenta_wool", "minecraft:black_wool"] },
  { result: "miku:miku_plush_fortnite_neko", plush: "miku:miku_plush", ingredients: ["minecraft:pink_wool", "minecraft:light_blue_wool"] },
  { result: "miku:miku_plush_v4", plush: "miku:miku_plush", ingredients: ["minecraft:iron_ingot"] },
  { result: "miku:miku_plush_mesmerizer", plush: "miku:miku_plush", ingredients: ["minecraft:light_blue_wool", "minecraft:light_blue_wool"] },
  { result: "miku:miku_plush_sonic", plush: "miku:miku_plush", ingredients: ["minecraft:blue_wool", "minecraft:redstone"] },
  { result: "miku:miku_plush_digital_stars_2025", plush: "miku:miku_plush", ingredients: ["minecraft:note_block", "minecraft:gold_nugget", "minecraft:gold_nugget", "minecraft:gold_nugget", "minecraft:gold_nugget"] },
  { result: "miku:miku_plush_rotten_girl", plush: "miku:miku_plush", ingredients: ["minecraft:rotten_flesh"] },
  { result: "miku:miku_plush_psycho_mode", plush: "miku:miku_plush", ingredients: ["minecraft:amethyst_shard"] },
  { result: "miku:miku_plush_dont_believe_in_t", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:light_blue_wool"] },
  { result: "miku:miku_plush_static", plush: "miku:miku_plush", ingredients: ["minecraft:yellow_dye", "minecraft:magenta_dye", "minecraft:cyan_dye", "minecraft:blue_wool"] },
  { result: "miku:miku_plush_mochimochi", plush: "miku:miku_plush", ingredients: ["minecraft:light_blue_wool", "minecraft:pink_wool", "minecraft:pink_petals"] },
  { result: "miku:miku_plush_monitoring", plush: "miku:miku_plush", ingredients: ["minecraft:brown_wool", "minecraft:spyglass"] },
  { result: "miku:miku_plush_hollow_knight", plush: "miku:miku_plush", ingredients: ["minecraft:black_wool", "minecraft:iron_sword", "minecraft:bone_block"] },
  { result: "miku:miku_plush_hornet", plush: "miku:miku_plush", ingredients: ["minecraft:red_wool", "minecraft:iron_sword", "minecraft:bone_block"] },
  { result: "miku:miku_plush_world_is_mine", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:gold_ingot", "minecraft:cake"] },
  { result: "miku:miku_plush_rolling_girl", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:brown_wool"] },
  { result: "miku:miku_plush_deep_sea_girl", plush: "miku:miku_plush", ingredients: ["minecraft:tube_coral", "minecraft:bubble_coral"] },
  { result: "miku:miku_plush_lucario_z", plush: "miku:miku_plush", ingredients: ["minecraft:iron_bars", "minecraft:white_wool", "minecraft:redstone"] },
  { result: "miku:miku_plush_pppp", plush: "miku:miku_plush", ingredients: ["minecraft:cyan_wool", "minecraft:white_wool"] },
  { result: "miku:miku_plush_link", plush: "miku:miku_plush", ingredients: ["minecraft:green_wool", "minecraft:emerald"] },
  { result: "miku:miku_plush_renaissance", plush: "miku:miku_plush", ingredients: ["minecraft:white_wool", "minecraft:writable_book"] },

  // Teto variants
  { result: "miku:teto_plush_mesmerizer", plush: "miku:teto_plush", ingredients: ["minecraft:red_wool", "minecraft:red_wool"] },
  { result: "miku:teto_plush_shadow", plush: "miku:teto_plush", ingredients: ["minecraft:black_wool", "minecraft:redstone"] },
  { result: "miku:teto_plush_birdbrain", plush: "miku:teto_plush", ingredients: ["minecraft:wheat_seeds", "minecraft:egg"] },
  { result: "miku:teto_plush_regret_rock", plush: "miku:teto_plush", ingredients: ["minecraft:purple_dye"] },
  { result: "miku:teto_plush_dont_believe_in_t", plush: "miku:teto_plush", ingredients: ["minecraft:white_wool", "minecraft:red_wool"] },
  { result: "miku:teto_plush_liar_dancer", plush: "miku:teto_plush", ingredients: ["minecraft:black_stained_glass", "minecraft:black_stained_glass", "minecraft:white_wool"] },
  { result: "miku:teto_plush_whatchacallitsname", plush: "miku:teto_plush", ingredients: ["minecraft:glass", "minecraft:glass", "minecraft:red_wool", "minecraft:orange_wool"] },
  { result: "miku:teto_plush_some_more_of_that_song", plush: "miku:teto_plush", ingredients: ["minecraft:light_blue_wool"] },
  { result: "miku:teto_plush_lobster", plush: "miku:teto_plush", ingredients: ["minecraft:seagrass", "minecraft:seagrass"] },
  { result: "miku:teto_plush_synthv", plush: "miku:teto_plush", ingredients: ["minecraft:iron_ingot"] },
  { result: "miku:teto_plush_spoken_for", plush: "miku:teto_plush", ingredients: ["minecraft:pink_dye", "minecraft:glowstone_dust"] },
  { result: "miku:teto_plush_pppp", plush: "miku:teto_plush", ingredients: ["minecraft:red_wool", "minecraft:white_wool"] },
  { result: "miku:teto_plush_shrimp", plush: "miku:teto_plush", ingredients: ["minecraft:kelp", "minecraft:kelp"] },

  // Meiko variants
  { result: "miku:meiko_plush_v3", plush: "miku:meiko_plush", ingredients: ["minecraft:iron_ingot"] },
  { result: "miku:meiko_plush_v4", plush: "miku:meiko_plush", ingredients: ["minecraft:iron_ingot", "minecraft:iron_ingot"] },

  // Gumi variants
  { result: "miku:gumi_plush_v3", plush: "miku:gumi_plush", ingredients: ["minecraft:iron_ingot"] },
  { result: "miku:gumi_plush_v4", plush: "miku:gumi_plush", ingredients: ["minecraft:iron_ingot", "minecraft:iron_ingot"] },
  { result: "miku:gumi_plush_v6", plush: "miku:gumi_plush", ingredients: ["minecraft:iron_ingot", "minecraft:iron_ingot", "minecraft:redstone"] },

  // Kaito variants
  { result: "miku:kaito_plush_v3", plush: "miku:kaito_plush", ingredients: ["minecraft:iron_ingot"] },
  { result: "miku:kaito_plush_v4", plush: "miku:kaito_plush", ingredients: ["minecraft:iron_ingot", "minecraft:iron_ingot"] },
];

const recipesDir = path.join(__dirname, "../behavior_packs/miku_plushie/recipes");

for (const recipe of recipes) {
  const resultId = recipe.result.replace("miku:", "");
  const filePath = path.join(recipesDir, `${resultId}.json`);

  const allIngredients = [recipe.plush, ...recipe.ingredients];
  
  const recipeJson = {
    format_version: "1.20.10",
    "minecraft:recipe_shapeless": {
      description: {
        identifier: recipe.result,
      },
      tags: ["crafting_table"],
      ingredients: allIngredients.map((item) => ({ item })),
      unlock: [{ item: recipe.plush }],
      result: {
        item: recipe.result,
        count: 1,
      },
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(recipeJson, null, 2) + "\n");
  console.log(`Generated: ${resultId}.json`);
}

console.log(`\nGenerated ${recipes.length} shapeless recipes.`);
