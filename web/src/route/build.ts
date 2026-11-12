import { ESSENTIAL_RECIPES } from "./crafting";
import {
  Data,
  buildGemSteps,
  findCharacterGems,
  getRouteFiles,
  initializeRouteState,
  parseRoute,
  type Fragments,
  type RouteData,
} from "common";

// Свой маршрут: копия upstream с правками (см. scripts/route-diff.sh).
const ROUTE_SOURCES = import.meta.glob<string>("./routes/*.txt", {
  query: "?raw",
  import: "default",
  eager: true,
});

function actNumber(path: string) {
  return Number(/act-(\d+)\.txt$/.exec(path)?.[1] ?? 0);
}

const DEFAULT_ROUTE_FILES = getRouteFiles(
  Object.entries(ROUTE_SOURCES)
    .sort(([a], [b]) => actNumber(a) - actNumber(b))
    .map(([, source]) => source),
);

/**
 * Квесты, которые дают только гемы. В маршруте они обёрнуты в
 * `#ifdef OPT_<id>`: без билда показываются с пометкой, с билдом
 * включаются, только если дают нужный гем раньше, чем остальной маршрут.
 */
export const OPTIONAL_QUESTS = ["a2q6", "a2q4", "a3q8", "a3q12"] as const;

export interface OptionalInfo {
  questId: string;
  /** Гемы билда, ради которых квест включён (пусто, если билда нет). */
  neededGems: string[];
  /** Что квест даёт классу: награда и товар у торговца. */
  questGems: string[];
  vendorGems: string[];
}

/** Один шаг маршрута и гемы, которые к нему относятся. */
export interface FocusStep {
  index: number;
  sectionIndex: number;
  step: RouteData.FragmentStep;
  gems: RouteData.GemStep[];
  /** Индекс перехода в новую зону, если шаг его начинает. */
  edgeIndex: number | null;
  optional?: OptionalInfo;
}

export interface FocusSection {
  name: string;
  firstStep: number;
  stepCount: number;
}

export interface FocusRoute {
  steps: FocusStep[];
  sections: FocusSection[];
  /** edges[i]: ID зоны, в которую ведёт i-й переход. */
  edges: string[];
  /** edgeStep[i]: индекс шага, начинающего i-й переход. */
  edgeStep: number[];
}

export const DEFAULT_BUILD_DATA: RouteData.BuildData = {
  characterClass: "None",
  bandit: "Alira",
  leagueStart: true,
  library: false,
};

function definitions(buildData: RouteData.BuildData, optional: Set<string>) {
  const defs = new Set<string>();
  if (buildData.leagueStart) defs.add("LEAGUE_START");
  defs.add(buildData.bandit === "None" ? "BANDIT_KILL" : `BANDIT_${buildData.bandit.toUpperCase()}`);
  for (const q of optional) defs.add(`OPT_${q}`);
  // Обитель грехов во 2 акте нужна ради испытания (старт лиги) или Фиделитаса.
  if (buildData.leagueStart || optional.has("a2q6")) defs.add("VISIT_A2_CHAMBER_OF_SINS");
  return defs;
}

/** Шаг без ненужных рецептов; null, если в нём ничего не осталось. */
function filterCrafting(step: RouteData.FragmentStep): RouteData.FragmentStep | null {
  if (!step.parts.some((p) => typeof p !== "string" && p.type === "crafting")) return step;

  const parts = step.parts.flatMap<Fragments.AnyFragment>((p) => {
    if (typeof p === "string" || p.type !== "crafting") return [p];
    const recipes = p.crafting_recipes.filter((r) => ESSENTIAL_RECIPES.has(r));
    return recipes.length > 0 ? [{ ...p, crafting_recipes: recipes }] : [];
  });
  // Висящее «, get» / «Get» после удалённого рецепта.
  while (parts.length > 0 && typeof parts[parts.length - 1] === "string" && /^\s*,?\s*get\s*$/i.test(parts[parts.length - 1] as string)) {
    parts.pop();
  }
  if (step.edgeIndex === null && !parts.some((p) => typeof p !== "string")) return null;
  return { ...step, parts };
}

function assemble(
  buildData: RouteData.BuildData,
  requiredGems: RouteData.RequiredGem[],
  optional: Set<string>,
): FocusRoute {
  const state = initializeRouteState();
  for (const d of definitions(buildData, optional)) state.preprocessorDefinitions.add(d);
  const route = parseRoute(DEFAULT_ROUTE_FILES, state);

  const withGems = requiredGems.length > 0 && buildData.characterClass in Data.Characters;
  const questGems = new Set<number>();
  const vendorGems = new Set<number>();
  if (withGems) findCharacterGems(buildData, requiredGems, questGems);

  const steps: FocusStep[] = [];
  const sections: FocusSection[] = [];
  const edgeStep: number[] = [];

  route.sections.forEach((section, sectionIndex) => {
    const firstStep = steps.length;
    for (const raw of section.steps) {
      if (raw.type !== "fragment_step") continue;
      const step = filterCrafting(raw);
      if (!step) continue;

      const gems: RouteData.GemStep[] = [];
      if (withGems) {
        for (const part of step.parts) {
          if (typeof part !== "string" && part.type === "quest") {
            gems.push(...buildGemSteps(part, buildData, requiredGems, questGems, vendorGems));
          }
        }
      }

      if (step.edgeIndex !== null) edgeStep[step.edgeIndex] = steps.length;
      steps.push({ index: steps.length, sectionIndex, step, gems, edgeIndex: step.edgeIndex });
    }
    sections.push({ name: section.name, firstStep, stepCount: steps.length - firstStep });
  });

  return { steps, sections, edges: route.edges, edgeStep };
}

/** Гемы, которые квест даёт классу (или всем, если класс неизвестен). */
export function questOffers(questId: string, characterClass: string) {
  const quest = Data.Quests[questId];
  const fits = (classes: string[]) =>
    classes.length === 0 || !(characterClass in Data.Characters) || classes.includes(characterClass);
  const reward = new Set<string>();
  const vendor = new Set<string>();
  for (const offer of Object.values(quest?.reward_offers ?? {})) {
    if (!offer) continue;
    for (const [id, r] of Object.entries(offer.quest)) if (r && fits(r.classes) && Data.Gems[id]) reward.add(id);
    for (const [id, r] of Object.entries(offer.vendor)) if (r && fits(r.classes) && Data.Gems[id]) vendor.add(id);
  }
  return { questGems: [...reward], vendorGems: [...vendor] };
}

const stepKey = (s: FocusStep) => JSON.stringify(s.step.parts) + JSON.stringify(s.step.subSteps);

/** Индексы шагов `a`, которых нет в `b` (по наибольшей общей подпоследовательности). */
function extraSteps(a: FocusStep[], b: FocusStep[]): number[] {
  const ka = a.map(stepKey);
  const kb = b.map(stepKey);
  const n = ka.length;
  const m = kb.length;
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = ka[i] === kb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const extra: number[] = [];
  let i = 0;
  let j = 0;
  while (i < n) {
    if (j < m && ka[i] === kb[j]) {
      i++;
      j++;
    } else if (j < m && dp[i][j + 1] >= dp[i + 1][j]) j++;
    else extra.push(i++);
  }
  return extra;
}

export function buildFocusRoute(
  buildData: RouteData.BuildData,
  requiredGems: RouteData.RequiredGem[],
): FocusRoute {
  const withGems = requiredGems.length > 0 && buildData.characterClass in Data.Characters;
  const base = assemble(buildData, requiredGems, new Set());

  // Акт, в котором маршрут без опциональных квестов даёт каждый гем.
  const gemAct = new Map<string, number>();
  for (const s of base.steps)
    for (const g of s.gems) if (!gemAct.has(g.requiredGem.id)) gemAct.set(g.requiredGem.id, s.sectionIndex + 1);

  const info = new Map<string, OptionalInfo>();
  const included = new Set<string>();
  for (const questId of OPTIONAL_QUESTS) {
    const offers = questOffers(questId, buildData.characterClass);
    const act = Number(Data.Quests[questId]?.act ?? 0);
    const offered = new Set([...offers.questGems, ...offers.vendorGems]);
    const neededGems = withGems
      ? requiredGems
          .map((g) => g.id)
          .filter((id) => offered.has(id) && (gemAct.get(id) ?? Infinity) > act)
      : [];
    info.set(questId, { questId, neededGems: [...new Set(neededGems)], ...offers });
    if (!withGems || neededGems.length > 0) included.add(questId);
    // Гем, полученный здесь, следующим опциональным квестам уже не нужен.
    for (const id of neededGems) gemAct.set(id, act);
  }

  const route = included.size > 0 ? assemble(buildData, requiredGems, included) : base;

  // Помечаем шаги опциональных квестов: каждый квест по отдельности против базы.
  const keysByQuest = new Map<string, Set<string>>();
  for (const questId of included) {
    const single = assemble(buildData, [], new Set([questId]));
    const plain = assemble(buildData, [], new Set());
    keysByQuest.set(questId, new Set(extraSteps(single.steps, plain.steps).map((i) => stepKey(single.steps[i]))));
  }
  for (const i of extraSteps(route.steps, base.steps)) {
    const key = stepKey(route.steps[i]);
    for (const [questId, keys] of keysByQuest) {
      if (keys.has(key)) {
        route.steps[i].optional = info.get(questId);
        break;
      }
    }
  }
  return route;
}

/** Зона, в которой игрок находится перед выполнением шага `pointer`. */
export function edgeBefore(route: FocusRoute, pointer: number): number {
  for (let i = Math.min(pointer, route.steps.length) - 1; i >= 0; i--) {
    const edge = route.steps[i].edgeIndex;
    if (edge !== null) return edge;
  }
  return 0;
}

export function areaBefore(route: FocusRoute, pointer: number) {
  return Data.Areas[route.edges[edgeBefore(route, pointer)]];
}

const LOOKAHEAD_EDGES = 4;

/**
 * Куда сдвинуть указатель, когда лог сообщил о входе в зону `areaId`.
 * Следующий по маршруту переход принимаем всегда. Дальние переходы
 * (игрок пропустил шаги) принимаем только для не-городских зон: в город
 * часто возвращаются порталом вне маршрута.
 */
export function pointerForArea(
  route: FocusRoute,
  pointer: number,
  areaId: string,
): number | null {
  const current = edgeBefore(route, pointer);
  if (pointer > 0 && route.edges[current] === areaId) return null;

  const last = Math.min(current + LOOKAHEAD_EDGES, route.edges.length - 1);
  for (let edge = current + 1; edge <= last; edge++) {
    if (route.edges[edge] !== areaId) continue;
    const area = Data.Areas[areaId];
    if (edge > current + 1 && area?.is_town_area) return null;
    return route.edgeStep[edge] + 1;
  }
  return null;
}

/** Минимальный уровень монстров в зоне, как в оригинале. */
/** Самый высокий уровень зоны (не города), куда маршрут привёл до шага `pointer`: оценка уровня персонажа. */
export function reachedAreaLevel(route: FocusRoute, pointer: number): number | null {
  const last = edgeBefore(route, pointer);
  let level: number | null = null;
  for (let i = 0; i <= last && i < route.edges.length; i++) {
    const area = Data.Areas[route.edges[i]];
    if (area && !area.is_town_area) level = Math.max(level ?? 0, area.level);
  }
  return level;
}

export function minAreaLevel(areaLevel: number) {
  return Math.max(1, areaLevel - (3 + Math.floor(areaLevel / 16)));
}
