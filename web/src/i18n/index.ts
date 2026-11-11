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
    ascend: "Ascend",
    labLayout: "Lab layout",
    crafting: "Recipe",
    routeComplete: "Route complete. Good luck in maps!",
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
    leagueStart: "League start (extra early-game detours)",
    library: "Library quest in Act 3",
    bandits: "Bandits",
    banditKill: "Kill all",
    banditHelp: "Help {0}",
    hints: "Hints under steps",
    hintsCurrent: "Current step only",
    hintsAll: "All steps",
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
    buildInfo: "Build",
    tabGems: "Gems",
    tabTree: "Tree",
    noTree: "No passive tree in this build, or its tree version is not supported.",
    treeAdded: "New in this set",
    treeTaken: "Already taken",
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
    ascend: "Восхождение",
    labLayout: "Схема лабиринта",
    crafting: "Рецепт",
    routeComplete: "Маршрут пройден. Удачи в картах!",
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
    leagueStart: "Старт лиги (дополнительные заходы в начале)",
    library: "Квест библиотеки в 3 акте",
    bandits: "Бандиты",
    banditKill: "Убить всех",
    banditHelp: "Помочь: {0}",
    hints: "Подсказки под шагами",
    hintsCurrent: "Только у текущего",
    hintsAll: "У всех шагов",
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
    buildInfo: "Билд",
    tabGems: "Гемы",
    tabTree: "Дерево",
    noTree: "В билде нет дерева пассивок или его версия не поддерживается.",
    treeAdded: "Новое в этом наборе",
    treeTaken: "Уже взято",
    treeHint: "Наведите на ноду, чтобы увидеть её. Колесо — масштаб, перетаскивание — сдвиг.",
  },
} satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof UI)["en"];

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
