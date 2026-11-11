// Перевод текста маршрута upstream (всё, что вне {фрагментов}) на русский.
// Ключи в нижнем регистре; регистр первой буквы берётся из оригинала.
// Новые фразы после синхронизации upstream просто останутся на английском.

const PHRASES: Record<string, string> = {
  // Шаги
  "get": "Получить",
  "get@waypoint": "Активировать",
  ", get": ", получить",
  ", get@waypoint": ", активировать",
  "hand in": "Сдать",
  ", take": ", взять",
  ", kill": ", убить",
  "find and kill": "Найти и убить",
  "talk to": "Поговорить:",
  "kill": "Убить",
  "complete": "Пройти",
  "find and take": "Найти и взять",
  "take": "Взять",
  "find": "Найти",
  ", activate": ", активировать",
  "poison the": "Отравить",
  "&": "и",
  "find 1x": "Найти 1× ",
  "find 2x": "Найти 2× ",
  "find 3x": "Найти 3× ",
  "find 4x": "Найти 4× ",
  "help": "Помочь",
  "activate": "Активировать",
  "before": "Перед",
  ", complete": ", пройти",
  "place": "Поставить",
  "in the plaza": "на площади",
  ", set sail from oriath": ", отплыть из Ориата",
  "take the": "Сесть:",
  ", place": ", поставить",
  "find and help": "Найти и помочь",
  "help and talk to": "Помочь и поговорить:",
  "burn the": "Сжечь",
  "to next floor": "на следующий этаж",
  "with": "с",
  "open": "Открыть",
  "find and take 7x": "Найти и взять 7× ",
  "light the": "Зажечь",
  ", throw in": ", бросить туда",
  ", sail to": ", отплыть в",
  "select": "Выбрать",
  "break": "Разбить",
  "free": "Освободить",
  ", use": ", использовать",
  ", search in the corners of the map": ", ищите в углах карты",
  ", sail to wraeclast": ", отплыть в Рэкласт",

  // Подсказки
  "little streams connect the 3 rhoa nests": "Ручейки соединяют 3 гнезда роа",
  "usually form a triangle, but will rarely form a line": "Обычно это треугольник, изредка линия",
  "go": "Идите",
  "if you find a ledge, turn around and go": "Если упёрлись в уступ, развернитесь и идите",
  "go right of the bridge": "Идите справа от моста",
  "search opposite the entrance": "Ищите напротив входа",
  "look for the large empty room": "Ищите большую пустую комнату",
  "usually": "Обычно",
  "look for map icon, access with nearby switch": "Ищите значок на карте, проход открывает рычаг рядом",
  "high chance for": "Высокий шанс на",
  "vendor": "Торговец",
  "+ normal": "+ обычный",
  "+ movement speed": "+ скорость передвижения",
  "go down the ledge next to the road": "Спуститесь с уступа у дороги",
  "follow the water": "Идите вдоль воды",
  "interact with the switch just before the zig-zagging walls, go to the opposite side to access":
    "Нажмите рычаг перед зигзагом стен, проход откроется с другой стороны",
  "loop around clockwise": "Обходите по часовой стрелке",
  "counter-clockwise spiral": "спираль против часовой стрелки",
  "type": "Введите",
  "in chat to confirm that you have all 24 passives from quests":
    "в чат и проверьте, что получены все 24 очка умений за квесты",
  "in chat to confirm that you have all 23 passives from quests":
    "в чат и проверьте, что получены все 23 очка умений за квесты",
  "follow the road": "Идите по дороге",
  "go in same direction as": "Идите в ту же сторону, что и",
  "look for the long hallway": "Ищите длинный коридор",
  "search the side of road opposite": "Ищите на другой стороне дороги, напротив",
  "try go": "Попробуйте идти",
  ", if it's blocked go": ", если закрыто, идите",
  "look for 2 pillars near": "Ищите 2 колонны рядом с",
  ", follow the trail": ", идите по тропе",
  "search opposite direction of the encampment entrance": "Ищите в стороне, противоположной входу в лагерь",
  "look for the torch touching the road": "Ищите факел у самой дороги",
  "follow the trail in the direction of the torch": "Идите по тропе в сторону факела",
  "s shape or l shape leads to exit": "К выходу ведёт изгиб буквой S или L",
  "first floor exit will be in one of the 3 corners": "Выход с первого этажа в одном из 3 углов",
  "remaining floors will have the exit diagonally across from the entrance":
    "На остальных этажах выход по диагонали от входа",
  "follow stairs": "Идите по лестницам",
  "look around nearby": "Осмотритесь рядом",
  "search": "Ищите",
  "follow stairs that are going up": "Идите по лестницам вверх",
  "at the fork in the road with wagons, go the route with 1 wagon, not 2":
    "На развилке с повозками идите туда, где 1 повозка, а не 2",
  "look for a candle in a narrow corridor": "Ищите подсвечник в узком коридоре",
  "put currency needed to buy skill gems in inventory": "Положите в инвентарь валюту для покупки камней умений",
  "stairs spawn in one of the corners": "Лестница в одном из углов",
  "look for barricades": "Ищите баррикады",
  "follow bridges": "Идите по мостам",
  "follow the exits keeping": "Идите по выходам, держась",
  "until you find the hanged karui": "пока не найдёте повешенного каруи",
  "loop around clockwise to go": "Обходите по часовой стрелке, чтобы идти",
  "as much as possible": "насколько возможно",
  "from": "от",
  "loop around counter-clockwise": "Обходите против часовой стрелки",
  "find the plaza": "найдите площадь",
  "corner of area, normally by a house": "угол зоны, обычно у дома",
  "find and kill the pack of monster on the island": "Найдите и убейте группу монстров на острове",
  "for a": "ради",
  "follow the road until it ends": "Идите по дороге до конца",
  "follow the shore": "Идите вдоль берега",
  "follow the road, look for the broken": "Идите по дороге, ищите сломанный объект:",
  "follow edges of the zone and cross bridges in the corners": "Идите по краю зоны, мосты в углах",
  "typically bridges spawn in the opposite diagonal corners": "Обычно мосты в противоположных по диагонали углах",
  "find the switch hidden behind": "Найдите рычаг, спрятанный за",
  "to access": "чтобы пройти",
  "in the room with a central pit, look": "В комнате с ямой в центре ищите",
  "or": "или",
  "for a side area containing a": "боковую зону, где есть",
  "black splashes of paint on ground points to the right direction to go":
    "Чёрные брызги краски на земле указывают верное направление",
  "follow": "Идите вдоль",
  "wall": "стены",
  "follow the dead guards by doorways": "Ориентируйтесь на мёртвых стражников у проходов",
  "look for a book icon": "Ищите значок книги",
  "follow the road until": "Идите по дороге до",
  "side": "стороны",
  "until you find the cliff": "пока не найдёте обрыв",
  "look for petrified soldiers": "Ищите окаменевших солдат",
  "look for the hidden switch halfway to": "Ищите скрытый рычаг на полпути к",
  "in the corner opposite the entrance to access": "в углу напротив входа, чтобы пройти",
  "look for a sewer grate leading to": "Ищите решётку канализации, ведущую в",
  ", it is attached to the cart tracks": ", она у рельсов вагонеток",
  "follow cart tracks": "Идите по рельсам вагонеток",
};

const PATTERNS: [RegExp, string][] = [
  [/^recommended level: (.+)$/i, "Рекомендуемый уровень: $1"],
  [/^farm level: (.+)$/i, "Уровень для фарма: $1"],
];

function matchCase(source: string, value: string) {
  const first = source.trimStart()[0];
  if (first && first === first.toLowerCase() && first !== first.toUpperCase()) {
    return value[0].toLowerCase() + value.slice(1);
  }
  return value;
}

/** Переводит кусок текста шага; `context` уточняет смысл (например, "waypoint"). */
export function translateRoutePhrase(text: string, context?: string): string {
  const core = text.trim();
  if (!core || core === "➞" || core === "+") return text;
  const key = core.toLowerCase();

  let value = (context && PHRASES[`${key}@${context}`]) ?? PHRASES[key];
  if (value === undefined) {
    for (const [re, replacement] of PATTERNS) {
      if (re.test(core)) {
        value = core.replace(re, replacement);
        break;
      }
    }
  }
  if (value === undefined) return text;

  const lead = text.match(/^\s*/)![0];
  const trail = text.match(/\s*$/)![0];
  // Фраза, начинающаяся с запятой, сохраняет её как есть.
  const body = core.startsWith(",") ? value : matchCase(core, value);
  return lead + (trail && body.endsWith(" ") ? body.trimEnd() : body) + trail;
}
