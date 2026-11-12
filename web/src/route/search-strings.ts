// Готовые строки для поиска в окне торговца (Ctrl+F). Подход как у poe.re
// (github.com/veiset/poe-vendor-string).
//
// Строки английские и одинаковые для любого клиента: поиск в игре понимает
// английский текст предмета и в русском клиенте (проверено пользователем 2026-11-12).
//
//  - гнёзда: строка «Sockets: R-G-B»; пробел разделяет несвязанные группы;
//  - скорость передвижения: названия модификаторов на волшебных ботинках
//    (Runner's 10%, Sprinter's 15%, Stallion's 20%);
//  - +1 к уровню камней: «+1 to Level of all … Skill Gems»;
//  - оружие: «Item Class: Two Hand Axes» и свойства «Adds # to # Physical Damage»,
//    «#% increased Physical Damage» (строка характеристик «Physical Damage: 4-9»
//    под них не попадает). Несколько условий в кавычках через пробел — «и».

import { Data, type RouteData } from "common";

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 50;

const SOCKETS = "ts:";
const MOVEMENT = ["Runn", "rint", "tallio"];
const PLUS_GEMS = "ll g";
// «s \d+ to \d+ phys» — «Adds 3 to 6 Physical Damage», «d.+cal d» — «increased Physical Damage»
// (строка уточнена пользователем)
const TWO_HAND_AXE_PHYS = '"two hand ax" "s \\d+ to \\d+ phys|d.+cal d"';

const ANY_LINKS: Record<3 | 4, string> = { 3: "-\\w-", 4: "-\\w-.-" };

const COLOUR: Record<string, "r" | "g" | "b"> = { strength: "r", dexterity: "g", intelligence: "b" };

export interface ColourCounts {
  r: number;
  g: number;
  b: number;
  gems: string[];
}

/** Цвета основной связки набора (самой большой группы): первые `size` гемов. */
export function mainLinkColours(groups: RouteData.GemLinkGroup[], size: 3 | 4): ColourCounts | null {
  const main = [...groups].sort(
    (a, b) => b.primaryGems.length + b.secondaryGems.length - (a.primaryGems.length + a.secondaryGems.length),
  )[0];
  if (!main) return null;
  const gems = [...main.primaryGems, ...main.secondaryGems]
    .map((g) => g.id)
    .filter((id) => COLOUR[Data.Gems[id]?.primary_attribute])
    .slice(0, size);
  if (gems.length < size) return null;
  const counts = { r: 0, g: 0, b: 0, gems };
  for (const id of gems) counts[COLOUR[Data.Gems[id].primary_attribute]]++;
  return counts;
}

/**
 * «В одной группе связанных гнёзд есть N красных, M зелёных…»:
 * ts:.+(?=(\S*r){2})(\S*g) — \S* не пересекает пробел между группами.
 */
export function colourLinkPattern(c: ColourCounts): string {
  const order = (["r", "g", "b"] as const).filter((x) => c[x] > 0);
  const last = order[order.length - 1];
  const part = (x: "r" | "g" | "b") => {
    const body = c[x] > 1 ? `(\\S*${x}){${c[x]}}` : `(\\S*${x})`;
    return x === last ? body : `(?=${body})`;
  };
  return `${SOCKETS}.+${order.map(part).join("")}`;
}

/** Связанные гнёзда (цвета билда, если известны) + ботинки на скорость передвижения. */
export function combinedSearchString(colours: ColourCounts | null, size: 3 | 4): { query: string; withBuild: boolean } {
  for (const links of [colours ? colourLinkPattern(colours) : null, ANY_LINKS[size]]) {
    if (!links) continue;
    for (let n = MOVEMENT.length; n >= 1; n--) {
      const query = `"${[links, ...MOVEMENT.slice(0, n)].join("|")}"`;
      if (query.length <= SEARCH_LIMIT) return { query, withBuild: links !== ANY_LINKS[size] };
    }
  }
  return { query: `"${ANY_LINKS[size]}|${MOVEMENT[0]}"`, withBuild: false };
}

/** Только гнёзда цветов билда — для блока «Под основную связку». */
export function buildLinkString(colours: ColourCounts): string {
  return `"${colourLinkPattern(colours)}"`;
}

/** +1 к уровню камней умений (жезлы, скипетры для заклинателей). */
export function plusGemsString(): string {
  return `"${PLUS_GEMS}"`;
}

/** Двуручные топоры с плоским или процентным физическим уроном. */
export function twoHandAxePhysString(): string {
  return TWO_HAND_AXE_PHYS;
}
