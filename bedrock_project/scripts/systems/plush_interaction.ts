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
  Player,
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

function giveOrDrop(entity: Entity, inventory: EntityInventoryComponent, item: ItemStack) {
  if (!inventory?.container) {
    // no inventory component for some reason -> just drop it
    entity.dimension.spawnItem(item, {
      x: entity.location.x,
      y: entity.location.y + 0.5,
      z: entity.location.z,
    });
    return;
  }

  const leftover = inventory.container.addItem(item);

  if (leftover) {
    entity.dimension.spawnItem(leftover, {
      x: entity.location.x,
      y: entity.location.y + 0.5,
      z: entity.location.z,
    });
  }
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

function normalizeEntityList(value: unknown): Entity[] {
  if (!value || typeof value !== "object") return [];

  const arrayLike = value as { length?: unknown; [index: number]: unknown };
  if (typeof arrayLike.length !== "number") return [];

  const normalized: Entity[] = [];
  for (let i = 0; i < arrayLike.length; i++) {
    const entry = arrayLike[i];
    if (entry && typeof entry === "object") {
      normalized.push(entry as Entity);
    }
  }

  return normalized;
}

function dropEquipment(entity: Entity, slotInfo: TrackedGearSlotInfo): void {
  try {
    entity.runCommand(`replaceitem entity @s ${slotInfo.commandSlot} 0 air`);
  } catch {}
}

export function getArmorEquipSound(typeId: string): string {
  if (!typeId.startsWith("minecraft:")) return "armor.equip_generic";

  if (
    typeId.endsWith("_helmet") ||
    typeId.endsWith("_chestplate") ||
    typeId.endsWith("_leggings") ||
    typeId.endsWith("_boots")
  ) {
    if (typeId.startsWith("minecraft:leather_")) return "armor.equip_leather";
    if (typeId.startsWith("minecraft:chainmail_")) return "armor.equip_chain";
    if (typeId.startsWith("minecraft:iron_")) return "armor.equip_iron";
    if (typeId.startsWith("minecraft:golden_")) return "armor.equip_gold";
    if (typeId.startsWith("minecraft:diamond_")) return "armor.equip_diamond";
    if (typeId.startsWith("minecraft:netherite_")) return "armor.equip_netherite";
    if (typeId.startsWith("minecraft:copper_")) return "armor.equip_copper";
  }

  return "armor.equip_generic";
}

function dropNextTrackedGear(entity: Entity, player: Player): boolean {
  const container = getEntityContainer(entity);
  if (!container) return false;

  const inventory = player.getComponent(EntityComponentTypes.Inventory) as EntityInventoryComponent | undefined;

  if (!inventory) return false;

  for (const slotInfo of TRACKED_GEAR_SLOTS) {
    const item = tryGetContainerItem(container, slotInfo.inventorySlot);
    if (!item || getItemPriority(slotInfo, item.typeId) < 0) continue;

    // Drop the item to the world (this is the only place we manually spawn)
    giveOrDrop(entity, inventory, item);

    // Remove from our shadow inventory (source of truth)
    trySetContainerItem(container, slotInfo.inventorySlot, undefined);

    // Visually unequip via the workaround
    dropEquipment(entity, slotInfo);

    player.dimension.playSound(getArmorEquipSound(item.typeId), player.location, { volume: 1, pitch: 1 });

    return true;
  }

  return false;
}

function persistPickedTrackedGear(entity: Entity, pickedItem: ItemStack): void {
  const slotInfo = getGearSlotInfoForItem(pickedItem.typeId);
  if (!slotInfo) return;

  const container = getEntityContainer(entity);
  if (!container) return;

  const currentPersistedItem = tryGetContainerItem(container, slotInfo.inventorySlot);
  const currentPriority = currentPersistedItem ? getItemPriority(slotInfo, currentPersistedItem.typeId) : -1;
  const pickedPriority = getItemPriority(slotInfo, pickedItem.typeId);

  // Only keep the best item for this slot (lower index = better)
  if (currentPriority >= 0 && currentPriority <= pickedPriority) {
    return;
  }

  trySetContainerItem(container, slotInfo.inventorySlot, pickedItem);
}

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system (fixed simplified version)");

  world.beforeEvents.entityItemPickup.subscribe(
    (event) => {
      const entity = event.entity;
      if (!isTrackedPlushEntity(entity)) return;

      const pickedItemComp = event.item.getComponent("minecraft:item") as EntityItemComponent | undefined;
      const pickedTypeId = pickedItemComp?.itemStack.typeId;
      if (!pickedTypeId || !getGearSlotInfoForItem(pickedTypeId)) return;

      const clonedItem = pickedItemComp!.itemStack.clone();

      // Can't write in beforeEvent, so defer to persist the picked item
      system.run(() => {
        persistPickedTrackedGear(entity, clonedItem);
      });
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

      const droppedItemEntities = normalizeEntityList(event.items);

      for (let i = 0; i < droppedItemEntities.length; i++) {
        const droppedItemEntity = droppedItemEntities[i];
        const itemComponent = droppedItemEntity.getComponent("minecraft:item") as EntityItemComponent | undefined;
        const droppedItem = itemComponent?.itemStack;
        if (!droppedItem) continue;

        const slotInfo = getGearSlotInfoForItem(droppedItem.typeId);
        if (!slotInfo) continue;

        const persistedItem = tryGetContainerItem(container, slotInfo.inventorySlot);
        if (!persistedItem || persistedItem.typeId !== droppedItem.typeId) continue;

        trySetContainerItem(container, slotInfo.inventorySlot, undefined);
      }
    },
    {
      entityFilter: { families: ["plush"] },
      itemFilter: { includeTypes: TRACKED_ITEM_IDS },
    }
  );

  // Player interaction
  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;
    if (!isTrackedPlushEntity(target)) return;
    if (!target.isOnGround) return;

    const tameable = target.getComponent("minecraft:tameable");
    if (!tameable?.isTamed || tameable.tamedToPlayerId !== player.id) return;

    if (player.isSneaking) {
      dropNextTrackedGear(target, player);
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
        if (mainhand!.amount > 1) mainhand!.amount--;
        else mainhand!.setItem(undefined);
      }
      return;
    }

    if (playerItem?.typeId === "miku:leek") {
      const character = getCharacterFromEntity(target.typeId);
      target.dimension.playSound("entity.generic.eat", target.location, { volume: 1, pitch: 1 });
      playPlushSound(target, character, "eat", 1, 1);
      return;
    }
  });
}
