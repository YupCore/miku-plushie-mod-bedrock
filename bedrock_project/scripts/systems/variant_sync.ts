import { world, system } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";

const DIMENSIONS = ["overworld", "nether", "the_end"] as const;

export function startVariantSyncSystem(): void {
  console.log("[Miku Plushie] Starting variant sync system");

  world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (!PLUSH_ENTITIES.includes(entity.typeId as any)) return;

    entity.setProperty("miku:is_dancing", false);
    entity.setProperty("miku:dance_index", 0);
    entity.setProperty("miku:is_eating", false);
  });

  system.runInterval(() => {
    for (const dimId of DIMENSIONS) {
      const dim = world.getDimension(dimId);
      for (const entity of dim.getEntities({ families: ["plush"] })) {
        const health = entity.getComponent("minecraft:health");
        if (health) {
          const healthFactor = health.currentValue / health.effectiveMax;
          entity.setProperty("miku:health_bend", (healthFactor - 1) * 25);
        }
      }
    }
  }, 20);
}
