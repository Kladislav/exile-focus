import { Data, type Fragments } from "common";
import {
  ArrowUp,
  CircleDot,
  Hammer,
  House,
  Landmark,
  LogOut,
  MapPin,
  ScrollText,
  Skull,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { I18n } from "../i18n";
import { minAreaLevel } from "../route/build";
import { CopyButton } from "./CopyButton";

const LAB_NAMES: Record<Fragments.AscendFragment["version"], string> = {
  normal: "The Labyrinth",
  cruel: "The Cruel Labyrinth",
  merciless: "The Merciless Labyrinth",
  eternal: "The Eternal Labyrinth",
};

const LAB_LAYOUTS: Record<Fragments.AscendFragment["version"], string> = {
  normal: "https://www.poelab.com/gtgax",
  cruel: "https://www.poelab.com/r8aws",
  merciless: "https://www.poelab.com/riikv",
  eternal: "https://www.poelab.com/wfbra",
};

function Term({ kind, icon: Icon, children }: { kind: string; icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className={`term term-${kind}`}>
      {Icon && <Icon className="term-icon" aria-hidden />}
      {children}
    </span>
  );
}

function Area({ id, i18n }: { id: string; i18n: I18n }) {
  const area = Data.Areas[id];
  if (!area) return <Term kind="area">{id}</Term>;
  return (
    <Term kind="area" icon={area.is_town_area ? House : undefined}>
      {i18n.game.area(id)}
      {!area.is_town_area && (
        <span className="term-level" title={i18n.t("monsterLevel")}>
          {minAreaLevel(area.level)}+
        </span>
      )}
    </Term>
  );
}

function Quest({ fragment, i18n }: { fragment: Fragments.QuestFragment; i18n: I18n }) {
  const quest = Data.Quests[fragment.questId];
  const npcs = [
    ...new Set(
      fragment.rewardOffers
        .map((id) => quest.reward_offers[id]?.quest_npc)
        .filter((x): x is string => !!x),
    ),
  ];
  return (
    <Term kind="quest" icon={ScrollText}>
      {i18n.game.quest(fragment.questId)}
      {npcs.length > 0 && <span className="term-aside"> · {npcs.map(i18n.game.term).join(", ")}</span>}
    </Term>
  );
}

type Rendered = { head?: ReactNode; tail?: ReactNode };

/** Направления по экрану (как в гайдах): 0 — вверх, дальше по часовой через 45°. */
const DIR_KEYS = ["dirUp", "dirUpRight", "dirRight", "dirDownRight", "dirDown", "dirDownLeft", "dirLeft", "dirUpLeft"] as const;

function renderFragment(f: Fragments.AnyFragment, i18n: I18n, next?: Fragments.AnyFragment): Rendered {
  if (typeof f === "string") {
    const context = next && typeof next !== "string" && next.type === "waypoint_get" ? "waypoint" : undefined;
    return { head: i18n.phrase(f, context) };
  }

  const { t, game } = i18n;
  switch (f.type) {
    case "kill":
      return { head: <Term kind="kill" icon={Skull}>{game.term(f.value)}</Term> };
    case "arena":
      return { head: <Term kind="area">{game.term(f.value)}</Term> };
    case "area":
    case "enter":
      return { head: <Area id={f.areaId} i18n={i18n} /> };
    case "logout":
      return {
        head: (
          <>
            <Term kind="generic" icon={LogOut}>{t("logout")}</Term> ➞ <Area id={f.areaId} i18n={i18n} />
          </>
        ),
      };
    case "waypoint":
    case "waypoint_get":
      return { head: <Term kind="waypoint" icon={MapPin}>{game.term("Waypoint")}</Term> };
    case "waypoint_use": {
      const dst = Data.Areas[f.dstAreaId];
      const src = Data.Areas[f.srcAreaId];
      return {
        head: (
          <>
            <Term kind="waypoint" icon={MapPin}>{game.term("Waypoint")}</Term> ➞ <Area id={f.dstAreaId} i18n={i18n} />
            {dst && src && dst.act !== src.act && dst.id !== "Labyrinth_Airlock" && (
              <span className="term-aside"> · {t("act", dst.act)}</span>
            )}
          </>
        ),
      };
    }
    case "portal_set":
      return { head: <Term kind="portal" icon={CircleDot}>{game.term("Portal")}</Term> };
    case "portal_use":
      return {
        head: (
          <>
            <Term kind="portal" icon={CircleDot}>{game.term("Portal")}</Term> ➞ <Area id={f.dstAreaId} i18n={i18n} />
          </>
        ),
      };
    case "quest":
      return { head: <Quest fragment={f} i18n={i18n} /> };
    case "quest_text":
      return { head: <Term kind="item">{game.term(f.value)}</Term> };
    case "generic":
      return { head: <Term kind="generic">{game.term(f.value)}</Term> };
    case "reward_quest":
      return { head: <>{t("take")} <Term kind="generic">{game.term(f.item)}</Term></> };
    case "reward_vendor":
      return { head: <>{t("buy")} <Term kind="generic">{game.term(f.item)}</Term>{f.cost && <> ({f.cost})</>}</> };
    case "trial":
      return { head: <Term kind="trial" icon={Landmark}>{game.term("Trial of Ascendancy")}</Term> };
    case "ascend":
      return {
        // Глагол — интерфейс, название лабиринта — язык игры (как «Пройти Trial of Ascendancy»).
        head: (
          <>
            {t("ascendVerb")} <Term kind="trial" icon={Landmark}>{game.term(LAB_NAMES[f.version])}</Term>
          </>
        ),
        tail: (
          <a className="chip" href={LAB_LAYOUTS[f.version]} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            {t("labLayout")}
          </a>
        ),
      };
    case "crafting":
      return {
        head: (
          <Term kind="generic" icon={Hammer}>
            {t("crafting")}: {f.crafting_recipes.map(game.term).join(", ")}
          </Term>
        ),
      };
    case "dir":
      return {
        head: (
          <span className="dir-chip" title={t(DIR_KEYS[f.dirIndex % 8])} aria-label={t(DIR_KEYS[f.dirIndex % 8])}>
            <ArrowUp strokeWidth={2.75} style={{ transform: `rotate(${f.dirIndex * 45}deg)` }} />
          </span>
        ),
      };
    case "copy":
      return f.side === "head" ? { head: <CopyButton text={f.text} /> } : { tail: <CopyButton text={f.text} /> };
  }
}

export function renderParts(parts: Fragments.AnyFragment[], i18n: I18n) {
  const head: ReactNode[] = [];
  const tail: ReactNode[] = [];
  parts.forEach((part, i) => {
    // «➞ Зона» в начале шага: шаг и так открывает карточку зоны, стрелка лишняя.
    // Стрелки внутри шага («Портал ➞ Зона») оставляем: они показывают, куда ведёт действие.
    const next = parts[i + 1];
    if (
      i === 0 &&
      typeof part === "string" &&
      part.trim() === "➞" &&
      next &&
      typeof next !== "string" &&
      (next.type === "enter" || next.type === "arena")
    )
      return;
    const r = renderFragment(part, i18n, next);
    if (r.head) head.push(<span key={i}>{r.head}</span>);
    if (r.tail) tail.push(<span key={i}>{r.tail}</span>);
  });
  return { head, tail };
}
