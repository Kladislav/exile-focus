import { Data, type RouteData } from "common";
import { memo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { gemColor, gemCostIcon } from "../assets";
import { useI18n, type I18n } from "../i18n";
import type { FocusRoute, FocusStep } from "../route/build";
import { useSettings, type Hints } from "../settings";
import { useProgress } from "../store";
import { CopyButton } from "./CopyButton";
import { OptionalBadge } from "./OptionalBadge";
import { renderParts } from "./Fragments";

/** Зазор между заголовком акта и текущим шагом после прокрутки. */
const CURRENT_STEP_GAP = 8;

export function RouteView({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const setPointer = useProgress((s) => s.setPointer);
  const hints = useSettings((s) => s.hints);
  const i18n = useI18n();
  const listRef = useRef<HTMLDivElement>(null);
  const selectStep = useCallback((index: number) => setPointer(index), [setPointer]);

  // Клик, клавиши или автопрогресс: текущий шаг уезжает наверх, под заголовок акта.
  useLayoutEffect(() => {
    // Плавная прокрутка мешает: при игре нужно сразу видеть шаг.
    scrollToCurrent(listRef.current, "instant");
  }, [pointer, route]);

  // Шрифт догружается позже первого рендера и сдвигает строки.
  useEffect(() => {
    document.fonts?.ready.then(() => scrollToCurrent(listRef.current, "instant"));
  }, []);

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
            {zoneGroups(route, section.firstStep, section.stepCount).map((group) => {
              const first = group[0].index;
              const last = group[group.length - 1].index;
              const state = pointer > last ? "is-done" : pointer >= first ? "is-current" : "";
              const edge = group[0].edgeIndex;
              const town = edge !== null && Data.Areas[route.edges[edge]]?.is_town_area;
              return (
                <ol key={first} className={`zone-card ${state} ${town ? "is-town" : ""}`}>
                  {group.map((item) => (
                    <StepRow
                      key={item.index}
                      item={item}
                      state={item.index < pointer ? "done" : item.index === pointer ? "current" : "next"}
                      hints={hints}
                      i18n={i18n}
                      onSelect={selectStep}
                    />
                  ))}
                </ol>
              );
            })}
          </section>
        );
      })}
      {pointer >= route.steps.length && <p className="route-done">{i18n.t("routeComplete")}</p>}
      <ScrollPadding />
    </main>
  );
}

/**
 * Текущий шаг сразу под шапкой и заголовком акта. Если шаг первый в карточке
 * зоны, поднимаем всю карточку, чтобы её верх не прятался под заголовком.
 */
function scrollToCurrent(list: HTMLElement | null, behavior: ScrollBehavior) {
  const step = list?.querySelector<HTMLElement>(".step.is-current, .route-done");
  if (!step) return;
  const card = step.closest<HTMLElement>(".zone-card");
  const anchor = card && card.firstElementChild === step ? card : step;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
  const actHead = step.closest(".act")?.querySelector<HTMLElement>(".act-head")?.offsetHeight ?? 0;
  const offset = header + actHead + CURRENT_STEP_GAP;
  const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

/** Шаги акта, разбитые на блоки: каждый переход в новую зону начинает блок. */
function zoneGroups(route: FocusRoute, first: number, count: number) {
  const groups: FocusStep[][] = [];
  for (const item of route.steps.slice(first, first + count)) {
    if (item.edgeIndex !== null || groups.length === 0) groups.push([]);
    groups[groups.length - 1].push(item);
  }
  return groups;
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
  // У выполненных шагов подсказки уже не нужны.
  const showHints = state !== "done" && (hints === "all" || (hints === "current" && state === "current"));
  const vendorNames = item.gems
    .filter((g) => g.rewardType === "vendor")
    .map((g) => i18n.game.gem(g.requiredGem.id));

  return (
    <li
      data-step={item.index}
      className={`step is-${state} ${item.edgeIndex !== null ? "is-edge" : ""} ${item.optional ? "is-optional" : ""}`}
      onClick={() => state !== "current" && onSelect(item.index)}
      title={state !== "current" ? i18n.t("setCurrent") : undefined}
    >
      <span className="step-marker" aria-hidden />
      <div className="step-body">
        <div className="step-main">
          <p className="step-text">
            {head}
            {item.optional && <OptionalBadge info={item.optional} i18n={i18n} />}
          </p>
          {tail.length > 0 && <div className="step-tail">{tail}</div>}
        </div>

        {showHints && item.step.subSteps.length > 0 && (
          <ul className="step-hints">
            {item.step.subSteps.map((sub, i) => (
              <li key={i}>{renderParts(sub.parts, i18n).head}</li>
            ))}
          </ul>
        )}

        {/* У выполненных шагов гемы уже взяты или куплены. */}
        {state !== "done" && item.gems.length > 0 && (
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
    document.getElementById(`act-${sectionIndex}`)?.scrollIntoView({ behavior: "instant", block: "start" });
}
