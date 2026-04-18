import { Block, Dimension, Entity, system, Vector3, world } from "@minecraft/server";
import { DIMENSION_IDS, isEdibleLeekBlockType } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

const MAX_LEEK_AGE = 7;
const HEAL_AMOUNT = 4;
const EAT_TIMER_TOTAL = 40;
const EAT_TICK_INTERVAL = 60;
const LEEK_BREAK_DELAY = 4;

const POSITION_CHECKS = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 1, z: 0 },
  { x: 1, y: 1, z: 0 },
  { x: -1, y: 1, z: 0 },
  { x: 0, y: 1, z: 1 },
  { x: 0, y: 1, z: -1 },
];

interface PlushEatState {
  eating: boolean;
  isEatingProp: boolean;
  timer: number;
  targetBlock: Block | null;
  targetDimensionId: string | null;
  maxHealth: number;
}

const eatingPlushes: Map<string, PlushEatState> = new Map();

function getLeekGrowth(block: Block): number {
  return (block.permutation.getState("miku:growth" as any) as number) ?? 0;
}

function isMatureLeekBlock(block: Block): boolean {
  if (block.typeId === "miku:wild_leek_crop") return true;
  if (block.typeId !== "miku:leek_crop") return false;
  return getLeekGrowth(block) >= MAX_LEEK_AGE;
}

function findNearbyLeekBlock(dimension: Dimension, pos: Vector3): Block | null {
  const blockX = Math.floor(pos.x);
  const blockY = Math.floor(pos.y);
  const blockZ = Math.floor(pos.z);

  for (const offset of POSITION_CHECKS) {
    const block: Block | undefined = dimension.getBlock({
      x: blockX + offset.x,
      y: blockY + offset.y,
      z: blockZ + offset.z,
    });
    if (block && isEdibleLeekBlockType(block.typeId) && isMatureLeekBlock(block)) return block;
  }
  return null;
}

function stopEating(entity: Entity, state?: PlushEatState): void {
  if (!state) return;

  state.eating = false;
  state.timer = 0;
  state.targetBlock = null;
  state.targetDimensionId = null;

  if (state.isEatingProp) {
    entity.setProperty("miku:is_eating", false);
    state.isEatingProp = false;
  }
}

function consumeLeekBlock(block: Block): boolean {
  if (!block.isValid || !isEdibleLeekBlockType(block.typeId) || !isMatureLeekBlock(block)) return false;

  if (block.typeId === "miku:wild_leek_crop") {
    block.setType("minecraft:air");
    return true;
  }

  block.setPermutation(block.permutation.withState("miku:growth" as any, 0));
  return true;
}

function processEatingState(entity: Entity): void {
  const entityId = entity.id;
  const character = getCharacterFromEntity(entity.typeId);
  const health = entity.getComponent("minecraft:health");
  const state = eatingPlushes.get(entityId);
  if (!health) {
    stopEating(entity, state);
    return;
  }

  const maxHealth = health.effectiveMax;
  if (health.currentValue >= maxHealth || entity.getTags().includes("miku_sitting")) {
    stopEating(entity, state);
    return;
  }

  const leekBlock = findNearbyLeekBlock(entity.dimension, entity.location);
  if (!leekBlock) {
    stopEating(entity, state);
    return;
  }

  const activeState =
    state ??
    ({
      eating: false,
      isEatingProp: false,
      timer: 0,
      targetBlock: null,
      targetDimensionId: null,
      maxHealth,
    } satisfies PlushEatState);

  activeState.maxHealth = maxHealth;
  eatingPlushes.set(entityId, activeState);

  if (!activeState.eating) {
    activeState.eating = true;
    activeState.timer = EAT_TIMER_TOTAL;
    activeState.targetBlock = leekBlock;
    activeState.targetDimensionId = entity.dimension.id;

    if (!activeState.isEatingProp) {
      entity.setProperty("miku:is_eating", true);
      activeState.isEatingProp = true;
    }

    entity.lookAt({
      x: leekBlock.x + 0.5,
      y: leekBlock.y + 0.5,
      z: leekBlock.z + 0.5,
    });

    playPlushSound(entity, character, "eat", 1, 1);
  }

  if (!activeState.eating || activeState.timer <= 0) {
    stopEating(entity, activeState);
    return;
  }

  activeState.timer--;

  if (activeState.timer % 4 === 1 && activeState.timer > 4) {
    entity.dimension.playSound("entity.generic.eat", entity.location, {
      volume: 0.5,
      pitch: 1,
    });

    playPlushSound(entity, character, "eat", 1, 1);
  }

  if (activeState.timer % 5 === 0 && activeState.timer > 10) {
    entity.dimension.spawnParticle("minecraft:crop_growth_emitter", {
      x: entity.location.x + (Math.random() - 0.5) * 0.5,
      y: entity.location.y + 0.3,
      z: entity.location.z + (Math.random() - 0.5) * 0.5,
    });
  }

  if (activeState.timer === LEEK_BREAK_DELAY) {
    const targetBlock = activeState.targetBlock;
    const sameDimension = activeState.targetDimensionId === entity.dimension.id;
    if (targetBlock && sameDimension && consumeLeekBlock(targetBlock)) {
      const newHealth = Math.min(health.currentValue + HEAL_AMOUNT, activeState.maxHealth);
      health.setCurrentValue(newHealth);
    }
  }

  if (activeState.timer <= 0) {
    stopEating(entity, activeState);
  }
}

export function startMikuEatLeekSystem(): void {
  system.runInterval(() => {
    const liveIds = new Set<string>();

    for (const dimensionId of DIMENSION_IDS) {
      const dimension = world.getDimension(dimensionId);
      const plushes = dimension.getEntities({ families: ["plush"] });

      for (const entity of plushes) {
        liveIds.add(entity.id);
        processEatingState(entity);
      }
    }

    for (const [entityId] of eatingPlushes) {
      if (!liveIds.has(entityId)) {
        eatingPlushes.delete(entityId);
      }
    }
  }, EAT_TICK_INTERVAL);
}
