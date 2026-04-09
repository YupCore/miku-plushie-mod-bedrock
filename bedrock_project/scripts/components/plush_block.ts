import {
  world,
  EquipmentSlot,
  GameMode,
  BlockCustomComponent,
  BlockComponentPlayerInteractEvent,
  BlockComponentOnPlaceEvent,
  BlockComponentPlayerBreakEvent,
} from "@minecraft/server";
import { getCharacterFromBlock } from "../utils/sounds";
import { getEntityTypeFromBlock, getVariantIndex } from "../utils/plush_registry";

class PlushBlockComponent implements BlockCustomComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onPlace = this.onPlace.bind(this);
    this.onPlayerBreak = this.onPlayerBreak.bind(this);
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
      entity.setProperty("miku:is_dancing", false);
      entity.setProperty("miku:dance_index", 0);

      const character = getCharacterFromBlock(blockId);
      const isKonoha = character === "konoha";

      if (!isKonoha) {
        dimension.playSound("random.totem", spawnLocation, {
          volume: 0.5,
          pitch: 1,
        });
      }

      const isCreative = player.getGameMode() === GameMode.Creative;
      if (!isCreative) {
        if (mainhand.amount > 1) {
          mainhand.amount--;
        } else {
          mainhand.setItem(undefined);
        }
      }

      dimension.spawnParticle("miku:miku_spawn", {
        x: location.x + 0.5,
        y: location.y + 0.5,
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
    const oieSound = `miku.plushie.${character}_oie`;
    if (character !== "konoha") {
      block.dimension.playSound(oieSound, block.location, {
        volume: 1,
        pitch: 1,
      });
    }
  }

  onPlayerBreak(event: BlockComponentPlayerBreakEvent): void {
    const { block } = event;
    const blockId = block.typeId;
    if (!blockId.startsWith("miku:") || blockId.includes("leek")) return;

    const character = getCharacterFromBlock(blockId);
    const byeSound = `miku.plushie.${character}_bye`;
    if (character !== "konoha") {
      block.dimension.playSound(byeSound, block.location, {
        volume: 1,
        pitch: 1,
      });
    }
  }
}

export function registerPlushBlockComponent(): void {
  try {
    const componentManager = (world as any).customComponentManager;
    if (componentManager) {
      componentManager.registerComponent("miku:plush_block", new PlushBlockComponent());
    }
  } catch (e) {
    console.warn("[Miku Plushie] Custom components not available, using legacy handlers");
  }
}
