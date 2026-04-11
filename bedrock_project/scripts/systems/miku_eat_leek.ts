import { world, system } from "@minecraft/server";

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
  timer: number;
  targetPos: { x: number; y: number; z: number } | null;
}

const eatingMikus: Map<string, MikuEatState> = new Map();

function findNearbyLeekCrop(
  dimension: any,
  pos: { x: number; y: number; z: number }
): { x: number; y: number; z: number } | null {
  const blockX = Math.floor(pos.x);
  const blockY = Math.floor(pos.y);
  const blockZ = Math.floor(pos.z);

  for (const offset of POSITION_CHECKS) {
    const checkPos = {
      x: blockX + offset.x,
      y: blockY + offset.y,
      z: blockZ + offset.z,
    };
    const block = dimension.getBlock(checkPos);
    if (block?.typeId === LEEK_CROP_BLOCK) {
      const age = (block.permutation.getState("miku:growth" as any) as number) ?? 0;
      if (age >= MAX_LEEK_AGE) {
        return checkPos;
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

      if (health.currentValue >= health.effectiveMax) {
        const state = eatingMikus.get(entityId);
        if (state) {
          state.eating = false;
          state.timer = 0;
          state.targetPos = null;
          miku.setProperty("miku:is_eating", false);
        }
        continue;
      }

      if (miku.getTags().includes("miku_sitting")) continue;

      const pos = miku.location;
      const leekPos = findNearbyLeekCrop(overworld, pos);

      if (!leekPos) {
        const state = eatingMikus.get(entityId);
        if (state) {
          state.eating = false;
          state.timer = 0;
          state.targetPos = null;
          miku.setProperty("miku:is_eating", false);
        }
        continue;
      }

      let state = eatingMikus.get(entityId);
      if (!state) {
        state = { eating: false, timer: 0, targetPos: null };
        eatingMikus.set(entityId, state);
      }

      if (!state.eating) {
        state.eating = true;
        state.timer = EAT_TIMER_TOTAL;
        state.targetPos = leekPos;
        miku.setProperty("miku:is_eating", true);

        miku.lookAt({
          x: leekPos.x + 0.5,
          y: leekPos.y + 0.5,
          z: leekPos.z + 0.5,
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
          const currentLeekPos = state.targetPos;
          if (currentLeekPos) {
            const leekBlock = overworld.getBlock(currentLeekPos);
            if (leekBlock?.typeId === LEEK_CROP_BLOCK) {
              const age = (leekBlock.permutation.getState("miku:growth" as any) as number) ?? 0;
              if (age >= MAX_LEEK_AGE) {
                leekBlock.setPermutation(leekBlock.permutation.withState("miku:growth" as any, 0));

                const currentHealth = miku.getComponent("minecraft:health");
                if (currentHealth) {
                  const newHealth = Math.min(currentHealth.currentValue + HEAL_AMOUNT, currentHealth.effectiveMax);
                  currentHealth.setCurrentValue(newHealth);
                }
              }
            }
          }
        }

        if (state.timer <= 0) {
          state.eating = false;
          state.timer = 0;
          state.targetPos = null;
          miku.setProperty("miku:is_eating", false);
        }
      }
    }
  }, EAT_TICK_INTERVAL);
}
