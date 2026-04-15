import { world, system, EquipmentSlot, GameMode, Entity, ItemStack } from "@minecraft/server";
import { PLUSH_ENTITIES } from "../utils/plush_registry";
import { getCharacterFromEntity, playPlushSound } from "../utils/sounds";

function isEntityOnGround(entity: Entity): boolean {
  return entity.isOnGround;
}

const GEAR_CACHE_PROPERTY = "miku:gear_cache";

const TRACKED_GEAR_SLOTS = [
  {
    slotId: "mainhand",
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
type TrackedGearState = Record<TrackedGearSlot, string>;

const PERSISTENCE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const trackedGearCache = new Map<string, TrackedGearState>();

// player.isSneaking is unreliable inside event handlers — cache it every tick
const playerSneakState = new Map<string, boolean>();

function createEmptyTrackedGearState(): TrackedGearState {
  return {
    mainhand: "",
    head: "",
    chest: "",
    legs: "",
    feet: "",
  };
}

function isTrackedGearSlot(value: string | undefined): value is TrackedGearSlot {
  return TRACKED_GEAR_SLOTS.some(({ slotId }) => slotId === value);
}

function parseGearMessage(message: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const pair of message.split(";")) {
    if (!pair) continue;

    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = pair.slice(0, separatorIndex);
    const value = pair.slice(separatorIndex + 1);
    parsed[key] = value;
  }

  return parsed;
}

function deserializeCompactTrackedGearState(serializedState: string): TrackedGearState {
  const hydratedState = createEmptyTrackedGearState();

  TRACKED_GEAR_SLOTS.forEach(({ slotId, itemIds }, index) => {
    const persistedChar = serializedState[index];
    const alphabetIndex = persistedChar ? PERSISTENCE_ALPHABET.indexOf(persistedChar) : 0;
    const itemIndex = alphabetIndex - 1;
    hydratedState[slotId] = itemIndex >= 0 ? (itemIds[itemIndex] ?? "") : "";
  });

  return hydratedState;
}

function serializeCompactTrackedGearState(state: TrackedGearState): string {
  return TRACKED_GEAR_SLOTS.map(({ slotId, itemIds }) => {
    const trackedItems = itemIds as readonly string[];
    const itemIndex = trackedItems.indexOf(state[slotId]);
    return PERSISTENCE_ALPHABET[itemIndex + 1] ?? PERSISTENCE_ALPHABET[0];
  }).join("");
}

function hydrateTrackedGearState(entity: Entity): TrackedGearState {
  try {
    const rawState = entity.getDynamicProperty(GEAR_CACHE_PROPERTY);
    if (typeof rawState !== "string" || rawState.length === 0) {
      return createEmptyTrackedGearState();
    }

    if (rawState.startsWith("{")) {
      const parsedState = JSON.parse(rawState) as Partial<Record<TrackedGearSlot, unknown>>;
      const hydratedState = createEmptyTrackedGearState();

      for (const { slotId } of TRACKED_GEAR_SLOTS) {
        if (typeof parsedState[slotId] === "string") {
          hydratedState[slotId] = parsedState[slotId];
        }
      }

      return hydratedState;
    }

    return deserializeCompactTrackedGearState(rawState);
  } catch {
    return createEmptyTrackedGearState();
  }
}

function getTrackedGearState(entity: Entity): TrackedGearState {
  const cachedState = trackedGearCache.get(entity.id);
  if (cachedState) {
    return cachedState;
  }

  const hydratedState = hydrateTrackedGearState(entity);
  trackedGearCache.set(entity.id, hydratedState);
  return hydratedState;
}

function persistTrackedGearState(entity: Entity, state: TrackedGearState): void {
  trackedGearCache.set(entity.id, state);

  try {
    entity.setDynamicProperty(GEAR_CACHE_PROPERTY, serializeCompactTrackedGearState(state));
  } catch {}
}

function updateTrackedGearState(entity: Entity, slot: TrackedGearSlot, itemTypeId: string): void {
  const nextState = { ...getTrackedGearState(entity) };
  nextState[slot] = itemTypeId;
  persistTrackedGearState(entity, nextState);
}

function dropNextTrackedGear(entity: Entity): boolean {
  const nextState = { ...getTrackedGearState(entity) };

  for (const { slotId, commandSlot } of TRACKED_GEAR_SLOTS) {
    const itemTypeId = nextState[slotId];
    if (!itemTypeId) continue;

    try {
      entity.dimension.spawnItem(new ItemStack(itemTypeId, 1), entity.location);
      entity.runCommand(`replaceitem entity @s ${commandSlot} 0 air`);
    } catch {
      return false;
    }

    nextState[slotId] = "";
    persistTrackedGearState(entity, nextState);
    return true;
  }

  return false;
}

export function startPlushInteractionSystem(): void {
  console.log("[Miku Plushie] Starting plush interaction system");

  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      playerSneakState.set(player.id, player.isSneaking);
    }
  }, 1);

  system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id !== "miku:gear") return;

    const sourceEntity = event.sourceEntity;
    if (!sourceEntity) return;
    if (!PLUSH_ENTITIES.includes(sourceEntity.typeId as (typeof PLUSH_ENTITIES)[number])) return;

    const parsedMessage = parseGearMessage(event.message);
    const slot = parsedMessage.slot;
    if (!isTrackedGearSlot(slot)) return;

    updateTrackedGearState(sourceEntity, slot, parsedMessage.item ?? "");
  });

  world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const { player, target } = event;
    if (!player || !target) return;

    if (!PLUSH_ENTITIES.includes(target.typeId as any)) return;
    if (!isEntityOnGround(target)) return;

    const tameable = target.getComponent("minecraft:tameable");
    if (!tameable?.isTamed) return;
    if (tameable.tamedToPlayerId !== player.id) return;

    const isSneaking = playerSneakState.get(player.id) ?? player.isSneaking;

    if (isSneaking) {
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
