import { world, system, Block } from "@minecraft/server";

const MIKU_ENTITY_TYPE = "miku:miku_plush";
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

interface MikuEatState {
  eating: boolean;
  isEatingProp: boolean; // tracks last written value of miku:is_eating property
  timer: number;
  targetBlock: Block | null;
  maxHealth: number;
}

const eatingMikus: Map<string, MikuEatState> = new Map();

function findNearbyLeekBlock(
  dimension: any,
  pos: { x: number; y: number; z: number }
): Block | null {
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
  console.log("[Miku Plushie] Starting Miku eat leek system");

  system.runInterval(() => {
    const overworld = world.getDimension("overworld");
    const mikus = overworld.getEntities({ type: MIKU_ENTITY_TYPE });

    // Clean up state for entities that are no longer alive
    const liveIds = new Set(mikus.map((e) => e.id));
    for (const id of eatingMikus.keys()) {
      if (!liveIds.has(id)) eatingMikus.delete(id);
    }

    for (const miku of mikus) {
      const entityId = miku.id;
      const health = miku.getComponent("minecraft:health");
      if (!health) continue;

      const maxHealth = health.effectiveMax;

      if (health.currentValue >= maxHealth) {
        const state = eatingMikus.get(entityId);
        if (state) {
          state.eating = false;
          state.timer = 0;
          state.targetBlock = null;
          if (state.isEatingProp) {
            miku.setProperty("miku:is_eating", false);
            state.isEatingProp = false;
          }
        }
        continue;
      }

      if (miku.getTags().includes("miku_sitting")) continue;

      const pos = miku.location;
      const leekBlock = findNearbyLeekBlock(overworld, pos);

      if (!leekBlock) {
        const state = eatingMikus.get(entityId);
        if (state) {
          state.eating = false;
          state.timer = 0;
          state.targetBlock = null;
          if (state.isEatingProp) {
            miku.setProperty("miku:is_eating", false);
            state.isEatingProp = false;
          }
        }
        continue;
      }

      let state = eatingMikus.get(entityId);
      if (!state) {
        state = { eating: false, timer: 0, targetBlock: null, isEatingProp: false, maxHealth };
        eatingMikus.set(entityId, state);
      }
      // Update cached maxHealth if needed (in case of attribute change)
      state.maxHealth = maxHealth;

      if (!state.eating) {
        state.eating = true;
        state.timer = EAT_TIMER_TOTAL;
        state.targetBlock = leekBlock;

        if (!state.isEatingProp) {
          miku.setProperty("miku:is_eating", true);
          state.isEatingProp = true;
        }

        miku.lookAt({
          x: leekBlock.x + 0.5,
          y: leekBlock.y + 0.5,
          z: leekBlock.z + 0.5,
        });

        miku.dimension.playSound("miku.plushie.miku_nom", miku.location, {
          volume: 1,
          pitch: 1,
        });
      }

      if (state.eating && state.timer > 0) {
        state.timer--;

        if (state.timer % 4 === 1 && state.timer > 4) {
          miku.dimension.playSound("entity.generic.eat", miku.location, {
            volume: 0.5,
            pitch: 1,
          });
          miku.dimension.playSound("miku.plushie.miku_eat", miku.location, {
            volume: 1,
            pitch: 1,
          });
        }

        if (state.timer % 5 === 0 && state.timer > 10) {
          miku.dimension.spawnParticle("minecraft:crop_growth_emitter", {
            x: miku.location.x + (Math.random() - 0.5) * 0.5,
            y: miku.location.y + 0.3,
            z: miku.location.z + (Math.random() - 0.5) * 0.5,
          });
        }

        if (state.timer === LEEK_BREAK_DELAY) {
          const cachedBlock = state.targetBlock;
          // Use cached block ref — check isValid so we don't crash on chunk unload
          if (cachedBlock && cachedBlock.isValid) {
            if (cachedBlock.typeId === LEEK_CROP_BLOCK) {
              const age = (cachedBlock.permutation.getState("miku:growth" as any) as number) ?? 0;
              if (age >= MAX_LEEK_AGE) {
                cachedBlock.setPermutation(cachedBlock.permutation.withState("miku:growth" as any, 0));

                const currentHealth = miku.getComponent("minecraft:health");
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
            miku.setProperty("miku:is_eating", false);
            state.isEatingProp = false;
          }
        }
      }
    }
  }, EAT_TICK_INTERVAL);
}
