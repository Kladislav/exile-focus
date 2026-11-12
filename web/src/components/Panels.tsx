import type { RouteData } from "common";
import { CircleAlert, CircleCheck, Download, Monitor, Moon, Radio, Route, Sun, Swords, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { processPob } from "../build/pob";
import { BuildSidebar } from "./BuildSidebar";
import { count, useI18n } from "../i18n";
import { CopyButton } from "./CopyButton";
import { connectLog, disconnectLog, reconnectLog, useLog } from "../log/client-log";
import { HINT_ORDER, useSettings, type Hints, type Lang, type Theme } from "../settings";
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
    case "settings":
      return <Settings />;
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

type ImportResult =
  | { ok: true; characterClass: string; gems: number; sets: number; trees: number }
  | { ok: false; reason: string }
  | null;

function BuildPanel() {
  const { buildData, requiredGems, gemLinks, buildTrees, setBuild, setBuildData, resetAll } = useProgress();
  const hasBuild = buildData.characterClass !== "None" && (requiredGems.length > 0 || buildTrees.length > 0);
  const [editing, setEditing] = useState(!hasBuild);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ImportResult>(null);
  const [justImported, setJustImported] = useState(false);
  const i18n = useI18n();
  const { t, game, ui } = i18n;

  function importCode() {
    const value = code.trim();
    if (/^https?:\/\//.test(value)) return setResult({ ok: false, reason: t("pobLinkUnsupported") });
    let pob = null;
    try {
      pob = processPob(value);
    } catch {
      pob = null;
    }
    if (!pob) return setResult({ ok: false, reason: t("pobInvalid") });
    setBuild({
      // Класс берём из PoB, настройки маршрута оставляем пользовательские.
      // Бандит "None" в PoB обычно значит «не выбран», поэтому его не применяем.
      buildData: {
        ...buildData,
        characterClass: pob.buildData.characterClass,
        bandit: pob.buildData.bandit !== "None" ? pob.buildData.bandit : buildData.bandit,
      },
      requiredGems: pob.requiredGems,
      gemLinks: pob.gemLinks,
      buildTrees: pob.buildTrees,
      pobCode: value,
    });
    setResult({
      ok: true,
      characterClass: pob.buildData.characterClass,
      gems: pob.requiredGems.length,
      sets: new Set(pob.gemLinks.map((g) => g.title)).size,
      trees: pob.buildTrees.length,
    });
    setCode("");
    setEditing(false);
    setJustImported(true);
    setTimeout(() => setJustImported(false), 1600);
  }

  const sets = new Set(gemLinks.map((g) => g.title)).size;
  const bandits: { value: RouteData.BuildData["bandit"]; label: string }[] = [
    { value: "None", label: t("banditKill") },
    { value: "Alira", label: game.term("Alira") },
    { value: "Kraityn", label: game.term("Kraityn") },
    { value: "Oak", label: game.term("Oak") },
  ];
  const banditBonus = { None: t("banditBonusKill"), Alira: t("banditBonusAlira"), Kraityn: t("banditBonusKraityn"), Oak: t("banditBonusOak") };

  return (
    <Drawer title={t("build")}>
      <section className="panel-card">
        <h3 className="panel-title">
          <Swords size={16} /> {t("pob")}
        </h3>

        {hasBuild && !editing && (
          <div className={`build-summary ${justImported ? "is-fresh" : ""}`}>
            <div className="build-summary-main">
              <span className="build-class">{game.term(buildData.characterClass)}</span>
              <span className="build-stats">
                {[
                  count(ui, requiredGems.length, "gem"),
                  sets > 0 && count(ui, sets, "set"),
                  buildTrees.length > 0 && count(ui, buildTrees.length, "tree"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm btn-nowrap" onClick={() => { setEditing(true); setResult(null); }}>
              {t("replaceBuild")}
            </button>
          </div>
        )}

        {result?.ok && !editing && (
          <div className="notice notice-ok" role="status">
            <CircleCheck size={18} />
            <div>
              <b>{t("importedTitle", game.term(result.characterClass))}</b>
              <span>{t("importedText")}</span>
            </div>
          </div>
        )}

        {editing && (
          <>
            <p className="panel-hint">{t("pobHelp")}</p>
            <textarea
              className="input code-input"
              rows={3}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              placeholder={t("pobPlaceholder")}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (result && !result.ok) setResult(null);
              }}
            />
            {result && !result.ok && (
              <div className="notice notice-error" role="alert">
                <CircleAlert size={18} />
                <div>
                  <b>{t("importFailed")}</b>
                  <span>{result.reason}</span>
                </div>
              </div>
            )}
            <div className="row">
              <button className="btn btn-primary" onClick={importCode} disabled={!code.trim()}>
                <Download size={16} /> {t("import")}
              </button>
              {hasBuild && (
                <button className="btn btn-ghost" onClick={() => { setEditing(false); setResult(null); setCode(""); }}>
                  {t("cancel")}
                </button>
              )}
            </div>
          </>
        )}
      </section>

      <section className="panel-card">
        <h3 className="panel-title">
          <Route size={16} /> {t("routeOptions")}
        </h3>
        <label className="switch-row">
          <span>
            <span className="switch-label">{t("leagueStart")}</span>
            <span className="switch-hint">{t("leagueStartHint")}</span>
          </span>
          <input
            type="checkbox"
            className="switch"
            checked={buildData.leagueStart}
            onChange={(e) => setBuildData({ leagueStart: e.target.checked })}
          />
        </label>
        <div className="field-block">
          <span className="switch-label">{t("bandits")}</span>
          <Segmented
            label={t("bandits")}
            value={buildData.bandit}
            options={bandits}
            onChange={(bandit) => setBuildData({ bandit })}
          />
          <span className="switch-hint">{banditBonus[buildData.bandit]}</span>
        </div>
        <p className="panel-note">{t("routeOptionsHint")}</p>
      </section>

      <LogCard />

      <div className="danger-zone">
        <button
          className="btn btn-ghost btn-sm btn-danger"
          onClick={() => {
            if (confirm(t("resetConfirm"))) {
              resetAll();
              setCode("");
              setResult(null);
              setEditing(true);
            }
          }}
        >
          <Trash2 size={15} /> {t("resetAll")}
        </button>
      </div>
    </Drawer>
  );
}

function LogCard() {
  const log = useLog();
  const { t } = useI18n();
  const status =
    log.status === "connected"
      ? { tone: "ok", text: t("logStatusOn", log.fileName ?? "Client.txt") }
      : log.status === "needs-permission"
        ? { tone: "warn", text: t("logStatusPermission") }
        : log.status === "unsupported"
          ? { tone: "off", text: t("logUnsupportedTitle") }
          : log.status === "error"
            ? { tone: "warn", text: t("logError") }
            : { tone: "off", text: t("logNotLinked") };
  return (
    <section className="panel-card">
      <h3 className="panel-title">
        <Radio size={16} /> Client.txt
      </h3>
      <div className="log-status">
        <span className={`status-dot status-${status.tone}`} />
        <span>{status.text}</span>
      </div>
      <div className="path-box">
        <code>
          {/* Переносим путь только после обратных слешей, а не посреди слова. */}
          {LOG_PATH.split("\\").map((part, i, all) => (
            <span key={i}>
              {part}
              {i < all.length - 1 && (
                <>
                  \<wbr />
                </>
              )}
            </span>
          ))}
        </code>
        <CopyButton text={LOG_PATH} />
      </div>
      <div className="row">
        {log.status === "connected" || log.status === "needs-permission" ? (
          <>
            {log.status === "needs-permission" && (
              <button className="btn btn-primary btn-sm" onClick={reconnectLog}>
                {t("logResume")}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={disconnectLog}>
              {t("unlinkLog")}
            </button>
          </>
        ) : (
          log.status !== "unsupported" && (
            <button className="btn btn-sm" onClick={connectLog}>
              {t("connectLog")}
            </button>
          )
        )}
      </div>
    </section>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented segmented-wide" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? "is-active" : ""} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

function Settings() {
  const { t } = useI18n();
  const settings = useSettings();
  const keys: [string, string][] = [
    ["→ / J", t("keyNext")],
    ["Backspace / ← / K", t("keyBack")],
    ["G", t("gemLinks")],
    ["B", t("build")],
    ["H", t("keyHints")],
    ["?", t("keySettings")],
    ["Esc", t("keyClose")],
  ];

  return (
    <Drawer title={t("settings")}>
      <section className="form-section">
        <h3>{t("uiLanguage")}</h3>
        <Segmented label={t("uiLanguage")} value={settings.uiLang} options={LANG_OPTIONS} onChange={(uiLang) => settings.set({ uiLang })} />
        <h3>{t("gameLanguage")}</h3>
        <Segmented label={t("gameLanguage")} value={settings.gameLang} options={LANG_OPTIONS} onChange={(gameLang) => settings.set({ gameLang })} />
        <h3>{t("theme")}</h3>
        <Segmented<Theme>
          label={t("theme")}
          value={settings.theme}
          options={[
            { value: "system", label: <><Monitor size={15} /> {t("themeSystem")}</> },
            { value: "light", label: <><Sun size={15} /> {t("themeLight")}</> },
            { value: "dark", label: <><Moon size={15} /> {t("themeDark")}</> },
          ]}
          onChange={(theme) => settings.set({ theme })}
        />
        <h3>{t("hints")}</h3>
        <Segmented<Hints>
          label={t("hints")}
          value={settings.hints}
          options={HINT_ORDER.map((h) => ({ value: h, label: { current: t("hintsCurrent"), all: t("hintsAll"), off: t("hintsOff") }[h] }))}
          onChange={(hints) => settings.set({ hints })}
        />
      </section>
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
          {t("creditsBefore")}{" "}
          <a href="https://github.com/HeartofPhos/exile-leveling" target="_blank" rel="noreferrer">
            exile-leveling
          </a>{" "}
          {t("creditsAfter")}
        </p>
      </section>
    </Drawer>
  );
}
