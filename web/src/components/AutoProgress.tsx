import { CircleAlert, CircleCheck, FileText, Gamepad2, ShieldCheck, X } from "lucide-react";
import { useI18n } from "../i18n";
import { connectLog, disconnectLog, reconnectLog, useLog } from "../log/client-log";
import { useUi } from "../store";
import { CopyButton } from "./CopyButton";

/** Где лежит Client.txt: обычная установка Steam и клиент с сайта игры. */
export const LOG_PATHS = {
  steam: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Path of Exile\\logs\\Client.txt",
  standalone: "C:\\Program Files (x86)\\Grinding Gear Games\\Path of Exile\\logs\\Client.txt",
};

/** Путь с переносами только после обратных слешей, а не посреди слова. */
export function LogPath({ path }: { path: string }) {
  return (
    <div className="path-box">
      <code>
        {path.split("\\").map((part, i, all) => (
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
      <CopyButton text={path} />
    </div>
  );
}

/** Окно «Автопрогресс»: что это, где взять Client.txt, затем выбор файла. */
export function AutoProgressModal() {
  const { t } = useI18n();
  const log = useLog();
  const setPanel = useUi((s) => s.setPanel);
  const close = () => setPanel(null);

  const pick = async () => {
    await connectLog();
    if (useLog.getState().status === "connected") close();
  };

  return (
    <>
      <div className="scrim" onClick={close} />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="autoprogress-title">
        <header className="modal-head">
          <h2 id="autoprogress-title">{t("autoProgress")}</h2>
          <button className="icon-btn" onClick={close} title={`${t("close")} (Esc)`}>
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">
          <p className="modal-lead">{t("apLead")}</p>

          {log.status === "connected" && (
            <p className="ap-status is-ok">
              <CircleCheck size={16} /> {t("logStatusOn", log.fileName ?? "Client.txt")}
            </p>
          )}
          {log.status === "error" && (
            <p className="ap-status is-warn">
              <CircleAlert size={16} /> {t("logError")}
              {log.error && <code> {log.error}</code>}
            </p>
          )}

          <ol className="ap-steps">
            <li>
              <span className="ap-icon">
                <FileText size={16} />
              </span>
              <div>
                <b>{t("apFindTitle")}</b>
                <p className="muted">{t("apFindSteam")}</p>
                <LogPath path={LOG_PATHS.steam} />
                <p className="muted ap-tip">{t("apFindSteamTip")}</p>
                <p className="muted">{t("apFindStandalone")}</p>
                <LogPath path={LOG_PATHS.standalone} />
              </div>
            </li>
            <li>
              <span className="ap-icon">
                <ShieldCheck size={16} />
              </span>
              <div>
                <b>{t("apPickTitle")}</b>
                <p className="muted">{t("apPickText")}</p>
              </div>
            </li>
            <li>
              <span className="ap-icon">
                <Gamepad2 size={16} />
              </span>
              <div>
                <b>{t("apPlayTitle")}</b>
                <p className="muted">{t("apPlayText")}</p>
              </div>
            </li>
          </ol>
        </div>

        <footer className="modal-foot">
          {log.status === "unsupported" ? (
            <p className="ap-status is-warn">
              <CircleAlert size={16} /> {t("logUnsupportedTitle")}
            </p>
          ) : log.status === "connected" ? (
            <>
              <button className="btn btn-ghost" onClick={disconnectLog}>
                {t("unlinkLog")}
              </button>
              <button className="btn btn-primary" onClick={close}>
                {t("apDone")}
              </button>
            </>
          ) : log.status === "needs-permission" ? (
            <>
              <button className="btn btn-ghost" onClick={pick}>
                {t("apPickOther")}
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  await reconnectLog();
                  if (useLog.getState().status === "connected") close();
                }}
              >
                {t("logResume")}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={pick}>
              <FileText size={16} /> {t("apPick")}
            </button>
          )}
        </footer>
      </div>
    </>
  );
}
