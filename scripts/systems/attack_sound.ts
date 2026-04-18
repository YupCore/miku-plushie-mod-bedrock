import { world } from "@minecraft/server";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";
import { isTrackedPlushEntityType } from "../utils/plush_registry";

export function startAttackSoundSystem(): void {
  world.afterEvents.entityHitEntity.subscribe((event) => {
    const { hitEntity } = event;

    if (!isTrackedPlushEntityType(hitEntity.typeId)) return;

    const character = getCharacterFromEntity(hitEntity.typeId);
    playPlushSound(hitEntity, character, "dor");
  });
}
