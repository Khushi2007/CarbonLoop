"use client";

import { useState } from "react";

/** Mirrors RankedMatch from src/lib/matching/types.ts. */
export type RankedMatch = {
  facility: {
    id: string;
    name: string;
    facilityType: string;
    latitude: number;
    longitude: number;
  };
  distanceKm: number;
  estimatedTransportCostInr: number;
  scores: {
    compatibility: number;
    carbonImpact: number;
    distance: number;
    capacity: number;
    cost: number;
  };
  overallScore: number;
  matchReason: string;
};

export type MatchingState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; matches: RankedMatch[] };

/** Triggers POST /api/matches on demand — matching is a deliberate action, not fetched automatically. */
export function useMatches(wasteLotId: string) {
  const [state, setState] = useState<MatchingState>({ status: "idle" });

  async function requestMatches() {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wasteLotId }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : `Matching request failed (${response.status})`);
      }
      setState({ status: "success", matches: body.matches as RankedMatch[] });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to load facility matches.",
      });
    }
  }

  return { state, requestMatches };
}
