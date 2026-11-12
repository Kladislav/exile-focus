import { Data, type RouteData } from "common";
import { Check } from "lucide-react";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gemColor, gemCostIcon } from "../assets";
import { useI18n, type I18n } from "../i18n";
import type { FocusRoute, FocusStep } from "../route/build";
import { useSettings, type Hints } from "../settings";
import { useProgress } from "../store";
import { CopyButton } from "./CopyButton";
import { OptionalBadge } from "./OptionalBadge";
import { renderParts } from "./Fragments";
import { scrollWindowTo } from "../scroll";

/** Зазор между заголовком акта и текущим шагом после прокрутки. */
const CURRENT_STEP_GAP = 8;

export function RouteView({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const setPointer = useProgress((s) => s.setPointer);
  const hints = useSettings((s) => s.hints);
  const i18n = useI18n();
  const listRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  const selectStep = useCallback((index: number) => setPointer(index), [setPointer]);

  const lastCard = useRef<Element | null>(null);

  // Клик, клавиши или автопрогресс: прокручиваем, только когда текущий шаг ушёл
  // в другую карточку зоны (или пропал с экрана). Внутри карточки список стоит.
  useLayoutEffect(() => {
    const step = listRef.current?.querySelector(".step.is-current, .route-done");
    const card = step?.closest(".zone-card") ?? step ?? null;
    const first = firstScroll.current;
    const sameCard = !first && card !== null && card === lastCard.current;
    lastCard.current = card;
    firstScroll.current = false;
    if (sameCard && step && isOnScreen(step)) return;
    // Первая отрисовка — сразу на место, дальше короткая анимация (scroll.ts).
    scrollToCurrent(listRef.current, first ? "instant" : "fast");
  }, [pointer, route]);

  // Шрифт догружается позже первого рендера и сдвигает строки.
  useEffect(() => {
    document.fonts?.ready.then(() => scrollToCurrent(listRef.current, "instant"));
  }, []);

  return (
    <main className="route" ref={listRef}>
      {route.sections.map((section, sectionIndex) => {
        const done = Math.min(Math.max(pointer - section.firstStep, 0), section.stepCount);
        const complete = done === section.stepCount;
        return (
          <section key={sectionIndex} className={`act ${complete ? "is-complete" : ""}`} id={`act-${sectionIndex}`}>
            <h2 className="act-head">
              <span className="act-title">{i18n.section(section.name)}</span>
              {complete ? (
                <span className="act-count is-complete">
                  <Check size={14} strokeWidth={3} /> {i18n.t("actComplete")}
                </span>
              ) : (
                <span className="act-count">{i18n.t("stepsDone", done, section.stepCount)}</span>
              )}
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
function scrollToCurrent(list: HTMLElement | null, mode: "fast" | "instant") {
  const step = list?.querySelector<HTMLElement>(".step.is-current, .route-done");
  if (!step) return;
  const card = step.closest<HTMLElement>(".zone-card");
  const anchor = card && card.firstElementChild === step ? card : step;
  const actHead = step.closest(".act")?.querySelector<HTMLElement>(".act-head");
  scrollWindowTo(() => {
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
    const offset = header + (actHead?.offsetHeight ?? 0) + CURRENT_STEP_GAP;
    return anchor.getBoundingClientRect().top + window.scrollY - offset;
  }, mode);
}

/** Шаг виден целиком между шапкой с заголовком акта и низом окна. */
function isOnScreen(el: Element) {
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
  const rect = el.getBoundingClientRect();
  return rect.top >= header + 40 && rect.bottom <= window.innerHeight;
}

const TRAVEL = new Set(["enter", "waypoint_use", "logout", "portal_use"]);

/** Шаг перемещает в другую зону (вход, вейпоинт, выход в меню, портал). */
function isTravel(item: FocusStep) {
  return item.edgeIndex !== null && item.step.parts.some((p) => typeof p !== "string" && TRAVEL.has(p.type));
}

/**
 * Шаги акта, разбитые на блоки. Переход в зону начинает новый блок, только если
 * в текущем уже было действие: проходные зоны (вошёл и сразу дальше) собираются
 * с действием, ради которого шли, в один «квестовый» блок.
 */
function zoneGroups(route: FocusRoute, first: number, count: number) {
  const groups: FocusStep[][] = [];
  for (const item of route.steps.slice(first, first + count)) {
    const current = groups[groups.length - 1];
    const hasAction = current?.some((s) => !isTravel(s));
    if (!current || (isTravel(item) && hasAction)) groups.push([]);
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
  // Содержимое шага не зависит от того, выполнен ли он: кэшируем, чтобы при прыжке
  // через акты React не пересобирал фрагменты сотен шагов.
  const { head, tail } = useMemo(() => renderParts(item.step.parts, i18n), [item, i18n]);
  const hintNodes = useMemo(() => item.step.subSteps.map((sub) => renderParts(sub.parts, i18n).head), [item, i18n]);
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
            {hintNodes.map((_, i) => (
              <li key={i}>{hintNodes[i]}</li>
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

/** Прокрутка к началу акта (из навигации по актам). */
export function useScrollToAct() {
  return (sectionIndex: number) => {
    const el = document.getElementById(`act-${sectionIndex}`);
    if (!el) return;
    scrollWindowTo(() => {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      return el.getBoundingClientRect().top + window.scrollY - header;
    });
  };
}
