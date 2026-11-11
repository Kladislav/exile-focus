import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "ru";
export type Theme = "system" | "light" | "dark";
export type Hints = "current" | "all" | "off";

interface SettingsState {
  uiLang: Lang;
  gameLang: Lang;
  theme: Theme;
  hints: Hints;
  set: (patch: Partial<Omit<SettingsState, "set">>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // По умолчанию английский; выбор пользователя сохраняется.
      uiLang: "en",
      gameLang: "en",
      theme: "system",
      hints: "all",
      set: (patch) => set(patch),
    }),
    {
      name: "exile-focus-settings",
      version: 2,
      // v2: подсказки по умолчанию у всех шагов (раньше только у текущего).
      migrate: (state, version) => {
        const s = state as Partial<SettingsState>;
        return (version < 2 ? { ...s, hints: "all" } : s) as SettingsState;
      },
    },
  ),
);

export const HINT_ORDER: Hints[] = ["current", "all", "off"];
