import { Entity, world, system } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";

const MAX_SPAWN_AGE = 10;
const SPAWN_AGE_TICK_INTERVAL = 1;

export function startSpawnAgeTracker(): void {
  console.log("[Miku Plushie] Starting spawn age tracker");

  const tracked = new Map<string, { entity: Entity; age: number }>();

  system.runInterval(() => {
    for (const [id, data] of tracked) {
      if (!data.entity.isValid) {
        tracked.delete(id);
        continue;
      }
      if (data.age >= MAX_SPAWN_AGE) {
        tracked.delete(id);
        continue;
      }
      data.age++;
      data.entity.setProperty("miku:spawn_age", data.age);
    }
  }, SPAWN_AGE_TICK_INTERVAL);

  world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (!PLUSH_ENTITIES.includes(entity.typeId as any)) return;
    tracked.set(entity.id, { entity, age: 0 });
  });
}
