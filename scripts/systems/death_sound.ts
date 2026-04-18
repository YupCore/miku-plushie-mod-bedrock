import { world } from "@minecraft/server";
import { isTrackedPlushEntityType } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

export function startDeathSoundSystem(): void {
  world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    if (!isTrackedPlushEntityType(entity.typeId)) return;

    const character = getCharacterFromEntity(entity.typeId);
    playPlushSound(entity, character, "bye");
  });
}
