import { Data, type RouteData } from "common";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { gemColor, gemCostIcon, icon } from "../assets";
import { useI18n } from "../i18n";
import { useProgress, useUi } from "../store";
import { SetSwitcher, setForAct } from "./SetSwitcher";
import { SearchStrings } from "./SearchStrings";
import { TreeViewer } from "./TreeViewer";
import { CopyButton, useCopy } from "./CopyButton";
import { useRoute } from "../route-context";
import { gemSource, routeGemSources, type GemSource } from "../route/gem-sources";


/**
 * Номер набора: по умолчанию тот, что подходит к текущему акту;
 * ручной выбор действует, пока игрок не перешёл в другой акт.
 */
const QUEST_ICON = icon("quest");

function useSetIndex(names: string[], act: number) {
  const [manual, setManual] = useState<{ act: number; index: number } | null>(null);
  const auto = setForAct(names, act) ?? 0;
  const index = manual && manual.act === act ? manual.index : auto;
  return [Math.min(index, Math.max(names.length - 1, 0)), (i: number) => setManual({ act, index: i })] as const;
}

export function BuildSidebar({ act }: { act: number }) {
  const { t } = useI18n();
  const tab = useUi((s) => s.sidebarTab);
  const setTab = useUi((s) => s.setSidebarTab);
  const gemLinks = useProgress((s) => s.gemLinks);
  const buildTrees = useProgress((s) => s.buildTrees);

  const gemSets = useMemo(() => groupByTitle(gemLinks), [gemLinks]);
  const [gemIndex, setGemIndex] = useSetIndex(
    gemSets.map(([title]) => title),
    act,
  );
  const [treeIndex, setTreeIndex] = useSetIndex(
    buildTrees.map((x) => x.name),
    act,
  );

  return (
    <div className="build-side">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "tree"} className={tab === "tree" ? "is-active" : ""} onClick={() => setTab("tree")}>
          {t("tabTree")}
        </button>
        <button role="tab" aria-selected={tab === "gems"} className={tab === "gems" ? "is-active" : ""} onClick={() => setTab("gems")}>
          {t("tabGems")}
        </button>
        <button role="tab" aria-selected={tab === "search"} className={tab === "search" ? "is-active" : ""} onClick={() => setTab("search")}>
          {t("tabSearch")}
        </button>
      </div>

      {tab === "gems" &&
        (gemSets.length === 0 ? (
          <p className="muted">{t("noGemLinks")}</p>
        ) : (
          <>
            <SetSwitcher names={gemSets.map(([title]) => title)} index={gemIndex} onIndex={setGemIndex} />
            <GemSet groups={gemSets[gemIndex]?.[1] ?? []} />
          </>
        ))}

      {tab === "tree" && <TreeViewer buildTrees={buildTrees} index={treeIndex} onIndex={setTreeIndex} />}

      {tab === "search" && <SearchStrings />}
    </div>
  );
}

function GemSet({ groups }: { groups: RouteData.GemLinkGroup[] }) {
  const route = useRoute();
  const sources = useMemo(() => (route ? routeGemSources(route) : new Map<string, GemSource>()), [route]);
  return (
    <div className="gem-set">
      {groups.map((group, i) => (
        <div key={i} className="gem-group">
          {group.primaryGems.map((link, j) => (
            <GemLine key={`p${j}`} id={link.id} source={gemSource(sources, link.id)} />
          ))}
          {group.secondaryGems.map((link, j) => (
            <GemLine key={`s${j}`} id={link.id} source={gemSource(sources, link.id)} support />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Строка гема: при наведении — где его взять; клик по названию или кнопке — копирование для поиска у торговца. */
function GemLine({ id, source, support }: { id: string; source: GemSource; support?: boolean }) {
  const { game } = useI18n();
  const gem = Data.Gems[id];
  const name = game.gem(id);
  // Название копируется и кликом по нему, и кнопкой справа.
  const copyState = useCopy(name);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const show = (e: React.SyntheticEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const hide = () => setAnchor(null);

  return (
    <div className={`gem-line ${support ? "is-support" : ""}`}>
      <button
        className={`gem-hover ${copyState[0] ? "is-copied" : ""}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={copyState[1]}
      >
        <span className="gem-dot" style={{ background: gem ? gemColor(gem.primary_attribute) : "var(--faint)" }} />
        <span className="gem-line-name">{name}</span>
      </button>
      {anchor && createPortal(<GemSourcePop source={source} anchor={anchor} copied={copyState[0]} />, document.body)}
      <GemSourceIcon source={source} requiredLevel={gem?.required_level ?? 1} />
      <CopyButton text={name} state={copyState} />
    </div>
  );
}

/** Сколько места нужно подсказке снизу; меньше — открываем вверх. */
const POP_SPACE = 140;

/**
 * Подсказка «где взять гем». Рисуется в body с position: fixed:
 * правая колонка прокручивается сама и обрезала бы её.
 */
function GemSourcePop({ source, anchor: el, copied }: { source: GemSource; anchor: HTMLElement; copied: boolean }) {
  const { t, game } = useI18n();
  // При прокрутке страницы или колонки подсказка едет вместе со строкой гема.
  const [, rerender] = useState(0);
  useEffect(() => {
    const update = () => rerender((n) => n + 1);
    window.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
    };
  }, []);
  const anchor = el.getBoundingClientRect();
  const above = window.innerHeight - anchor.bottom < POP_SPACE;
  const width = Math.min(Math.max(anchor.width, 260), 360);
  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8));
  const style: React.CSSProperties = above
    ? { left, width, top: "auto", bottom: window.innerHeight - anchor.top + 6 }
    : { left, width, top: anchor.bottom + 6, bottom: "auto" };
  return (
    <span className="opt-pop gem-pop" role="tooltip" style={style}>
      {copied && (
        <span className="gem-pop-copied">
          <Check size={14} strokeWidth={3} /> {t("copied")}
        </span>
      )}
      {source.kind === "quest" || source.kind === "vendor" ? (
        <>
          <span className="opt-sub">
            {t(source.kind === "quest" ? "gemFromQuest" : "gemFromVendor")} · {t("act", source.act)}
          </span>
          <b>{game.quest(source.questId)}</b>
          <span className="opt-text">{game.term(source.npc)}</span>
        </>
      ) : source.kind === "lilly" ? (
        <>
          <span className="opt-sub">{t("gemFromLillyTitle")}</span>
          <span className="opt-text">{t("gemFromLilly", game.term("Lilly Roth"))}</span>
        </>
      ) : (
        <span className="opt-text">{t("gemNotSold")}</span>
      )}
    </span>
  );
}

/** Иконка у гема: квест — награда, сфера — покупка у торговца (сколько стоит); находка — без иконки. */
function GemSourceIcon({ source, requiredLevel }: { source: GemSource; requiredLevel: number }) {
  const { t } = useI18n();
  if (source.kind === "drop") return <span className="gem-source" />;
  if (source.kind === "quest") return <img className="gem-source" src={QUEST_ICON} alt={t("gemFromQuest")} title={t("gemFromQuest")} />;
  const cost = gemCostIcon(requiredLevel);
  const title = source.kind === "vendor" ? t("gemFromVendor") : t("gemFromLillyTitle");
  return <img className="gem-source" src={cost.src} alt={title} title={title} />;
}

function groupByTitle(groups: RouteData.GemLinkGroup[]) {
  const map = new Map<string, RouteData.GemLinkGroup[]>();
  for (const g of groups) map.set(g.title, [...(map.get(g.title) ?? []), g]);
  return [...map.entries()];
}

/** Правая колонка без билда: что здесь появится и кнопка импорта. */
export function BuildEmpty() {
  const { t } = useI18n();
  const setPanel = useUi((s) => s.setPanel);
  return (
    <>
      <div className="build-side build-empty">
        <h3>{t("buildInfo")}</h3>
        <p>{t("buildEmptyText")}</p>
        <button className="btn btn-primary build-empty-btn" onClick={() => setPanel("build")}>
          {t("importPob")}
        </button>
      </div>
      <div className="build-side search-card">
        <h3>{t("tabSearch")}</h3>
        <SearchStrings />
      </div>
    </>
  );
}
