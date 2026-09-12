"use client";

import { useEffect, useState } from "react";

export type WasteLotStatus = "AVAILABLE" | "MATCHED" | "IN_TRANSIT" | "PROCESSED" | "CANCELLED";

/** Mirrors the JSON shape returned by GET /api/waste-lots (see src/lib/waste-lots/waste-lots.ts#WasteLotListing). */
export type WasteLotListItem = {
  id: string;
  wasteType: string;
  quantityTonnes: number;
  moisturePercent: number | null;
  qualityScore: number | null;
  location: { latitude: number; longitude: number };
  availableFrom: string;
  status: WasteLotStatus;
  createdAt: string;
  generator: { id: string; name: string; organization: string | null };
};

export type WasteLotsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; wasteLots: WasteLotListItem[] };

/** Fetches every waste lot regardless of status — this register is a full history view, not just the open matching queue. */
export function useWasteLots(): WasteLotsState {
  const [state, setState] = useState<WasteLotsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/waste-lots?status=ALL");
        if (!response.ok) throw new Error(`Waste lot request failed (${response.status})`);
        const body = (await response.json()) as { wasteLots: WasteLotListItem[] };
        if (!cancelled) setState({ status: "success", wasteLots: body.wasteLots });
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load waste lots.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
