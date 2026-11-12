// Готовые строки для поиска в окне торговца (Ctrl+F). Подход как у poe.re
// (github.com/veiset/poe-vendor-string), плюс русский клиент.
//
// Поиск идёт по тексту предмета на языке клиента:
//  - гнёзда: строка «Sockets: R-G-B» / «Гнезда: R-G-B»; пробел разделяет
//    несвязанные группы, буквы цветов в русском клиенте латинские;
//  - скорость передвижения: названия модификаторов на волшебных ботинках
//    (Runner's 10%, Sprinter's 15%, Stallion's 20%; в русском — прилагательные
//    «Быстрый», «Резкий», «Резвый» с родом, поэтому ищем по основе);
//  - +1 к уровню камней: текст свойства «+1 to Level of all … Skill Gems» /
//    «+1 к уровню всех камней умений чар …».
//  - оружие: строка «Item Class: Two Hand Axes» / «Класс предмета: Двуручные топоры»
//    и свойства «Adds # to # Physical Damage», «#% increased Physical Damage»
//    (в русском — «… физического урона»; строка характеристик «Physical Damage: 4-9» /
//    «Физический урон» под них не попадает). Несколько условий в кавычках через
//    пробел поиск объединяет по «и».
// Тексты взяты из файлов игры 3.29 (таблицы Mods, ItemClasses, stat_descriptions.txt).

import { Data, type RouteData } from "common";
import type { Lang } from "../settings";

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 50;

const TEXT: Record<Lang, { sockets: string; movement: string[]; plusGems: string }> = {
  en: { sockets: "ts:", movement: ["Runn", "rint", "tallio"], plusGems: "ll g" },
  ru: { sockets: "да:", movement: ["быстр", "резк", "резв"], plusGems: "умений чар" },
};

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
export function colourLinkPattern(gameLang: Lang, c: ColourCounts): string {
  const order = (["r", "g", "b"] as const).filter((x) => c[x] > 0);
  const last = order[order.length - 1];
  const part = (x: "r" | "g" | "b") => {
    const body = c[x] > 1 ? `(\\S*${x}){${c[x]}}` : `(\\S*${x})`;
    return x === last ? body : `(?=${body})`;
  };
  return `${TEXT[gameLang].sockets}.+${order.map(part).join("")}`;
}

/** Связанные гнёзда (цвета билда, если известны) + ботинки на скорость передвижения. */
export function combinedSearchString(
  gameLang: Lang,
  colours: ColourCounts | null,
  size: 3 | 4,
): { query: string; withBuild: boolean } {
  const movement = TEXT[gameLang].movement;
  for (const links of [colours ? colourLinkPattern(gameLang, colours) : null, ANY_LINKS[size]]) {
    if (!links) continue;
    for (let n = movement.length; n >= 1; n--) {
      const query = `"${[links, ...movement.slice(0, n)].join("|")}"`;
      if (query.length <= SEARCH_LIMIT) return { query, withBuild: links !== ANY_LINKS[size] };
    }
  }
  return { query: `"${ANY_LINKS[size]}|${movement[0]}"`, withBuild: false };
}

/** Только гнёзда цветов билда — для блока «Под основную связку». */
export function buildLinkString(gameLang: Lang, colours: ColourCounts): string {
  return `"${colourLinkPattern(gameLang, colours)}"`;
}

/** +1 к уровню камней умений (жезлы, скипетры для заклинателей). */
export function plusGemsString(gameLang: Lang): string {
  return `"${TEXT[gameLang].plusGems}"`;
}

const WEAPON: Record<Lang, { twoHandAxe: string; physMod: string }> = {
  // «s \d+ to \d+ phys» — «Adds 3 to 6 Physical Damage», «d.+cal d» — «increased Physical Damage»
  // (строка уточнена пользователем)
  en: { twoHandAxe: "two hand ax", physMod: "s \\d+ to \\d+ phys|d.+cal d" },
  ru: { twoHandAxe: "двуручные топ", physMod: "физического урона" },
};

/** Двуручные топоры с плоским или процентным физическим уроном. */
export function twoHandAxePhysString(gameLang: Lang): string {
  const w = WEAPON[gameLang];
  return `"${w.twoHandAxe}" "${w.physMod}"`;
}
