// Где игрок получает гем: по готовому маршруту (награда или покупка после квеста),
// а если в маршруте гема нет — у Лилии Рот в 6 акте или нигде.

import { Data } from "common";
import type { FocusRoute } from "./build";

export type GemSource =
  | { kind: "quest" | "vendor"; questId: string; npc: string; act: number }
  /** В маршруте нет, но гем есть в наградах квестов — после 6 акта его продаёт Лилия Рот. */
  | { kind: "lilly" }
  /** Ни в наградах, ни у торговцев: только находка (ваал-гемы, особые поддержки и т.п.). */
  | { kind: "drop" };

/** Гемы, которые хоть кому-то дают или продают за квесты. */
let sold: Set<string> | null = null;
function soldGems() {
  if (sold) return sold;
  sold = new Set();
  for (const quest of Object.values(Data.Quests)) {
    for (const offer of Object.values(quest.reward_offers)) {
      if (!offer) continue;
      for (const id of Object.keys(offer.quest)) sold.add(id);
      for (const id of Object.keys(offer.vendor)) sold.add(id);
    }
  }
  return sold;
}

/** Первое место в маршруте, где игрок берёт или покупает каждый гем. */
export function routeGemSources(route: FocusRoute): Map<string, GemSource> {
  const result = new Map<string, GemSource>();
  for (const step of route.steps) {
    if (!step.gems.length) continue;
    const quests = step.step.parts.flatMap((p) => (typeof p !== "string" && p.type === "quest" ? [p] : []));
    for (const gem of step.gems) {
      const id = gem.requiredGem.id;
      if (result.has(id)) continue;
      for (const q of quests) {
        const offer = q.rewardOffers
          .map((o) => Data.Quests[q.questId]?.reward_offers[o])
          .find((o) => o && (gem.rewardType === "quest" ? o.quest[id] : o.vendor[id]));
        if (!offer) continue;
        const npc = gem.rewardType === "quest" ? offer.quest_npc : (offer.vendor[id]?.npc ?? offer.quest_npc);
        result.set(id, { kind: gem.rewardType, questId: q.questId, npc, act: step.sectionIndex + 1 });
        break;
      }
    }
  }
  return result;
}

export function gemSource(sources: Map<string, GemSource>, id: string): GemSource {
  return sources.get(id) ?? (soldGems().has(id) ? { kind: "lilly" } : { kind: "drop" });
}
