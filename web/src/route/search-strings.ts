// Готовые строки поиска для окна торговца (поле поиска в окне продавца, Ctrl+F).
// Поиск идёт по тексту предмета на языке клиента, поэтому строки про свойства
// зависят от языка игры. Тексты свойств взяты из stat_descriptions.txt игры (3.29).
// Буквы цветов гнёзд (R/G/B) в русском клиенте не переводятся.

import { Data, type RouteData } from "common";
import type { Lang } from "../settings";

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 50;

export interface SearchString {
  id: string;
  query: string;
}

const COLOUR: Record<string, string> = { strength: "r", dexterity: "g", intelligence: "b" };

function permutations(letters: string[]): string[] {
  if (letters.length <= 1) return [letters.join("")];
  const out = new Set<string>();
  letters.forEach((l, i) => {
    for (const rest of permutations([...letters.slice(0, i), ...letters.slice(i + 1)])) out.add(l + rest);
  });
  return [...out];
}

/** "g-g-r|g-r-g|r-g-g" — связанные гнёзда нужных цветов в любом порядке. */
function linkQuery(colours: string[]): string | null {
  const variants = permutations(colours).map((p) => p.split("").join("-"));
  const query = `"${variants.join("|")}"`;
  return query.length <= SEARCH_LIMIT ? query : null;
}

/** Перестановки цветов связки без кавычек ("g-r-r|r-g-r|r-r-g") или null. */
export function buildLinkPattern(groups: RouteData.GemLinkGroup[], size = 3): string | null {
  const s = buildSearchStrings(groups).find((x) => x.id === `build${size}`);
  return s ? s.query.slice(1, -1) : null;
}

/**
 * Гнёзда под основную связку набора: главный гем и поддержки, цвета по атрибуту.
 * Возвращает строки для 3 и 4 связанных гнёзд, если они укладываются в лимит поиска.
 */
export function buildSearchStrings(groups: RouteData.GemLinkGroup[]): (SearchString & { gems: string[] })[] {
  const main = [...groups].sort(
    (a, b) => b.primaryGems.length + b.secondaryGems.length - (a.primaryGems.length + a.secondaryGems.length),
  )[0];
  if (!main) return [];
  const gems = [...main.primaryGems, ...main.secondaryGems].map((g) => g.id).filter((id) => Data.Gems[id]);
  const colours = gems.map((id) => COLOUR[Data.Gems[id].primary_attribute]).filter(Boolean);

  const result: (SearchString & { gems: string[] })[] = [];
  for (const size of [3, 4]) {
    if (colours.length < size) continue;
    const query = linkQuery(colours.slice(0, size).sort());
    if (query) result.push({ id: `build${size}`, query, gems: gems.slice(0, size) });
  }
  return result;
}

/** Скорость передвижения в тексте предмета; короткий вариант — на случай длинной связки. */
const MOVEMENT: Record<Lang, string[]> = {
  // "{0}% increased Movement Speed"
  en: ["movement speed", "movement"],
  // "{0}% повышение скорости передвижения"
  ru: ["скорости передвижения", "передвиж"],
};

/**
 * Общая строка: связанные гнёзда (цвета билда, если влезают) и скорость передвижения.
 * Укладывается в лимит поиска, сокращая фразу или откатываясь на любые цвета.
 */
export function combinedSearchString(
  gameLang: Lang,
  buildLinks?: string,
  size: 3 | 4 = 3,
): { query: string; withBuild: boolean } {
  const anyLinks = size === 3 ? "-\\w-" : "-\\w-\\w-";
  for (const links of [buildLinks, anyLinks].filter((x): x is string => !!x)) {
    for (const movement of MOVEMENT[gameLang]) {
      const query = `"${links}|${movement}"`;
      if (query.length <= SEARCH_LIMIT) return { query, withBuild: links === buildLinks };
    }
  }
  return { query: `"${anyLinks}|${MOVEMENT[gameLang][1]}"`, withBuild: false };
}
