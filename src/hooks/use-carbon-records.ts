"use client";

import type { FacilityType, ShipmentStatus } from "@prisma/client";
import { useEffect, useState } from "react";

/**
 * Mirrors the JSON shape returned by GET /api/carbon-records (see
 * src/lib/ledger/ledger.ts#serialize). Declared here rather than imported
 * from src/lib/ledger because that module pulls in the Prisma client at
 * runtime and is not meant to be bundled into client code.
 */
export type LedgerRecord = {
  id: string;
  shipmentId: string;
  createdAt: string;
  waste: {
    id: string;
    type: string;
    quantityTonnes: number;
    generator: { id: string; name: string; organization: string | null };
  };
  conversion: {
    facility: { id: string; name: string; facilityType: FacilityType };
    pathway: string;
    outputTonnes: number;
  };
  logistics: {
    distanceKm: number;
    durationMinutes: number;
    transportCostInr: number;
    transportEmissionsKgCo2e: number;
    shipmentStatus: ShipmentStatus;
  };
  carbon: {
    avoidedLandfillEmissionsKgCo2e: number;
    carbonStoredKgCo2e: number;
    processEmissionsKgCo2e: number;
    transportEmissionsKgCo2e: number;
    netCo2eBenefitKgCo2e: number;
  };
  economics: {
    transportCostInr: number;
    avoidedLandfillValueInr: number;
    conversionOutputValueInr: number;
    carbonRelatedValueInr: number;
    estimatedEconomicValueInr: number;
  };
};

export type LedgerTotals = {
  recordCount: number;
  totalNetCo2eKg: number;
  totalEconomicValueInr: number;
};

export type LedgerState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; records: LedgerRecord[]; totals: LedgerTotals };

function aggregate(records: LedgerRecord[]): LedgerTotals {
  return records.reduce(
    (totals, record) => ({
      recordCount: totals.recordCount + 1,
      totalNetCo2eKg: totals.totalNetCo2eKg + record.carbon.netCo2eBenefitKgCo2e,
      totalEconomicValueInr: totals.totalEconomicValueInr + record.economics.estimatedEconomicValueInr,
    }),
    { recordCount: 0, totalNetCo2eKg: 0, totalEconomicValueInr: 0 },
  );
}

/** Fetches the Carbon Ledger and aggregates client-side; no summary endpoint exists. */
export function useCarbonRecords(): LedgerState {
  const [state, setState] = useState<LedgerState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/carbon-records");
        if (!response.ok) throw new Error(`Ledger request failed (${response.status})`);
        const body = (await response.json()) as { records: LedgerRecord[] };
        if (!cancelled) setState({ status: "success", records: body.records, totals: aggregate(body.records) });
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load ledger data.",
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

export type CarbonRecordState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found" }
  | { status: "success"; record: LedgerRecord };

/** Fetches a single persisted ledger record via GET /api/carbon-records/[id]. Never recalculates anything. */
export function useCarbonRecord(id: string): CarbonRecordState {
  const [state, setState] = useState<CarbonRecordState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/carbon-records/${id}`);
        if (response.status === 404) {
          if (!cancelled) setState({ status: "not-found" });
          return;
        }
        if (!response.ok) throw new Error(`Ledger record request failed (${response.status})`);
        const record = (await response.json()) as LedgerRecord;
        if (!cancelled) setState({ status: "success", record });
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load this ledger record.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
