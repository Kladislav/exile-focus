import type { RouteData } from "common";
import { useMemo } from "react";
import { useI18n } from "../i18n";
import { useProgress } from "../store";
import { combinedSearchString, mainLinkColours, plusGemsString, twoHandAxePhysString } from "../route/search-strings";
import { CopyButton } from "./CopyButton";

/** Готовые строки для поиска в окне торговца. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const { t, game } = useI18n();
  const characterClass = useProgress((s) => s.buildData.characterClass);

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
      {links.map(({ size, query, withBuild }) => (
        <SearchRow
          key={size}
          label={t("searchLinks", size)}
          query={query}
          build={withBuild ? game.term(characterClass) : undefined}
        />
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

/** `build` — строка собрана под билд: рамка и мелкая подпись класса. */
function SearchRow({ label, query, build }: { label: string; query: string; build?: string }) {
  return (
    <div className={`search-row ${build ? "is-build" : ""}`}>
      <div className="search-main">
        <span className="search-label">
          {label}
          {build && <span className="search-tag">{build}</span>}
        </span>
        <code className="search-query">{query}</code>
      </div>
      <CopyButton text={query} />
    </div>
  );
}
