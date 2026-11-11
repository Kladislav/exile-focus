import { ChevronLeft, Check } from "lucide-react";
import type { FocusRoute } from "../route/build";
import { useProgress } from "../store";
import { StepCard } from "./StepCard";

const NEXT_COUNT = 3;

export function FocusView({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const setPointer = useProgress((s) => s.setPointer);
  const showSubsteps = useProgress((s) => s.showSubsteps);

  const current = route.steps[pointer];
  const prev = route.steps[pointer - 1];
  const next = route.steps.slice(pointer + 1, pointer + 1 + NEXT_COUNT);

  if (!current) {
    return (
      <main className="focus">
        <div className="done-screen">
          <h1>Route complete</h1>
          <p>Kitava is down. Good luck in maps, exile.</p>
          <button className="btn" onClick={() => setPointer(route.steps.length - 1)}>
            <ChevronLeft size={16} /> Back to last step
          </button>
        </div>
      </main>
    );
  }

  const section = route.sections[current.sectionIndex];
  const stepInSection = pointer - section.firstStep + 1;

  return (
    <main className="focus">
      <div className="focus-meta">
        <span className="focus-section">{section.name}</span>
        <span className="focus-count">
          {stepInSection} / {section.stepCount}
        </span>
      </div>

      <div className="focus-stack">
        {prev ? (
          <StepCard item={prev} variant="prev" showSubsteps={false} onClick={() => setPointer(pointer - 1)} />
        ) : (
          <div className="card-placeholder" />
        )}

        <StepCard item={current} variant="current" showSubsteps={showSubsteps} />

        <div className="focus-actions">
          <button className="btn btn-ghost" disabled={pointer === 0} onClick={() => setPointer(pointer - 1)}>
            <ChevronLeft size={16} /> Back <kbd>⌫</kbd>
          </button>
          <button className="btn btn-primary" onClick={() => setPointer(pointer + 1)}>
            <Check size={16} /> Done <kbd>Space</kbd>
          </button>
        </div>

        {next.map((item) => (
          <StepCard
            key={item.index}
            item={item}
            variant="next"
            showSubsteps={false}
            onClick={() => setPointer(item.index)}
          />
        ))}
      </div>
    </main>
  );
}
