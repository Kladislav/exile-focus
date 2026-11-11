import { useEffect, useMemo } from "react";
import { FocusView } from "./components/FocusView";
import { Panels } from "./components/Panels";
import { ProgressRail } from "./components/ProgressRail";
import { TopBar } from "./components/TopBar";
import { onAreaEntered, restoreLog } from "./log/client-log";
import { buildFocusRoute, pointerForArea } from "./route/build";
import { useProgress, useUi, type Panel } from "./store";

const PANEL_KEYS: Record<string, Panel> = { l: "list", g: "gems", b: "build", "?": "help" };

export function App() {
  const buildData = useProgress((s) => s.buildData);
  const requiredGems = useProgress((s) => s.requiredGems);

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

      const { pointer, setPointer, toggleSubsteps } = useProgress.getState();
      const { panel, setPanel } = useUi.getState();
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === "Escape") return setPanel(null);
      if (key in PANEL_KEYS) {
        const p = PANEL_KEYS[key];
        return setPanel(panel === p ? null : p);
      }
      if (key === "h") return toggleSubsteps();
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
      <TopBar route={route} />
      <ProgressRail route={route} />
      <FocusView route={route} />
      <Panels route={route} />
    </div>
  );
}
