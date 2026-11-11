import { Data } from "common";
import { CircleHelp, Gamepad2, Gem, Languages, Monitor, Moon, Radio, Sun, Swords } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { connectLog, reconnectLog, useLog } from "../log/client-log";
import type { FocusRoute } from "../route/build";
import { areaBefore, minAreaLevel } from "../route/build";
import { useSettings, type Lang, type Theme } from "../settings";
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
          <NavButton panel="help" title={`${t("help")} (?)`}>
            <CircleHelp size={18} />
          </NavButton>
          <span className="divider" />
          <LangToggle setting="uiLang" icon={<Languages size={16} />} title={t("uiLanguage")} />
          <LangToggle setting="gameLang" icon={<Gamepad2 size={16} />} title={t("gameLanguage")} />
          <ThemeButton />
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

function LangToggle({ setting, icon, title }: { setting: "uiLang" | "gameLang"; icon: ReactNode; title: string }) {
  const value = useSettings((s) => s[setting]);
  const set = useSettings((s) => s.set);
  return (
    <div className="segmented" title={title} role="group" aria-label={title}>
      <span className="segmented-icon">{icon}</span>
      {(["ru", "en"] as Lang[]).map((lang) => (
        <button
          key={lang}
          className={value === lang ? "is-active" : ""}
          aria-pressed={value === lang}
          onClick={() => set({ [setting]: lang })}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const THEME_ORDER: Theme[] = ["system", "light", "dark"];
const THEME_ICON = { system: Monitor, light: Sun, dark: Moon };

function ThemeButton() {
  const theme = useSettings((s) => s.theme);
  const set = useSettings((s) => s.set);
  const { t } = useI18n();
  const Icon = THEME_ICON[theme];
  const label = { system: t("themeSystem"), light: t("themeLight"), dark: t("themeDark") }[theme];
  return (
    <button
      className="nav-btn"
      title={`${t("theme")}: ${label}`}
      aria-label={`${t("theme")}: ${label}`}
      onClick={() => set({ theme: THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length] })}
    >
      <Icon size={18} />
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
