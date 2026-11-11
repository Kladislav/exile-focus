import { Data } from "common";
import { useSettings, type Lang } from "../settings";
import GAME_RU from "./game-ru.json";
import { translateRoutePhrase } from "./route-ru";

export type { Lang };

const UI = {
  en: {
    act: "Act {0}",
    connectLog: "Connect Client.txt",
    logLive: "Live",
    logLiveTitle: "Reading Client.txt",
    logResume: "Resume log",
    logError: "Log error, reconnect",
    logUnsupported: "No auto-progress",
    logUnsupportedTitle: "Auto-progress needs Chrome or Edge",
    importBuild: "Import build",
    gemLinks: "Build: gems and tree",
    build: "Build & settings",
    help: "Help",
    close: "Close",
    route: "Route",
    level: "Lv {0}",
    monsterLevel: "Monster level",
    take: "Take",
    buy: "Buy",
    vendorSearch: "Vendor search",
    copied: "Copied",
    copy: "Copy",
    logout: "Logout",
    ascendVerb: "Complete",
    labLayout: "Lab layout",
    crafting: "Recipe",
    routeComplete: "🎉 Route complete. Good luck in maps! 🗺️",
    setCurrent: "Mark as current step",
    unknownGem: "Unknown gem {0}",
    noGemLinks: "Import a Path of Building code to see gem links.",
    pob: "Path of Building",
    pobPlaceholder: "Paste PoB export code",
    import: "Import",
    pobLinkUnsupported: "Links are not supported yet: open the build in Path of Building and copy the code.",
    pobInvalid: "Could not read this code.",
    pobImported: "Imported {0}: {1} gems. Progress reset.",
    routeOptions: "Route options",
    routeOptionsHint: "Changing these rebuilds the route and resets progress.",
    leagueStart: "League start",
    library: "Library quest in Act 3",
    bandits: "Bandits",
    banditKill: "Kill all",
    banditHelp: "Help {0}",
    hints: "Hints under steps",
    hintsCurrent: "Current step only",
    hintsAll: "Steps not done yet",
    hintsOff: "Hidden",
    logLinked: "Linked: {0}.",
    logNotLinked: "Not linked.",
    logWhere: "Find it in",
    unlinkLog: "Unlink log",
    reset: "Reset",
    resetAll: "Reset everything",
    resetConfirm: "Reset build and progress?",
    keys: "Keys",
    keyNext: "Step done",
    keyBack: "Step back",
    keyHints: "Cycle hints",
    keyHelp: "This help",
    keySettings: "Settings",
    settings: "Settings",
    keyClose: "Close panel",
    autoProgress: "Auto-progress",
    autoProgressText:
      "Click Connect Client.txt (Chrome or Edge) and pick the game log. Each time you enter the next zone of the route, the list moves on by itself. Portals back to town outside the route are ignored. You can also click any step to make it current.",
    credits: "Credits",
    creditsText: "Route and game data: {0} by HeartofPhos (MIT).",
    uiLanguage: "Interface language",
    gameLanguage: "Game language: zone, quest, gem names",
    theme: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    stepsDone: "{0} of {1}",
    progress: "Progress",
    dirUp: "Up",
    dirUpRight: "Up and right",
    dirRight: "Right",
    dirDownRight: "Down and right",
    dirDown: "Down",
    dirDownLeft: "Down and left",
    dirLeft: "Left",
    dirUpLeft: "Up and left",
    optional: "optional",
    optionalForBuild: "for your build",
    optionalHint: "Optional quest: do it only if your build needs one of these gems.",
    optionalNeeded: "Included because your build gets these gems here:",
    optionalReward: "Quest reward",
    optionalVendor: "Sold by vendor afterwards",
    optionalVendorMany: "{0} gems, almost any you may need",
    buildInfo: "Build",
    replaceBuild: "Replace build",
    importedTitle: "{0} imported",
    importedText: "Gem rewards are on the quest steps now. Progress was reset to the start of the route.",
    importFailed: "Could not import",
    pobHelp: "In Path of Building: Import/Export Build → Generate → Copy, then paste the code here.",
    cancel: "Cancel",
    leagueStartHint: "Trials of Ascendancy and the Quicksilver Flask quest along the way",
    banditBonusKill: "+1 passive skill point",
    banditBonusAlira: "+15% to all elemental resistances",
    banditBonusKraityn: "+8% movement speed",
    banditBonusOak: "+40 maximum life",
    logStatusOn: "Reading {0}",
    logStatusPermission: "File is linked, allow access again after reload",
    importPob: "Import Path of Building",
    buildEmptyText: "Import a Path of Building code: gem links per set and the passive tree will show up here, and gem rewards will appear on quest steps.",
    tabGems: "Gems",
    tabTree: "Tree",
    tabSearch: "Search",
    searchHelp: "Copy a string and paste it into the vendor's search box (Ctrl+F): matching items light up.",
    searchForBuild: "For your main link",
    searchCombined: "Everything useful in one string",
    searchCombinedHint: "3 links, movement speed, life, resistances",
    searchCombinedBuild: "3 links in your colours, movement speed, life, resistances",
    searchCommon: "Useful for everyone",
    search_build3: "3 linked sockets in your colours",
    search_build4: "4 linked sockets in your colours",
    search_links3: "3 linked sockets",
    search_links4: "4 linked sockets",
    search_movement: "Movement speed (boots)",
    actComplete: "Complete",
    noTree: "Could not show the passive tree:",
    noTreeImported: "This build was imported before trees were supported. Import it again in Build & settings (B).",
    treeBadVersion: "tree version is not supported",
    treeEmpty: "no passives in this set",
    treeError: "could not read the tree link",
    treeAdded: "New in this set",
    treeTaken: "Already taken",
    treeRemoved: "Refund",
    treeRemovedHint: "Taken in the previous set, not in this one",
    treeHint: "Hover a node to see it. Scroll to zoom, drag to move.",
  },
  ru: {
    act: "Акт {0}",
    connectLog: "Подключить Client.txt",
    logLive: "Лог",
    logLiveTitle: "Читаю Client.txt",
    logResume: "Продолжить лог",
    logError: "Ошибка лога, переподключить",
    logUnsupported: "Без автопрогресса",
    logUnsupportedTitle: "Автопрогресс работает в Chrome или Edge",
    importBuild: "Импорт билда",
    gemLinks: "Билд: гемы и дерево",
    build: "Билд и настройки",
    help: "Справка",
    close: "Закрыть",
    route: "Маршрут",
    level: "Ур. {0}",
    monsterLevel: "Уровень монстров",
    take: "Взять",
    buy: "Купить",
    vendorSearch: "Поиск у торговца",
    copied: "Скопировано",
    copy: "Копировать",
    logout: "Выйти в меню",
    ascendVerb: "Пройти",
    labLayout: "Схема лабиринта",
    crafting: "Рецепт",
    routeComplete: "🎉 Маршрут пройден. Удачи в картах! 🗺️",
    setCurrent: "Сделать текущим шагом",
    unknownGem: "Неизвестный гем {0}",
    noGemLinks: "Импортируйте код Path of Building, чтобы увидеть связки.",
    pob: "Path of Building",
    pobPlaceholder: "Вставьте код экспорта PoB",
    import: "Импортировать",
    pobLinkUnsupported: "Ссылки пока не поддерживаются: откройте билд в Path of Building и скопируйте код.",
    pobInvalid: "Не удалось прочитать код.",
    pobImported: "Импортирован {0}: гемов {1}. Прогресс сброшен.",
    routeOptions: "Настройки маршрута",
    routeOptionsHint: "При изменении маршрут перестраивается, прогресс сбрасывается.",
    leagueStart: "Старт лиги",
    library: "Квест библиотеки в 3 акте",
    bandits: "Бандиты",
    banditKill: "Убить всех",
    banditHelp: "Помочь: {0}",
    hints: "Подсказки под шагами",
    hintsCurrent: "Только у текущего",
    hintsAll: "У невыполненных",
    hintsOff: "Скрыть",
    logLinked: "Подключён: {0}.",
    logNotLinked: "Не подключён.",
    logWhere: "Файл лежит в",
    unlinkLog: "Отключить лог",
    reset: "Сброс",
    resetAll: "Сбросить всё",
    resetConfirm: "Сбросить билд и прогресс?",
    keys: "Клавиши",
    keyNext: "Шаг выполнен",
    keyBack: "Шаг назад",
    keyHints: "Режим подсказок",
    keyHelp: "Эта справка",
    keySettings: "Настройки",
    settings: "Настройки",
    keyClose: "Закрыть панель",
    autoProgress: "Автопрогресс",
    autoProgressText:
      "Нажмите «Подключить Client.txt» (Chrome или Edge) и выберите лог игры. Когда входите в следующую зону маршрута, список сам переходит дальше. Порталы в город вне маршрута не учитываются. Текущий шаг можно выбрать и кликом.",
    credits: "Авторы",
    creditsText: "Маршрут и данные игры: {0}, автор HeartofPhos (MIT).",
    uiLanguage: "Язык интерфейса",
    gameLanguage: "Язык игры: зоны, квесты, гемы",
    theme: "Тема",
    themeSystem: "Системная",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    stepsDone: "{0} из {1}",
    progress: "Прогресс",
    dirUp: "Вверх",
    dirUpRight: "Вправо-вверх",
    dirRight: "Вправо",
    dirDownRight: "Вправо-вниз",
    dirDown: "Вниз",
    dirDownLeft: "Влево-вниз",
    dirLeft: "Влево",
    dirUpLeft: "Влево-вверх",
    optional: "необязательно",
    optionalForBuild: "для билда",
    optionalHint: "Необязательный квест: делайте, только если билду нужен один из этих гемов.",
    optionalNeeded: "Включён, потому что билд получает здесь эти гемы:",
    optionalReward: "Награда за квест",
    optionalVendor: "Потом у торговца",
    optionalVendorMany: "{0} гемов, почти любой нужный",
    buildInfo: "Билд",
    replaceBuild: "Заменить билд",
    importedTitle: "{0}: билд импортирован",
    importedText: "Награды гемами теперь у шагов с квестами. Прогресс сброшен на начало маршрута.",
    importFailed: "Не удалось импортировать",
    pobHelp: "В Path of Building: Import/Export Build → Generate → Copy, затем вставьте код сюда.",
    cancel: "Отмена",
    leagueStartHint: "Испытания восхождения и квест на Ртутный флакон по пути",
    banditBonusKill: "+1 очко пассивных умений",
    banditBonusAlira: "+15% ко всем сопротивлениям стихиям",
    banditBonusKraityn: "+8% к скорости передвижения",
    banditBonusOak: "+40 к максимуму здоровья",
    logStatusOn: "Читаю {0}",
    logStatusPermission: "Файл выбран, после перезагрузки нужно снова разрешить доступ",
    importPob: "Импорт Path of Building",
    buildEmptyText: "Импортируйте код Path of Building: здесь появятся связки гемов по наборам и дерево пассивок, а награды гемами — у шагов с квестами.",
    tabGems: "Гемы",
    tabTree: "Дерево",
    tabSearch: "Поиск",
    searchHelp: "Скопируйте строку и вставьте в поиск в окне торговца (Ctrl+F): подходящие предметы подсветятся.",
    searchForBuild: "Под основную связку",
    searchCombined: "Всё полезное одной строкой",
    searchCombinedHint: "3 связанных гнезда, скорость передвижения, здоровье, сопротивления",
    searchCombinedBuild: "3 связанных гнезда ваших цветов, скорость передвижения, здоровье, сопротивления",
    searchCommon: "Полезно всем",
    search_build3: "3 связанных гнезда ваших цветов",
    search_build4: "4 связанных гнезда ваших цветов",
    search_links3: "3 связанных гнезда",
    search_links4: "4 связанных гнезда",
    search_movement: "Скорость передвижения (ботинки)",
    actComplete: "Пройден",
    noTree: "Не удалось показать дерево:",
    noTreeImported: "Билд импортирован до поддержки деревьев. Импортируйте его заново в «Билд и настройки» (B).",
    treeBadVersion: "версия дерева не поддерживается",
    treeEmpty: "в наборе нет пассивок",
    treeError: "не удалось разобрать ссылку на дерево",
    treeAdded: "Новое в этом наборе",
    treeTaken: "Уже взято",
    treeRemoved: "Снять",
    treeRemovedHint: "Было в прошлом наборе, в этом нет",
    treeHint: "Наведите на ноду, чтобы увидеть её. Колесо — масштаб, перетаскивание — сдвиг.",
  },
} satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof UI)["en"];

const COUNT_FORMS = {
  en: { gem: ["gem", "gems"], set: ["set", "sets"], tree: ["tree", "trees"] },
  ru: { gem: ["гем", "гема", "гемов"], set: ["набор", "набора", "наборов"], tree: ["дерево", "дерева", "деревьев"] },
} as const;

/** «36 гемов», «4 дерева», «1 set». */
export function count(lang: Lang, n: number, kind: keyof (typeof COUNT_FORMS)["en"]) {
  if (lang === "en") return `${n} ${COUNT_FORMS.en[kind][n === 1 ? 0 : 1]}`;
  const forms = COUNT_FORMS.ru[kind];
  const mod10 = n % 10;
  const mod100 = n % 100;
  const form = mod10 === 1 && mod100 !== 11 ? 0 : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 1 : 2;
  return `${n} ${forms[form]}`;
}

export function format(template: string, ...args: (string | number)[]) {
  return template.replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i)] ?? ""));
}

export function translate(lang: Lang, key: UiKey, ...args: (string | number)[]) {
  return format(UI[lang][key] ?? UI.en[key], ...args);
}

/** Названия из игры (зоны, квесты, гемы, NPC, боссы) на языке игры. */
export interface GameNames {
  area(id: string): string;
  quest(id: string): string;
  gem(id: string): string;
  term(en: string): string;
}

const ENGLISH: GameNames = {
  area: (id) => Data.Areas[id]?.name ?? id,
  quest: (id) => Data.Quests[id]?.name ?? id,
  gem: (id) => Data.Gems[id]?.name ?? id,
  term: (en) => en,
};

const RU = GAME_RU as {
  areas: Record<string, string>;
  quests: Record<string, string>;
  gems: Record<string, string>;
  text: Record<string, string>;
};

const RUSSIAN: GameNames = {
  area: (id) => RU.areas[id] ?? ENGLISH.area(id),
  quest: (id) => RU.quests[id] ?? ENGLISH.quest(id),
  gem: (id) => RU.gems[id] ?? ENGLISH.gem(id),
  term: (en) => RU.text[en] ?? en,
};

export interface I18n {
  ui: Lang;
  t: (key: UiKey, ...args: (string | number)[]) => string;
  game: GameNames;
  /** Текст маршрута (не игровые названия) на языке интерфейса. */
  phrase: (text: string, context?: string) => string;
  /** "Act 3" -> "Акт 3". */
  section: (name: string) => string;
}

export function makeI18n(ui: Lang, gameLang: Lang): I18n {
  const t = (key: UiKey, ...args: (string | number)[]) => translate(ui, key, ...args);
  return {
    ui,
    t,
    game: gameLang === "ru" ? RUSSIAN : ENGLISH,
    phrase: ui === "ru" ? translateRoutePhrase : (text) => text,
    section: (name) => {
      const m = /^Act (\d+)$/.exec(name);
      return m ? t("act", m[1]) : name;
    },
  };
}

const cache = new Map<string, I18n>();

export function useI18n(): I18n {
  const ui = useSettings((s) => s.uiLang);
  const gameLang = useSettings((s) => s.gameLang);
  const key = `${ui}:${gameLang}`;
  let value = cache.get(key);
  if (!value) {
    value = makeI18n(ui, gameLang);
    cache.set(key, value);
  }
  return value;
}
