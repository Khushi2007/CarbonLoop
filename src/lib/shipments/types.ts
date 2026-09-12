import { ShipmentStatus } from "@prisma/client";

import { CarbonBreakdown } from "../carbon/types";
import { EconomicBreakdown } from "../economics/types";
import { RouteGeometry } from "../routing/types";

export type ShipmentError = { code: "NOT_FOUND" | "INCOMPATIBLE_FACILITY" | "FACILITY_UNAVAILABLE" | "WASTE_LOT_NOT_ELIGIBLE" | "INVALID_SHIPMENT_STATE" | "NO_ROUTE" | "NETWORK_ERROR" | "INVALID_RESPONSE" | "INVALID_COORDINATES" | "UNSUPPORTED_CARBON_COEFFICIENT" | "UNSUPPORTED_ECONOMIC_COEFFICIENT" | "INTERNAL_ERROR"; message: string };

export type ShipmentSummary = { id: string; wasteLotId: string; facilityId: string; distanceKm: number; durationMinutes: number; transportCostInr: number; transportEmissionsKgCo2e: number; routeGeometry: RouteGeometry | null; status: ShipmentStatus; scheduledAt: Date | null; completedAt: Date | null };
export type CompletedShipmentResult = { shipment: ShipmentSummary; carbon: CarbonBreakdown; economics: EconomicBreakdown; carbonRecordId: string; };
