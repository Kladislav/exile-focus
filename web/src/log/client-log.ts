import { create } from "zustand";
import { idbDelete, idbGet, idbSet } from "./idb";

/**
 * Автопрогресс по Client.txt через File System Access API (Chrome/Edge).
 * Файл читается с конца: раз в секунду берём только дописанные байты.
 */

const POLL_MS = 1000;
const INITIAL_TAIL_BYTES = 256 * 1024;
const HANDLE_KEY = "client-log-handle";

const AREA_RE = /Generating level (\d+) area "([^"]+)"/;
const LEVEL_RE = /: (\S+) \((\w+)\) is now level (\d+)/;

export type LogStatus =
  | "unsupported"
  | "idle"
  | "needs-permission"
  | "connected"
  | "error";

interface LogState {
  status: LogStatus;
  fileName: string | null;
  areaId: string | null;
  areaLevel: number | null;
  charName: string | null;
  charClass: string | null;
  level: number | null;
  error: string | null;
}

export const useLog = create<LogState>(() => ({
  status: "showOpenFilePicker" in window ? "idle" : "unsupported",
  fileName: null,
  areaId: null,
  areaLevel: null,
  charName: null,
  charClass: null,
  level: null,
  error: null,
}));

type AreaListener = (areaId: string) => void;
const areaListeners = new Set<AreaListener>();

export function onAreaEntered(listener: AreaListener) {
  areaListeners.add(listener);
  return () => {
    areaListeners.delete(listener);
  };
}

let handle: FileSystemFileHandle | null = null;
let timer: number | null = null;
let offset = 0;
let decoder = new TextDecoder();
let partialLine = "";

function processLine(line: string, live: boolean) {
  const area = AREA_RE.exec(line);
  if (area) {
    const areaId = area[2];
    useLog.setState({ areaId, areaLevel: Number(area[1]) });
    if (live) areaListeners.forEach((l) => l(areaId));
    return;
  }

  const level = LEVEL_RE.exec(line);
  if (level) {
    useLog.setState({
      charName: level[1],
      charClass: level[2],
      level: Number(level[3]),
    });
  }
}

function processChunk(bytes: ArrayBuffer, live: boolean) {
  const text = partialLine + decoder.decode(bytes, { stream: true });
  const lines = text.split(/\r?\n/);
  partialLine = lines.pop() ?? "";
  for (const line of lines) processLine(line, live);
}

async function poll() {
  if (!handle) return;
  try {
    const file = await handle.getFile();
    if (file.size < offset) {
      // Файл очистили или пересоздали.
      offset = 0;
      partialLine = "";
      decoder = new TextDecoder();
    }
    if (file.size > offset) {
      const bytes = await file.slice(offset, file.size).arrayBuffer();
      offset = file.size;
      processChunk(bytes, true);
    }
  } catch (e) {
    stop();
    useLog.setState({ status: "error", error: String(e) });
  }
}

async function start(h: FileSystemFileHandle) {
  stop();
  handle = h;
  const file = await h.getFile();

  // Хвост лога читаем один раз, чтобы узнать текущую зону и уровень,
  // но прогресс по нему не двигаем: это прошлые события.
  offset = Math.max(0, file.size - INITIAL_TAIL_BYTES);
  decoder = new TextDecoder();
  partialLine = "";
  const tail = await file.slice(offset, file.size).arrayBuffer();
  offset = file.size;
  processChunk(tail, false);

  useLog.setState({ status: "connected", fileName: file.name, error: null });
  timer = window.setInterval(poll, POLL_MS);
}

function stop() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
}

export async function connectLog() {
  try {
    const [h] = await window.showOpenFilePicker({
      id: "poe-client-log",
      types: [{ description: "Client.txt", accept: { "text/plain": [".txt"] } }],
    });
    await idbSet(HANDLE_KEY, h);
    await start(h);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    useLog.setState({ status: "error", error: String(e) });
  }
}

/** Повторный доступ после перезагрузки страницы; нужен клик пользователя. */
export async function reconnectLog() {
  const h = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  if (!h) return connectLog();
  try {
    if ((await h.requestPermission({ mode: "read" })) === "granted") {
      await start(h);
    }
  } catch (e) {
    useLog.setState({ status: "error", error: String(e) });
  }
}

export async function disconnectLog() {
  stop();
  handle = null;
  await idbDelete(HANDLE_KEY);
  useLog.setState({ status: "idle", fileName: null, error: null });
}

export async function restoreLog() {
  if (useLog.getState().status === "unsupported") return;
  const h = await idbGet<FileSystemFileHandle>(HANDLE_KEY);
  if (!h) return;
  useLog.setState({ fileName: h.name });
  const permission = await h.queryPermission({ mode: "read" });
  if (permission === "granted") await start(h);
  else useLog.setState({ status: "needs-permission" });
}
