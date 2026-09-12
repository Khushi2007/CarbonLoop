"use client";

import { useRef, useState } from "react";

/** Mirrors RouteAPIResponse from src/lib/routing/types.ts. */
export type RouteResult = {
  wasteLot: { id: string; wasteType: string; quantityTonnes: number; latitude: number; longitude: number };
  facility: { id: string; name: string; facilityType: string; latitude: number; longitude: number };
  route: {
    distanceKm: number;
    durationMinutes: number;
    estimatedTransportCostInr: number;
    geometry: { type: "LineString"; coordinates: [number, number][] };
  };
};

export type RouteState =
  | { status: "idle" }
  | { status: "loading"; facilityId: string }
  | { status: "error"; facilityId: string; message: string }
  | { status: "success"; facilityId: string; result: RouteResult };

/** Triggers POST /api/routes on demand — routing is a deliberate per-facility decision, not automatic. */
export function useRoute(wasteLotId: string) {
  const [state, setState] = useState<RouteState>({ status: "idle" });
  const requestIdRef = useRef(0);

  async function planRoute(facilityId: string) {
    const requestId = ++requestIdRef.current;
    setState({ status: "loading", facilityId });

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wasteLotId, facilityId }),
      });
      const body = await response.json();
      if (requestIdRef.current !== requestId) return; // superseded by a later selection

      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : `Route request failed (${response.status})`);
      }
      setState({ status: "success", facilityId, result: body as RouteResult });
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      setState({
        status: "error",
        facilityId,
        message: error instanceof Error ? error.message : "Unable to calculate route.",
      });
    }
  }

  return { state, planRoute };
}
