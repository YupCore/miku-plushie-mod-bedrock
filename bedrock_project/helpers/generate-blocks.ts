import * as fs from "fs";
import * as path from "path";

const BP_DIR = path.join(__dirname, "..", "behavior_packs", "miku_plushie");
const BLOCKS_DIR = path.join(BP_DIR, "blocks");
const RP_DIR = path.join(__dirname, "..", "resource_packs", "miku_plushie");

interface PlushBlockDef {
  blockId: string;
  entityType: string;
  geometry: string;
  character: string;
  isGhost?: boolean;
}

const PLUSH_BLOCKS: PlushBlockDef[] = [
  // Miku plush variants
  { blockId: "miku_plush", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br_ba", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br_bik", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br_beach", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br_braid", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_br_ba_drum",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_br_pa", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br_sp", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_br_mg", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_br_brown_bro",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_br_electrician",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_br_bik_orange",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_br_am", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_br_fut_fla",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_br_fut_cam",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_br_go", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_br_school_pe",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_br_fut_crvg",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_br_rs", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_frog", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_mushroom", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_senbonzakura",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_uraotomelovers",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_personadancing",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_helloplanet",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_hachune", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_zatsune", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_infinity", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_vampire", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_werewoman",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_jason", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_michael_myers",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_pumpkin", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_ghostface",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_frankenstein",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_mummy", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_ghost",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
    isGhost: true,
  },
  { blockId: "miku_plush_patati", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_patata", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_devil", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_witch", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_santa", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_reindeer", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_santa_elf",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_xmas_tree",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_sonic_crossworlds",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_fortnite_neko",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_v4", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_mesmerizer",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_sonic", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_psycho_mode",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_dont_believe_in_t",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_static", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_mochimochi",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_monitoring",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_digital_stars_2025",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_rotten_girl",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_hollow_knight",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_hornet", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_world_is_mine",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_rolling_girl",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_deep_sea_girl",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  {
    blockId: "miku_plush_lucario_z",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_pppp", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  { blockId: "miku_plush_link", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },
  {
    blockId: "miku_plush_renaissance",
    entityType: "miku:miku_plush",
    geometry: "geometry.miku_plush",
    character: "miku",
  },
  { blockId: "miku_plush_bik", entityType: "miku:miku_plush", geometry: "geometry.miku_plush", character: "miku" },

  // Teto plush variants
  { blockId: "teto_plush", entityType: "miku:teto_plush", geometry: "geometry.teto_plush", character: "teto" },
  {
    blockId: "teto_plush_mesmerizer",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },
  { blockId: "teto_plush_shadow", entityType: "miku:teto_plush", geometry: "geometry.teto_plush", character: "teto" },
  {
    blockId: "teto_plush_birdbrain",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },
  {
    blockId: "teto_plush_regret_rock",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },
  {
    blockId: "teto_plush_dont_believe_in_t",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },
  {
    blockId: "teto_plush_liar_dancer",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },
  {
    blockId: "teto_plush_whatchacallitsname",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
    isGhost: true,
  },
  {
    blockId: "teto_plush_some_more_of_that_song",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },
  { blockId: "teto_plush_lobster", entityType: "miku:teto_plush", geometry: "geometry.teto_plush", character: "teto" },
  { blockId: "teto_plush_synthv", entityType: "miku:teto_plush", geometry: "geometry.teto_plush", character: "teto" },
  { blockId: "teto_plush_pppp", entityType: "miku:teto_plush", geometry: "geometry.teto_plush", character: "teto" },
  { blockId: "teto_plush_shrimp", entityType: "miku:teto_plush", geometry: "geometry.teto_plush", character: "teto" },
  {
    blockId: "teto_plush_spoken_for",
    entityType: "miku:teto_plush",
    geometry: "geometry.teto_plush",
    character: "teto",
  },

  // Neru plush variants
  {
    blockId: "akita_neru_plush",
    entityType: "miku:akita_neru_plush",
    geometry: "geometry.akita_neru_plush",
    character: "neru",
  },
  {
    blockId: "akita_neru_plush_tails",
    entityType: "miku:akita_neru_plush",
    geometry: "geometry.akita_neru_plush",
    character: "neru",
  },

  // Other vocaloids
  { blockId: "aiko_plush", entityType: "miku:aiko_plush", geometry: "geometry.aiko_plush", character: "aiko" },
  { blockId: "rin_plush", entityType: "miku:rin_plush", geometry: "geometry.rin_plush", character: "rin" },
  { blockId: "len_plush", entityType: "miku:len_plush", geometry: "geometry.len_plush", character: "len" },
  { blockId: "konoha_plush", entityType: "miku:konoha_plush", geometry: "geometry.konoha_plush", character: "miku" },
  { blockId: "luka_plush", entityType: "miku:luka_plush", geometry: "geometry.luka_plush", character: "luka" },
  { blockId: "meiko_plush", entityType: "miku:meiko_plush", geometry: "geometry.meiko_plush", character: "meiko" },
  { blockId: "meiko_plush_v3", entityType: "miku:meiko_plush", geometry: "geometry.meiko_plush", character: "meiko" },
  { blockId: "meiko_plush_v4", entityType: "miku:meiko_plush", geometry: "geometry.meiko_plush", character: "meiko" },
  { blockId: "gumi_plush", entityType: "miku:gumi_plush", geometry: "geometry.gumi_plush", character: "gumi" },
  { blockId: "gumi_plush_v3", entityType: "miku:gumi_plush", geometry: "geometry.gumi_plush", character: "gumi" },
  { blockId: "gumi_plush_v4", entityType: "miku:gumi_plush", geometry: "geometry.gumi_plush", character: "gumi" },
  { blockId: "gumi_plush_v6", entityType: "miku:gumi_plush", geometry: "geometry.gumi_plush", character: "gumi" },
  { blockId: "kaito_plush", entityType: "miku:kaito_plush", geometry: "geometry.kaito_plush", character: "kaito" },
  { blockId: "kaito_plush_v3", entityType: "miku:kaito_plush", geometry: "geometry.kaito_plush", character: "kaito" },
  { blockId: "kaito_plush_v4", entityType: "miku:kaito_plush", geometry: "geometry.kaito_plush", character: "kaito" },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generatePlushBlockJson(block: PlushBlockDef): object {
  const fullBlockId = `miku:${block.blockId}`;
  const renderMethod = block.isGhost ? "blend" : "alpha_test";

  return {
    format_version: "1.21.50",
    "minecraft:block": {
      description: {
        identifier: fullBlockId,
        traits: {
          "minecraft:placement_direction": {
            enabled_states: ["minecraft:cardinal_direction"],
            y_rotation_offset: 180,
          },
        },
      },
      components: {
        "miku:plush_block": {},
        "minecraft:display_name": `block.${fullBlockId}.name`,
        "minecraft:geometry": block.geometry,
        "minecraft:material_instances": {
          "*": {
            texture: fullBlockId,
            render_method: renderMethod,
          },
        },
        "minecraft:item_visual": {
          geometry: block.geometry,
          material_instances: {
            "*": {
              texture: fullBlockId,
              render_method: renderMethod,
            },
          },
        },
        "minecraft:collision_box": {
          origin: [-3.5, 0, -3.5],
          size: [7, 13.5, 7],
        },
        "minecraft:selection_box": {
          origin: [-3.5, 0, -3.5],
          size: [7, 13.5, 7],
        },
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 2,
        },
        "minecraft:destructible_by_explosion": {
          explosion_resistance: 5,
        },
        "minecraft:map_color": "#8E3A24",
        "minecraft:placement_filter": {
          conditions: [
            {
              allowed_faces: ["up"],
            },
          ],
        },
      },
      permutations: [
        {
          condition: "q.block_state('minecraft:cardinal_direction') == 'north'",
          components: {
            "minecraft:transformation": { rotation: [0, 0, 0] },
          },
        },
        {
          condition: "q.block_state('minecraft:cardinal_direction') == 'east'",
          components: {
            "minecraft:transformation": { rotation: [0, -90, 0] },
          },
        },
        {
          condition: "q.block_state('minecraft:cardinal_direction') == 'south'",
          components: {
            "minecraft:transformation": { rotation: [0, 180, 0] },
          },
        },
        {
          condition: "q.block_state('minecraft:cardinal_direction') == 'west'",
          components: {
            "minecraft:transformation": { rotation: [0, 90, 0] },
          },
        },
      ],
    },
  };
}

function generateRpBlocksJson(): object {
  const blocksSounds: Record<string, { sound: string }> = {};

  for (const block of PLUSH_BLOCKS) {
    const fullBlockId = `miku:${block.blockId}`;
    const soundGroup = block.isGhost ? "glass" : "cloth";
    blocksSounds[fullBlockId] = { sound: soundGroup };
  }

  return {
    format_version: "1.21.50",
    ...blocksSounds,
  };
}

function generateBlocks() {
  ensureDir(BLOCKS_DIR);
  ensureDir(RP_DIR);

  console.log("Generating plush block JSONs...");

  for (const block of PLUSH_BLOCKS) {
    const blockJson = generatePlushBlockJson(block);
    const blockPath = path.join(BLOCKS_DIR, `${block.blockId}.json`);
    fs.writeFileSync(blockPath, JSON.stringify(blockJson, null, 2));
    console.log(`  Created: ${block.blockId}.json`);

    console.log("\nGenerating RP blocks.json for sounds...");
    const rpBlocksJson = generateRpBlocksJson();
    const rpBlocksPath = path.join(RP_DIR, "blocks.json");
    fs.writeFileSync(rpBlocksPath, JSON.stringify(rpBlocksJson, null, 2));
    console.log(`  Created: blocks.json`);

    console.log(`\nGenerated ${PLUSH_BLOCKS.length} plush blocks with loot tables, sounds, and item definitions.`);
    console.log("Block generation complete!");
  }

  console.log("\nGenerating RP blocks.json for sounds...");
  const rpBlocksJson = generateRpBlocksJson();
  const rpBlocksPath = path.join(RP_DIR, "blocks.json");
  fs.writeFileSync(rpBlocksPath, JSON.stringify(rpBlocksJson, null, 2));
  console.log(`  Created: blocks.json`);

  console.log(`\nGenerated ${PLUSH_BLOCKS.length} plush blocks with loot tables and sounds.`);
  console.log("Block generation complete!");
}

if (require.main === module) {
  generateBlocks();
}

export { generateBlocks, PLUSH_BLOCKS };
