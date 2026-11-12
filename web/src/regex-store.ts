import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SELECTION, LINK_OPTIONS, MOVEMENT_TIERS, type RegexSelection } from "./route/search-strings";

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
    {
      name: "exile-focus-regex",
      version: 4,
      // v2: остались только ступени скорости 10% и 15%; v3: убраны типы оружия;
      // v4: связки билда вынесены в отдельную строку.
      migrate: (state) => {
        const { weapons: _weapons, ...s } = state as RegexSelection & { weapons?: unknown };
        const tiers = new Set<string>(MOVEMENT_TIERS.map((m) => m.id));
        const links = new Set<string>(LINK_OPTIONS);
        return {
          ...s,
          links: (s.links ?? []).filter((l) => links.has(l)),
          movement: (s.movement ?? []).filter((m) => tiers.has(m)),
        } as never;
      },
    },
  ),
);
