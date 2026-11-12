import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SELECTION, type RegexSelection } from "./route/search-strings";

type Key = keyof RegexSelection;

/** Выбор в конструкторе Regex; запоминается между сессиями. */
export const useRegex = create<
  RegexSelection & {
    toggle: <K extends Key>(key: K, value: RegexSelection[K][number]) => void;
    reset: () => void;
  }
>()(
  persist(
    (set) => ({
      ...DEFAULT_SELECTION,
      toggle: (key, value) =>
        set((s) => {
          const list = s[key] as string[];
          const next = list.includes(value as string) ? list.filter((x) => x !== value) : [...list, value as string];
          return { [key]: next } as Partial<RegexSelection>;
        }),
      reset: () => set(DEFAULT_SELECTION),
    }),
    { name: "exile-focus-regex", version: 1 },
  ),
);
