import { Check } from "lucide-react";
import { useI18n } from "../i18n";
import type { FocusRoute } from "../route/build";
import { useProgress } from "../store";
import { useScrollToAct } from "./RouteView";

/** Акты одинаковой ширины: номер, заливка по пройденным шагам, общий процент справа. */
export function ProgressRail({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const scrollToAct = useScrollToAct();
  const i18n = useI18n();
  const total = route.steps.length;
  const percent = Math.round((Math.min(pointer, total) / total) * 100);

  return (
    <nav className="acts" aria-label={i18n.t("route")}>
      <div className="acts-list">
        {route.sections.map((section, index) => {
          const done = Math.min(Math.max(pointer - section.firstStep, 0), section.stepCount);
          const complete = done === section.stepCount;
          const active = pointer >= section.firstStep && pointer < section.firstStep + section.stepCount;
          return (
            <button
              key={index}
              className={`act-pill ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
              title={`${i18n.section(section.name)}: ${i18n.t("stepsDone", done, section.stepCount)}`}
              onClick={() => scrollToAct(index)}
            >
              <span className="act-pill-fill" style={{ width: `${(done / section.stepCount) * 100}%` }} />
              <span className="act-pill-label">
                {complete && <Check size={13} strokeWidth={3} />}
                {section.name.replace(/^Act /, "")}
              </span>
            </button>
          );
        })}
      </div>
      <span className="acts-total" title={i18n.t("stepsDone", Math.min(pointer, total), total)}>
        {percent}%
      </span>
    </nav>
  );
}
