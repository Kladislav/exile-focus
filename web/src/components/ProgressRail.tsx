import type { FocusRoute } from "../route/build";
import { useProgress } from "../store";

export function ProgressRail({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const setPointer = useProgress((s) => s.setPointer);

  return (
    <nav className="rail" aria-label="Acts">
      {route.sections.map((section) => {
        const done = Math.min(Math.max(pointer - section.firstStep, 0), section.stepCount);
        const active = pointer >= section.firstStep && pointer < section.firstStep + section.stepCount;
        return (
          <button
            key={section.name}
            className={`rail-seg ${active ? "is-active" : ""}`}
            style={{ flexGrow: section.stepCount }}
            title={`${section.name}: ${done}/${section.stepCount}`}
            onClick={() => setPointer(section.firstStep)}
          >
            <span className="rail-fill" style={{ width: `${(done / section.stepCount) * 100}%` }} />
            <span className="rail-label">{section.name.replace("Act ", "")}</span>
          </button>
        );
      })}
    </nav>
  );
}
