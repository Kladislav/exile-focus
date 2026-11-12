import { Data, type RouteData } from "common";
import { useMemo } from "react";
import { gemColor } from "../assets";
import { useI18n } from "../i18n";
import {
  buildLinkString,
  combinedSearchString,
  mainLinkColours,
  plusGemsString,
} from "../route/search-strings";
import { useSettings } from "../settings";
import { CopyButton } from "./CopyButton";

/** Готовые строки для поиска в окне торговца. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const gameLang = useSettings((s) => s.gameLang);
  const { t, game } = useI18n();

  const rows = useMemo(
    () =>
      ([3, 4] as const).map((size) => {
        const colours = groups ? mainLinkColours(groups, size) : null;
        return { size, colours, combined: combinedSearchString(gameLang, colours, size) };
      }),
    [gameLang, groups],
  );
  const forBuild = rows.filter((r) => r.colours);

  return (
    <div className="search-strings">
      <p className="panel-hint">{t("searchHelp")}</p>
      <div className="search-combined">
        {rows.map(({ size, combined }) => (
          <SearchRow key={size} label={t(size === 3 ? "searchCombined" : "searchCombined4")} query={combined.query}>
            <span className="search-gems">{t(combined.withBuild ? "searchCombinedBuild" : "searchCombinedHint", size)}</span>
          </SearchRow>
        ))}
      </div>

      <SearchRow label={t("searchPlusGems")} query={plusGemsString(gameLang)}>
        <span className="search-gems">{t("searchPlusGemsHint")}</span>
      </SearchRow>

      {forBuild.length > 0 && (
        <>
          <h4 className="search-group">{t("searchForBuild")}</h4>
          {forBuild.map(({ size, colours }) => (
            <SearchRow
              key={size}
              label={t(size === 3 ? "search_build3" : "search_build4")}
              query={buildLinkString(gameLang, colours!)}
            >
              <span className="search-gems">
                {colours!.gems.map((id) => (
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

      <p className="search-credit">
        {t("searchCredit")}{" "}
        <a href="https://poe.re/#/vendor" target="_blank" rel="noreferrer">
          poe.re
        </a>
      </p>
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
