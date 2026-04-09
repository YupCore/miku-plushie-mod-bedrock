import { world, EquipmentSlot, GameMode, system, BlockVolume } from "@minecraft/server";

const MAX_GROWTH_AGE = 7;
const BONE_MEAL_AMOUNT_MIN = 2;
const BONE_MEAL_AMOUNT_MAX = 5;
const RANDOM_GROWTH_CHANCE = 0.05;
const CROP_GROWTH_INTERVAL = 10;
const SCAN_RADIUS_XZ = 64;
const SCAN_RADIUS_Y = 16;

function getGrowthState(block: any): number {
  return (block.permutation.getState("miku:growth" as any) as number) ?? 0;
}

function setGrowthState(block: any, age: number): void {
  block.setPermutation(block.permutation.withState("miku:growth" as any, age));
}

function processCropGrowth(dimension: any, center: { x: number; y: number; z: number }): void {
  const minX = Math.floor(center.x) - SCAN_RADIUS_XZ;
  const minY = Math.max(-64, Math.floor(center.y) - SCAN_RADIUS_Y);
  const minZ = Math.floor(center.z) - SCAN_RADIUS_XZ;
  const maxX = Math.floor(center.x) + SCAN_RADIUS_XZ;
  const maxY = Math.min(320, Math.floor(center.y) + SCAN_RADIUS_Y);
  const maxZ = Math.floor(center.z) + SCAN_RADIUS_XZ;

  let blockLocations: Iterable<any>;
  try {
    blockLocations = dimension.getBlocks(
      new BlockVolume({ x: minX, y: minY, z: minZ }, { x: maxX, y: maxY, z: maxZ }),
      { includeTypes: ["miku:leek_crop"] }
    );
  } catch {
    return;
  }

  for (const loc of blockLocations) {
    const block = dimension.getBlock(loc);
    if (!block) continue;

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
    const seen = new Set<string>();
    for (const player of world.getAllPlayers()) {
      const pos = player.location;
      // Deduplicate: one scan per 64-block tile per dimension per tick
      const key = `${player.dimension.id}:${Math.floor(pos.x / SCAN_RADIUS_XZ)}:${Math.floor(pos.z / SCAN_RADIUS_XZ)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      processCropGrowth(player.dimension, pos);
    }
  }, CROP_GROWTH_INTERVAL);
}
