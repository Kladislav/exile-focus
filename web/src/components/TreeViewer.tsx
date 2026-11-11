import type { RouteData, SkillTree } from "common";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { buildUrlTreeDelta, calculateBounds } from "../tree/delta";
import { buildUrlTrees, loadTree, type TreeProblem, type UrlTree } from "../tree/url-tree";
import { SetSwitcher } from "./SetSwitcher";

interface Rendered {
  svg: string;
  style: string;
  skillTree: SkillTree.Data;
  nodes: SkillTree.NodeLookup;
  focus: { x: number; y: number; width: number; height: number };
  masteries: Record<string, string>;
}

/** Дерево пассивок: текущий набор, новые относительно предыдущего ноды подсвечены. */
export function TreeViewer({
  buildTrees,
  index,
  onIndex,
}: {
  buildTrees: RouteData.BuildTree[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const { t } = useI18n();
  const [trees, setTrees] = useState<UrlTree.Data[] | null>(null);
  const [problems, setProblems] = useState<TreeProblem[]>([]);
  const [rendered, setRendered] = useState<Rendered | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const styleId = `tree-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let alive = true;
    buildUrlTrees(buildTrees).then((result) => {
      if (!alive) return;
      setTrees(result.trees);
      setProblems(result.problems);
    });
    return () => {
      alive = false;
    };
  }, [buildTrees]);

  const current = trees && trees.length > 0 ? Math.min(index, trees.length - 1) : 0;

  useEffect(() => {
    if (!trees || trees.length === 0) return;
    let alive = true;
    const tree = trees[current];
    const previous: UrlTree.Data =
      current > 0 ? trees[current - 1] : { ...tree, nodes: [], masteries: {} };

    loadTree(tree.version).then(({ skillTree, nodes, svg, viewBox, style }) => {
      if (!alive) return;
      const delta = buildUrlTreeDelta(tree, previous, skillTree);
      const focus = calculateBounds(delta.nodesActive, delta.nodesAdded, delta.nodesRemoved, nodes, viewBox);
      setRendered({
        svg,
        skillTree,
        nodes,
        focus,
        masteries: delta.masteries,
        style: style({
          styleId,
          backgroundColor: "transparent",
          ascendancy: tree.ascendancy?.id,
          nodeColor: "var(--tree-node)",
          nodeActiveColor: "var(--tree-active)",
          nodeAddedColor: "var(--tree-added)",
          nodeRemovedColor: "var(--tree-removed)",
          connectionColor: "var(--tree-connection)",
          connectionActiveColor: "var(--tree-active)",
          connectionAddedColor: "var(--tree-added)",
          connectionRemovedColor: "var(--tree-removed)",
          nodesActive: delta.nodesActive,
          nodesAdded: delta.nodesAdded,
          nodesRemoved: delta.nodesRemoved,
          connectionsActive: delta.connectionsActive,
          connectionsAdded: delta.connectionsAdded,
          connectionsRemoved: delta.connectionsRemoved,
        }),
      });
    });
    return () => {
      alive = false;
    };
  }, [trees, current, styleId]);

  if (buildTrees.length === 0) return <p className="muted">{t("noTreeImported")}</p>;
  if (trees === null) return <p className="muted">…</p>;
  if (trees.length === 0) return <TreeProblems problems={problems} />;

  return (
    <div className="tree">
      <SetSwitcher names={trees.map((x) => x.name)} index={current} onIndex={onIndex} />
      {rendered && (
        <>
          <Viewport focus={rendered.focus}>
            <style dangerouslySetInnerHTML={{ __html: rendered.style }} />
            <div
              id={styleId}
              dangerouslySetInnerHTML={{ __html: rendered.svg }}
              onPointerOver={(e) => {
                const id = (e.target as Element).id;
                if (id?.startsWith("n")) setHovered(id.slice(1));
              }}
              onPointerOut={() => setHovered(null)}
            />
          </Viewport>
          <div className="tree-legend">
            <span><i style={{ background: "var(--tree-added)" }} /> {t("treeAdded")}</span>
            <span><i style={{ background: "var(--tree-active)" }} /> {t("treeTaken")}</span>
          </div>
          <NodeInfo rendered={rendered} nodeId={hovered} />
        </>
      )}
    </div>
  );
}

function TreeProblems({ problems }: { problems: TreeProblem[] }) {
  const { t } = useI18n();
  return (
    <div className="muted">
      <p>{t("noTree")}</p>
      <ul className="tree-problems">
        {problems.map((p, i) => (
          <li key={i}>
            <b>{p.name}</b> ({p.version || "?"}):{" "}
            {p.reason === "version" ? t("treeBadVersion") : p.reason === "empty" ? t("treeEmpty") : t("treeError")}
            {p.detail && <code> {p.detail}</code>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NodeInfo({ rendered, nodeId }: { rendered: Rendered; nodeId: string | null }) {
  const { t } = useI18n();
  if (!nodeId) return <p className="tree-node muted">{t("treeHint")}</p>;
  const node = rendered.nodes[nodeId];
  if (!node) return null;
  const stats = [...(node.stats ?? [])];
  const mastery = rendered.masteries[nodeId];
  if (mastery) stats.push(...(rendered.skillTree.masteryEffects[mastery]?.stats ?? []));
  return (
    <div className="tree-node">
      <b>{node.text}</b>
      {stats.flatMap((s) => s.split("\n")).map((s, i) => (
        <div key={i} className="muted">
          {s}
        </div>
      ))}
    </div>
  );
}

/** Масштаб и перемещение колесом и мышью (d3-zoom), стартовый кадр — по нодам набора. */
function Viewport({ focus, children }: { focus: Rendered["focus"]; children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const behavior = useMemo<ZoomBehavior<HTMLDivElement, unknown>>(
    () =>
      zoom<HTMLDivElement, unknown>().on("zoom", ({ transform }) => {
        if (worldRef.current)
          worldRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
      }),
    [],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    select(el).call(behavior);
    return () => {
      select(el).on(".zoom", null);
    };
  }, [behavior]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const k = Math.min(width / focus.width, height / focus.height);
      const x = width / 2 - (focus.x + focus.width / 2) * k;
      const y = height / 2 - (focus.y + focus.height / 2) * k;
      select(el).call(behavior.transform, zoomIdentity.translate(x, y).scale(k));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [focus, behavior]);

  return (
    <div className="tree-viewport" ref={viewportRef}>
      <div className="tree-world" ref={worldRef}>
        {children}
      </div>
    </div>
  );
}
