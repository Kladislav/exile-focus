import { useEffect, useMemo, useRef } from "react";
import { Panels } from "./components/Panels";
import { ProgressRail } from "./components/ProgressRail";
import { RouteView } from "./components/RouteView";
import { TopBar } from "./components/TopBar";
import { onAreaEntered, restoreLog } from "./log/client-log";
import { buildFocusRoute, pointerForArea } from "./route/build";
import { HINT_ORDER, useSettings } from "./settings";
import { useProgress, useUi, type Panel } from "./store";

const PANEL_KEYS: Record<string, Panel> = { g: "gems", b: "build", "?": "help" };

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
      <div className="header" ref={headerRef}>
        <TopBar route={route} />
        <ProgressRail route={route} />
      </div>
      <RouteView route={route} />
      <Panels />
    </div>
  );
}
