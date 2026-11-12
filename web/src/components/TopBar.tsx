import { Gem, Radio, Settings, Swords } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { reconnectLog, useLog } from "../log/client-log";
import { useProgress, useUi, type Panel } from "../store";

export function TopBar() {
  const characterClass = useProgress((s) => s.buildData.characterClass);
  const i18n = useI18n();
  const { t } = i18n;

  return (
    <header>
      <div className="topbar-row">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <img className="brand-logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={30} height={30} />
          <span className="brand-name">Exile Focus</span>
        </a>

        <div className="topbar-actions">
          <LogButton />
          {/* Только для узких окон: на широком экране то же самое в правой колонке. */}
          <NavButton panel="gems" title={`${t("gemLinks")} (G)`} className="nav-btn-narrow">
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

function NavButton({
  panel,
  title,
  className = "",
  children,
}: {
  panel: Panel;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const current = useUi((s) => s.panel);
  const setPanel = useUi((s) => s.setPanel);
  return (
    <button
      className={`nav-btn ${className} ${current === panel ? "is-active" : ""}`}
      title={title}
      aria-label={title}
      onClick={() => setPanel(current === panel ? null : panel)}
    >
      {children}
    </button>
  );
}

function LogButton() {
  const { status } = useLog();
  const { t } = useI18n();
  const setPanel = useUi((s) => s.setPanel);
  const open = () => setPanel("log");

  switch (status) {
    case "connected":
      return (
        <button className="log log-on" title={t("logLiveTitle")} onClick={open}>
          <span className="log-dot" /> {t("logLive")}
        </button>
      );
    case "needs-permission":
      // Доступ к файлу после перезагрузки выдаётся только по клику — сразу здесь.
      return (
        <button className="log log-warn" onClick={reconnectLog}>
          <Radio size={16} /> {t("logResume")}
        </button>
      );
    case "error":
      return (
        <button className="log log-warn" onClick={open}>
          <Radio size={16} /> {t("logError")}
        </button>
      );
    default:
      return (
        <button className="log" onClick={open} title={t("apButtonTitle")}>
          <Radio size={16} /> <span className="nav-label">{t("autoProgress")}</span>
        </button>
      );
  }
}
