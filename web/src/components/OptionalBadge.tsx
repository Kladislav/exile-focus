import { Data } from "common";
import { gemColor } from "../assets";
import type { I18n } from "../i18n";
import type { OptionalInfo } from "../route/build";

/** Сколько гемов торговца показывать списком; дальше только число. */
const VENDOR_LIST_LIMIT = 24;

/** Метка необязательного квеста и подсказка: ради каких гемов он нужен. */
export function OptionalBadge({ info, i18n }: { info: OptionalInfo; i18n: I18n }) {
  const { t, game } = i18n;
  const forBuild = info.neededGems.length > 0;
  return (
    <span className={`opt-badge ${forBuild ? "is-build" : ""}`} tabIndex={0} onClick={(e) => e.stopPropagation()}>
      {forBuild ? t("optionalForBuild") : t("optional")}
      <span className="opt-pop" role="tooltip">
        <b className="opt-title">{game.quest(info.questId)}</b>
        <span className="opt-text">{forBuild ? t("optionalNeeded") : t("optionalHint")}</span>
        {forBuild ? (
          <GemList ids={info.neededGems} i18n={i18n} />
        ) : (
          <>
            {info.questGems.length > 0 && (
              <>
                <span className="opt-sub">{t("optionalReward")}</span>
                <GemList ids={info.questGems} i18n={i18n} />
              </>
            )}
            {info.vendorGems.length > 0 && (
              <>
                <span className="opt-sub">{t("optionalVendor")}</span>
                {info.vendorGems.length > VENDOR_LIST_LIMIT ? (
                  <span className="opt-text">{t("optionalVendorMany", info.vendorGems.length)}</span>
                ) : (
                  <GemList ids={info.vendorGems} i18n={i18n} />
                )}
              </>
            )}
          </>
        )}
      </span>
    </span>
  );
}

function GemList({ ids, i18n }: { ids: string[]; i18n: I18n }) {
  const sorted = [...ids].sort((a, b) => i18n.game.gem(a).localeCompare(i18n.game.gem(b)));
  return (
    <span className="opt-gems">
      {sorted.map((id) => (
        <span key={id} className="opt-gem">
          <span className="gem-dot" style={{ background: gemColor(Data.Gems[id]?.primary_attribute ?? "") }} />
          {i18n.game.gem(id)}
        </span>
      ))}
    </span>
  );
}
