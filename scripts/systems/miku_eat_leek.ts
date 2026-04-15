import { world, system, Block } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";

const LEEK_CROP_BLOCK = "miku:leek_crop";
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
  maxHealth: number;
}

const eatingPlushes: Map<string, PlushEatState> = new Map();

function findNearbyLeekBlock(dimension: any, pos: { x: number; y: number; z: number }): Block | null {
  const blockX = Math.floor(pos.x);
  const blockY = Math.floor(pos.y);
  const blockZ = Math.floor(pos.z);

  for (const offset of POSITION_CHECKS) {
    const block: Block | undefined = dimension.getBlock({
      x: blockX + offset.x,
      y: blockY + offset.y,
      z: blockZ + offset.z,
    });
    if (block?.typeId === LEEK_CROP_BLOCK) {
      const age = (block.permutation.getState("miku:growth" as any) as number) ?? 0;
      if (age >= MAX_LEEK_AGE) {
        return block;
      }
    }
  }
  return null;
}

export function startMikuEatLeekSystem(): void {
  console.log("[Miku Plushie] Starting plush eat leek system");

  system.runInterval(() => {
    const overworld = world.getDimension("overworld");
    const allPlushes = (PLUSH_ENTITIES as readonly string[]).flatMap((type) => overworld.getEntities({ type }));

    // Clean up state for entities no longer alive
    const liveIds = new Set(allPlushes.map((e) => e.id));
    for (const id of eatingPlushes.keys()) {
      if (!liveIds.has(id)) eatingPlushes.delete(id);
    }

    for (const entity of allPlushes) {
      const entityId = entity.id;
      const health = entity.getComponent("minecraft:health");
      if (!health) continue;

      const maxHealth = health.effectiveMax;

      if (health.currentValue >= maxHealth) {
        const state = eatingPlushes.get(entityId);
        if (state) {
          state.eating = false;
          state.timer = 0;
          state.targetBlock = null;
          if (state.isEatingProp) {
            entity.setProperty("miku:is_eating", false);
            state.isEatingProp = false;
          }
        }
        continue;
      }

      if (entity.getTags().includes("miku_sitting")) continue;

      const pos = entity.location;
      const leekBlock = findNearbyLeekBlock(overworld, pos);

      if (!leekBlock) {
        const state = eatingPlushes.get(entityId);
        if (state) {
          state.eating = false;
          state.timer = 0;
          state.targetBlock = null;
          if (state.isEatingProp) {
            entity.setProperty("miku:is_eating", false);
            state.isEatingProp = false;
          }
        }
        continue;
      }

      let state = eatingPlushes.get(entityId);
      if (!state) {
        state = { eating: false, timer: 0, targetBlock: null, isEatingProp: false, maxHealth };
        eatingPlushes.set(entityId, state);
      }
      state.maxHealth = maxHealth;

      if (!state.eating) {
        state.eating = true;
        state.timer = EAT_TIMER_TOTAL;
        state.targetBlock = leekBlock;

        if (!state.isEatingProp) {
          entity.setProperty("miku:is_eating", true);
          state.isEatingProp = true;
        }

        entity.lookAt({
          x: leekBlock.x + 0.5,
          y: leekBlock.y + 0.5,
          z: leekBlock.z + 0.5,
        });

        if (entity.typeId === "miku:miku_plush") {
          entity.dimension.playSound("miku.plushie.miku_eat", entity.location, {
            volume: 1,
            pitch: 1,
          });
        }
      }

      if (state.eating && state.timer > 0) {
        state.timer--;

        if (state.timer % 4 === 1 && state.timer > 4) {
          entity.dimension.playSound("entity.generic.eat", entity.location, {
            volume: 0.5,
            pitch: 1,
          });
          if (entity.typeId === "miku:miku_plush") {
            entity.dimension.playSound("miku.plushie.miku_eat", entity.location, {
              volume: 1,
              pitch: 1,
            });
          }
        }

        if (state.timer % 5 === 0 && state.timer > 10) {
          entity.dimension.spawnParticle("minecraft:crop_growth_emitter", {
            x: entity.location.x + (Math.random() - 0.5) * 0.5,
            y: entity.location.y + 0.3,
            z: entity.location.z + (Math.random() - 0.5) * 0.5,
          });
        }

        if (state.timer === LEEK_BREAK_DELAY) {
          const cachedBlock = state.targetBlock;
          if (cachedBlock && cachedBlock.isValid) {
            if (cachedBlock.typeId === LEEK_CROP_BLOCK) {
              const age = (cachedBlock.permutation.getState("miku:growth" as any) as number) ?? 0;
              if (age >= MAX_LEEK_AGE) {
                cachedBlock.setPermutation(cachedBlock.permutation.withState("miku:growth" as any, 0));

                const currentHealth = entity.getComponent("minecraft:health");
                if (currentHealth) {
                  const newHealth = Math.min(currentHealth.currentValue + HEAL_AMOUNT, state.maxHealth);
                  currentHealth.setCurrentValue(newHealth);
                }
              }
            }
          }
        }

        if (state.timer <= 0) {
          state.eating = false;
          state.timer = 0;
          state.targetBlock = null;
          if (state.isEatingProp) {
            entity.setProperty("miku:is_eating", false);
            state.isEatingProp = false;
          }
        }
      }
    }
  }, EAT_TICK_INTERVAL);
}
