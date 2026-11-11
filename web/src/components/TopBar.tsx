import { Data } from "common";
import { CircleHelp, Gem, ListOrdered, Radio, Swords } from "lucide-react";
import { connectLog, reconnectLog, useLog } from "../log/client-log";
import type { FocusRoute } from "../route/build";
import { areaBefore, minAreaLevel } from "../route/build";
import { useProgress, useUi, type Panel } from "../store";

export function TopBar({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const characterClass = useProgress((s) => s.buildData.characterClass);
  const log = useLog();
  const setPanel = useUi((s) => s.setPanel);
  const panel = useUi((s) => s.panel);

  // Пока лог подключён, зону берём из него: так видно, где игрок на самом деле.
  const area =
    (log.status === "connected" && log.areaId && Data.Areas[log.areaId]) ||
    areaBefore(route, pointer);

  return (
    <header className="topbar">
      <div className="brand">
        exile<span>focus</span>
      </div>

      <div className="zone">
        <span className="zone-act">Act {area.act}</span>
        <span className="zone-name">{area.name}</span>
        {!area.is_town_area && (
          <span className="zone-level" title="Monster level">
            {minAreaLevel(area.level)}+
          </span>
        )}
      </div>

      <div className="topbar-right">
        <LevelBadge areaLevel={area.is_town_area ? null : area.level} />
        <LogButton />
        <NavButton panel="list" current={panel} onClick={setPanel} title="Route (L)">
          <ListOrdered size={18} />
        </NavButton>
        <NavButton panel="gems" current={panel} onClick={setPanel} title="Gem links (G)">
          <Gem size={18} />
        </NavButton>
        <NavButton panel="build" current={panel} onClick={setPanel} title="Build (B)">
          <Swords size={18} />
          <span className="nav-label">{characterClass === "None" ? "Import build" : characterClass}</span>
        </NavButton>
        <NavButton panel="help" current={panel} onClick={setPanel} title="Help (?)">
          <CircleHelp size={18} />
        </NavButton>
      </div>
    </header>
  );
}

function NavButton({
  panel,
  current,
  onClick,
  title,
  children,
}: {
  panel: Panel;
  current: Panel;
  onClick: (p: Panel) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`nav-btn ${current === panel ? "is-active" : ""}`}
      title={title}
      onClick={() => onClick(current === panel ? null : panel)}
    >
      {children}
    </button>
  );
}

function LevelBadge({ areaLevel }: { areaLevel: number | null }) {
  const { level, charName } = useLog();
  if (level === null) return null;

  let tone = "ok";
  if (areaLevel !== null && level < areaLevel - 2) tone = "low";
  if (areaLevel !== null && level > areaLevel + 4) tone = "high";

  return (
    <span className={`level level-${tone}`} title={charName ?? undefined}>
      Lv {level}
    </span>
  );
}

function LogButton() {
  const { status, error } = useLog();

  switch (status) {
    case "unsupported":
      return (
        <span className="log log-off" title="Auto-progress needs Chrome or Edge">
          <Radio size={16} /> No auto-progress
        </span>
      );
    case "connected":
      return (
        <span className="log log-on" title="Reading Client.txt">
          <Radio size={16} /> Live
        </span>
      );
    case "needs-permission":
      return (
        <button className="log log-warn" onClick={reconnectLog}>
          <Radio size={16} /> Resume log
        </button>
      );
    case "error":
      return (
        <button className="log log-warn" title={error ?? ""} onClick={connectLog}>
          <Radio size={16} /> Log error, reconnect
        </button>
      );
    default:
      return (
        <button className="log" onClick={connectLog}>
          <Radio size={16} /> Connect Client.txt
        </button>
      );
  }
}
