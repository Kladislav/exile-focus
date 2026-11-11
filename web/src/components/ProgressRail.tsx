import { useI18n } from "../i18n";
import type { FocusRoute } from "../route/build";
import { useProgress } from "../store";
import { useScrollToAct } from "./RouteView";

export function ProgressRail({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const scrollToAct = useScrollToAct();
  const i18n = useI18n();

  return (
    <nav className="rail" aria-label={i18n.t("route")}>
      {route.sections.map((section, index) => {
        const done = Math.min(Math.max(pointer - section.firstStep, 0), section.stepCount);
        const active = pointer >= section.firstStep && pointer < section.firstStep + section.stepCount;
        return (
          <button
            key={index}
            className={`rail-seg ${active ? "is-active" : ""}`}
            style={{ flexGrow: section.stepCount }}
            title={`${i18n.section(section.name)}: ${i18n.t("stepsDone", done, section.stepCount)}`}
            onClick={() => scrollToAct(index)}
          >
            <span className="rail-bar">
              <span className="rail-fill" style={{ width: `${(done / section.stepCount) * 100}%` }} />
            </span>
            <span className="rail-label">{section.name.replace(/^Act /, "")}</span>
          </button>
        );
      })}
    </nav>
  );
}
