import { Data, type RouteData } from "common";
import { gemCostIcon } from "../assets";
import type { FocusStep } from "../route/build";
import { CopyButton } from "./CopyButton";
import { renderParts } from "./Fragments";

type Variant = "current" | "prev" | "next";

export function StepCard({
  item,
  variant,
  showSubsteps,
  onClick,
}: {
  item: FocusStep;
  variant: Variant;
  showSubsteps: boolean;
  onClick?: () => void;
}) {
  const { head, tail } = renderParts(item.step.parts);
  const vendorNames = item.gems
    .filter((g) => g.rewardType === "vendor")
    .map((g) => Data.Gems[g.requiredGem.id]?.name)
    .filter(Boolean);

  return (
    <article className={`card card-${variant}`} onClick={onClick}>
      <div className="card-main">
        <p className="card-text">{head}</p>
        {tail.length > 0 && <div className="card-tail">{tail}</div>}
      </div>

      {variant === "current" && showSubsteps && item.step.subSteps.length > 0 && (
        <ul className="substeps">
          {item.step.subSteps.map((sub, i) => (
            <li key={i}>{renderParts(sub.parts).head}</li>
          ))}
        </ul>
      )}

      {variant !== "prev" && item.gems.length > 0 && (
        <div className="gems">
          {item.gems.map((g, i) => (
            <GemRow key={i} gem={g} compact={variant === "next"} />
          ))}
          {variant === "current" && vendorNames.length > 1 && (
            <div className="gems-search">
              <CopyButton text={`"${vendorNames.join("|")}"`} label="Vendor search" />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function GemRow({ gem, compact }: { gem: RouteData.GemStep; compact: boolean }) {
  const data = Data.Gems[gem.requiredGem.id];
  if (!data) return <div className="gem gem-missing">Unknown gem {gem.requiredGem.id}</div>;
  const cost = gemCostIcon(data.required_level);

  return (
    <div className="gem">
      <span className="gem-dot" style={{ background: Data.GemColours[data.primary_attribute] }} />
      <span className="gem-verb">{gem.rewardType === "quest" ? "Take" : "Buy"}</span>
      <span className="gem-name">
        {data.name}
        {gem.count > 1 && <span className="gem-count"> ×{gem.count}</span>}
      </span>
      {gem.rewardType === "vendor" && (
        <img className="gem-cost" src={cost.src} alt={cost.name} title={cost.name} />
      )}
      {!compact && (
        <>
          <span className="gem-note">{gem.requiredGem.note}</span>
          <CopyButton text={data.name} />
        </>
      )}
    </div>
  );
}
