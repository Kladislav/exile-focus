import {
  Data,
  buildGemSteps,
  findCharacterGems,
  getRouteFiles,
  initializeRouteState,
  parseRoute,
  type RouteData,
} from "common";

const ROUTE_SOURCES = import.meta.glob<string>(
  "../../../upstream/common/data/routes/*.txt",
  { query: "?raw", import: "default", eager: true },
);

function actNumber(path: string) {
  return Number(/act-(\d+)\.txt$/.exec(path)?.[1] ?? 0);
}

const DEFAULT_ROUTE_FILES = getRouteFiles(
  Object.entries(ROUTE_SOURCES)
    .sort(([a], [b]) => actNumber(a) - actNumber(b))
    .map(([, source]) => source),
);

/** Один «экран» фокус-режима: шаг маршрута и гемы, которые к нему относятся. */
export interface FocusStep {
  index: number;
  sectionIndex: number;
  step: RouteData.FragmentStep;
  gems: RouteData.GemStep[];
  /** Индекс перехода в новую зону, если шаг его начинает. */
  edgeIndex: number | null;
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
  library: true,
};

export function buildFocusRoute(
  buildData: RouteData.BuildData,
  requiredGems: RouteData.RequiredGem[],
): FocusRoute {
  const state = initializeRouteState();
  if (buildData.leagueStart) state.preprocessorDefinitions.add("LEAGUE_START");
  if (buildData.library) state.preprocessorDefinitions.add("LIBRARY");
  state.preprocessorDefinitions.add(
    buildData.bandit === "None"
      ? "BANDIT_KILL"
      : `BANDIT_${buildData.bandit.toUpperCase()}`,
  );

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
    for (const step of section.steps) {
      if (step.type !== "fragment_step") continue;

      const gems: RouteData.GemStep[] = [];
      if (withGems) {
        for (const part of step.parts) {
          if (typeof part !== "string" && part.type === "quest") {
            gems.push(
              ...buildGemSteps(part, buildData, requiredGems, questGems, vendorGems),
            );
          }
        }
      }

      if (step.edgeIndex !== null) edgeStep[step.edgeIndex] = steps.length;
      steps.push({
        index: steps.length,
        sectionIndex,
        step,
        gems,
        edgeIndex: step.edgeIndex,
      });
    }
    sections.push({
      name: section.name,
      firstStep,
      stepCount: steps.length - firstStep,
    });
  });

  return { steps, sections, edges: route.edges, edgeStep };
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
export function minAreaLevel(areaLevel: number) {
  return Math.max(1, areaLevel - (3 + Math.floor(areaLevel / 16)));
}
