import { Data, type RouteData } from "common";
import { gemColor } from "../assets";
import { Swords } from "lucide-react";
import { useMemo } from "react";
import { useI18n, type UiKey } from "../i18n";
import { useRegex } from "../regex-store";
import {
  composeRegex,
  DAMAGE_OPTIONS,
  buildLinkSets,
  buildLinksString,
  LINK_OPTIONS,
  MOVEMENT_TIERS,
  SEARCH_LIMIT,
} from "../route/search-strings";
import { useProgress } from "../store";
import { CopyButton } from "./CopyButton";

/** Конструктор строки для поиска у торговца, как раздел Vendor на poe.re. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const { t, game } = useI18n();
  const characterClass = useProgress((s) => s.buildData.characterClass);
  const selection = useRegex();

  const build = useMemo(
    () =>
      ([3, 4] as const)
        .map((size) => {
          const sets = groups ? buildLinkSets(groups, size) : [];
          return { size, sets, query: buildLinksString(sets) };
        })
        .filter((b) => b.sets.length),
    [groups],
  );
  const query = composeRegex(selection);
  const tooLong = query.length > SEARCH_LIMIT;

  return (
    <div className="regex">
      <div className={`regex-result ${tooLong ? "is-too-long" : ""}`}>
        <code className="search-query">{query || t("regexEmpty")}</code>
        <div className="regex-result-side">
          <span className="regex-count">
            {query.length}/{SEARCH_LIMIT}
          </span>
          {query && <CopyButton text={query} />}
        </div>
      </div>

      <RegexGroup title={t("regexLinks")}>
        {LINK_OPTIONS.map((id) => (
          <Toggle key={id} on={selection.links.includes(id)} onClick={() => selection.toggle("links", id)}>
            {t("regexAnyLinks", id === "any3" ? 3 : 4)}
          </Toggle>
        ))}
      </RegexGroup>

      <RegexGroup title={t("regexMovement")}>
        {MOVEMENT_TIERS.map((m) => (
          <Toggle key={m.id} on={selection.movement.includes(m.id)} onClick={() => selection.toggle("movement", m.id)}>
            {m.id}%
          </Toggle>
        ))}
      </RegexGroup>

      <RegexGroup title={t("regexDamage")}>
        {DAMAGE_OPTIONS.map((d) => (
          <Toggle key={d.id} on={selection.damage.includes(d.id)} onClick={() => selection.toggle("damage", d.id)}>
            {t(`regexDamage_${d.id}` as UiKey)}
          </Toggle>
        ))}
      </RegexGroup>

      {build.length > 0 && (
        <section className="regex-group is-build">
          <h4 className="regex-group-title build-title">
            <Swords size={16} />
            {characterClass && characterClass !== "None" ? game.term(characterClass) : t("regexBuild")}
          </h4>
          {build.map(({ size, sets, query }) => (
            <div key={size} className="build-links">
              <div className="build-links-head">
                <span className="search-label">{t("regexBuildLinks", size)}</span>
                <CopyButton text={query} />
              </div>
              <code className="search-query">{query}</code>
              <ul className="build-link-sets">
                {sets.map((set) => (
                  <li key={set.colours.join("")} className="build-link-set">
                    <span className="build-link-gems">
                      {set.gems.map((id) => (
                        <span key={id} className="build-link-gem">
                          <span className="gem-dot" style={{ background: gemColor(Data.Gems[id].primary_attribute) }} />
                          {game.gem(id)}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <div className="search-more">
        <span>{t("searchMore")}</span>
        <a className="search-more-link" href="https://poe.re/#/vendor" target="_blank" rel="noreferrer">
          poe.re
        </a>
      </div>
    </div>
  );
}

function RegexGroup({
  title,
  className = "",
  children,
}: {
  title: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`regex-group ${className}`}>
      <h4 className="regex-group-title">{title}</h4>
      <div className="regex-toggles">{children}</div>
    </section>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={`regex-toggle ${on ? "is-on" : ""}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}
