import type { RouteData } from "common";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_BUILD_DATA } from "./route/build";

export type Panel = "list" | "gems" | "build" | "help" | null;

interface ProgressState {
  /** Индекс текущего (ещё не выполненного) шага. */
  pointer: number;
  buildData: RouteData.BuildData;
  requiredGems: RouteData.RequiredGem[];
  gemLinks: RouteData.GemLinkGroup[];
  pobCode: string | null;
  showSubsteps: boolean;

  setPointer: (pointer: number) => void;
  setBuild: (build: {
    buildData: RouteData.BuildData;
    requiredGems: RouteData.RequiredGem[];
    gemLinks: RouteData.GemLinkGroup[];
    pobCode: string | null;
  }) => void;
  setBuildData: (patch: Partial<RouteData.BuildData>) => void;
  toggleSubsteps: () => void;
  resetAll: () => void;
}

const INITIAL = {
  pointer: 0,
  buildData: DEFAULT_BUILD_DATA,
  requiredGems: [],
  gemLinks: [],
  pobCode: null,
  showSubsteps: true,
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
      toggleSubsteps: () => set((s) => ({ showSubsteps: !s.showSubsteps })),
      resetAll: () => set(INITIAL),
    }),
    { name: "exile-focus", version: 1 },
  ),
);

export const useUi = create<{ panel: Panel; setPanel: (p: Panel) => void }>(
  (set) => ({
    panel: null,
    setPanel: (panel) => set({ panel }),
  }),
);
