import type { RouteData } from "common";
import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { processPob } from "../build/pob";
import { BuildSidebar } from "./BuildSidebar";
import { useI18n } from "../i18n";
import { disconnectLog, useLog } from "../log/client-log";
import { HINT_ORDER, useSettings, type Hints } from "../settings";
import { useProgress, useUi } from "../store";

const LOG_PATH = "<Steam library>\\steamapps\\common\\Path of Exile\\logs\\Client.txt";

function Drawer({ title, children }: { title: string; children: ReactNode }) {
  const setPanel = useUi((s) => s.setPanel);
  const { t } = useI18n();
  return (
    <>
      <div className="scrim" onClick={() => setPanel(null)} />
      <aside className="drawer" role="dialog" aria-label={title}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={() => setPanel(null)} title={`${t("close")} (Esc)`}>
            <X size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}

export function Panels({ act }: { act: number }) {
  const panel = useUi((s) => s.panel);
  switch (panel) {
    case "gems":
      return <BuildDrawer act={act} />;
    case "build":
      return <BuildPanel />;
    case "help":
      return <Help />;
    default:
      return null;
  }
}

function BuildDrawer({ act }: { act: number }) {
  const { t } = useI18n();
  return (
    <Drawer title={t("buildInfo")}>
      <BuildSidebar act={act} />
    </Drawer>
  );
}

function BuildPanel() {
  const { buildData, pobCode, setBuild, setBuildData, resetAll } = useProgress();
  const hints = useSettings((s) => s.hints);
  const setSettings = useSettings((s) => s.set);
  const [code, setCode] = useState(pobCode ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const log = useLog();
  const { t, game } = useI18n();

  function importCode() {
    const value = code.trim();
    if (/^https?:\/\//.test(value)) return setMessage(t("pobLinkUnsupported"));
    let pob = null;
    try {
      pob = processPob(value);
    } catch {
      pob = null;
    }
    if (!pob) return setMessage(t("pobInvalid"));
    setBuild({
      buildData: pob.buildData,
      requiredGems: pob.requiredGems,
      gemLinks: pob.gemLinks,
      buildTrees: pob.buildTrees,
      pobCode: value,
    });
    setMessage(t("pobImported", game.term(pob.buildData.characterClass), pob.requiredGems.length));
  }

  const hintLabels: Record<Hints, string> = {
    current: t("hintsCurrent"),
    all: t("hintsAll"),
    off: t("hintsOff"),
  };

  return (
    <Drawer title={t("build")}>
      <section className="form-section">
        <h3>{t("pob")}</h3>
        <textarea
          className="input"
          rows={4}
          placeholder={t("pobPlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="row">
          <button className="btn btn-primary" onClick={importCode} disabled={!code.trim()}>
            {t("import")}
          </button>
          {message && <span className="muted">{message}</span>}
        </div>
      </section>

      <section className="form-section">
        <h3>{t("routeOptions")}</h3>
        <p className="muted">{t("routeOptionsHint")}</p>
        <label className="check">
          <input
            type="checkbox"
            checked={buildData.leagueStart}
            onChange={(e) => setBuildData({ leagueStart: e.target.checked })}
          />
          {t("leagueStart")}
        </label>
        <label className="check">
          <input type="checkbox" checked={buildData.library} onChange={(e) => setBuildData({ library: e.target.checked })} />
          {t("library")}
        </label>
        <label className="field">
          {t("bandits")}
          <select
            className="input"
            value={buildData.bandit}
            onChange={(e) => setBuildData({ bandit: e.target.value as RouteData.BuildData["bandit"] })}
          >
            <option value="None">{t("banditKill")}</option>
            {(["Alira", "Oak", "Kraityn"] as const).map((b) => (
              <option key={b} value={b}>
                {t("banditHelp", game.term(b))}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          {t("hints")}
          <select className="input" value={hints} onChange={(e) => setSettings({ hints: e.target.value as Hints })}>
            {HINT_ORDER.map((h) => (
              <option key={h} value={h}>
                {hintLabels[h]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="form-section">
        <h3>Client.txt</h3>
        <p className="muted">
          {log.fileName ? t("logLinked", log.fileName) : t("logNotLinked")} {t("logWhere")} <code>{LOG_PATH}</code>
        </p>
        {log.fileName && (
          <button className="btn" onClick={disconnectLog}>
            {t("unlinkLog")}
          </button>
        )}
      </section>

      <section className="form-section">
        <h3>{t("reset")}</h3>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm(t("resetConfirm"))) {
              resetAll();
              setCode("");
              setMessage(null);
            }
          }}
        >
          {t("resetAll")}
        </button>
      </section>
    </Drawer>
  );
}

function Help() {
  const { t } = useI18n();
  const keys: [string, string][] = [
    ["Space / → / J", t("keyNext")],
    ["Backspace / ← / K", t("keyBack")],
    ["G", t("gemLinks")],
    ["B", t("build")],
    ["H", t("keyHints")],
    ["?", t("keyHelp")],
    ["Esc", t("keyClose")],
  ];
  const [before, after] = t("creditsText").split("{0}");

  return (
    <Drawer title={t("help")}>
      <section className="form-section">
        <h3>{t("keys")}</h3>
        <dl className="keys">
          {keys.map(([k, v]) => (
            <div key={k}>
              <dt>
                <kbd>{k}</kbd>
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="form-section">
        <h3>{t("autoProgress")}</h3>
        <p className="muted">{t("autoProgressText")}</p>
        <p className="muted">
          <code>{LOG_PATH}</code>
        </p>
      </section>
      <section className="form-section">
        <h3>{t("credits")}</h3>
        <p className="muted">
          {before}
          <a href="https://github.com/HeartofPhos/exile-leveling" target="_blank" rel="noreferrer">
            exile-leveling
          </a>
          {after}
        </p>
      </section>
    </Drawer>
  );
}
