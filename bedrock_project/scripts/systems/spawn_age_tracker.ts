import { world, system } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";

const MAX_SPAWN_AGE = 10;
const SPAWN_AGE_TICK_INTERVAL = 1;

export function startSpawnAgeTracker(): void {
  console.log("[Miku Plushie] Starting spawn age tracker");

  world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (!PLUSH_ENTITIES.includes(entity.typeId as any)) return;

    let age = 0;
    const entityId = entity.id;

    const intervalId = system.runInterval(() => {
      const currentEntity = world
        .getDimension("overworld")
        .getEntities({ type: entity.typeId })
        .find((e) => e.id === entityId);

      if (!currentEntity) {
        system.clearRun(intervalId);
        return;
      }

      if (age >= MAX_SPAWN_AGE) {
        system.clearRun(intervalId);
        return;
      }

      age++;
      currentEntity.setProperty("miku:spawn_age", age);
    }, SPAWN_AGE_TICK_INTERVAL);
  });
}
