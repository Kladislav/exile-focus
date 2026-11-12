// Готовые строки для поиска в окне торговца (Ctrl+F). Подход как у poe.re
// (github.com/veiset/poe-vendor-string).
//
// Строки английские и одинаковые для любого клиента: поиск в игре понимает
// английский текст предмета и в русском клиенте (проверено пользователем 2026-11-12).
// Поле поиска вмещает 250 символов (уточнено пользователем).
//
//  - гнёзда: связки цветов перестановками «r-r-g|r-g-r|g-r-r» (без якоря «Sockets:»,
//    поэтому кольца и амулеты не цепляются); пробел в «Sockets: R-G B» разделяет
//    несвязанные группы, так что «r-r-g» находит только связанные гнёзда;
//  - скорость передвижения: названия модификаторов на волшебных ботинках
//    Runner's 10%, Sprinter's 15%, Stallion's 20%, Gazelle's 25%, Cheetah's 30%,
//    Hellion's 35%; апостроф отсекает «of the Gazelle», «of the Cheetah»,
//    «Aspect of the Hellion»;
//  - +1 к уровню камней: «+1 to Level of all … Skill Gems»;
//  - оружие: «Item Class: Two Hand Axes / Two Hand Swords» и свойства «Adds # to # Physical Damage»,
//    «#% increased Physical Damage» (строка характеристик «Physical Damage: 4-9»
//    под них не попадает). Несколько условий в кавычках через пробел — «и».

import { Data, type RouteData } from "common";

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 250;

const MOVEMENT = "Runn|rint|llion's|zelle's|etah's";
const PLUS_GEMS = "ll g";
// «s \d+ to \d+ phys» — «Adds 3 to 6 Physical Damage», «d.+cal d» — «increased Physical Damage»
// (строка уточнена пользователем). Классы «Two Hand Axes» и «Two Hand Swords».
const TWO_HAND_AXE_PHYS = '"two hand (ax|sw)" "s \\d+ to \\d+ phys|d.+cal d"';

const ANY_LINKS: Record<3 | 4, string> = { 3: "-\\w-", 4: "-\\w-.-" };

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

/**
 * Связанные гнёзда (цвета всех основных связок билда) + ботинки на скорость.
 * Если всё не помещается в лимит поиска, отбрасывает связки с конца.
 */
export function combinedSearchString(colourSets: string[][], size: 3 | 4): { query: string; withBuild: boolean } {
  for (let n = colourSets.length; n >= 1; n--) {
    const links = [...new Set(colourSets.slice(0, n).flatMap(linkPermutations))];
    const query = `"${[...links, MOVEMENT].join("|")}"`;
    if (query.length <= SEARCH_LIMIT) return { query, withBuild: true };
  }
  return { query: `"${ANY_LINKS[size]}|${MOVEMENT}"`, withBuild: false };
}

/** Только ботинки на скорость, все ступени 10–35%. */
export function movementSpeedString(): string {
  return `"${MOVEMENT}"`;
}

/** +1 к уровню камней умений (жезлы, скипетры для заклинателей). */
export function plusGemsString(): string {
  return `"${PLUS_GEMS}"`;
}

/** Двуручные топоры и мечи с плоским или процентным физическим уроном. */
export function twoHandAxePhysString(): string {
  return TWO_HAND_AXE_PHYS;
}
