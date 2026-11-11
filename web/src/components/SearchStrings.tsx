import { Data, type RouteData } from "common";
import { useMemo } from "react";
import { gemColor } from "../assets";
import { useI18n, type UiKey } from "../i18n";
import { buildSearchStrings, commonSearchStrings } from "../route/search-strings";
import { useSettings } from "../settings";
import { CopyButton } from "./CopyButton";

/** Готовые строки для поиска в окне торговца: общие и под связку билда. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const gameLang = useSettings((s) => s.gameLang);
  const { t, game } = useI18n();
  const common = useMemo(() => commonSearchStrings(gameLang), [gameLang]);
  const forBuild = useMemo(() => (groups ? buildSearchStrings(groups) : []), [groups]);

  return (
    <div className="search-strings">
      <p className="panel-hint">{t("searchHelp")}</p>
      {forBuild.length > 0 && (
        <>
          <h4 className="search-group">{t("searchForBuild")}</h4>
          {forBuild.map((s) => (
            <SearchRow key={s.id} label={t(`search_${s.id}` as UiKey)} query={s.query}>
              <span className="search-gems">
                {s.gems.map((id) => (
                  <span key={id} className="search-gem">
                    <span className="gem-dot" style={{ background: gemColor(Data.Gems[id]?.primary_attribute ?? "") }} />
                    {game.gem(id)}
                  </span>
                ))}
              </span>
            </SearchRow>
          ))}
        </>
      )}
      <h4 className="search-group">{t("searchCommon")}</h4>
      {common.map((s) => (
        <SearchRow key={s.id} label={t(`search_${s.id}` as UiKey)} query={s.query} />
      ))}
    </div>
  );
}

function SearchRow({ label, query, children }: { label: string; query: string; children?: React.ReactNode }) {
  return (
    <div className="search-row">
      <div className="search-main">
        <span className="search-label">{label}</span>
        <code className="search-query">{query}</code>
        {children}
      </div>
      <CopyButton text={query} />
    </div>
  );
}
