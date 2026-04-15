import { Player, system, world } from "@minecraft/server";
import { playPlushSoundAtPosition } from "../utils/sounds";

const NERU_PHONE_ITEM_ID = "miku:akita_neru_phone";
const NERU_PHONE_COOLDOWN_TICKS = 60; // 3 seconds at 20 TPS

const lastPlayTickByPlayer = new Map<string, number>();

function tryPlayNeruPhoneSound(player: Player, itemTypeId?: string): void {
  if (itemTypeId !== NERU_PHONE_ITEM_ID) return;

  const now = system.currentTick;
  const lastPlayedAt = lastPlayTickByPlayer.get(player.id) ?? -NERU_PHONE_COOLDOWN_TICKS;

  if (now - lastPlayedAt < NERU_PHONE_COOLDOWN_TICKS) return;

  lastPlayTickByPlayer.set(player.id, now);
  playPlushSoundAtPosition(player.dimension, player.location, "neru", "phone", 1, 1);
}

export function startNeruPhoneSoundSystem(): void {
  console.log("[Miku Plushie] Starting Neru phone sound system");

  // Covers place/use-on interactions (RMB on blocks).
  world.afterEvents.itemStartUseOn.subscribe((event) => {
    tryPlayNeruPhoneSound(event.source, event.itemStack?.typeId);
  });

  // Covers item-use interactions that don't target a block.
  world.afterEvents.itemUse.subscribe((event) => {
    tryPlayNeruPhoneSound(event.source, event.itemStack?.typeId);
  });
}
