import * as fs from "fs";
import * as path from "path";

const BP_DIR = path.join(__dirname, "..", "behavior_packs", "miku_plushie");
const RP_DIR = path.join(__dirname, "..", "resource_packs", "miku_plushie");
const ITEMS_DIR = path.join(BP_DIR, "items");
const RECIPES_DIR = path.join(BP_DIR, "recipes");
const ATTACHABLES_DIR = path.join(RP_DIR, "attachables");

interface PlushVariant {
  plushId: string;
  baseCharacter: string;
  displayName: string;
  texturePath: string;
}

const BASE_GEOMETRY_MAP: Record<string, string> = {
  miku: "geometry.miku_plush",
  teto: "geometry.teto_plush",
  rin: "geometry.rin_plush",
  len: "geometry.len_plush",
  luka: "geometry.luka_plush",
  meiko: "geometry.meiko_plush",
  kaito: "geometry.kaito_plush",
  gumi: "geometry.gumi_plush",
  konoha: "geometry.miku_plush",
  akita_neru: "geometry.akita_neru_plush",
  aiko: "geometry.aiko_plush",
};

const VARIANTS: PlushVariant[] = [
  { plushId: "miku_plush", baseCharacter: "miku", displayName: "Miku Plush Helmet", texturePath: "textures/blocks/miku_plush" },
  { plushId: "miku_plush_br", baseCharacter: "miku", displayName: "Miku Plush BR Helmet", texturePath: "textures/blocks/miku_plush_br" },
  { plushId: "miku_plush_br_am", baseCharacter: "miku", displayName: "Miku Plush BR AM Helmet", texturePath: "textures/blocks/miku_plush_br_am" },
  { plushId: "miku_plush_br_ba", baseCharacter: "miku", displayName: "Miku Plush BR BA Helmet", texturePath: "textures/blocks/miku_plush_br_ba" },
  { plushId: "miku_plush_br_ba_drum", baseCharacter: "miku", displayName: "Miku Plush BR BA Drum Helmet", texturePath: "textures/blocks/miku_plush_br_ba_drum" },
  { plushId: "miku_plush_br_beach", baseCharacter: "miku", displayName: "Miku Plush BR Beach Helmet", texturePath: "textures/blocks/miku_plush_br_beach" },
  { plushId: "miku_plush_br_bik_orange", baseCharacter: "miku", displayName: "Miku Plush BR Bik Orange Helmet", texturePath: "textures/blocks/miku_plush_br_bik_orange" },
  { plushId: "miku_plush_br_braid", baseCharacter: "miku", displayName: "Miku Plush BR Braid Helmet", texturePath: "textures/blocks/miku_plush_br_braid" },
  { plushId: "miku_plush_br_brown_bro", baseCharacter: "miku", displayName: "Miku Plush BR Brown Bro Helmet", texturePath: "textures/blocks/miku_plush_br_brown_bro" },
  { plushId: "miku_plush_br_electrician", baseCharacter: "miku", displayName: "Miku Plush BR Electrician Helmet", texturePath: "textures/blocks/miku_plush_br_electrician" },
  { plushId: "miku_plush_br_fut_cam", baseCharacter: "miku", displayName: "Miku Plush BR Fut Cam Helmet", texturePath: "textures/blocks/miku_plush_br_fut_cam" },
  { plushId: "miku_plush_br_fut_crvg", baseCharacter: "miku", displayName: "Miku Plush BR Fut Crvg Helmet", texturePath: "textures/blocks/miku_plush_br_fut_crvg" },
  { plushId: "miku_plush_br_fut_fla", baseCharacter: "miku", displayName: "Miku Plush BR Fut Fla Helmet", texturePath: "textures/blocks/miku_plush_br_fut_fla" },
  { plushId: "miku_plush_br_go", baseCharacter: "miku", displayName: "Miku Plush BR Go Helmet", texturePath: "textures/blocks/miku_plush_br_go" },
  { plushId: "miku_plush_br_mg", baseCharacter: "miku", displayName: "Miku Plush BR MG Helmet", texturePath: "textures/blocks/miku_plush_br_mg" },
  { plushId: "miku_plush_br_pa", baseCharacter: "miku", displayName: "Miku Plush BR PA Helmet", texturePath: "textures/blocks/miku_plush_br_pa" },
  { plushId: "miku_plush_br_rs", baseCharacter: "miku", displayName: "Miku Plush BR RS Helmet", texturePath: "textures/blocks/miku_plush_br_rs" },
  { plushId: "miku_plush_br_school_pe", baseCharacter: "miku", displayName: "Miku Plush BR School PE Helmet", texturePath: "textures/blocks/miku_plush_br_school_pe" },
  { plushId: "miku_plush_br_sp", baseCharacter: "miku", displayName: "Miku Plush BR SP Helmet", texturePath: "textures/blocks/miku_plush_br_sp" },
  { plushId: "miku_plush_bik", baseCharacter: "miku", displayName: "Miku Plush Bik Helmet", texturePath: "textures/blocks/miku_plush_bik" },
  { plushId: "miku_plush_deep_sea_girl", baseCharacter: "miku", displayName: "Deep Sea Girl Helmet", texturePath: "textures/blocks/deep_sea_girl" },
  { plushId: "miku_plush_devil", baseCharacter: "miku", displayName: "Miku Plush Devil Helmet", texturePath: "textures/blocks/miku_plush_devil" },
  { plushId: "miku_plush_digital_stars_2025", baseCharacter: "miku", displayName: "Miku Plush Digital Stars 2025 Helmet", texturePath: "textures/blocks/miku_plush_digital_stars_2025" },
  { plushId: "miku_plush_dont_believe_in_t", baseCharacter: "miku", displayName: "Miku Plush Don't Believe in T Helmet", texturePath: "textures/blocks/miku_plush_dont_believe_in_t" },
  { plushId: "miku_plush_fortnite_neko", baseCharacter: "miku", displayName: "Miku Plush Fortnite Neko Helmet", texturePath: "textures/blocks/miku_plush_fortnite_neko" },
  { plushId: "miku_plush_frankenstein", baseCharacter: "miku", displayName: "Miku Plush Frankenstein Helmet", texturePath: "textures/blocks/miku_plush_frankenstein" },
  { plushId: "miku_plush_frog", baseCharacter: "miku", displayName: "Miku Plush Frog Helmet", texturePath: "textures/blocks/miku_plush_frog" },
  { plushId: "miku_plush_ghost", baseCharacter: "miku", displayName: "Ghost Plush Helmet", texturePath: "textures/blocks/miku_plush_ghost" },
  { plushId: "miku_plush_ghostface", baseCharacter: "miku", displayName: "Miku Plush Ghostface Helmet", texturePath: "textures/blocks/miku_plush_ghostface" },
  { plushId: "miku_plush_hachune", baseCharacter: "miku", displayName: "Hachune Plush Helmet", texturePath: "textures/blocks/miku_plush_hachune" },
  { plushId: "miku_plush_helloplanet", baseCharacter: "miku", displayName: "Miku Plush HelloPlanet Helmet", texturePath: "textures/blocks/miku_plush_helloplanet" },
  { plushId: "miku_plush_hollow_knight", baseCharacter: "miku", displayName: "Miku Plush Hollow Knight Helmet", texturePath: "textures/blocks/miku_plush_hollow_knight" },
  { plushId: "miku_plush_hornet", baseCharacter: "miku", displayName: "Miku Plush Hornet Helmet", texturePath: "textures/blocks/miku_plush_hornet" },
  { plushId: "miku_plush_infinity", baseCharacter: "miku", displayName: "Miku Plush Infinity Helmet", texturePath: "textures/blocks/miku_plush_infinity" },
  { plushId: "miku_plush_jason", baseCharacter: "miku", displayName: "Miku Plush Jason Helmet", texturePath: "textures/blocks/miku_plush_jason" },
  { plushId: "miku_plush_link", baseCharacter: "miku", displayName: "Miku Plush Link Helmet", texturePath: "textures/blocks/miku_plush_link" },
  { plushId: "miku_plush_lucario_z", baseCharacter: "miku", displayName: "Miku Plush Lucario Z Helmet", texturePath: "textures/blocks/miku_plush_lucario_z" },
  { plushId: "miku_plush_mesmerizer", baseCharacter: "miku", displayName: "Miku Plush Mesmerizer Helmet", texturePath: "textures/blocks/miku_plush_mesmerizer" },
  { plushId: "miku_plush_michael_myers", baseCharacter: "miku", displayName: "Miku Plush Michael Myers Helmet", texturePath: "textures/blocks/miku_plush_michael_myers" },
  { plushId: "miku_plush_mochimochi", baseCharacter: "miku", displayName: "Mochimochi Plush Helmet", texturePath: "textures/blocks/miku_plush_mochimochi" },
  { plushId: "miku_plush_monitoring", baseCharacter: "miku", displayName: "Miku Plush Monitoring Helmet", texturePath: "textures/blocks/miku_plush_monitoring" },
  { plushId: "miku_plush_mummy", baseCharacter: "miku", displayName: "Miku Plush Mummy Helmet", texturePath: "textures/blocks/miku_plush_mummy" },
  { plushId: "miku_plush_mushroom", baseCharacter: "miku", displayName: "Miku Plush Mushroom Helmet", texturePath: "textures/blocks/miku_plush_mushroom" },
  { plushId: "miku_plush_patata", baseCharacter: "miku", displayName: "Patata Plush Helmet", texturePath: "textures/blocks/miku_plush_patata" },
  { plushId: "miku_plush_patati", baseCharacter: "miku", displayName: "Patati Plush Helmet", texturePath: "textures/blocks/miku_plush_patati" },
  { plushId: "miku_plush_personadancing", baseCharacter: "miku", displayName: "Miku Plush Persona Dancing Helmet", texturePath: "textures/blocks/miku_plush_personadancing" },
  { plushId: "miku_plush_pppp", baseCharacter: "miku", displayName: "Miku Plush PPPP Helmet", texturePath: "textures/blocks/miku_plush_pppp" },
  { plushId: "miku_plush_psycho_mode", baseCharacter: "miku", displayName: "Miku Plush Psycho Mode Helmet", texturePath: "textures/blocks/miku_plush_psycho_mode" },
  { plushId: "miku_plush_pumpkin", baseCharacter: "miku", displayName: "Miku Plush Pumpkin Helmet", texturePath: "textures/blocks/miku_plush_pumpkin" },
  { plushId: "miku_plush_reindeer", baseCharacter: "miku", displayName: "Miku Plush Reindeer Helmet", texturePath: "textures/blocks/miku_plush_reindeer" },
  { plushId: "miku_plush_renaissance", baseCharacter: "miku", displayName: "Miku Plush Renaissance Helmet", texturePath: "textures/blocks/miku_plush_renaissance" },
  { plushId: "miku_plush_rolling_girl", baseCharacter: "miku", displayName: "Rolling Girl Plush Helmet", texturePath: "textures/blocks/miku_plush_rolling_girl" },
  { plushId: "miku_plush_rotten_girl", baseCharacter: "miku", displayName: "Miku Plush Rotten Girl Helmet", texturePath: "textures/blocks/miku_plush_rotten_girl" },
  { plushId: "miku_plush_santa", baseCharacter: "miku", displayName: "Miku Plush Santa Helmet", texturePath: "textures/blocks/miku_plush_santa" },
  { plushId: "miku_plush_santa_elf", baseCharacter: "miku", displayName: "Miku Plush Santa Elf Helmet", texturePath: "textures/blocks/miku_plush_santa_elf" },
  { plushId: "miku_plush_senbonzakura", baseCharacter: "miku", displayName: "Miku Plush Senbonzakura Helmet", texturePath: "textures/blocks/miku_plush_senbonzakura" },
  { plushId: "miku_plush_sonic", baseCharacter: "miku", displayName: "Miku Plush Sonic Helmet", texturePath: "textures/blocks/miku_plush_sonic" },
  { plushId: "miku_plush_sonic_crossworlds", baseCharacter: "miku", displayName: "Miku Plush Sonic Crossworlds Helmet", texturePath: "textures/blocks/miku_plush_sonic_crossworlds" },
  { plushId: "miku_plush_static", baseCharacter: "miku", displayName: "Miku Plush Static Helmet", texturePath: "textures/blocks/miku_plush_static" },
  { plushId: "miku_plush_synthv", baseCharacter: "miku", displayName: "Miku Plush SynthV Helmet", texturePath: "textures/blocks/miku_plush_synthv" },
  { plushId: "miku_plush_uraotomelovers", baseCharacter: "miku", displayName: "Miku Plush Uraotome Lovers Helmet", texturePath: "textures/blocks/miku_plush_uraotomelovers" },
  { plushId: "miku_plush_v4", baseCharacter: "miku", displayName: "Miku Plush V4 Helmet", texturePath: "textures/blocks/miku_plush_v4" },
  { plushId: "miku_plush_vampire", baseCharacter: "miku", displayName: "Miku Plush Vampire Helmet", texturePath: "textures/blocks/miku_plush_vampire" },
  { plushId: "miku_plush_werewoman", baseCharacter: "miku", displayName: "Miku Plush Werewoman Helmet", texturePath: "textures/blocks/miku_plush_werewoman" },
  { plushId: "miku_plush_witch", baseCharacter: "miku", displayName: "Miku Plush Witch Helmet", texturePath: "textures/blocks/miku_plush_witch" },
  { plushId: "miku_plush_world_is_mine", baseCharacter: "miku", displayName: "Miku Plush World Is Mine Helmet", texturePath: "textures/blocks/miku_plush_world_is_mine" },
  { plushId: "miku_plush_xmas_tree", baseCharacter: "miku", displayName: "Miku Plush Xmas Tree Helmet", texturePath: "textures/blocks/miku_plush_xmas_tree" },
  { plushId: "miku_plush_zatsune", baseCharacter: "miku", displayName: "Miku Plush Zatsune Helmet", texturePath: "textures/blocks/miku_plush_zatsune" },
  { plushId: "teto_plush", baseCharacter: "teto", displayName: "Teto Plush Helmet", texturePath: "textures/blocks/teto_plush" },
  { plushId: "teto_plush_birdbrain", baseCharacter: "teto", displayName: "Teto Plush Birdbrain Helmet", texturePath: "textures/blocks/teto_plush_birdbrain" },
  { plushId: "teto_plush_dont_believe_in_t", baseCharacter: "teto", displayName: "Teto Plush Don't Believe in T Helmet", texturePath: "textures/blocks/teto_plush_dont_believe_in_t" },
  { plushId: "teto_plush_liar_dancer", baseCharacter: "teto", displayName: "Teto Plush Liar Dancer Helmet", texturePath: "textures/blocks/teto_plush_liar_dancer" },
  { plushId: "teto_plush_lobster", baseCharacter: "teto", displayName: "Teto Plush Lobster Helmet", texturePath: "textures/blocks/teto_plush_lobster" },
  { plushId: "teto_plush_mesmerizer", baseCharacter: "teto", displayName: "Teto Plush Mesmerizer Helmet", texturePath: "textures/blocks/teto_plush_mesmerizer" },
  { plushId: "teto_plush_pppp", baseCharacter: "teto", displayName: "Teto Plush PPPP Helmet", texturePath: "textures/blocks/teto_plush_pppp" },
  { plushId: "teto_plush_regret_rock", baseCharacter: "teto", displayName: "Teto Plush Regret Rock Helmet", texturePath: "textures/blocks/teto_plush_regret_rock" },
  { plushId: "teto_plush_shadow", baseCharacter: "teto", displayName: "Teto Plush Shadow Helmet", texturePath: "textures/blocks/teto_plush_shadow" },
  { plushId: "teto_plush_shrimp", baseCharacter: "teto", displayName: "Teto Plush Shrimp Helmet", texturePath: "textures/blocks/teto_plush_shrimp" },
  { plushId: "teto_plush_some_more_of_that_song", baseCharacter: "teto", displayName: "Teto Plush Some More of That Song Helmet", texturePath: "textures/blocks/teto_plush_some_more_of_that_song" },
  { plushId: "teto_plush_spoken_for", baseCharacter: "teto", displayName: "Teto Plush Spoken For Helmet", texturePath: "textures/blocks/teto_plush_spoken_for" },
  { plushId: "teto_plush_synthv", baseCharacter: "teto", displayName: "Teto Plush SynthV Helmet", texturePath: "textures/blocks/teto_plush_synthv" },
  { plushId: "teto_plush_whatchacallitsname", baseCharacter: "teto", displayName: "Teto Plush Whatchacallitsname Helmet", texturePath: "textures/blocks/teto_plush_whatchacallitsname" },
  { plushId: "akita_neru_plush", baseCharacter: "akita_neru", displayName: "Akita Neru Plush Helmet", texturePath: "textures/blocks/akita_neru_plush" },
  { plushId: "akita_neru_plush_tails", baseCharacter: "akita_neru", displayName: "Akita Neru Plush Tails Helmet", texturePath: "textures/blocks/akita_neru_plush_tails" },
  { plushId: "luka_plush", baseCharacter: "luka", displayName: "Luka Plush Helmet", texturePath: "textures/blocks/luka_plush" },
  { plushId: "meiko_plush", baseCharacter: "meiko", displayName: "Meiko Plush Helmet", texturePath: "textures/blocks/meiko_plush" },
  { plushId: "meiko_plush_v3", baseCharacter: "meiko", displayName: "Meiko Plush V3 Helmet", texturePath: "textures/blocks/meiko_plush_v3" },
  { plushId: "meiko_plush_v4", baseCharacter: "meiko", displayName: "Meiko Plush V4 Helmet", texturePath: "textures/blocks/meiko_plush_v4" },
  { plushId: "kaito_plush", baseCharacter: "kaito", displayName: "Kaito Plush Helmet", texturePath: "textures/blocks/kaito_plush" },
  { plushId: "kaito_plush_v3", baseCharacter: "kaito", displayName: "Kaito Plush V3 Helmet", texturePath: "textures/blocks/kaito_plush_v3" },
  { plushId: "kaito_plush_v4", baseCharacter: "kaito", displayName: "Kaito Plush V4 Helmet", texturePath: "textures/blocks/kaito_plush_v4" },
  { plushId: "gumi_plush", baseCharacter: "gumi", displayName: "Gumi Plush Helmet", texturePath: "textures/blocks/gumi_plush" },
  { plushId: "gumi_plush_v3", baseCharacter: "gumi", displayName: "Gumi Plush V3 Helmet", texturePath: "textures/blocks/gumi_plush_v3" },
  { plushId: "gumi_plush_v4", baseCharacter: "gumi", displayName: "Gumi Plush V4 Helmet", texturePath: "textures/blocks/gumi_plush_v4" },
  { plushId: "gumi_plush_v6", baseCharacter: "gumi", displayName: "Gumi Plush V6 Helmet", texturePath: "textures/blocks/gumi_plush_v6" },
  { plushId: "rin_plush", baseCharacter: "rin", displayName: "Rin Plush Helmet", texturePath: "textures/blocks/rin_plush" },
  { plushId: "len_plush", baseCharacter: "len", displayName: "Len Plush Helmet", texturePath: "textures/blocks/len_plush" },
  { plushId: "konoha_plush", baseCharacter: "konoha", displayName: "Konoha Plush Helmet", texturePath: "textures/blocks/konoha_plush" },
  { plushId: "aiko_plush", baseCharacter: "aiko", displayName: "Aiko Plush Helmet", texturePath: "textures/blocks/aiko_plush" },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateHelmetItem(variant: PlushVariant): object {
  return {
    format_version: "1.21.70",
    "minecraft:item": {
      description: {
        identifier: `miku:${variant.plushId}_helmet`,
        menu_category: {
          category: "equipment",
          group: "minecraft:itemGroup.name.helmet"
        }
      },
      components: {
        "minecraft:icon": `miku:${variant.plushId}_helmet`,
        "minecraft:max_stack_size": 1,
        "minecraft:wearable": {
          slot: "slot.armor.head",
          protection: 1
        },
        "minecraft:enchantable": {
          slot: "armor_head",
          value: 10
        },
        "minecraft:tags": {
          tags: ["minecraft:is_armor"]
        }
      }
    }
  };
}

function generateAttachable(variant: PlushVariant): object {
  const geometry = BASE_GEOMETRY_MAP[variant.baseCharacter];
  return {
    format_version: "1.8.0",
    "minecraft:attachable": {
      description: {
        identifier: `miku:${variant.plushId}_helmet`,
        materials: {
          default: "entity_alphatest"
        },
        textures: {
          default: variant.texturePath
        },
        geometry: {
          default: geometry
        }
      },
      scripts: {
        animate: ["helmet_transform"]
      },
      animations: {
        helmet_transform: "animation.plush_helmet.transform"
      },
      render_controllers: ["controller.render.plush_helmet"]
    }
  };
}

function generateRecipeFromBlock(variant: PlushVariant): object {
  return {
    format_version: "1.20.10",
    "minecraft:recipe_shapeless": {
      description: {
        identifier: `miku:${variant.plushId}_helmet_from_block`
      },
      tags: ["crafting_table"],
      ingredients: [
        { item: `miku:${variant.plushId}` }
      ],
      unlock: [
        { item: `miku:${variant.plushId}` }
      ],
      result: {
        item: `miku:${variant.plushId}_helmet`,
        count: 1
      }
    }
  };
}

function generateRecipeToBlock(variant: PlushVariant): object {
  return {
    format_version: "1.20.10",
    "minecraft:recipe_shapeless": {
      description: {
        identifier: `miku:${variant.plushId}_helmet_to_block`
      },
      tags: ["crafting_table"],
      ingredients: [
        { item: `miku:${variant.plushId}_helmet` }
      ],
      unlock: [
        { item: `miku:${variant.plushId}_helmet` }
      ],
      result: {
        item: `miku:${variant.plushId}`,
        count: 1
      }
    }
  };
}

function generateAll() {
  ensureDir(ITEMS_DIR);
  ensureDir(ATTACHABLES_DIR);
  ensureDir(RECIPES_DIR);

  console.log("Generating plush helmet wearables...\n");

  for (const variant of VARIANTS) {
    const helmetItemJson = generateHelmetItem(variant);
    const helmetItemPath = path.join(ITEMS_DIR, `${variant.plushId}_helmet.json`);
    fs.writeFileSync(helmetItemPath, JSON.stringify(helmetItemJson, null, 2));
    console.log(`  Created BP item: ${variant.plushId}_helmet.json`);

    const attachableJson = generateAttachable(variant);
    const attachablePath = path.join(ATTACHABLES_DIR, `${variant.plushId}_helmet.json`);
    fs.writeFileSync(attachablePath, JSON.stringify(attachableJson, null, 2));
    console.log(`  Created RP attachable: ${variant.plushId}_helmet.json`);

    const recipeFromBlock = generateRecipeFromBlock(variant);
    const recipeFromBlockPath = path.join(RECIPES_DIR, `${variant.plushId}_helmet_from_block.json`);
    fs.writeFileSync(recipeFromBlockPath, JSON.stringify(recipeFromBlock, null, 2));
    console.log(`  Created BP recipe: ${variant.plushId}_helmet_from_block.json`);

    const recipeToBlock = generateRecipeToBlock(variant);
    const recipeToBlockPath = path.join(RECIPES_DIR, `${variant.plushId}_helmet_to_block.json`);
    fs.writeFileSync(recipeToBlockPath, JSON.stringify(recipeToBlock, null, 2));
    console.log(`  Created BP recipe: ${variant.plushId}_helmet_to_block.json`);
  }

  console.log(`\nGenerated ${VARIANTS.length} helmet variants (${VARIANTS.length * 4} total files).`);
  console.log("  - ${VARIANTS.length} BP item files");
  console.log("  - ${VARIANTS.length} RP attachable files");
  console.log("  - ${VARIANTS.length} BP recipes (block -> helmet)");
  console.log("  - ${VARIANTS.length} BP recipes (helmet -> block)");
  console.log("\nWearable generation complete!");
}

if (require.main === module) {
  generateAll();
}

export { generateAll, VARIANTS, PlushVariant, BASE_GEOMETRY_MAP };
