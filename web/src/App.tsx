import { useEffect, useMemo, useRef } from "react";
import { ActNav } from "./components/ActNav";
import { BuildEmpty, BuildSidebar } from "./components/BuildSidebar";
import { Panels } from "./components/Panels";
import { ProgressRail } from "./components/ProgressRail";
import { RouteView } from "./components/RouteView";
import { TopBar } from "./components/TopBar";
import { RouteContext } from "./route-context";
import { onAreaEntered, restoreLog } from "./log/client-log";
import { buildFocusRoute, pointerForArea } from "./route/build";
import { HINT_ORDER, useSettings } from "./settings";
import { useProgress, useUi, type Panel } from "./store";

/**
 * Клавиша по физическому месту, а не по символу: в русской раскладке J — это «о»,
 * а хоткеи должны работать при любой раскладке.
 */
function hotkey(e: KeyboardEvent): string {
  if (e.code.startsWith("Key")) return e.code.slice(3).toLowerCase();
  if (e.code === "Slash" && e.shiftKey) return "?";
  return e.key.length === 1 ? e.key.toLowerCase() : e.key;
}

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

/** Высота липкой шапки — для заголовков актов, сайдбаров и прокрутки к шагу. */
function useHeaderHeight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    update();
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function App() {
  const buildData = useProgress((s) => s.buildData);
  const requiredGems = useProgress((s) => s.requiredGems);
  useTheme();
  const headerRef = useHeaderHeight();

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

      const { pointer, setPointer } = useProgress.getState();
      const { panel, setPanel } = useUi.getState();
      const key = hotkey(e);

      if (key === "Escape") return setPanel(null);
      if (key in PANEL_KEYS) {
        const p = PANEL_KEYS[key];
        // На широком экране панель билда и так в правой колонке.
        if (p === "gems" && matchMedia("(min-width: 1280px)").matches) return;
        return setPanel(panel === p ? null : p);
      }
      if (key === "h") {
        const { hints, set } = useSettings.getState();
        return set({ hints: HINT_ORDER[(HINT_ORDER.indexOf(hints) + 1) % HINT_ORDER.length] });
      }
      if (panel) return;

      // Пробел шаги не листает: его легко задеть случайно. Зажатая клавиша
      // срабатывает один раз — автоповтор не пролистывает пачку шагов.
      if (key === "ArrowRight" || key === "j") {
        e.preventDefault();
        if (!e.repeat && pointer < route.steps.length) setPointer(pointer + 1);
      } else if (key === "Backspace" || key === "ArrowLeft" || key === "k") {
        e.preventDefault();
        if (!e.repeat) setPointer(pointer - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route]);

  return (
    <RouteContext.Provider value={route}>
      <div className="app">
        <div className="header" ref={headerRef}>
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
    </RouteContext.Provider>
  );
}
