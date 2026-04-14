import {
  system,
  EquipmentSlot,
  GameMode,
  BlockCustomComponent,
  BlockComponentPlayerInteractEvent,
  BlockComponentOnPlaceEvent,
  BlockComponentPlayerBreakEvent,
} from "@minecraft/server";
import { getCharacterFromBlock, playPlushSoundAtPosition } from "../utils/sounds";
import { getEntityTypeFromBlock, getVariantIndex, getGeoIndex } from "../utils/plush_registry";

class PlushBlockComponent implements BlockCustomComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onPlace = this.onPlace.bind(this);
    this.onBreak = this.onBreak.bind(this);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
    const { block, player } = event;
    if (!player) return;

    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (mainhand?.typeId !== "miku:vocaloid_heart") return;

    const blockId = block.typeId;
    if (!blockId.startsWith("miku:") || blockId.includes("leek")) return;

    const dimension = block.dimension;
    const location = block.location;

    const entityType = getEntityTypeFromBlock(blockId);
    const variant = getVariantIndex(blockId);

    const spawnLocation = {
      x: location.x + 0.5,
      y: location.y,
      z: location.z + 0.5,
    };

    try {
      const entity = dimension.spawnEntity(entityType, spawnLocation);

      entity.setProperty("miku:variant", variant);
      if (entityType === "miku:miku_plush") {
        entity.setProperty("miku:geo_index", getGeoIndex(blockId));
      }
      entity.setProperty("miku:is_dancing", false);
      entity.setProperty("miku:dance_index", 0);

      // Tame immediately to the spawning player — matches Java setOwner() at spawn time
      const tameable = entity.getComponent("minecraft:tameable");
      if (tameable) {
        tameable.tame(player);
      }
      entity.triggerEvent("miku:on_tame");

      dimension.playSound("random.totem", spawnLocation, {
        volume: 0.5,
        pitch: 1,
      });

      const isCreative = player.getGameMode() === GameMode.Creative;
      if (!isCreative) {
        if (mainhand!.amount > 1) {
          mainhand!.amount--;
        } else {
          mainhand!.setItem(undefined);
        }
      }

      dimension.spawnParticle("miku:miku_spawn", {
        x: location.x + 0.5,
        y: location.y,
        z: location.z + 0.5,
      });

      block.setType("minecraft:air");
    } catch (e) {
      console.error("[Miku Plushie] Error spawning entity:", e);
    }
  }

  onPlace(event: BlockComponentOnPlaceEvent): void {
    const { block } = event;
    const blockId = block.typeId;
    if (!blockId.startsWith("miku:") || blockId.includes("leek")) return;

    const character = getCharacterFromBlock(blockId);
    playPlushSoundAtPosition(block.dimension, block.location, character, "oie");
  }

  onBreak(event: BlockComponentPlayerBreakEvent): void {
    const { block } = event;
    const brokenBlockId = event.brokenBlockPermutation.type.id;
    if (!brokenBlockId.startsWith("miku:") || brokenBlockId.includes("leek")) return;

    const character = getCharacterFromBlock(brokenBlockId);

    playPlushSoundAtPosition(block.dimension, block.location, character, "bye");
  }
}

export function registerPlushBlockComponent(): void {
  // V2 custom component registration via system.beforeEvents.startup
  system.beforeEvents.startup.subscribe((initEvent) => {
    initEvent.blockComponentRegistry.registerCustomComponent("miku:plush_block", new PlushBlockComponent());
  });
}
