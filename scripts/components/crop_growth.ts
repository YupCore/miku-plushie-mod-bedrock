import {
  Block,
  BlockComponentRegistry,
  EquipmentSlot,
  GameMode,
  BlockCustomComponent,
  BlockComponentRandomTickEvent,
  BlockComponentPlayerInteractEvent,
} from "@minecraft/server";

const GROWTH_STATE = "miku:growth";
const MAX_GROWTH = 7;
const MIN_LIGHT_LEVEL = 9;
const FARMLAND_SEARCH_RANGE = 1;
const FARMLAND_SPEED_MODIFIER = 1;
const FARMLAND_MOISTURE_SPEED_MODIFIER = 2;
const NEIGHBORING_FARMLAND_SPEED_MULTIPLIER = 0.25;
const CROWDING_SPEED_MULTIPLIER = 0.5;
const BONE_MEAL_MIN = 2;
const BONE_MEAL_MAX = 5;

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function* getFarmlandIterator(crop: Block, searchRange: number) {
  for (let x = -searchRange; x <= searchRange; x++) {
    for (let z = -searchRange; z <= searchRange; z++) {
      const block = crop.offset({ x, y: -1, z });
      if (block?.typeId === "minecraft:farmland") yield block;
    }
  }
}

function isCrowded(crop: Block): boolean {
  const north = crop.north();
  const south = crop.south();
  const west = crop.west();
  const east = crop.east();

  const isEnclosed =
    (west?.typeId === crop.typeId || east?.typeId === crop.typeId) &&
    (north?.typeId === crop.typeId || south?.typeId === crop.typeId);
  if (isEnclosed) return true;

  return (
    north?.west()?.typeId === crop.typeId ||
    north?.east()?.typeId === crop.typeId ||
    south?.west()?.typeId === crop.typeId ||
    south?.east()?.typeId === crop.typeId
  );
}

function getGrowthSpeed(crop: Block): number {
  let speed = 1;
  for (const farmland of getFarmlandIterator(crop, FARMLAND_SEARCH_RANGE)) {
    let modifier = FARMLAND_SPEED_MODIFIER;
    const moisture = farmland.permutation.getState("moisturized_amount") ?? 0;
    if (moisture > 0) modifier += FARMLAND_MOISTURE_SPEED_MODIFIER;
    const isDirectlyBelow = farmland.x === crop.x && farmland.z === crop.z;
    if (!isDirectlyBelow) modifier *= NEIGHBORING_FARMLAND_SPEED_MULTIPLIER;
    speed += modifier;
  }
  if (isCrowded(crop)) speed *= CROWDING_SPEED_MULTIPLIER;
  return speed;
}

function randomShouldCropGrow(crop: Block): boolean {
  const speed = getGrowthSpeed(crop);
  const range = Math.floor(25 / speed);
  return randomInt(0, range) === 0;
}

const CropGrowthComponent: BlockCustomComponent = {
  onRandomTick({ block }: BlockComponentRandomTickEvent) {
    if (block.getLightLevel() < MIN_LIGHT_LEVEL) return;
    const growth = (block.permutation.getState(GROWTH_STATE as any) as number) ?? MAX_GROWTH;
    if (growth >= MAX_GROWTH) return;
    if (!randomShouldCropGrow(block)) return;
    block.setPermutation(block.permutation.withState(GROWTH_STATE as any, growth + 1));
  },

  onPlayerInteract({ block, dimension, player }: BlockComponentPlayerInteractEvent) {
    if (!player) return;
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return;
    const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainhand.hasItem()) return;
    if (mainhand.typeId !== "minecraft:bone_meal") return;

    const growth = (block.permutation.getState(GROWTH_STATE as any) as number) ?? MAX_GROWTH;
    if (growth >= MAX_GROWTH) return;

    const newGrowth = Math.min(growth + randomInt(BONE_MEAL_MIN, BONE_MEAL_MAX), MAX_GROWTH);
    block.setPermutation(block.permutation.withState(GROWTH_STATE as any, newGrowth));

    if (player.getGameMode() !== GameMode.Creative) {
      if (mainhand.amount > 1) mainhand.amount--;
      else mainhand.setItem(undefined);
    }

    const effectLocation = block.center();
    dimension.playSound("item.bone_meal.use", effectLocation);
    dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);
  },
};

export function registerCropGrowthComponent(blockComponentRegistry: BlockComponentRegistry): void {
  blockComponentRegistry.registerCustomComponent("miku:crop_growth", CropGrowthComponent);
}
