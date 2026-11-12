import type { RouteData } from "common";
import { useMemo } from "react";
import { useI18n } from "../i18n";
import { combinedSearchString, mainLinkColours, plusGemsString, twoHandAxePhysString } from "../route/search-strings";
import { CopyButton } from "./CopyButton";

/** Готовые строки для поиска в окне торговца. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const { t } = useI18n();

  const links = useMemo(
    () =>
      ([3, 4] as const).map((size) => ({
        size,
        ...combinedSearchString(groups ? mainLinkColours(groups, size) : null, size),
      })),
    [groups],
  );

  return (
    <div className="search-strings">
      <p className="panel-hint">{t("searchHelp")}</p>
      {links.map(({ size, query, withBuild }) => (
        <SearchRow key={size} label={t(withBuild ? "searchLinksBuild" : "searchLinks", size)} query={query} />
      ))}
      <SearchRow label={t("searchPlusGems")} query={plusGemsString()} />
      <SearchRow label={t("searchAxePhys")} query={twoHandAxePhysString()} />
      <div className="search-more">
        <span>{t("searchMore")}</span>
        <a className="search-more-link" href="https://poe.re/#/vendor" target="_blank" rel="noreferrer">
          poe.re
        </a>
      </div>
    </div>
  );
}

function SearchRow({ label, query }: { label: string; query: string }) {
  return (
    <div className="search-row">
      <div className="search-main">
        <span className="search-label">{label}</span>
        <code className="search-query">{query}</code>
      </div>
      <CopyButton text={query} />
    </div>
  );
}
