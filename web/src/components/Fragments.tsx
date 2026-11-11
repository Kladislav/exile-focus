import { Data, type Fragments, type GameData } from "common";
import { ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { icon } from "../assets";
import { minAreaLevel } from "../route/build";
import { CopyButton } from "./CopyButton";

const LAB_LAYOUTS: Record<Fragments.AscendFragment["version"], string> = {
  normal: "https://www.poelab.com/gtgax",
  cruel: "https://www.poelab.com/r8aws",
  merciless: "https://www.poelab.com/riikv",
  eternal: "https://www.poelab.com/wfbra",
};

function Icon({ name }: { name: string }) {
  return <img className="frag-icon" src={icon(name)} alt="" />;
}

function Area({ area, label }: { area: GameData.Area; label?: string }) {
  return (
    <span className="frag frag-area">
      {area.is_town_area && <Icon name="town" />}
      {label ?? area.name}
      {!area.is_town_area && (
        <span className="frag-level">{minAreaLevel(area.level)}+</span>
      )}
    </span>
  );
}

function Tag({ kind, children, img }: { kind: string; children: ReactNode; img?: string }) {
  return (
    <span className={`frag frag-${kind}`}>
      {img && <Icon name={img} />}
      {children}
    </span>
  );
}

function Direction({ index }: { index: number }) {
  return (
    <span className="frag frag-dir" title={`${index * 45}°`}>
      <ArrowUp size="1em" style={{ transform: `rotate(${index * 45}deg)` }} />
    </span>
  );
}

function Quest({ fragment }: { fragment: Fragments.QuestFragment }) {
  const quest = Data.Quests[fragment.questId];
  const npcs = [
    ...new Set(
      fragment.rewardOffers
        .map((id) => quest.reward_offers[id]?.quest_npc)
        .filter((x): x is string => !!x),
    ),
  ];
  return (
    <span className="frag frag-quest">
      <Icon name="quest" />
      {quest.name}
      {npcs.length > 0 && <span className="frag-npc"> · {npcs.join(", ")}</span>}
    </span>
  );
}

/** Возвращает узлы для текста шага и для правой колонки (кнопки копирования). */
export function renderFragment(f: Fragments.AnyFragment): { head?: ReactNode; tail?: ReactNode } {
  if (typeof f === "string") return { head: f };

  switch (f.type) {
    case "kill":
      return { head: <Tag kind="kill">{f.value}</Tag> };
    case "arena":
      return { head: <Tag kind="area">{f.value}</Tag> };
    case "area":
    case "enter":
      return { head: <Area area={Data.Areas[f.areaId]} /> };
    case "logout":
      return {
        head: (
          <>
            <Tag kind="generic">Logout</Tag> ➞ <Area area={Data.Areas[f.areaId]} />
          </>
        ),
      };
    case "waypoint":
    case "waypoint_get":
      return { head: <Tag kind="waypoint" img="waypoint">Waypoint</Tag> };
    case "waypoint_use": {
      const dst = Data.Areas[f.dstAreaId];
      const src = Data.Areas[f.srcAreaId];
      return {
        head: (
          <>
            <Tag kind="waypoint" img="waypoint">Waypoint</Tag> ➞{" "}
            <Area area={dst} label={dst.map_name || dst.name} />
            {dst.act !== src.act && dst.id !== "Labyrinth_Airlock" && (
              <span className="frag-npc"> · Act {dst.act}</span>
            )}
          </>
        ),
      };
    }
    case "portal_set":
      return { head: <Tag kind="portal" img="portal">Portal</Tag> };
    case "portal_use":
      return {
        head: (
          <>
            <Tag kind="portal" img="portal">Portal</Tag> ➞ <Area area={Data.Areas[f.dstAreaId]} />
          </>
        ),
      };
    case "quest":
      return { head: <Quest fragment={f} /> };
    case "quest_text":
      return { head: <Tag kind="quest-text">{f.value}</Tag> };
    case "generic":
      return { head: <Tag kind="generic">{f.value}</Tag> };
    case "reward_quest":
      return { head: <>Take <Tag kind="generic">{f.item}</Tag></> };
    case "reward_vendor":
      return {
        head: (
          <>
            Buy <Tag kind="generic">{f.item}</Tag>
            {f.cost && <> for {f.cost}</>}
          </>
        ),
      };
    case "trial":
      return { head: <Tag kind="trial" img="trial">Trial of Ascendancy</Tag> };
    case "ascend":
      return {
        head: <Tag kind="trial" img="trial">Ascend</Tag>,
        tail: (
          <a className="chip" href={LAB_LAYOUTS[f.version]} target="_blank" rel="noreferrer">
            Lab layout
          </a>
        ),
      };
    case "crafting":
      return {
        head: (
          <Tag kind="generic" img="crafting">
            Crafting: {f.crafting_recipes.join(", ")}
          </Tag>
        ),
      };
    case "dir":
      return { head: <Direction index={f.dirIndex} /> };
    case "copy":
      return f.side === "head"
        ? { head: <CopyButton text={f.text} /> }
        : { tail: <CopyButton text={f.text} label="Search" /> };
  }
}

export function renderParts(parts: Fragments.AnyFragment[]) {
  const head: ReactNode[] = [];
  const tail: ReactNode[] = [];
  parts.forEach((part, i) => {
    const r = renderFragment(part);
    if (r.head) head.push(<span key={i}>{r.head}</span>);
    if (r.tail) tail.push(<span key={i}>{r.tail}</span>);
  });
  return { head, tail };
}
