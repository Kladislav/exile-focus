import type { RouteData } from "common";
import { useMemo } from "react";
import { useI18n, type UiKey } from "../i18n";
import { useRegex } from "../regex-store";
import {
  composeRegex,
  DAMAGE_OPTIONS,
  linkGroupColours,
  MOVEMENT_TIERS,
  SEARCH_LIMIT,
  twoHandAxePhysString,
  WEAPON_OPTIONS,
  type LinkOption,
} from "../route/search-strings";
import { useProgress } from "../store";
import { CopyButton } from "./CopyButton";

/** Конструктор строки для поиска у торговца, как раздел Vendor на poe.re. */
export function SearchStrings({ groups }: { groups?: RouteData.GemLinkGroup[] }) {
  const { t, game } = useI18n();
  const characterClass = useProgress((s) => s.buildData.characterClass);
  const selection = useRegex();

  const buildColours = useMemo(
    () => ({ 3: groups ? linkGroupColours(groups, 3) : [], 4: groups ? linkGroupColours(groups, 4) : [] }),
    [groups],
  );
  const query = composeRegex(selection, buildColours);
  const tooLong = query.length > SEARCH_LIMIT;

  const links: { id: LinkOption; label: string; build?: boolean }[] = [
    ...(buildColours[3].length ? [{ id: "build3" as const, label: t("regexBuildLinks", 3), build: true }] : []),
    ...(buildColours[4].length ? [{ id: "build4" as const, label: t("regexBuildLinks", 4), build: true }] : []),
    { id: "any3", label: t("regexAnyLinks", 3) },
    { id: "any4", label: t("regexAnyLinks", 4) },
  ];

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
        {links.map((l) => (
          <Toggle
            key={l.id}
            on={selection.links.includes(l.id)}
            onClick={() => selection.toggle("links", l.id)}
            build={l.build}
          >
            {l.label}
            {l.build && <span className="search-tag">{game.term(characterClass)}</span>}
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

      <RegexGroup title={t("regexWeapons")} note={t("regexWeaponsNote")}>
        {WEAPON_OPTIONS.map((w) => (
          <Toggle key={w.id} on={selection.weapons.includes(w.id)} onClick={() => selection.toggle("weapons", w.id)}>
            {t(`regexWeapon_${w.id}` as UiKey)}
          </Toggle>
        ))}
      </RegexGroup>

      <div className="search-row">
        <div className="search-main">
          <span className="search-label">{t("searchAxePhys")}</span>
          <code className="search-query">{twoHandAxePhysString()}</code>
        </div>
        <CopyButton text={twoHandAxePhysString()} />
      </div>

      <div className="search-more">
        <span>{t("searchMore")}</span>
        <a className="search-more-link" href="https://poe.re/#/vendor" target="_blank" rel="noreferrer">
          poe.re
        </a>
      </div>
    </div>
  );
}

function RegexGroup({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="regex-group">
      <h4 className="regex-group-title">{title}</h4>
      {note && <p className="regex-note">{note}</p>}
      <div className="regex-toggles">{children}</div>
    </section>
  );
}

function Toggle({
  on,
  onClick,
  build,
  children,
}: {
  on: boolean;
  onClick: () => void;
  build?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button className={`regex-toggle ${on ? "is-on" : ""} ${build ? "is-build" : ""}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}
