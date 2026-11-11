import { Data, type RouteData } from "common";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { processPob } from "../build/pob";
import { disconnectLog, useLog } from "../log/client-log";
import type { FocusRoute } from "../route/build";
import { useProgress, useUi } from "../store";
import { renderParts } from "./Fragments";

function Drawer({ title, children }: { title: string; children: ReactNode }) {
  const setPanel = useUi((s) => s.setPanel);
  return (
    <>
      <div className="scrim" onClick={() => setPanel(null)} />
      <aside className="drawer" role="dialog" aria-label={title}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={() => setPanel(null)} title="Close (Esc)">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </>
  );
}

export function Panels({ route }: { route: FocusRoute }) {
  const panel = useUi((s) => s.panel);
  switch (panel) {
    case "list":
      return <StepList route={route} />;
    case "gems":
      return <GemLinks />;
    case "build":
      return <BuildPanel />;
    case "help":
      return <Help />;
    default:
      return null;
  }
}

function StepList({ route }: { route: FocusRoute }) {
  const pointer = useProgress((s) => s.pointer);
  const setPointer = useProgress((s) => s.setPointer);
  const setPanel = useUi((s) => s.setPanel);
  const currentRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <Drawer title="Route">
      {route.sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="list-section">
          <h3>{section.name}</h3>
          <ol>
            {route.steps
              .slice(section.firstStep, section.firstStep + section.stepCount)
              .map((item) => (
                <li
                  key={item.index}
                  ref={item.index === pointer ? currentRef : undefined}
                  className={
                    item.index < pointer ? "is-done" : item.index === pointer ? "is-current" : ""
                  }
                  onClick={() => {
                    setPointer(item.index);
                    setPanel(null);
                  }}
                >
                  {renderParts(item.step.parts).head}
                  {item.gems.length > 0 && <span className="list-gems">{item.gems.length} gem{item.gems.length > 1 ? "s" : ""}</span>}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </Drawer>
  );
}

function GemLinks() {
  const gemLinks = useProgress((s) => s.gemLinks);
  return (
    <Drawer title="Gem links">
      {gemLinks.length === 0 && <p className="muted">Import a Path of Building code to see gem links.</p>}
      {groupByTitle(gemLinks).map(([title, groups]) => (
        <section key={title} className="links-group">
          <h3>{title}</h3>
          {groups.map((group, i) => (
            <div key={i} className="links-row">
              {[...group.primaryGems, ...group.secondaryGems].map((link, j) => {
                const gem = Data.Gems[link.id];
                if (!gem) return null;
                return (
                  <span key={j} className={`link-gem ${gem.is_support ? "is-support" : ""}`}>
                    <span className="gem-dot" style={{ background: Data.GemColours[gem.primary_attribute] }} />
                    {gem.name.replace(" Support", "")}
                  </span>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </Drawer>
  );
}

function groupByTitle(groups: RouteData.GemLinkGroup[]) {
  const map = new Map<string, RouteData.GemLinkGroup[]>();
  for (const g of groups) map.set(g.title, [...(map.get(g.title) ?? []), g]);
  return [...map.entries()];
}

function BuildPanel() {
  const { buildData, pobCode, setBuild, setBuildData, resetAll, showSubsteps, toggleSubsteps } =
    useProgress();
  const [code, setCode] = useState(pobCode ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const log = useLog();

  function importCode() {
    if (/^https?:\/\//.test(code.trim())) {
      setMessage("Links are not supported yet: open the build in Path of Building and copy the code.");
      return;
    }
    let pob = null;
    try {
      pob = processPob(code.trim());
    } catch {
      pob = null;
    }
    if (!pob) {
      setMessage("Could not read this code.");
      return;
    }
    setBuild({
      buildData: pob.buildData,
      requiredGems: pob.requiredGems,
      gemLinks: pob.gemLinks,
      pobCode: code.trim(),
    });
    setMessage(`Imported ${pob.buildData.characterClass}: ${pob.requiredGems.length} gems. Progress reset.`);
  }

  return (
    <Drawer title="Build & settings">
      <section className="form-section">
        <h3>Path of Building</h3>
        <textarea
          className="input"
          rows={4}
          placeholder="Paste PoB export code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="row">
          <button className="btn btn-primary" onClick={importCode} disabled={!code.trim()}>
            Import
          </button>
          {message && <span className="muted">{message}</span>}
        </div>
      </section>

      <section className="form-section">
        <h3>Route options</h3>
        <p className="muted">Changing these rebuilds the route and resets progress.</p>
        <label className="check">
          <input
            type="checkbox"
            checked={buildData.leagueStart}
            onChange={(e) => setBuildData({ leagueStart: e.target.checked })}
          />
          League start (extra early-game detours)
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={buildData.library}
            onChange={(e) => setBuildData({ library: e.target.checked })}
          />
          Library quest in Act 3
        </label>
        <label className="field">
          Bandits
          <select
            className="input"
            value={buildData.bandit}
            onChange={(e) => setBuildData({ bandit: e.target.value as RouteData.BuildData["bandit"] })}
          >
            <option value="None">Kill all</option>
            <option value="Alira">Help Alira</option>
            <option value="Oak">Help Oak</option>
            <option value="Kraityn">Help Kraityn</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={showSubsteps} onChange={toggleSubsteps} />
          Show hints under the current step
        </label>
      </section>

      <section className="form-section">
        <h3>Client.txt</h3>
        <p className="muted">
          {log.fileName ? `Linked: ${log.fileName}` : "Not linked."} Find it in{" "}
          <code>&lt;Steam library&gt;\steamapps\common\Path of Exile\logs\Client.txt</code>
        </p>
        {log.fileName && (
          <button className="btn btn-ghost" onClick={disconnectLog}>
            Unlink log
          </button>
        )}
      </section>

      <section className="form-section">
        <h3>Reset</h3>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm("Reset build and progress?")) {
              resetAll();
              setCode("");
              setMessage(null);
            }
          }}
        >
          Reset everything
        </button>
      </section>
    </Drawer>
  );
}

const KEYS: [string, string][] = [
  ["Space / → / J", "Step done"],
  ["Backspace / ← / K", "Step back"],
  ["L", "Full route"],
  ["G", "Gem links"],
  ["B", "Build & settings"],
  ["H", "Toggle hints"],
  ["?", "This help"],
  ["Esc", "Close panel"],
];

function Help() {
  return (
    <Drawer title="Help">
      <section className="form-section">
        <h3>Keys</h3>
        <dl className="keys">
          {KEYS.map(([k, v]) => (
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
        <h3>Auto-progress</h3>
        <p className="muted">
          Click <b>Connect Client.txt</b> (Chrome or Edge) and pick the game log:{" "}
          <code>&lt;Steam library&gt;\steamapps\common\Path of Exile\logs\Client.txt</code>. Each time you
          enter the next zone of the route, the guide moves on by itself. Portals back to town outside the
          route are ignored.
        </p>
      </section>
      <section className="form-section">
        <h3>Credits</h3>
        <p className="muted">
          Route and game data:{" "}
          <a href="https://github.com/HeartofPhos/exile-leveling" target="_blank" rel="noreferrer">
            exile-leveling
          </a>{" "}
          by HeartofPhos (MIT).
        </p>
      </section>
    </Drawer>
  );
}
