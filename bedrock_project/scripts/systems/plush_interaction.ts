import {
  world,
  system,
  EquipmentSlot,
  GameMode,
  Entity,
  EntityInventoryComponent,
  EntityComponentTypes,
  EntityItemComponent,
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

type TrackedGearSlotInfo = (typeof TRACKED_GEAR_SLOTS)[number];

const TRACKED_ITEM_IDS = [...new Set(TRACKED_GEAR_SLOTS.flatMap((slotInfo) => slotInfo.itemIds))];
const PLUSH_ENTITY_TYPE_SET = new Set<string>(PLUSH_ENTITIES);

function isTrackedPlushEntity(entity: Entity): boolean {
  return PLUSH_ENTITY_TYPE_SET.has(entity.typeId);
}

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

function applyEquipmentMirror(entity: Entity, slotInfo: TrackedGearSlotInfo, itemTypeId: string): void {
  try {
    if (itemTypeId) {
      entity.runCommand(`replaceitem entity @s ${slotInfo.commandSlot} 0 ${itemTypeId}`);
      return;
    }
    entity.runCommand(`replaceitem entity @s ${slotInfo.commandSlot} 0 air`);
  } catch {}
}

function syncPersistedGearToEquipment(entity: Entity): void {
  const container = getEntityContainer(entity);
  if (!container) return;

  for (const slotInfo of TRACKED_GEAR_SLOTS) {
    const persistedItem = tryGetContainerItem(container, slotInfo.inventorySlot);
    if (!persistedItem) {
      applyEquipmentMirror(entity, slotInfo, "");
      continue;
    }

    if (getItemPriority(slotInfo, persistedItem.typeId) < 0) {
      trySetContainerItem(container, slotInfo.inventorySlot, undefined);
      applyEquipmentMirror(entity, slotInfo, "");
      continue;
    }

    applyEquipmentMirror(entity, slotInfo, persistedItem.typeId);
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
    return true;
  }

  return false;
}

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system");

  world.beforeEvents.entityItemPickup.subscribe(
    (event) => {
      const entity = event.entity;

      if (!isTrackedPlushEntity(entity)) return;

      const container = getEntityContainer(entity);
      if (!container) return;

      const pickedItemComp = event.item.getComponent(EntityComponentTypes.Item);

      if (!pickedItemComp) return;

      const pickedItem = pickedItemComp.itemStack;

      const slotInfo = getGearSlotInfoForItem(pickedItem.typeId);
      if (!slotInfo) return;

      const currentPersistedItem = tryGetContainerItem(container, slotInfo.inventorySlot);
      const currentPriority = currentPersistedItem ? getItemPriority(slotInfo, currentPersistedItem.typeId) : -1;
      const pickedPriority = getItemPriority(slotInfo, pickedItem.typeId);

      if (currentPriority >= 0 && currentPriority <= pickedPriority) {
        return;
      }

      console.log(`[Miku Plushie] Entity ${entity.id} picked up item: ${pickedItem.type}`);

      const persistedCopy = pickedItem.clone();
      persistedCopy.amount = 1;
      if (!trySetContainerItem(container, slotInfo.inventorySlot, persistedCopy)) {
        return;
      }

      applyEquipmentMirror(entity, slotInfo, pickedItem.typeId);
    },
    {
      entityFilter: { families: ["plush"] },
      itemFilter: { includeTypes: TRACKED_ITEM_IDS },
    }
  );

  world.afterEvents.entityItemDrop.subscribe(
    (event) => {
      const entity = event.entity;
      if (!isTrackedPlushEntity(entity)) return;

      const container = getEntityContainer(entity);
      if (!container) return;

      for (const droppedItemEntity of event.items) {
        const itemComponent = droppedItemEntity.getComponent("minecraft:item") as EntityItemComponent | undefined;
        const droppedItem = itemComponent?.itemStack;
        if (!droppedItem) continue;

        const slotInfo = getGearSlotInfoForItem(droppedItem.typeId);
        if (!slotInfo) continue;

        const persistedItem = tryGetContainerItem(container, slotInfo.inventorySlot);
        if (!persistedItem || persistedItem.typeId !== droppedItem.typeId) {
          continue;
        }

        trySetContainerItem(container, slotInfo.inventorySlot, undefined);
        applyEquipmentMirror(entity, slotInfo, "");
      }
    },
    {
      entityFilter: { families: ["plush"] },
      itemFilter: { includeTypes: TRACKED_ITEM_IDS },
    }
  );

  world.afterEvents.entityLoad.subscribe((event) => {
    const { entity } = event;
    if (!isTrackedPlushEntity(entity)) return;
    syncPersistedGearToEquipment(entity);
  });

  world.afterEvents.entitySpawn.subscribe((event) => {
    const { entity } = event;
    if (!isTrackedPlushEntity(entity)) return;
    syncPersistedGearToEquipment(entity);
  });

  system.run(() => {
    for (const dimensionId of ["overworld", "nether", "the_end"] as const) {
      for (const entity of world.getDimension(dimensionId).getEntities({ families: ["plush"] })) {
        if (!isTrackedPlushEntity(entity)) continue;
        syncPersistedGearToEquipment(entity);
      }
    }
  });

  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;

    if (!isTrackedPlushEntity(target)) return;
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
