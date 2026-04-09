import { world, system } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";

export function startVariantSyncSystem(): void {
  console.log("[Miku Plushie] Starting variant sync system");

  world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (!PLUSH_ENTITIES.includes(entity.typeId as any)) return;

    entity.setProperty("miku:variant", 0);
    entity.setProperty("miku:is_dancing", false);
    entity.setProperty("miku:dance_index", 0);
    entity.setProperty("miku:is_eating", false);
  });

  system.runInterval(() => {
    for (const entity of world.getAllPlayers()) {
      for (const plush of PLUSH_ENTITIES) {
        for (const miku of entity.dimension.getEntities({ type: plush })) {
          const health = miku.getComponent("minecraft:health");
          if (health) {
            const healthFactor = health.currentValue / health.effectiveMax;
            const healthBend = (healthFactor - 1) * 25;
            miku.setProperty("miku:health_bend", healthBend);
          }
        }
      }
    }
  }, 10);
}
