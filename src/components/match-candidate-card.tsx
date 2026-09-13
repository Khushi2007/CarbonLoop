"use client";

import { useState } from "react";

import { formatKm } from "@/components/ui/format";
import { formatInr } from "@/components/ui/stat";
import type { RankedMatch } from "@/hooks/use-matches";

/** Mirrors the matching engine's exact weighting: Score = 0.30C + 0.25B + 0.20D + 0.15A + 0.10K. */
const SCORE_ROWS: { key: keyof RankedMatch["scores"]; label: string; weight: string }[] = [
  { key: "compatibility", label: "Compatibility", weight: "30%" },
  { key: "carbonImpact", label: "Carbon impact", weight: "25%" },
  { key: "distance", label: "Distance", weight: "20%" },
  { key: "capacity", label: "Capacity", weight: "15%" },
  { key: "cost", label: "Cost", weight: "10%" },
];

/**
 * One ranked candidate, replacing what used to be a wide table row. Content
 * wraps naturally within a fixed-width card instead of forcing a table to
 * grow past the viewport — no horizontal scrolling is needed at any width.
 */
export function MatchCandidateCard({
  match,
  rank,
  isSelected,
  isPlanning,
  onPlanRoute,
}: {
  match: RankedMatch;
  rank: number;
  isSelected: boolean;
  isPlanning: boolean;
  onPlanRoute: () => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <li
      className={`border-b border-border py-4 first:pt-0 last:border-b-0 ${
        isSelected ? "border-l-2 border-l-accent pl-4" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-foreground-muted">
            {String(rank).padStart(2, "0")} · {match.facility.facilityType}
          </p>
          <p className="mt-0.5 text-base text-foreground">{match.facility.name}</p>
          <p className="mt-1 max-w-prose text-xs text-foreground-muted">{match.matchReason}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="text-right">
            <p className="font-mono text-lg text-foreground">{match.overallScore.toFixed(1)}</p>
            <p className="font-mono text-[0.65rem] text-foreground-muted">score</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-foreground">{formatKm(match.distanceKm)}</p>
            <p className="font-mono text-[0.65rem] text-foreground-muted">distance</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-foreground">{formatInr(match.estimatedTransportCostInr)}</p>
            <p className="font-mono text-[0.65rem] text-foreground-muted">est. cost</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={() => setShowBreakdown((open) => !open)}
          aria-expanded={showBreakdown}
          className="font-mono text-xs text-foreground-secondary hover:text-foreground"
        >
          {showBreakdown ? "Hide score breakdown" : "Score breakdown"}
        </button>
        <button
          type="button"
          onClick={onPlanRoute}
          disabled={isPlanning}
          className="font-mono text-xs text-accent hover:underline disabled:opacity-50"
        >
          {isPlanning ? "Planning…" : "Plan Route →"}
        </button>
      </div>

      {showBreakdown && (
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-3 text-xs sm:grid-cols-5">
          {SCORE_ROWS.map((row) => (
            <div key={row.key}>
              <dt className="font-mono text-[0.65rem] text-foreground-muted">
                {row.label} ({row.weight})
              </dt>
              <dd className="mt-0.5 font-mono text-foreground">{match.scores[row.key].toFixed(1)}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}
