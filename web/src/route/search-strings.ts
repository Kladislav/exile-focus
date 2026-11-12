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

// «Sockets: R-G-B-R»: каждый «-.» — ещё одно связанное гнездо (3L/4L как у poe.re).
const ANY_LINKS: Record<LinkOption, string> = {
  any3: "-\\w-",
  any4: "-\\w-.-",
  any5: "-\\w-.-.-",
  any6: "-\\w-.-.-.-",
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

/** Собирает строку из выбранных частей; части через «|», всё в кавычках. */
export function composeRegex(selection: RegexSelection): string {
  const parts: string[] = [];
  // «3 связанных» находит и 4–6: берём только самую короткую из отмеченных.
  const link = LINK_OPTIONS.find((l) => selection.links.includes(l));
  if (link) parts.push(ANY_LINKS[link]);
  for (const tier of MOVEMENT_TIERS) if (selection.movement.includes(tier.id)) parts.push(tier.re);
  for (const dmg of DAMAGE_OPTIONS) if (selection.damage.includes(dmg.id)) parts.push(dmg.re);

  const unique = [...new Set(parts)];
  return unique.length ? `"${unique.join("|")}"` : "";
}
