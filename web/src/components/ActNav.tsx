import { Check } from "lucide-react";
import { useI18n } from "../i18n";
import type { FocusRoute } from "../route/build";
import { useProgress } from "../store";
import { useScrollToAct } from "./RouteView";

/** Закреплённая слева навигация: общий прогресс и акты с долей пройденных шагов. */
export function ActNav({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const scrollToAct = useScrollToAct();
  const i18n = useI18n();
  const total = route.steps.length;
  const done = Math.min(pointer, total);
  const percent = Math.round((done / total) * 100);

  return (
    <nav className="actnav" aria-label={i18n.t("route")}>
      <div className="actnav-total">
        <span>{i18n.t("progress")}</span>
        <b>{percent}%</b>
      </div>
      <div className="actnav-bar">
        <span style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <ol>
        {route.sections.map((section, index) => {
          const sectionDone = Math.min(Math.max(pointer - section.firstStep, 0), section.stepCount);
          const complete = sectionDone === section.stepCount;
          const active = pointer >= section.firstStep && pointer < section.firstStep + section.stepCount;
          return (
            <li key={index}>
              <button
                className={`actnav-item ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
                onClick={() => scrollToAct(index)}
              >
                <span className="actnav-name">{i18n.section(section.name)}</span>
                <span className="actnav-count">
                  {complete ? <Check size={15} strokeWidth={2.5} /> : `${sectionDone}/${section.stepCount}`}
                </span>
                <span className="actnav-mini">
                  <span style={{ width: `${(sectionDone / section.stepCount) * 100}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
