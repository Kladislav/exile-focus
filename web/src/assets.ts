// Иконки берём из upstream, чтобы не дублировать файлы.
const FRAGMENT = "../../upstream/web/src/components/FragmentStep/Fragment/images";
const COST = "../../upstream/web/src/components/GemCost/images";

const fragmentImages = import.meta.glob<string>(
  "../../upstream/web/src/components/FragmentStep/Fragment/images/*.png",
  { eager: true, import: "default" },
);
const costImages = import.meta.glob<string>(
  "../../upstream/web/src/components/GemCost/images/*.png",
  { eager: true, import: "default" },
);

export const icon = (name: string) => fragmentImages[`${FRAGMENT}/${name}.png`];

export function gemCostIcon(requiredLevel: number) {
  const name =
    requiredLevel < 8
      ? "wisdom"
      : requiredLevel < 16
        ? "transmutation"
        : requiredLevel < 28
          ? "alteration"
          : requiredLevel < 38
            ? "chance"
            : "alchemy";
  return { src: costImages[`${COST}/${name}.png`], name };
}

/** Мягкие цвета атрибутов вместо кислотных #33ff33 из данных игры. */
export function gemColor(attribute: string) {
  switch (attribute) {
    case "strength":
      return "var(--gem-str)";
    case "dexterity":
      return "var(--gem-dex)";
    case "intelligence":
      return "var(--gem-int)";
    default:
      return "var(--faint)";
  }
}
