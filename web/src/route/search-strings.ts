// Конструктор строки для поиска в окне торговца (Ctrl+F), как раздел Vendor на poe.re
// (github.com/veiset/poe-vendor-string, poe/src/utils/OutputString.ts).
//
// Строки английские и одинаковые для любого клиента: поиск понимает английский
// текст предмета и в русском клиенте (проверено пользователем 2026-11-12).
// Поле поиска вмещает 250 символов (уточнено пользователем).
// Части через «|» — «или»; условия в отдельных кавычках через пробел — «и».
//
//  - связки: любые 3–6 связанных гнёзд, цвета не важны (с 3.29 цвет гнезда влияет только на качество,
//    со слов пользователя);
//  - скорость: названия модификаторов на волшебных ботинках, 10% и 15%;
//  - урон: «d.+cal d» — «Adds # to # Physical Damage» / «#% increased Physical Damage»,
//    «fi.+d.+er$» — «+#% to Fire Damage over Time Multiplier» (и холод, хаос);

/** Ограничение длины поля поиска в игре. */
export const SEARCH_LIMIT = 250;

export const LINK_OPTIONS = ["any3", "any4", "any5", "any6"] as const;
export type LinkOption = (typeof LINK_OPTIONS)[number];

// Как у poe.re (generate3LinkStr … generate6LinkStr): «Sockets: R-G-B-R».
// «[rgbw]» — с белыми гнёздами; каждое «-\w» — ещё одно связанное гнездо.
const ANY_LINKS: Record<LinkOption, string> = {
  any3: "-[rgbw]-",
  any4: "-\\w-.-",
  any5: "(-\\w){4}",
  any6: "(-\\w){5}",
};

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
  links: ["any3"],
  movement: ["10", "15"],
  damage: [],
};

/** Собирает строку из выбранных частей через «|», как generateResultString у poe.re. */
export function composeRegex(selection: RegexSelection): string {
  const parts: string[] = [];
  // Выбрана одна связка (старое сохранённое состояние могло хранить несколько — берём меньшую).
  const link = LINK_OPTIONS.find((l) => selection.links.includes(l));
  if (link) parts.push(ANY_LINKS[link]);
  for (const tier of MOVEMENT_TIERS) if (selection.movement.includes(tier.id)) parts.push(tier.re);
  for (const dmg of DAMAGE_OPTIONS) if (selection.damage.includes(dmg.id)) parts.push(dmg.re);

  const result = [...new Set(parts)].join("|");
  // Как у poe.re: кавычки нужны, только если в строке есть пробел.
  return /[ "]/.test(result) ? `"${result.replaceAll('"', "")}"` : result;
}
