import { useEffect, useMemo } from "react";
import { ActNav } from "./components/ActNav";
import { BuildEmpty, BuildSidebar } from "./components/BuildSidebar";
import { Panels } from "./components/Panels";
import { ProgressRail } from "./components/ProgressRail";
import { RouteView } from "./components/RouteView";
import { TopBar } from "./components/TopBar";
import { onAreaEntered, restoreLog } from "./log/client-log";
import { buildFocusRoute, pointerForArea } from "./route/build";
import { HINT_ORDER, useSettings } from "./settings";
import { useProgress, useUi, type Panel } from "./store";

const PANEL_KEYS: Record<string, Panel> = { g: "gems", b: "build", "?": "settings", s: "settings" };

function useTheme() {
  const theme = useSettings((s) => s.theme);
  const uiLang = useSettings((s) => s.uiLang);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = uiLang;
  }, [uiLang]);
}

/** Высота шапки нужна липким заголовкам актов. */
export function App() {
  const buildData = useProgress((s) => s.buildData);
  const requiredGems = useProgress((s) => s.requiredGems);
  useTheme();

  const route = useMemo(() => buildFocusRoute(buildData, requiredGems), [buildData, requiredGems]);
  const pointer = useProgress((s) => s.pointer);
  const hasBuild = useProgress((s) => s.gemLinks.length > 0 || s.buildTrees.length > 0);
  const currentStep = route.steps[Math.min(pointer, route.steps.length - 1)];
  const act = currentStep ? currentStep.sectionIndex + 1 : 1;

  // Указатель мог сохраниться от более длинного маршрута.
  useEffect(() => {
    const { pointer, setPointer } = useProgress.getState();
    if (pointer > route.steps.length) setPointer(route.steps.length);
  }, [route]);

  useEffect(() => {
    restoreLog();
  }, []);

  useEffect(
    () =>
      onAreaEntered((areaId) => {
        const { pointer, setPointer } = useProgress.getState();
        const next = pointerForArea(route, pointer, areaId);
        if (next !== null) setPointer(next);
      }),
    [route],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target;
      if (target instanceof Element && target.closest("input, textarea, select")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Иначе пробел нажмёт кнопку в фокусе и шаг сдвинется дважды.
      if (target instanceof HTMLButtonElement) target.blur();

      const { pointer, setPointer } = useProgress.getState();
      const { panel, setPanel } = useUi.getState();
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === "Escape") return setPanel(null);
      if (key in PANEL_KEYS) {
        const p = PANEL_KEYS[key];
        return setPanel(panel === p ? null : p);
      }
      if (key === "h") {
        const { hints, set } = useSettings.getState();
        return set({ hints: HINT_ORDER[(HINT_ORDER.indexOf(hints) + 1) % HINT_ORDER.length] });
      }
      if (panel) return;

      if (key === " " || key === "ArrowRight" || key === "j") {
        e.preventDefault();
        if (pointer < route.steps.length) setPointer(pointer + 1);
      } else if (key === "Backspace" || key === "ArrowLeft" || key === "k") {
        e.preventDefault();
        setPointer(pointer - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route]);

  return (
    <div className="app">
      <div className="header">
        <TopBar />
        <ProgressRail route={route} />
      </div>
      <div className="layout">
        <aside className="layout-left">
          <ActNav route={route} />
        </aside>
        <RouteView route={route} />
        <aside className="layout-right">{hasBuild ? <BuildSidebar act={act} /> : <BuildEmpty />}</aside>
      </div>
      <Panels act={act} />
    </div>
  );
}
