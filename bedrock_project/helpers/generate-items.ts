import * as fs from "fs";
import * as path from "path";

const BP_DIR = path.join(__dirname, "..", "behavior_packs", "miku_plushie");
const ITEMS_DIR = path.join(BP_DIR, "items");

interface ItemDef {
  itemId: string;
  type: "food" | "seed" | "regular" | "pickaxe";
  nutrition?: number;
  saturation?: number;
  rarity?: "common" | "uncommon" | "rare" | "epic";
}

const ITEMS: ItemDef[] = [
  { itemId: "leek", type: "food", nutrition: 4, saturation: 0.6 },
  { itemId: "baguette", type: "food", nutrition: 8, saturation: 0.6 },
  { itemId: "leek_seeds", type: "seed" },
  { itemId: "canudinho", type: "regular", rarity: "rare" },
  { itemId: "akita_neru_phone", type: "regular" },
  { itemId: "vocaloid_heart", type: "regular" },
  { itemId: "teto_pickaxe", type: "pickaxe" },
  { itemId: "teto_pickaxe_mesmerizer", type: "pickaxe" },
  { itemId: "teto_pickaxe_birdbrain", type: "pickaxe" },
  { itemId: "teto_pickaxe_regret_rock", type: "pickaxe" },
  { itemId: "teto_pickaxe_dont_believe_in_t", type: "pickaxe" },
  { itemId: "teto_pickaxe_liar_dancer", type: "pickaxe" },
  { itemId: "teto_pickaxe_whatchacallitsname", type: "pickaxe" },
  { itemId: "teto_pickaxe_some_more_of_that_song", type: "pickaxe" },
  { itemId: "teto_pickaxe_synthv", type: "pickaxe" },
  { itemId: "teto_pickaxe_spoken_for", type: "pickaxe" },
  { itemId: "teto_pickaxe_pppp", type: "pickaxe" },
];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateFoodItem(item: ItemDef): object {
  return {
    format_version: "1.21.70",
    "minecraft:item": {
      description: {
        identifier: `miku:${item.itemId}`,
      },
      components: {
        "minecraft:icon": `miku:${item.itemId}`,
        "minecraft:food": {
          nutrition: item.nutrition,
          saturation_modifier: item.saturation,
        },
        "minecraft:use_animation": "eat",
        "minecraft:use_modifiers": {
          use_duration: 1.6,
          movement_modifier: 0.35,
        },
        "minecraft:tags": {
          tags: ["minecraft:is_food"],
        },
      },
    },
  };
}

function generateSeedItem(item: ItemDef): object {
  return {
    format_version: "1.21.70",
    "minecraft:item": {
      description: {
        identifier: `miku:${item.itemId}`,
      },
      components: {
        "minecraft:icon": `miku:${item.itemId}`,
        "minecraft:block_placer": {
          block: "miku:leek_crop",
        },
      },
    },
  };
}

function generateRegularItem(item: ItemDef): object {
  const components: Record<string, unknown> = {
    "minecraft:icon": `miku:${item.itemId}`,
  };
  if (item.rarity) {
    components["minecraft:rarity"] = item.rarity;
  }
  return {
    format_version: "1.21.70",
    "minecraft:item": {
      description: {
        identifier: `miku:${item.itemId}`,
      },
      components,
    },
  };
}

function generatePickaxeItem(): object {
  return {
    format_version: "1.21.70",
    "minecraft:item": {
      description: {
        identifier: "miku:teto_pickaxe",
      },
      components: {
        "minecraft:icon": "miku:teto_pickaxe",
        "minecraft:durability": {
          max_durability: 500,
        },
        "minecraft:digger": {
          use_efficiency: true,
          destroy_speeds: [
            {
              block: {
                tags: "q.any_tag('minecraft:is_pickaxe_item_destructible')",
              },
              speed: 15,
            },
          ],
        },
        "minecraft:damage": {
          value: 2,
        },
        "minecraft:enchantable": {
          value: 25,
          slot: "pickaxe",
        },
        "minecraft:repairable": {
          repair_items: [
            {
              items: ["minecraft:diamond"],
              repair_amount: "context.other->query.remaining_durability + 0.05 * context.other->query.max_durability",
            },
          ],
        },
        "minecraft:hand_equipped": true,
        "minecraft:tags": {
          tags: ["minecraft:is_pickaxe"],
        },
      },
    },
  };
}

function generateItemJson(item: ItemDef): object {
  switch (item.type) {
    case "food":
      return generateFoodItem(item);
    case "seed":
      return generateSeedItem(item);
    case "pickaxe":
      return generatePickaxeItem();
    case "regular":
    default:
      return generateRegularItem(item);
  }
}

function generateItems() {
  ensureDir(ITEMS_DIR);

  console.log("Generating item JSONs...");

  for (const item of ITEMS) {
    const itemJson = generateItemJson(item);
    const itemPath = path.join(ITEMS_DIR, `${item.itemId}.json`);
    fs.writeFileSync(itemPath, JSON.stringify(itemJson, null, 2));
    console.log(`  Created: ${item.itemId}.json`);
  }

  console.log(`\nGenerated ${ITEMS.length} items.`);
  console.log("Item generation complete!");
}

if (require.main === module) {
  generateItems();
}

export { generateItems, ITEMS, ItemDef };
