import { Data, type RouteData } from "common";
import { useMemo, useState } from "react";
import { gemColor } from "../assets";
import { useI18n } from "../i18n";
import { useProgress } from "../store";
import { SetSwitcher, setForAct } from "./SetSwitcher";
import { TreeViewer } from "./TreeViewer";

type Tab = "gems" | "tree";

/**
 * Номер набора: по умолчанию тот, что подходит к текущему акту;
 * ручной выбор действует, пока игрок не перешёл в другой акт.
 */
function useSetIndex(names: string[], act: number) {
  const [manual, setManual] = useState<{ act: number; index: number } | null>(null);
  const auto = setForAct(names, act) ?? 0;
  const index = manual && manual.act === act ? manual.index : auto;
  return [Math.min(index, Math.max(names.length - 1, 0)), (i: number) => setManual({ act, index: i })] as const;
}

export function BuildSidebar({ act }: { act: number }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("gems");
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
        <button role="tab" aria-selected={tab === "gems"} className={tab === "gems" ? "is-active" : ""} onClick={() => setTab("gems")}>
          {t("tabGems")}
        </button>
        <button role="tab" aria-selected={tab === "tree"} className={tab === "tree" ? "is-active" : ""} onClick={() => setTab("tree")}>
          {t("tabTree")}
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
    </div>
  );
}

function GemSet({ groups }: { groups: RouteData.GemLinkGroup[] }) {
  const { game } = useI18n();
  return (
    <div className="gem-set">
      {groups.map((group, i) => (
        <div key={i} className="gem-group">
          {group.primaryGems.map((link, j) => (
            <GemLine key={`p${j}`} id={link.id} name={game.gem(link.id)} />
          ))}
          {group.secondaryGems.map((link, j) => (
            <GemLine key={`s${j}`} id={link.id} name={game.gem(link.id)} support />
          ))}
        </div>
      ))}
    </div>
  );
}

function GemLine({ id, name, support }: { id: string; name: string; support?: boolean }) {
  const gem = Data.Gems[id];
  return (
    <div className={`gem-line ${support ? "is-support" : ""}`}>
      <span className="gem-dot" style={{ background: gem ? gemColor(gem.primary_attribute) : "var(--faint)" }} />
      {name}
    </div>
  );
}

function groupByTitle(groups: RouteData.GemLinkGroup[]) {
  const map = new Map<string, RouteData.GemLinkGroup[]>();
  for (const g of groups) map.set(g.title, [...(map.get(g.title) ?? []), g]);
  return [...map.entries()];
}
