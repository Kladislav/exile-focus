import { Data, type RouteData } from "common";
import { useMemo } from "react";
import { gemColor } from "../assets";
import { useI18n, type UiKey } from "../i18n";
import { buildLinkPattern, buildSearchStrings, combinedSearchString } from "../route/search-strings";
import { useSettings } from "../settings";
import { CopyButton } from "./CopyButton";

/** Готовые строки для поиска в окне торговца: общие и под связку билда. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const gameLang = useSettings((s) => s.gameLang);
  const { t, game } = useI18n();
  const forBuild = useMemo(() => (groups ? buildSearchStrings(groups) : []), [groups]);
  // Две общие строки: в начале ищут 3 связанных, к середине игры — 4.
  const combined = useMemo(
    () =>
      ([3, 4] as const).map((size) => ({
        size,
        ...combinedSearchString(gameLang, groups ? (buildLinkPattern(groups, size) ?? undefined) : undefined, size),
      })),
    [gameLang, groups],
  );

  return (
    <div className="search-strings">
      <p className="panel-hint">{t("searchHelp")}</p>
      <div className="search-combined">
        {combined.map((c) => (
          <SearchRow key={c.size} label={t(c.size === 3 ? "searchCombined" : "searchCombined4")} query={c.query}>
            <span className="search-gems">
              {t(c.withBuild ? "searchCombinedBuild" : "searchCombinedHint", c.size)}
            </span>
          </SearchRow>
        ))}
      </div>
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
