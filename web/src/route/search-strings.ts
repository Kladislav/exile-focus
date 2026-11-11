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

const STAT_TEXT: Record<Lang, { movement: string; life: string; resist: string }> = {
  // "{0}% increased Movement Speed", "+{0} to maximum Life", "+{0}% to Fire Resistance"
  en: { movement: "movement speed", life: "maximum life", resist: "resistance" },
  // "{0}% повышение скорости передвижения", "+{0} к максимуму здоровья", "+{0}% к сопротивлению огню"
  ru: { movement: "скорости передвижения", life: "максимуму здоровья", resist: "сопротивлению" },
};

/** Строки, полезные любому билду. */
export function commonSearchStrings(gameLang: Lang): SearchString[] {
  const t = STAT_TEXT[gameLang];
  return [
    { id: "links3", query: '"-\\w-"' },
    { id: "links4", query: '"-\\w-\\w-"' },
    { id: "movement", query: `"${t.movement}"` },
    { id: "life", query: `"${t.life}"` },
    { id: "resist", query: `"${t.resist}"` },
  ];
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
