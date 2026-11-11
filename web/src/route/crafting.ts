// Рецепты крафтового стола, которые реально нужны при прокачке.
// Остальные шаги «Получить рецепт» из маршрута убираются.
//
// Ранжирование (2026-11-12):
//  1. Нужны всем, оставляем:
//     - скорость передвижения на ботинки (Rank 1 в 3 акте, дальше улучшения);
//     - гнёзда, цвета и связи: 4-линк и раскраска на прокачке;
//     - сопротивления: после Китавы в 5 и 10 актах минус 30% к каждому,
//       резисты добираются крафтом;
//     - здоровье и мана (Rank 2–3) на добивку свободных аффиксов;
//     - атрибуты: закрывают требования вещей и гемов (по просьбе пользователя).
//  2. Зависят от билда, убираем: урон конкретного типа (физ., стихии, хаос,
//     чары), скорость атаки и чар, урон с течением времени, миньоны,
//     ловушки, урон умений Ваал.
//  3. Почти не используются на прокачке, убираем: защита,
//     точность, реген маны и здоровья, длительность флаконов, смягчение
//     недугов, срабатывание чар.
export const ESSENTIAL_RECIPES = new Set([
  "Movement Speed - Rank 1",
  "All Attributes - Rank 1",
  "Attributes - Rank 2",
  "All Attributes - Rank 2",
  "Movement Speed and Exerted Attacks - Rank 2",
  "Movement Speed and Flask Enchantments - Rank 3",
  "Socket Colours",
  "Socket Numbers - 2 to 4 Sockets",
  "Socket Links - 2 to 4 Linked Sockets",
  "All Resistances - Rank 1",
  "All Resistances - Rank 2",
  "Double Resistances - Rank 1",
  "Double Resistances - Rank 2",
  "Double Resistances - Rank 3",
  "Elemental Resistances - Rank 2",
  "Elemental Resistances - Rank 3",
  "Life and Mana - Rank 2",
  "Life and Mana - Rank 3",
]);
