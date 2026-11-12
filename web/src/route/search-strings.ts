// Конструктор строки для поиска в окне торговца (Ctrl+F), как раздел Vendor на poe.re
// (github.com/veiset/poe-vendor-string, poe/src/utils/OutputString.ts).
//
// Строки английские и одинаковые для любого клиента: поиск понимает английский
// текст предмета и в русском клиенте (проверено пользователем 2026-11-12).
// Поле поиска вмещает 250 символов (уточнено пользователем).
// Части через «|» — «или»; условия в отдельных кавычках через пробел — «и».
//
//  - связки: перестановки цветов «r-r-g|r-g-r|g-r-r» (пробел в «Sockets: R-G B» разделяет
//    несвязанные группы), любые связки «-\w-», «-\w-.-» (как у poe.re);
//  - скорость: названия модификаторов на волшебных ботинках по ступеням;
//  - урон: «d.+cal d» — «Adds # to # Physical Damage» / «#% increased Physical Damage»,
//    «fi.+d.+er$» — «+#% to Fire Damage over Time Multiplier» (и холод, хаос);
//  - оружие: «Item Class: …» → «s:.+(ax|sw)»; выбранный тип подсвечивается всегда.

import { Data, type RouteData } from "common";

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 250;

export const LINK_OPTIONS = ["build3", "build4", "any3", "any4"] as const;
export type LinkOption = (typeof LINK_OPTIONS)[number];

const ANY_LINKS: Record<"any3" | "any4", string> = { any3: "-\\w-", any4: "-\\w-.-" };

/** Ступени скорости передвижения: % → кусок названия модификатора (проверено по таблице Mods). */
export const MOVEMENT_TIERS = [
  { id: "10", re: "Runn" }, // Runner's
  { id: "15", re: "rint" }, // Sprinter's
  { id: "20", re: "tallio" }, // Stallion's
  { id: "25", re: "zelle's" }, // Gazelle's (не «of the Gazelle»)
  { id: "30", re: "etah's" }, // Cheetah's (не «of the Cheetah»)
  { id: "35", re: "ellion's" }, // Hellion's (не «Aspect of the Hellion»)
] as const;
export type MovementTier = (typeof MOVEMENT_TIERS)[number]["id"];

export const DAMAGE_OPTIONS = [
  { id: "phys", re: "d.+cal d" },
  { id: "fireDot", re: "fi.+d.+er$" },
  { id: "coldDot", re: "co.+d.+er$" },
  { id: "chaosDot", re: "ch.+d.+er$" },
] as const;
export type DamageOption = (typeof DAMAGE_OPTIONS)[number]["id"];

export const WEAPON_OPTIONS = [
  { id: "axe", re: "ax" },
  { id: "mace", re: "mac" },
  { id: "sword", re: "sw" },
  { id: "staff", re: "stave" },
  { id: "sceptre", re: "sc" },
  { id: "claw", re: "cl" },
  { id: "bow", re: "bow" },
  { id: "wand", re: "wa" },
  { id: "dagger", re: "da" },
  { id: "shield", re: "sh" },
] as const;
export type WeaponOption = (typeof WEAPON_OPTIONS)[number]["id"];

export interface RegexSelection {
  links: LinkOption[];
  movement: MovementTier[];
  damage: DamageOption[];
  weapons: WeaponOption[];
}

export const DEFAULT_SELECTION: RegexSelection = {
  links: ["build3"],
  movement: ["10", "15", "20"],
  damage: [],
  weapons: [],
};

/** Сколько связок набора учитывать (главная атака, движение, ауры…). */
const MAX_LINK_GROUPS = 3;

const COLOUR: Record<string, "r" | "g" | "b"> = { strength: "r", dexterity: "g", intelligence: "b" };

/** Цвета связок набора: для каждой группы первые `size` гемов, без повторов, крупные группы первыми. */
export function linkGroupColours(groups: RouteData.GemLinkGroup[], size: 3 | 4): string[][] {
  const result: string[][] = [];
  const seen = new Set<string>();
  const sorted = [...groups].sort(
    (a, b) => b.primaryGems.length + b.secondaryGems.length - (a.primaryGems.length + a.secondaryGems.length),
  );
  for (const group of sorted) {
    const colours = [...group.primaryGems, ...group.secondaryGems]
      .map((g) => COLOUR[Data.Gems[g.id]?.primary_attribute])
      .filter(Boolean)
      .slice(0, size);
    if (colours.length < size) continue;
    const key = [...colours].sort().join("");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(colours);
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

/** Собирает строку из выбранных частей; части через «|», всё в кавычках. */
export function composeRegex(
  selection: RegexSelection,
  buildColours: { 3: string[][]; 4: string[][] },
): string {
  const parts: string[] = [];
  for (const link of LINK_OPTIONS) {
    if (!selection.links.includes(link)) continue;
    if (link === "build3" || link === "build4") {
      const sets = buildColours[link === "build3" ? 3 : 4];
      // Без билда (или без связки нужного размера) — любые связанные гнёзда.
      if (sets.length) parts.push(...sets.flatMap(linkPermutations));
      else parts.push(ANY_LINKS[link === "build3" ? "any3" : "any4"]);
    } else {
      parts.push(ANY_LINKS[link]);
    }
  }
  for (const tier of MOVEMENT_TIERS) if (selection.movement.includes(tier.id)) parts.push(tier.re);
  for (const dmg of DAMAGE_OPTIONS) if (selection.damage.includes(dmg.id)) parts.push(dmg.re);
  const weapons = WEAPON_OPTIONS.filter((w) => selection.weapons.includes(w.id)).map((w) => w.re);
  if (weapons.length === 1) parts.push(`s:.+${weapons[0]}`);
  if (weapons.length > 1) parts.push(`s:.+(${weapons.join("|")})`);

  const unique = [...new Set(parts)];
  return unique.length ? `"${unique.join("|")}"` : "";
}

// «s \d+ to \d+ phys» — «Adds 3 to 6 Physical Damage», «d.+cal d» — «increased Physical Damage»
// (строка уточнена пользователем). Классы «Two Hand Axes» и «Two Hand Swords».
const TWO_HAND_AXE_PHYS = '"two hand (ax|sw)" "s \\d+ to \\d+ phys|d.+cal d"';

/** Двуручные топоры и мечи с плоским или процентным физическим уроном (условие «и»). */
export function twoHandAxePhysString(): string {
  return TWO_HAND_AXE_PHYS;
}
