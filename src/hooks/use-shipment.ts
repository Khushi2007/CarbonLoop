"use client";

import { useRef, useState } from "react";

export type ShipmentStatus = "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "PROCESSED" | "CANCELLED";

/** Mirrors ShipmentSummary from src/lib/shipments/types.ts. */
export type ShipmentSummary = {
  id: string;
  wasteLotId: string;
  facilityId: string;
  distanceKm: number;
  durationMinutes: number;
  transportCostInr: number;
  transportEmissionsKgCo2e: number;
  routeGeometry: { type: "LineString"; coordinates: [number, number][] } | null;
  status: ShipmentStatus;
  scheduledAt: string | null;
  completedAt: string | null;
};

export type ShipmentState =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "created"; shipment: ShipmentSummary }
  | { status: "completing"; shipment: ShipmentSummary }
  | { status: "completed"; shipment: ShipmentSummary; carbonRecordId: string }
  | { status: "error"; stage: "create" | "complete"; message: string; shipment?: ShipmentSummary };

function shipmentOf(state: ShipmentState): ShipmentSummary | undefined {
  if (state.status === "created" || state.status === "completing" || state.status === "completed") return state.shipment;
  if (state.status === "error") return state.shipment;
  return undefined;
}

/**
 * Creating and completing a shipment are two distinct, explicit operations —
 * neither happens automatically. Mirrors the request-ID race guard used by
 * useRoute/useCarbon.
 */
export function useShipment(wasteLotId: string) {
  const [state, setState] = useState<ShipmentState>({ status: "idle" });
  const requestIdRef = useRef(0);

  async function createShipment(facilityId: string) {
    const requestId = ++requestIdRef.current;
    setState({ status: "creating" });

    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wasteLotId, facilityId }),
      });
      const body = await response.json();
      if (requestIdRef.current !== requestId) return;

      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : `Shipment creation failed (${response.status})`);
      }
      setState({ status: "created", shipment: body as ShipmentSummary });
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      setState({
        status: "error",
        stage: "create",
        message: error instanceof Error ? error.message : "Unable to create shipment.",
      });
    }
  }

  async function completeShipment() {
    const shipment = shipmentOf(state);
    if (!shipment) return;

    const requestId = ++requestIdRef.current;
    setState({ status: "completing", shipment });

    try {
      const response = await fetch(`/api/shipments/${shipment.id}/complete`, { method: "POST" });
      const body = await response.json();
      if (requestIdRef.current !== requestId) return;

      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : `Shipment completion failed (${response.status})`);
      }
      setState({ status: "completed", shipment: body.shipment as ShipmentSummary, carbonRecordId: body.carbonRecordId as string });
    } catch (error) {
      if (requestIdRef.current !== requestId) return;
      setState({
        status: "error",
        stage: "complete",
        message: error instanceof Error ? error.message : "Unable to complete shipment.",
        shipment,
      });
    }
  }

  return { state, createShipment, completeShipment, currentShipment: shipmentOf(state) };
}
