"use client";

import { useRef, useState } from "react";

/** Mirrors CarbonCoefficient from src/lib/carbon/types.ts. */
export type CarbonCoefficient = {
  id: string;
  value: number;
  unit: "kg CO2e per tonne input" | "kg CO2e per tonne-km";
  assumption: "illustrative-demo-mvp";
  description: string;
};

/** Mirrors CarbonCalculationResult from src/lib/carbon/types.ts. */
export type CarbonResult = {
  wasteLot: { id: string; wasteType: string; quantityTonnes: number };
  facility: { id: string; name: string; facilityType: string };
  route: { distanceKm: number; durationMinutes: number; estimatedTransportCostInr: number };
  carbon: {
    wasteQuantityTonnes: number;
    wasteType: string;
    conversionPathway: string;
    conversionOutputTonnes: number;
    routeDistanceKm: number;
    avoidedLandfillEmissionsKgCo2e: number;
    carbonStoredKgCo2e: number;
    processEmissionsKgCo2e: number;
    transportEmissionsKgCo2e: number;
    netCo2eBenefitKgCo2e: number;
    assumptions: {
      landfillBaseline: CarbonCoefficient;
      carbonStored: CarbonCoefficient;
      processEmissions: CarbonCoefficient;
      transportEmissions: CarbonCoefficient;
    };
  };
};

export type CarbonState =
  | { status: "idle" }
  | { status: "loading"; facilityId: string }
  | { status: "error"; facilityId: string; message: string }
  | { status: "success"; facilityId: string; result: CarbonResult };

/**
 * Triggers POST /api/carbon on demand. Note: the backend recomputes its own
 * route internally from {wasteLotId, facilityId} — it does not take the
 * previously-planned route as input. The frontend still gates this action
 * behind a planned route as a deliberate UX sequencing choice, not a
 * backend requirement (see Phase 5 report).
 */
export function useCarbon(wasteLotId: string) {
  const [state, setState] = useState<CarbonState>({ status: "idle" });
  const requestIdRef = useRef(0);

  async function calculateCarbon(facilityId: string) {
    const requestId = ++requestIdRef.current;
    setState({ status: "loading", facilityId });

    try {
      const response = await fetch("/api/carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wasteLotId, facilityId }),
      });
      const body = await response.json();
      if (requestIdRef.current !== requestId) return;

      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : `Carbon calculation failed (${response.status})`);
      }
      setState({ status: "success", facilityId, result: body as CarbonResult });
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      setState({
        status: "error",
        facilityId,
        message: error instanceof Error ? error.message : "Unable to calculate carbon impact.",
      });
    }
  }

  return { state, calculateCarbon };
}
