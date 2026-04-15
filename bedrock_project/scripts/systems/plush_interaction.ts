import {
  world,
  system,
  EquipmentSlot,
  GameMode,
  Entity,
  EntityInventoryComponent,
  ItemStack,
  type Container,
} from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

const TRACKED_GEAR_SLOTS = [
  {
    slotId: "mainhand",
    inventorySlot: 0,
    commandSlot: "slot.weapon.mainhand",
    itemIds: [
      "minecraft:netherite_sword",
      "minecraft:diamond_sword",
      "minecraft:iron_sword",
      "minecraft:golden_sword",
      "minecraft:copper_sword",
      "minecraft:stone_sword",
      "minecraft:wooden_sword",
      "minecraft:netherite_spear",
      "minecraft:diamond_spear",
      "minecraft:iron_spear",
      "minecraft:golden_spear",
      "minecraft:copper_spear",
      "minecraft:stone_spear",
      "minecraft:wooden_spear",
    ],
  },
  {
    slotId: "head",
    inventorySlot: 1,
    commandSlot: "slot.armor.head",
    itemIds: [
      "minecraft:netherite_helmet",
      "minecraft:diamond_helmet",
      "minecraft:iron_helmet",
      "minecraft:chainmail_helmet",
      "minecraft:golden_helmet",
      "minecraft:leather_helmet",
    ],
  },
  {
    slotId: "chest",
    inventorySlot: 2,
    commandSlot: "slot.armor.chest",
    itemIds: [
      "minecraft:netherite_chestplate",
      "minecraft:diamond_chestplate",
      "minecraft:iron_chestplate",
      "minecraft:chainmail_chestplate",
      "minecraft:golden_chestplate",
      "minecraft:leather_chestplate",
    ],
  },
  {
    slotId: "legs",
    inventorySlot: 3,
    commandSlot: "slot.armor.legs",
    itemIds: [
      "minecraft:netherite_leggings",
      "minecraft:diamond_leggings",
      "minecraft:iron_leggings",
      "minecraft:chainmail_leggings",
      "minecraft:golden_leggings",
      "minecraft:leather_leggings",
    ],
  },
  {
    slotId: "feet",
    inventorySlot: 4,
    commandSlot: "slot.armor.feet",
    itemIds: [
      "minecraft:netherite_boots",
      "minecraft:diamond_boots",
      "minecraft:iron_boots",
      "minecraft:chainmail_boots",
      "minecraft:golden_boots",
      "minecraft:leather_boots",
    ],
  },
] as const;

type TrackedGearSlot = (typeof TRACKED_GEAR_SLOTS)[number]["slotId"];
type TrackedGearSlotInfo = (typeof TRACKED_GEAR_SLOTS)[number];

type GearCandidate = {
  typeId: string;
  priority: number;
  sourceSlot: number;
};

// Per-entity cache: what's in reserved slots + what's last mirrored to equipment slots.
// Avoids redundant container writes and runCommand calls on stable ticks.
type PlushGearCache = {
  reserved: string[]; // typeIds at inventorySlots 0–4
  mirror: string[]; // typeIds last mirrored to equipment slots
};

const plushGearCache = new Map<string, PlushGearCache>();

function getEntityContainer(entity: Entity): Container | null {
  try {
    const inv = entity.getComponent("minecraft:inventory") as EntityInventoryComponent | undefined;
    const container = inv?.container;
    return container?.isValid ? container : null;
  } catch {
    return null;
  }
}

function getItemPriority(slotInfo: TrackedGearSlotInfo, itemTypeId: string): number {
  return (slotInfo.itemIds as readonly string[]).indexOf(itemTypeId);
}

function getGearSlotInfoForItem(itemTypeId: string): TrackedGearSlotInfo | undefined {
  return TRACKED_GEAR_SLOTS.find((slotInfo) => getItemPriority(slotInfo, itemTypeId) >= 0);
}

function trySpawnItem(entity: Entity, item: ItemStack): void {
  try {
    entity.dimension.spawnItem(item, entity.location);
  } catch {}
}

function trySetContainerItem(container: Container, slot: number, item?: ItemStack): boolean {
  try {
    container.setItem(slot, item);
    return true;
  } catch {
    return false;
  }
}

function tryGetContainerItem(container: Container, slot: number): ItemStack | undefined {
  try {
    return container.getItem(slot);
  } catch {
    return undefined;
  }
}

function entityHasMirroredGear(entity: Entity, slotInfo: TrackedGearSlotInfo, itemTypeId: string): boolean {
  try {
    const result = entity.runCommand(`testfor @s[hasitem={item=${itemTypeId},location=${slotInfo.commandSlot}}]`);
    return result.successCount > 0;
  } catch {
    return false;
  }
}

function applyEquipmentMirror(entity: Entity, slotInfo: TrackedGearSlotInfo, itemTypeId: string): void {
  try {
    if (itemTypeId) {
      if (entityHasMirroredGear(entity, slotInfo, itemTypeId)) return;
      entity.runCommand(`replaceitem entity @s ${slotInfo.commandSlot} 0 ${itemTypeId}`);
      return;
    }
    entity.runCommand(`replaceitem entity @s ${slotInfo.commandSlot} 0 air`);
  } catch {}
}

function collectGearCandidates(container: Container): Map<TrackedGearSlot, GearCandidate[]> {
  const candidatesBySlot = new Map<TrackedGearSlot, GearCandidate[]>();
  for (const slotInfo of TRACKED_GEAR_SLOTS) {
    candidatesBySlot.set(slotInfo.slotId, []);
  }
  for (let sourceSlot = 0; sourceSlot < container.size; sourceSlot++) {
    const item = tryGetContainerItem(container, sourceSlot);
    if (!item) continue;
    const slotInfo = getGearSlotInfoForItem(item.typeId);
    if (!slotInfo) continue;
    candidatesBySlot.get(slotInfo.slotId)!.push({
      typeId: item.typeId,
      priority: getItemPriority(slotInfo, item.typeId),
      sourceSlot,
    });
  }
  return candidatesBySlot;
}

function getBestCandidate(slotInfo: TrackedGearSlotInfo, candidates: GearCandidate[]): GearCandidate | undefined {
  let best: GearCandidate | undefined;
  for (const candidate of candidates) {
    if (!best) {
      best = candidate;
      continue;
    }
    if (candidate.priority < best.priority) {
      best = candidate;
      continue;
    }
    // Among equal-priority items, prefer whichever is already in the reserved slot
    if (candidate.priority === best.priority && candidate.sourceSlot === slotInfo.inventorySlot) {
      best = candidate;
    }
  }
  return best;
}

function normalizePlushGear(entity: Entity): void {
  const container = getEntityContainer(entity);
  if (!container) return;

  // Fast path: skip if reserved slots (0–4) are unchanged and no gear landed elsewhere
  const prevCache = plushGearCache.get(entity.id);
  if (prevCache) {
    let unchanged = true;
    for (let i = 0; i < TRACKED_GEAR_SLOTS.length && unchanged; i++) {
      const typeId = tryGetContainerItem(container, TRACKED_GEAR_SLOTS[i].inventorySlot)?.typeId ?? "";
      if (typeId !== prevCache.reserved[i]) unchanged = false;
    }
    for (let i = TRACKED_GEAR_SLOTS.length; i < container.size && unchanged; i++) {
      if (tryGetContainerItem(container, i)) unchanged = false;
    }
    if (unchanged) return;
  }

  // --- Full normalize ---

  const candidatesBySlot = collectGearCandidates(container);
  const slotsToClear = new Set<number>();
  const drops: ItemStack[] = [];
  const bestBySlot = new Map<TrackedGearSlot, GearCandidate>();

  for (const slotInfo of TRACKED_GEAR_SLOTS) {
    const candidates = candidatesBySlot.get(slotInfo.slotId) ?? [];
    const best = getBestCandidate(slotInfo, candidates);

    for (const candidate of candidates) {
      if (candidate !== best) {
        slotsToClear.add(candidate.sourceSlot);
        drops.push(new ItemStack(candidate.typeId, 1));
      } else if (candidate.sourceSlot !== slotInfo.inventorySlot) {
        // Best needs to move to reserved slot — mark source for clearing
        slotsToClear.add(candidate.sourceSlot);
      }
      // Best already at reserved slot — no clear needed
    }

    if (best) bestBySlot.set(slotInfo.slotId, best);
  }

  // Read ItemStacks for items that need to move BEFORE their source slots are cleared
  const itemsToMove = new Map<TrackedGearSlot, ItemStack>();
  for (const slotInfo of TRACKED_GEAR_SLOTS) {
    const best = bestBySlot.get(slotInfo.slotId);
    if (!best || best.sourceSlot === slotInfo.inventorySlot) continue;
    const item = tryGetContainerItem(container, best.sourceSlot);
    if (item) itemsToMove.set(slotInfo.slotId, item);
  }

  for (const slot of slotsToClear) {
    trySetContainerItem(container, slot, undefined);
  }

  const newReserved: string[] = [];
  const newMirror: string[] = [];

  for (let i = 0; i < TRACKED_GEAR_SLOTS.length; i++) {
    const slotInfo = TRACKED_GEAR_SLOTS[i];
    const typeId = bestBySlot.get(slotInfo.slotId)?.typeId ?? "";
    newReserved.push(typeId);
    newMirror.push(typeId);

    const itemToMove = itemsToMove.get(slotInfo.slotId);
    if (itemToMove) {
      trySetContainerItem(container, slotInfo.inventorySlot, itemToMove);
    }

    // Only mirror if the equipment slot state needs to change
    if (typeId !== (prevCache?.mirror[i] ?? "")) {
      applyEquipmentMirror(entity, slotInfo, typeId);
    }
  }

  plushGearCache.set(entity.id, { reserved: newReserved, mirror: newMirror });

  for (const item of drops) {
    trySpawnItem(entity, item);
  }
}

function dropNextTrackedGear(entity: Entity): boolean {
  const container = getEntityContainer(entity);
  if (!container) return false;

  for (const slotInfo of TRACKED_GEAR_SLOTS) {
    const item = tryGetContainerItem(container, slotInfo.inventorySlot);
    if (!item || getItemPriority(slotInfo, item.typeId) < 0) continue;

    trySpawnItem(entity, item);
    trySetContainerItem(container, slotInfo.inventorySlot, undefined);
    applyEquipmentMirror(entity, slotInfo, "");
    plushGearCache.delete(entity.id);
    return true;
  }

  return false;
}

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system");

  system.runInterval(() => {
    for (const dimensionId of ["overworld", "nether", "the_end"] as const) {
      for (const entity of world.getDimension(dimensionId).getEntities({ families: ["plush"] })) {
        normalizePlushGear(entity);
      }
    }
  }, 20);

  world.afterEvents.entityDie.subscribe((event) => {
    if (PLUSH_ENTITIES.includes(event.deadEntity.typeId as (typeof PLUSH_ENTITIES)[number])) {
      plushGearCache.delete(event.deadEntity.id);
    }
  });

  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;

    if (!PLUSH_ENTITIES.includes(target.typeId as any)) return;
    if (!target.isOnGround) return;

    const tameable = target.getComponent("minecraft:tameable");
    if (!tameable?.isTamed) return;
    if (tameable.tamedToPlayerId !== player.id) return;

    if (player.isSneaking) {
      dropNextTrackedGear(target);
      return;
    }

    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    const playerItem = mainhand?.getItem();

    if (playerItem?.typeId === "miku:canudinho") {
      const character = getCharacterFromEntity(target.typeId);
      playPlushSound(target, character, "canudinho", 1, 1);

      const isCreative = player.getGameMode() === GameMode.Creative;
      if (!isCreative) {
        if (mainhand!.amount > 1) {
          mainhand!.amount--;
        } else {
          mainhand!.setItem(undefined);
        }
      }
      return;
    }

    if (playerItem?.typeId === "miku:leek") {
      const character = getCharacterFromEntity(target.typeId);
      target.dimension.playSound("entity.generic.eat", target.location, {
        volume: 1,
        pitch: 1,
      });
      playPlushSound(target, character, "eat", 1, 1);
      return;
    }
  });
}
