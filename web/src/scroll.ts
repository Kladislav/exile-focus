// Короткая прокрутка окна: встроенная smooth слишком медленная,
// а мгновенная выглядит как рывок.

const DURATION_MS = 180;

let frame: number | null = null;

function cancel() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
}

// Пользователь крутит сам — анимация уступает.
for (const type of ["wheel", "touchstart", "keydown"] as const) {
  window.addEventListener(type, cancel, { passive: true });
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function scrollWindowTo(top: number, mode: "fast" | "instant" = "fast") {
  cancel();
  const target = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  const start = window.scrollY;
  const distance = target - start;
  if (mode === "instant" || Math.abs(distance) < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: target, behavior: "instant" });
    return;
  }
  const startedAt = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - startedAt) / DURATION_MS);
    window.scrollTo({ top: start + distance * easeOutCubic(t), behavior: "instant" });
    frame = t < 1 ? requestAnimationFrame(step) : null;
  };
  frame = requestAnimationFrame(step);
}
