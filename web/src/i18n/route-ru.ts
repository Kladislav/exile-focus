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
  // У лодки в игре нет названия: обычный текст, а не термин игры.
  "take the boat ➞": "Сесть в лодку ➞",
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
  // Подсказки из гайда LootKeeper «Быстрая прокачка» (обновлён 2024-06-27)
  "first character: pick up the boss drops and sell them for starting currency":
    "Первый персонаж: соберите лут с босса и продайте торговцу ради стартовой валюты",
  "check the vendors for items with the linked sockets your skills need":
    "Загляните к торговцам: бывают вещи с нужными связанными гнёздами",
  "the waypoint is at the far end of the zone, next to this exit":
    "Вейпоинт в дальнем конце зоны, у этого выхода",
  "nests are marked with ! on the minimap":
    "Гнёзда отмечены «!» на мини-карте",
  "follow the cliff wall; skip":
    "Идите вдоль скалы; пропустите",
  "reward: take":
    "Награда: возьмите",
  ", keep it on the flask bar and use it while moving":
    ", поставьте на панель флаконов и пейте на бегу",
  "a narrow bridge means you are heading the right way":
    "Узкий мост — значит, идёте верно",
  "the trial entrance is marked on the map with this icon:":
    "Вход в испытание отмечен на карте этим значком:",
  "the waypoint is usually near the start of the zone":
    "Вейпоинт обычно в начале зоны",
  ": click the corpse in":
    ": нажмите на труп в зоне",
  ", no need to kill the monster there":
    ", монстра там убивать не нужно",
  "bring it to the captain near the waypoint, then fight him":
    "Отнесите капитану у вейпоинта, потом бой с ним",
  "the town vendor now sells more skill gems (level 12+)":
    "У торговца в городе появились новые камни умений (от 12 уровня)",
  "cold resistance helps: wear 1–2":
    "Поможет сопротивление холоду: наденьте 1–2",
  "(vendor:":
    "(у торговца:",
  "+ any blue gem)":
    "+ любой синий камень)",
  "dodge the icicle barrage, geysers and ice storm":
    "Уходите от шквала сосулек, гейзеров и ледяной бури",
  "follow the cliff that starts at the waypoint":
    "Идите вдоль скалы, которая начинается у вейпоинта",
  "usually at the very end, marked with ! on the map":
    "Обычно в самом конце, отмечен «!» на карте",
  "the boss in front of it does not need to be killed":
    "Босса перед ним убивать не нужно",
  "the waypoint is easiest to find along the left edge of the zone":
    "Вейпоинт проще найти вдоль левого края зоны",
  "lots of cobwebs around the entrance":
    "У входа много паутины",
  "activate the stone ball blocking the path":
    "Активируйте каменный шар, который перекрывает путь",
  "follow the shore, get the waypoint on the way; do not enter":
    "Идите вдоль берега, по пути возьмите вейпоинт; не заходите в",
  "activate the altar at the top to summon the boss":
    "Активируйте алтарь наверху, чтобы призвать босса",
  "logout right after the kill and take the waypoint to":
    "Сразу после убийства релог и вейпоинт в",
  ": no need to wait for the cutscene":
    ": ждать сцену не нужно",
  "follow the shore: the blackguards holding her are on the way":
    "Идите вдоль берега: чёрные стражи с ней будут по пути",
  "do not talk to npcs yet, go straight to":
    "С NPC пока не говорите, сразу идите в",
  "the corpse becomes clickable only after the boss and all her guards are dead":
    "Труп активируется только после победы над боссом и всеми стражами",
  "the sewer entrance is marked on the map":
    "Вход в канализацию отмечен на карте",
  "busts are in stashes marked on the map":
    "Бюсты лежат в тайниках, они отмечены на карте",
  "do not open the green quest chest":
    "Зелёный квестовый сундук не открывайте",
  "the container is marked on the map":
    "Контейнер отмечен на карте",
  "long narrow bridges going up lead the right way":
    "Верный путь — по длинным узким мостикам вверх",
  "the entrance is along the green right-hand wall":
    "Вход вдоль правой стены, заросшей зеленью",
  "the quest giver stands next to the waypoint":
    "Квестодатель стоит у вейпоинта",
  "pages are marked on the map":
    "Страницы отмечены на карте",
  "phase 2: hide under the dome from the blood rain, or portal to town and back":
    "Вторая фаза: прячьтесь под купол от кровавого дождя или уйдите порталом в город и вернитесь",
  "look for the book icon on the map":
    "Ориентир — значок книги на карте",
  "the seal is in the upper part of town":
    "Печать в верхней части города",
  "the mini-boss next to the spirit does not need to be killed":
    "Мини-босса рядом с духом убивать не нужно",
  "good time for the first labyrinth: around level 32–34":
    "Хорошее время для первого лабиринта: около 32–34 уровня",
  "the lever is marked on the map":
    "Рычаг отмечен на карте",
  "the fight starts when you step on the platform":
    "Бой начнётся, когда встанете на платформу",
  "after this fight all resistances drop by 30%: craft the missing ones on free suffixes":
    "После боя все сопротивления снижаются на 30%: докрафтите недостающие на свободные суффиксы",
  "the red gate opens only if you carry the item from the queen":
    "Красные ворота откроются, только если у вас предмет с царицы",
  "kill the 3 flowers on the lower platform to make her appear":
    "Убейте 3 цветка на нижней платформе — тогда она появится",
  "open the chest in this zone, the flag drops from it":
    "Откройте сундук в этой зоне, флаг выпадет из него",
  "two pillars on top of the pyramid: stand in the circle next to each one to move it, push both to the end":
    "На вершине пирамиды два столба: встаньте в круг у столба, и он поедет; доведите оба до конца",
  "pull the lever, click the flame, then take the stairs on the right down to the ship":
    "Дёрните рычаг, нажмите на пламя и спуститесь по лестнице справа к кораблю",
  "it is marked on the map":
    "Отмечен на карте",
  "in the container at the end of the second level":
    "В контейнере в конце второго уровня",
  "his fortress is at the end of the road":
    "Его крепость в конце дороги",
  "in a chest at the end of the zone":
    "В сундуке в конце зоны",
  "if the character feels weak, the labyrinth can wait":
    "Если персонаж слабоват, лабиринт можно отложить",
  "in a chest on a small island in the water":
    "В сундуке на небольшом островке в воде",
  "drop portals on the way: after a death you come back to them from town":
    "По пути ставьте порталы: после смерти вернётесь к ним из города",
  "straight zone, good for farming: ctrl+click the entrance and choose new to reset it":
    "Прямая зона, удобна для фарма: Ctrl+клик по входу и «Новая» — зона обновится",
  "open the chest and kill the monsters that spawn":
    "Откройте сундук и убейте появившихся монстров",
  "do not stand in front of its head":
    "Не стойте перед его мордой",
  "after the kill take the item from the device in the room that opens":
    "После убийства заберите предмет из устройства в открывшейся комнате",
  "after this fight resistances drop by another 30%: get elemental resistances to 75%":
    "После боя сопротивления снова снижаются на 30%: добейте стихийные до 75%",
  "from now on a death costs 10% of the current level's experience":
    "Теперь смерть стоит 10% опыта текущего уровня",
  "with the quest":
    "с квестом",
  "after the kill activate":
    "После убийства активируйте",
  "to get the quest item":
    "— получите квестовый предмет",
  "first character only: free the caged":
    "Только для первого персонажа: освободите из клетки класс",
  "to unlock the class":
    "— он станет доступен для игры",
  "afterwards":
    "После этого",
  "sells every basic skill and support gem":
    "продаёт любые базовые камни умений и поддержки",
  "press y. major:":
    "Клавиша Y. Старший бог:",
  "(stun immunity). minor:":
    "(защита от оглушения). Младший:",
  "(life flask charges)":
    "(заряды флаконов здоровья)",
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
