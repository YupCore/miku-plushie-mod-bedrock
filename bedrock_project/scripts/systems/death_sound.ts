import { world } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

export function startDeathSoundSystem(): void {
  console.log("[Miku Plushie] Starting death sound system");

  world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    if (!PLUSH_ENTITIES.includes(entity.typeId as any)) return;

    const character = getCharacterFromEntity(entity.typeId);
    playPlushSound(entity, character, "bye");
  });
}
