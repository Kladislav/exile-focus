import { ChevronLeft, ChevronRight } from "lucide-react";

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

/** Номер набора, чьё название покрывает текущий акт («ACT 1-3», «Акт 4», «act 6-10»). */
export function setForAct(names: string[], act: number): number | null {
  for (let i = 0; i < names.length; i++) {
    const m = /(?:act|акт)\s*(\d+)(?:\s*[-–—]\s*(\d+))?/i.exec(names[i]);
    if (!m) continue;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    if (act >= from && act <= to) return i;
  }
  return null;
}
