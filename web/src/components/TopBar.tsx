import { Data } from "common";
import { Gem, Radio, Settings, Swords } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { connectLog, reconnectLog, useLog } from "../log/client-log";
import type { FocusRoute } from "../route/build";
import { areaBefore, minAreaLevel } from "../route/build";
import { useProgress, useUi, type Panel } from "../store";

export function TopBar({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const characterClass = useProgress((s) => s.buildData.characterClass);
  const log = useLog();
  const i18n = useI18n();
  const { t } = i18n;

  // Пока лог подключён, зону берём из него: так видно, где игрок на самом деле.
  const area =
    (log.status === "connected" && log.areaId && Data.Areas[log.areaId]) || areaBefore(route, pointer);

  return (
    <header>
      <div className="topbar-row">
        <div className="zone">
          <span className="zone-act">{t("act", area.act)}</span>
          <span className="zone-name">{i18n.game.area(area.id)}</span>
          {!area.is_town_area && (
            <span className="zone-level" title={t("monsterLevel")}>
              {minAreaLevel(area.level)}+
            </span>
          )}
          <LevelBadge areaLevel={area.is_town_area ? null : area.level} />
        </div>

        <div className="topbar-actions">
          <LogButton />
          <NavButton panel="gems" title={`${t("gemLinks")} (G)`}>
            <Gem size={18} />
          </NavButton>
          <NavButton panel="build" title={`${t("build")} (B)`}>
            <Swords size={18} />
            <span className="nav-label">
              {characterClass === "None" ? t("importBuild") : i18n.game.term(characterClass)}
            </span>
          </NavButton>
          <NavButton panel="settings" title={`${t("settings")} (S)`}>
            <Settings size={18} />
          </NavButton>
        </div>
      </div>
    </header>
  );
}

function NavButton({ panel, title, children }: { panel: Panel; title: string; children: ReactNode }) {
  const current = useUi((s) => s.panel);
  const setPanel = useUi((s) => s.setPanel);
  return (
    <button
      className={`nav-btn ${current === panel ? "is-active" : ""}`}
      title={title}
      aria-label={title}
      onClick={() => setPanel(current === panel ? null : panel)}
    >
      {children}
    </button>
  );
}

function LevelBadge({ areaLevel }: { areaLevel: number | null }) {
  const { level, charName } = useLog();
  const { t } = useI18n();
  if (level === null) return null;

  let tone = "ok";
  if (areaLevel !== null && level < areaLevel - 2) tone = "low";
  if (areaLevel !== null && level > areaLevel + 4) tone = "high";

  return (
    <span className={`level level-${tone}`} title={charName ?? undefined}>
      {t("level", level)}
    </span>
  );
}

function LogButton() {
  const { status, error } = useLog();
  const { t } = useI18n();

  switch (status) {
    case "unsupported":
      return (
        <span className="log" title={t("logUnsupportedTitle")}>
          <Radio size={16} /> <span className="nav-label">{t("logUnsupported")}</span>
        </span>
      );
    case "connected":
      return (
        <span className="log log-on" title={t("logLiveTitle")}>
          <span className="log-dot" /> {t("logLive")}
        </span>
      );
    case "needs-permission":
      return (
        <button className="log log-warn" onClick={reconnectLog}>
          <Radio size={16} /> {t("logResume")}
        </button>
      );
    case "error":
      return (
        <button className="log log-warn" title={error ?? ""} onClick={connectLog}>
          <Radio size={16} /> {t("logError")}
        </button>
      );
    default:
      return (
        <button className="log" onClick={connectLog}>
          <Radio size={16} /> {t("connectLog")}
        </button>
      );
  }
}
