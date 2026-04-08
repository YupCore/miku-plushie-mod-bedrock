import * as fs from "fs";
import * as path from "path";
import { PLUSH_BLOCKS } from "./generate-blocks";

const BP_DIR = path.join(__dirname, "..", "behavior_packs", "miku_plushie");
const BLOCKS_DIR = path.join(BP_DIR, "blocks");
const LOOT_TABLES_DIR = path.join(BP_DIR, "loot_tables", "blocks");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const growthStages = [
  { stage: 0, height: 0.0625 },
  { stage: 1, height: 0.125 },
  { stage: 2, height: 0.25 },
  { stage: 3, height: 0.375 },
  { stage: 4, height: 0.5 },
  { stage: 5, height: 0.625 },
  { stage: 6, height: 0.75 },
  { stage: 7, height: 1.0 },
];

function generateLeekCropBlock(): object {
  return {
    format_version: "1.21.70",
    "minecraft:block": {
      description: {
        identifier: "miku:leek_crop",
      },
      components: {
        "minecraft:geometry": "geometry.crop",
        "minecraft:material_instances": {
          "*": {
            texture: "miku:leek_crop_stage0",
            render_method: "alpha_test",
          },
          aged_0: { texture: "miku:leek_crop_stage0", render_method: "alpha_test" },
          aged_1: { texture: "miku:leek_crop_stage1", render_method: "alpha_test" },
          aged_2: { texture: "miku:leek_crop_stage2", render_method: "alpha_test" },
          aged_3: { texture: "miku:leek_crop_stage3", render_method: "alpha_test" },
          aged_4: { texture: "miku:leek_crop_stage4", render_method: "alpha_test" },
          aged_5: { texture: "miku:leek_crop_stage5", render_method: "alpha_test" },
          aged_6: { texture: "miku:leek_crop_stage6", render_method: "alpha_test" },
          aged_7: { texture: "miku:leek_crop_stage7", render_method: "alpha_test" },
        },
        "minecraft:light_emission": 0,
        "minecraft:map_color": "#4CE117",
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 0.0,
        },
        "minecraft:destructible_by_explosion": {
          explosions_resistant: false,
        },
        "minecraft:loot": "loot_tables/blocks/leek_crop.json",
        "minecraft:collision_box": {
          origin: [-7, 0, -7],
          size: [14, 16, 14],
        },
        "minecraft:selection_box": {
          origin: [-7, 0, -7],
          size: [14, 16, 14],
        },
        "minecraft:placement_filter": {
          conditions: [
            {
              allowed_faces: ["up"],
              block_filter: [{ tags: "query.any_tag('minecraft:is_fertile')" }],
            },
          ],
        },
        "minecraft:growable": {
          can_grow_on_interaction: false,
          can_survate_on_interaction: false,
          interaction_fertilize_type: "bonemeal",
        },
        "minecraft:light_dampening": 0,
        "minecraft:physics": false,
        "minecraft:air_physical": true,
      },
      permutations: growthStages.flatMap(({ stage, height }) => [
        {
          condition: `q.block_state('minecraft:growth') == ${stage}`,
          components: {
            "minecraft:material_instances": {
              "*": {
                texture: `miku:leek_crop_stage${stage}`,
                render_method: "alpha_test",
              },
            },
            "minecraft:geometry": `geometry.leek_crop_stage${stage}`,
            "minecraft:collision_box": {
              origin: [-7, 0, -7],
              size: [14, Math.round(height * 16), 14],
            },
            "minecraft:selection_box": {
              origin: [-7, 0, -7],
              size: [14, Math.round(height * 16), 14],
            },
          },
        },
      ]),
    },
  };
}

function generateLeekCropLootTable(): object {
  return {
    pools: [
      {
        rolls: 1,
        entries: [
          {
            type: "item",
            name: "miku:leek_seeds",
            weight: 1,
          },
        ],
      },
    ],
  };
}

function generateMatureLeekCropLootTable(): object {
  return {
    pools: [
      {
        rolls: 1,
        entries: [
          {
            type: "item",
            name: "miku:leek",
            weight: 1,
            functions: [
              {
                function: "set_count",
                count: {
                  min: 1,
                  max: 2,
                },
              },
            ],
          },
        ],
      },
      {
        rolls: 1,
        entries: [
          {
            type: "item",
            name: "miku:leek_seeds",
            weight: 1,
            functions: [
              {
                function: "set_count",
                count: {
                  min: 0,
                  max: 3,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

function generateWildLeekCropBlock(): object {
  return {
    format_version: "1.21.70",
    "minecraft:block": {
      description: {
        identifier: "miku:wild_leek_crop",
      },
      components: {
        "minecraft:geometry": "geometry.leek_crop_stage7",
        "minecraft:material_instances": {
          "*": {
            texture: "miku:wild_leek_crop",
            render_method: "alpha_test",
          },
        },
        "minecraft:light_emission": 0,
        "minecraft:map_color": "#4CE117",
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 0.0,
        },
        "minecraft:destructible_by_explosion": {
          explosions_resistant: false,
        },
        "minecraft:loot": "loot_tables/blocks/wild_leek_crop.json",
        "minecraft:collision_box": {
          origin: [-7, 0, -7],
          size: [14, 16, 14],
        },
        "minecraft:selection_box": {
          origin: [-7, 0, -7],
          size: [14, 16, 14],
        },
        "minecraft:placement_filter": {
          conditions: [
            {
              allowed_faces: ["up"],
              block_filter: [
                { blocks: ["minecraft:grass_block"] },
                { blocks: ["minecraft:podzol"] },
                { blocks: ["minecraft:rooted_dirt"] },
              ],
            },
          ],
        },
        "minecraft:light_dampening": 0,
        "minecraft:physics": false,
        "minecraft:air_physical": true,
      },
    },
  };
}

function generateWildLeekCropLootTable(): object {
  return {
    pools: [
      {
        rolls: 1,
        entries: [
          {
            type: "item",
            name: "miku:leek",
            weight: 1,
            functions: [
              {
                function: "set_count",
                count: {
                  min: 1,
                  max: 2,
                },
              },
            ],
          },
        ],
      },
      {
        rolls: 1,
        entries: [
          {
            type: "item",
            name: "miku:leek_seeds",
            weight: 1,
            functions: [
              {
                function: "set_count",
                count: {
                  min: 0,
                  max: 1,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

function generateCropBlocks() {
  ensureDir(BLOCKS_DIR);
  ensureDir(LOOT_TABLES_DIR);

  console.log("Generating crop block JSONs...");

  const leekCropJson = generateLeekCropBlock();
  const leekCropPath = path.join(BLOCKS_DIR, "leek_crop.json");
  fs.writeFileSync(leekCropPath, JSON.stringify(leekCropJson, null, 2));
  console.log("  Created: leek_crop.json");

  const wildLeekCropJson = generateWildLeekCropBlock();
  const wildLeekCropPath = path.join(BLOCKS_DIR, "wild_leek_crop.json");
  fs.writeFileSync(wildLeekCropPath, JSON.stringify(wildLeekCropJson, null, 2));
  console.log("  Created: wild_leek_crop.json");

  const leekCropLootJson = generateLeekCropLootTable();
  const leekCropLootPath = path.join(LOOT_TABLES_DIR, "leek_crop.json");
  fs.writeFileSync(leekCropLootPath, JSON.stringify(leekCropLootJson, null, 2));
  console.log("  Created: leek_crop loot table");

  const wildLeekCropLootJson = generateWildLeekCropLootTable();
  const wildLeekCropLootPath = path.join(LOOT_TABLES_DIR, "wild_leek_crop.json");
  fs.writeFileSync(wildLeekCropLootPath, JSON.stringify(wildLeekCropLootJson, null, 2));
  console.log("  Created: wild_leek_crop loot table");

  console.log("\nCrop block generation complete!");
}

if (require.main === module) {
  generateCropBlocks();
}

export { generateCropBlocks };
