import { Data, type RouteData } from "common";
import { Check } from "lucide-react";
import { memo, useLayoutEffect, useRef } from "react";
import { gemColor, gemCostIcon } from "../assets";
import { useI18n, type I18n } from "../i18n";
import type { FocusRoute, FocusStep } from "../route/build";
import { useSettings, type Hints } from "../settings";
import { useProgress } from "../store";
import { CopyButton } from "./CopyButton";
import { renderParts } from "./Fragments";

/** Доля высоты окна, на которой держим текущий шаг при прокрутке. */
const CURRENT_STEP_OFFSET = 0.3;

export function RouteView({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const setPointer = useProgress((s) => s.setPointer);
  const hints = useSettings((s) => s.hints);
  const i18n = useI18n();
  const listRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);

  useLayoutEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(".step.is-current, .route-done");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * CURRENT_STEP_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: firstScroll.current ? "instant" : "smooth" });
    firstScroll.current = false;
  }, [pointer, route]);

  return (
    <main className="route" ref={listRef}>
      {route.sections.map((section, sectionIndex) => {
        const done = Math.min(Math.max(pointer - section.firstStep, 0), section.stepCount);
        return (
          <section key={sectionIndex} className="act" id={`act-${sectionIndex}`}>
            <h2 className="act-head">
              <span>{i18n.section(section.name)}</span>
              <span className="act-count">{i18n.t("stepsDone", done, section.stepCount)}</span>
            </h2>
            <ol className="steps">
              {route.steps.slice(section.firstStep, section.firstStep + section.stepCount).map((item) => (
                <StepRow
                  key={item.index}
                  item={item}
                  state={item.index < pointer ? "done" : item.index === pointer ? "current" : "next"}
                  hints={hints}
                  i18n={i18n}
                  onSelect={setPointer}
                />
              ))}
            </ol>
          </section>
        );
      })}
      {pointer >= route.steps.length && <p className="route-done">{i18n.t("routeComplete")}</p>}
      <ScrollPadding />
    </main>
  );
}

/** Чтобы последние шаги тоже можно было прокрутить к верхней трети окна. */
function ScrollPadding() {
  return <div style={{ height: "60vh" }} aria-hidden />;
}

type StepState = "done" | "current" | "next";

const StepRow = memo(function StepRow({
  item,
  state,
  hints,
  i18n,
  onSelect,
}: {
  item: FocusStep;
  state: StepState;
  hints: Hints;
  i18n: I18n;
  onSelect: (index: number) => void;
}) {
  const { head, tail } = renderParts(item.step.parts, i18n);
  const showHints = hints === "all" || (hints === "current" && state === "current");
  const vendorNames = item.gems
    .filter((g) => g.rewardType === "vendor")
    .map((g) => i18n.game.gem(g.requiredGem.id));

  return (
    <li
      className={`step is-${state}`}
      onClick={() => state !== "current" && onSelect(item.index)}
      title={state !== "current" ? i18n.t("setCurrent") : undefined}
    >
      <span className="step-marker" aria-hidden>
        {state === "done" && <Check size={14} strokeWidth={2.5} />}
      </span>
      <div className="step-body">
        <div className="step-main">
          <p className="step-text">{head}</p>
          {tail.length > 0 && <div className="step-tail">{tail}</div>}
        </div>

        {showHints && item.step.subSteps.length > 0 && (
          <ul className="step-hints">
            {item.step.subSteps.map((sub, i) => (
              <li key={i}>{renderParts(sub.parts, i18n).head}</li>
            ))}
          </ul>
        )}

        {item.gems.length > 0 && (
          <div className="gems">
            {item.gems.map((g, i) => (
              <GemRow key={i} gem={g} i18n={i18n} />
            ))}
            {state === "current" && vendorNames.length > 1 && (
              <div>
                <CopyButton text={`"${vendorNames.join("|")}"`} label={i18n.t("vendorSearch")} />
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
});

function GemRow({ gem, i18n }: { gem: RouteData.GemStep; i18n: I18n }) {
  const data = Data.Gems[gem.requiredGem.id];
  if (!data) return <div className="gem gem-missing">{i18n.t("unknownGem", gem.requiredGem.id)}</div>;
  const cost = gemCostIcon(data.required_level);
  const name = i18n.game.gem(data.id);

  return (
    <div className="gem">
      <span className="gem-dot" style={{ background: gemColor(data.primary_attribute) }} />
      <span className="gem-verb">{gem.rewardType === "quest" ? i18n.t("take") : i18n.t("buy")}</span>
      <span className="gem-name">
        {name}
        {gem.count > 1 && <span className="gem-count"> ×{gem.count}</span>}
      </span>
      {gem.rewardType === "vendor" && <img className="gem-cost" src={cost.src} alt={cost.name} title={cost.name} />}
      {gem.requiredGem.note && <span className="gem-note">{gem.requiredGem.note}</span>}
      <CopyButton text={name} />
    </div>
  );
}

/** Прокрутка к началу акта (из полосы прогресса). */
export function useScrollToAct() {
  return (sectionIndex: number) =>
    document.getElementById(`act-${sectionIndex}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
