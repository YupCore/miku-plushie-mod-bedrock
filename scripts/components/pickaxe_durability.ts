import {
  EquipmentSlot,
  GameMode,
  ItemComponentTypes,
  ItemComponentRegistry,
  ItemCustomComponent,
  ItemStack,
  Player,
} from "@minecraft/server";

const PICKAXE_DURABILITY_COMPONENT_ID = "miku:pickaxe_durability";

function shouldConsumeDurability(eventItem: ItemStack): boolean {
  const enchantable = eventItem.getComponent(ItemComponentTypes.Enchantable);
  const unbreakingLevel = enchantable?.getEnchantment("unbreaking")?.level ?? 0;

  if (unbreakingLevel <= 0) {
    return true;
  }

  return Math.random() < 1 / (unbreakingLevel + 1);
}

const PickaxeDurabilityComponent: ItemCustomComponent = {
  onMineBlock(event) {
    const { itemStack, source, block } = event;
    if (!itemStack || source.typeId !== "minecraft:player") return;

    const player = source as Player;
    if (player.getGameMode() === GameMode.Creative) return;
    if (!shouldConsumeDurability(itemStack)) return;

    const durability = itemStack.getComponent(ItemComponentTypes.Durability);
    if (!durability) return;

    const equippable = player.getComponent("minecraft:equippable");
    const mainhand = equippable?.getEquipmentSlot(EquipmentSlot.Mainhand);
    if (!mainhand?.hasItem()) return;
    if (mainhand.typeId !== itemStack.typeId) return;

    if (durability.damage + 1 >= durability.maxDurability) {
      mainhand.setItem(undefined);
      player.dimension.playSound("random.break", player.location, {
        volume: 1,
        pitch: 0.9,
      });
      player.dimension.playSound("miku.plushie.teto_bye", block.location, {
        volume: 0.8,
        pitch: 1,
      });
      return;
    }

    durability.damage += 1;
    mainhand.setItem(itemStack);
  },
};

export function registerPickaxeDurabilityComponent(itemComponentRegistry: ItemComponentRegistry): void {
  itemComponentRegistry.registerCustomComponent(PICKAXE_DURABILITY_COMPONENT_ID, PickaxeDurabilityComponent);
}
