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

const browserLang: Lang = navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      uiLang: browserLang,
      gameLang: browserLang,
      theme: "system",
      hints: "current",
      set: (patch) => set(patch),
    }),
    { name: "exile-focus-settings", version: 1 },
  ),
);

export const HINT_ORDER: Hints[] = ["current", "all", "off"];
