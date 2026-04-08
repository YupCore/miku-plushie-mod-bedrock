import { world, EquipmentSlot, GameMode, system } from "@minecraft/server";

const MAX_GROWTH_AGE = 7;
const BONE_MEAL_AMOUNT_MIN = 2;
const BONE_MEAL_AMOUNT_MAX = 5;
const RANDOM_GROWTH_CHANCE = 0.05;
const CROP_GROWTH_INTERVAL = 10;

function getGrowthState(block: any): number {
  try {
    return (block.permutation as any).getState?.("miku:growth") ?? 0;
  } catch {
    return 0;
  }
}

function setGrowthState(block: any, age: number): void {
  try {
    const newPermutation = (block.permutation as any).withState?.("miku:growth", age);
    if (newPermutation) {
      block.setPermutation(newPermutation);
    }
  } catch {
    // Block permutation update not supported
  }
}

function processCropGrowth(dimension: any): void {
  const cropBlocks = dimension.getBlocks({
    volume: {
      min: { x: -1000, y: -64, z: -1000 },
      max: { x: 1000, y: 320, z: 1000 },
    },
    includeTypes: ["miku:leek_crop"],
  });

  for (const block of cropBlocks) {
    const currentAge = getGrowthState(block);
    if (currentAge >= MAX_GROWTH_AGE) continue;

    const blockBelow = dimension.getBlock({
      x: block.location.x,
      y: block.location.y - 1,
      z: block.location.z,
    });

    if (blockBelow?.typeId === "minecraft:farmland") {
      if (Math.random() < RANDOM_GROWTH_CHANCE) {
        setGrowthState(block, currentAge + 1);
      }
    }
  }
}

export function startCropGrowthSystem(): void {
  console.log("[Miku Plushie] Starting crop growth system");

  world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const { block, player } = event;
    if (!player) return;

    if (block.typeId === "miku:leek_crop") {
      const equippable = player.getComponent("minecraft:equippable");
      const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);

      if (mainhand?.typeId === "minecraft:bone_meal") {
        const currentAge = getGrowthState(block);
        if (currentAge >= MAX_GROWTH_AGE) return;

        const growthAmount =
          Math.floor(Math.random() * (BONE_MEAL_AMOUNT_MAX - BONE_MEAL_AMOUNT_MIN + 1)) + BONE_MEAL_AMOUNT_MIN;
        const newAge = Math.min(currentAge + growthAmount, MAX_GROWTH_AGE);

        setGrowthState(block, newAge);
        block.dimension.playSound("item.bone_meal.use", block.location);

        const isCreative = player.getGameMode() === GameMode.Creative;
        if (!isCreative) {
          if (mainhand.amount > 1) {
            mainhand.amount--;
          } else {
            mainhand.setItem(undefined);
          }
        }
      }
    }
  });

  system.runInterval(() => {
    for (const dimId of ["overworld"]) {
      try {
        const dimension = world.getDimension(dimId);
        processCropGrowth(dimension);
      } catch {
        // Dimension might not exist
      }
    }
  }, CROP_GROWTH_INTERVAL);
}
