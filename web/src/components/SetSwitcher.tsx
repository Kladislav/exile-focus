import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

/** Переключатель наборов из PoB (например «ACT 1-3» → «ACT 4-6»). */
export function SetSwitcher({
  names,
  index,
  onIndex,
}: {
  names: string[];
  index: number;
  onIndex: (i: number) => void;
}) {
  if (names.length === 0) return null;
  return (
    <div className="set-switcher">
      <button className="icon-btn" disabled={index <= 0} onClick={() => onIndex(index - 1)} aria-label="Previous">
        <ChevronLeft size={18} />
      </button>
      <span className="set-name" title={names[index]}>
        {names[index]}
        {names.length > 1 && (
          <span className="set-count">
            {" "}
            {index + 1}/{names.length}
          </span>
        )}
      </span>
      <button
        className="icon-btn"
        disabled={index >= names.length - 1}
        onClick={() => onIndex(index + 1)}
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

type SetRange = { kind: "act" | "level"; from: number; to: number };

const NUM_RANGE = String.raw`(\d+)\s*(?:(?:[-–—]|to|до)\s*(\d+)|(\+))?`;
const ACT_RE = new RegExp(String.raw`(?:act|акт)\s*` + NUM_RANGE, "i");
// «lvl 12-24», «level 30+», «lv20», «ур. 20», «уровень 12-24»
const LEVEL_BEFORE_RE = new RegExp(String.raw`(?:lvl|level|lv|ур(?:овень|\.)?)\s*` + NUM_RANGE, "i");
// «38+ lvl», «12-24 level», «20 ур»
const LEVEL_AFTER_RE = new RegExp(NUM_RANGE + String.raw`\s*(?:lvl|level|lv|ур)`, "i");

/** Что покрывает набор по названию из PoB: акты («ACT 1-3») или уровни («38+ lvl», «lvl 12-24»). */
export function parseSetRange(name: string): SetRange | null {
  const range = (kind: SetRange["kind"], m: RegExpExecArray): SetRange => {
    const from = Number(m[1]);
    return { kind, from, to: m[3] ? Infinity : m[2] ? Number(m[2]) : kind === "act" ? from : Infinity };
  };
  const act = ACT_RE.exec(name);
  if (act) return range("act", act);
  const level = LEVEL_BEFORE_RE.exec(name) ?? LEVEL_AFTER_RE.exec(name);
  return level ? range("level", level) : null;
}

/**
 * Набор под текущий прогресс: сначала по акту, иначе по уровню персонажа.
 * Если уровнем подходят несколько («12+ lvl», «38+ lvl»), берём с самой высокой нижней границей.
 */
export function setForProgress(names: string[], act: number, level: number | null): number | null {
  const ranges = names.map(parseSetRange);
  const byAct = ranges.findIndex((r) => r?.kind === "act" && act >= r.from && act <= r.to);
  if (byAct >= 0) return byAct;
  if (level === null) return null;
  let best: number | null = null;
  ranges.forEach((r, i) => {
    if (r?.kind !== "level" || level < r.from || level > r.to) return;
    if (best === null || r.from > ranges[best]!.from) best = i;
  });
  return best;
}

/**
 * Очки пассивок за квесты, полученные до начала акта `act` (без бандитов).
 * Примерно: 1 акт — 2, 2 — 2, 3 — 3, 4 — 2, 5 — 1, 6 — 3, 7 — 3, 8 — 2, 9 — 2, 10 — 1.
 */
const QUEST_POINTS_BY_ACT = [2, 2, 3, 2, 1, 3, 3, 2, 2, 1];
export function questPointsBefore(act: number) {
  return QUEST_POINTS_BY_ACT.slice(0, Math.max(0, act - 1)).reduce((a, b) => a + b, 0);
}

/** Набор без подсказки в названии: самый большой, на который хватает очков (с запасом в 2). */
export function setForPoints(points: number[], available: number): number | null {
  let best: number | null = null;
  points.forEach((p, i) => {
    if (p <= available + 2 && (best === null || p > points[best])) best = i;
  });
  return best;
}

/**
 * Номер набора: по умолчанию подходящий к акту или уровню персонажа
 * (для деревьев без подсказки в названии — по числу очков);
 * ручной выбор действует, пока автоматический выбор не сменится.
 */
export function useAutoSet(names: string[], act: number, level: number | null, points?: number[]) {
  const auto =
    setForProgress(names, act, level) ??
    (points && level !== null ? setForPoints(points, level - 1 + questPointsBefore(act)) : null) ??
    0;
  const [manual, setManual] = useState<{ auto: number; index: number } | null>(null);
  const index = manual && manual.auto === auto ? manual.index : auto;
  return [Math.min(index, Math.max(names.length - 1, 0)), (i: number) => setManual({ auto, index: i })] as const;
}
