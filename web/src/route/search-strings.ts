// Конструктор строки для поиска в окне торговца (Ctrl+F), как раздел Vendor на poe.re
// (github.com/veiset/poe-vendor-string, poe/src/utils/OutputString.ts).
//
// Строки английские и одинаковые для любого клиента: поиск понимает английский
// текст предмета и в русском клиенте (проверено пользователем 2026-11-12).
// Поле поиска вмещает 250 символов (уточнено пользователем).
// Части через «|» — «или»; условия в отдельных кавычках через пробел — «и».
//
//  - связки билда — отдельная строка: перестановки цветов «r-r-g|r-g-r|g-r-r» (пробел в «Sockets: R-G B» разделяет
//    несвязанные группы), любые связки «-\w-», «-\w-.-» (как у poe.re);
//  - скорость: названия модификаторов на волшебных ботинках, 10% и 15%;
//  - урон: «d.+cal d» — «Adds # to # Physical Damage» / «#% increased Physical Damage»,
//    «fi.+d.+er$» — «+#% to Fire Damage over Time Multiplier» (и холод, хаос);

import { Data, type RouteData } from "common";

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 250;

export const LINK_OPTIONS = ["any3", "any4"] as const;
export type LinkOption = (typeof LINK_OPTIONS)[number];

const ANY_LINKS: Record<LinkOption, string> = { any3: "-\\w-", any4: "-\\w-.-" };

/** Ступени скорости передвижения: % → кусок названия модификатора (проверено по таблице Mods). */
export const MOVEMENT_TIERS = [
  { id: "10", re: "Runn" }, // Runner's
  { id: "15", re: "rint" }, // Sprinter's
  // Выше 15% на прокачке у торговцев почти не встречается — не показываем.
] as const;
export type MovementTier = (typeof MOVEMENT_TIERS)[number]["id"];

export const DAMAGE_OPTIONS = [
  { id: "phys", re: "d.+cal d" },
  { id: "fireDot", re: "fi.+d.+er$" },
  { id: "coldDot", re: "co.+d.+er$" },
  { id: "chaosDot", re: "ch.+d.+er$" },
] as const;
export type DamageOption = (typeof DAMAGE_OPTIONS)[number]["id"];

export interface RegexSelection {
  links: LinkOption[];
  movement: MovementTier[];
  damage: DamageOption[];
}

export const DEFAULT_SELECTION: RegexSelection = {
  links: [],
  movement: ["10", "15"],
  damage: [],
};

/** Сколько связок набора учитывать (главная атака, движение, ауры…). */
const MAX_LINK_GROUPS = 3;

const COLOUR: Record<string, "r" | "g" | "b"> = { strength: "r", dexterity: "g", intelligence: "b" };

export interface LinkSet {
  /** Цвета гнёзд: «r», «g», «b». */
  colours: string[];
  /** Гемы, по которым посчитаны цвета (id). */
  gems: string[];
}

/** Связки билда: группы с гемами поддержки, первые `size` гемов, без повторов цветов, крупные группы первыми. */
export function buildLinkSets(groups: RouteData.GemLinkGroup[], size: 3 | 4): LinkSet[] {
  const result: LinkSet[] = [];
  const seen = new Set<string>();
  const sorted = [...groups].sort(
    (a, b) => b.primaryGems.length + b.secondaryGems.length - (a.primaryGems.length + a.secondaryGems.length),
  );
  for (const group of sorted) {
    // Без поддержек это не связка (ауры, кличи, стойки): им гнёзда связывать не нужно.
    if (!group.secondaryGems.some((g) => Data.Gems[g.id]?.is_support)) continue;
    const gems = [...group.primaryGems, ...group.secondaryGems]
      .map((g) => g.id)
      .filter((id) => COLOUR[Data.Gems[id]?.primary_attribute])
      .slice(0, size);
    if (gems.length < size) continue;
    const colours = gems.map((id) => COLOUR[Data.Gems[id].primary_attribute]);
    const key = [...colours].sort().join("");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ colours, gems });
    if (result.length >= MAX_LINK_GROUPS) break;
  }
  return result;
}

function permutations(letters: string[]): string[] {
  if (letters.length <= 1) return [letters.join("")];
  const out = new Set<string>();
  letters.forEach((l, i) => {
    for (const rest of permutations([...letters.slice(0, i), ...letters.slice(i + 1)])) out.add(l + rest);
  });
  return [...out].sort();
}

/** «r-r-g|r-g-r|g-r-r» — связанные гнёзда этих цветов в любом порядке. */
function linkPermutations(colours: string[]): string[] {
  return permutations(colours).map((p) => p.split("").join("-"));
}

/** Связанные гнёзда цветов билда в любом порядке: «r-r-g|r-g-r|g-r-r|…». */
export function buildLinksString(sets: LinkSet[]): string {
  const parts = [...new Set(sets.flatMap((s) => linkPermutations(s.colours)))];
  return parts.length ? `"${parts.join("|")}"` : "";
}

/** Собирает строку из выбранных частей; части через «|», всё в кавычках. */
export function composeRegex(selection: RegexSelection): string {
  const parts: string[] = [];
  for (const link of LINK_OPTIONS) if (selection.links.includes(link)) parts.push(ANY_LINKS[link]);
  for (const tier of MOVEMENT_TIERS) if (selection.movement.includes(tier.id)) parts.push(tier.re);
  for (const dmg of DAMAGE_OPTIONS) if (selection.damage.includes(dmg.id)) parts.push(dmg.re);

  const unique = [...new Set(parts)];
  return unique.length ? `"${unique.join("|")}"` : "";
}
