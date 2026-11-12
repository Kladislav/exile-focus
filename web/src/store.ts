import type { RouteData } from "common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BUILD_DATA } from "./route/build";

export type Panel = "gems" | "build" | "settings" | null;

interface ProgressState {
  /** Индекс текущего (ещё не выполненного) шага. */
  pointer: number;
  buildData: RouteData.BuildData;
  requiredGems: RouteData.RequiredGem[];
  gemLinks: RouteData.GemLinkGroup[];
  buildTrees: RouteData.BuildTree[];
  pobCode: string | null;

  setPointer: (pointer: number) => void;
  setBuild: (build: {
    buildData: RouteData.BuildData;
    requiredGems: RouteData.RequiredGem[];
    gemLinks: RouteData.GemLinkGroup[];
    buildTrees: RouteData.BuildTree[];
    pobCode: string | null;
  }) => void;
  setBuildData: (patch: Partial<RouteData.BuildData>) => void;
  resetAll: () => void;
}

const INITIAL = {
  pointer: 0,
  buildData: DEFAULT_BUILD_DATA,
  requiredGems: [],
  gemLinks: [],
  buildTrees: [],
  pobCode: null,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...INITIAL,
      setPointer: (pointer) => set({ pointer: Math.max(0, pointer) }),
      // Маршрут перестраивается, индексы шагов меняются: прогресс сбрасываем.
      setBuild: (build) => set({ ...build, pointer: 0 }),
      setBuildData: (patch) =>
        set((s) => ({ buildData: { ...s.buildData, ...patch }, pointer: 0 })),
      resetAll: () => set(INITIAL),
    }),
    { name: "exile-focus", version: 1 },
  ),
);

export type SidebarTab = "tree" | "gems" | "search";
const SIDEBAR_TABS: SidebarTab[] = ["tree", "gems", "search"];

/** Вкладка панели билда хранится в адресе (?tab=gems), чтобы переживать перезагрузку. */
function tabFromUrl(): SidebarTab {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return SIDEBAR_TABS.includes(tab as SidebarTab) ? (tab as SidebarTab) : "tree";
}

function tabToUrl(tab: SidebarTab) {
  const url = new URL(window.location.href);
  if (tab === "tree") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  window.history.replaceState(null, "", url);
}

export const useUi = create<{
  panel: Panel;
  setPanel: (p: Panel) => void;
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;
}>((set) => ({
  panel: null,
  setPanel: (panel) => set({ panel }),
  sidebarTab: tabFromUrl(),
  setSidebarTab: (sidebarTab) => {
    tabToUrl(sidebarTab);
    set({ sidebarTab });
  },
}));
