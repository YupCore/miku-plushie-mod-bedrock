import { world } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plushRegistry";

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
}
