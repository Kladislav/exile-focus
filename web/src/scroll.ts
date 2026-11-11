// Короткая прокрутка окна: встроенная smooth слишком медленная,
// а мгновенная выглядит как рывок.
//
// Цель задаётся функцией и пересчитывается на каждом кадре: карточки зон
// за пределами экрана браузер считает по примерной высоте
// (content-visibility), и настоящая позиция шага уточняется по мере прокрутки.

const DURATION_MS = 180;
/** Сколько кадров после остановки доводить позицию, пока она уточняется. */
const SETTLE_FRAMES = 12;

let frame: number | null = null;

function cancel() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
}

// Пользователь крутит сам — прокрутка уступает.
for (const type of ["wheel", "touchstart", "keydown"] as const) {
  window.addEventListener(type, cancel, { passive: true });
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function clampTop(top: number) {
  return Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
}

function jump(top: number) {
  window.scrollTo({ top, behavior: "instant" });
}

/** Доводка: пока цель сдвигается (досчитались высоты карточек), подстраиваемся. */
function settle(getTop: () => number, framesLeft: number) {
  const target = clampTop(getTop());
  if (Math.abs(target - window.scrollY) >= 1) jump(target);
  frame = framesLeft > 0 ? requestAnimationFrame(() => settle(getTop, framesLeft - 1)) : null;
}

export function scrollWindowTo(getTop: () => number, mode: "fast" | "instant" = "fast") {
  cancel();
  const start = window.scrollY;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (mode === "instant" || reduced) {
    jump(clampTop(getTop()));
    frame = requestAnimationFrame(() => settle(getTop, SETTLE_FRAMES));
    return;
  }
  const startedAt = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - startedAt) / DURATION_MS);
    const target = clampTop(getTop());
    jump(start + (target - start) * easeOutCubic(t));
    frame = requestAnimationFrame(t < 1 ? step : () => settle(getTop, SETTLE_FRAMES));
  };
  frame = requestAnimationFrame(step);
}
