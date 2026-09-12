import { FacilityStatus, Prisma, ShipmentStatus, WasteLotStatus } from "@prisma/client";

import { calculateCarbonBreakdown, calculateTransportEmissionsKgCo2e, getCarbonAssumptions } from "../carbon/engine";
import { TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM } from "../carbon/constants";
import { prisma } from "../db/prisma";
import { calculateEconomicBreakdown, getEconomicAssumptions } from "../economics/engine";
import { calculateRouteForCoordinates } from "../routing/routing";
import { RouteGeometry } from "../routing/types";
import { CompletedShipmentResult, ShipmentError, ShipmentSummary } from "./types";

const shipmentSummary = (shipment: { id: string; wasteLotId: string; facilityId: string; distanceKm: Prisma.Decimal; durationMinutes: number; transportCost: Prisma.Decimal; transportEmissionsKgCo2e: Prisma.Decimal; routeGeometry: Prisma.JsonValue | null; status: ShipmentStatus; scheduledAt: Date | null; completedAt: Date | null }): ShipmentSummary => ({
  id: shipment.id, wasteLotId: shipment.wasteLotId, facilityId: shipment.facilityId, distanceKm: Number(shipment.distanceKm), durationMinutes: shipment.durationMinutes, transportCostInr: Number(shipment.transportCost), transportEmissionsKgCo2e: Number(shipment.transportEmissionsKgCo2e), routeGeometry: shipment.routeGeometry as RouteGeometry | null, status: shipment.status, scheduledAt: shipment.scheduledAt, completedAt: shipment.completedAt,
});

const COMPLETABLE_SHIPMENT_STATUSES: ShipmentStatus[] = [ShipmentStatus.SCHEDULED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED];

/**
 * Carries an already-classified domain ShipmentError out of a Prisma
 * interactive transaction. Throwing (rather than returning) it rolls back
 * every write made earlier in the same transaction, while the outer catch
 * still returns the intended typed result instead of an unhandled crash.
 */
class ShipmentDomainError extends Error {
  constructor(public readonly result: ShipmentError) {
    super(result.message);
  }
}

export async function createShipment(wasteLotId: string, facilityId: string): Promise<ShipmentSummary | ShipmentError> {
  const [wasteLot, facility] = await Promise.all([prisma.wasteLot.findUnique({ where: { id: wasteLotId } }), prisma.facility.findUnique({ where: { id: facilityId } })]);
  if (!wasteLot) return { code: "NOT_FOUND", message: "Waste lot not found" };
  if (!facility) return { code: "NOT_FOUND", message: "Facility not found" };
  const quantityTonnes = Number(wasteLot.quantityTonnes);
  if (wasteLot.status !== WasteLotStatus.AVAILABLE || quantityTonnes <= 0) return { code: "WASTE_LOT_NOT_ELIGIBLE", message: "Waste lot is not available for shipment." };
  if (facility.status !== FacilityStatus.ACTIVE || Number(facility.availableCapacityTonnes) < quantityTonnes) return { code: "FACILITY_UNAVAILABLE", message: "Facility is not active or lacks available capacity." };
  if (!facility.acceptedWasteTypes.includes(wasteLot.wasteType)) return { code: "INCOMPATIBLE_FACILITY", message: "Facility does not accept this waste type." };

  const route = await calculateRouteForCoordinates({ origin: [Number(wasteLot.longitude), Number(wasteLot.latitude)], destination: [Number(facility.longitude), Number(facility.latitude)], quantityTonnes });
  if ("code" in route) return route;
  const transportEmissionsKgCo2e = calculateTransportEmissionsKgCo2e(quantityTonnes, route.distanceKm, TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM.value);

  try {
    return await prisma.$transaction(async (tx) => {
      // Conditional transition is the concurrency guard: only one request can claim AVAILABLE.
      // Throwing (rather than returning) on failure ensures nothing partial is ever committed:
      // both claims below must succeed together, or the whole transaction rolls back.
      const claimedLot = await tx.wasteLot.updateMany({ where: { id: wasteLotId, status: WasteLotStatus.AVAILABLE }, data: { status: WasteLotStatus.MATCHED } });
      if (claimedLot.count !== 1) throw new ShipmentDomainError({ code: "WASTE_LOT_NOT_ELIGIBLE", message: "Waste lot was already claimed for another shipment." });

      // Same atomic-conditional pattern for facility capacity: the conditional decrement
      // only succeeds while enough capacity remains, so concurrent shipments can never
      // jointly overbook a facility. Throwing here also rolls back the waste-lot claim above.
      const claimedCapacity = await tx.facility.updateMany({ where: { id: facilityId, availableCapacityTonnes: { gte: quantityTonnes } }, data: { availableCapacityTonnes: { decrement: quantityTonnes } } });
      if (claimedCapacity.count !== 1) throw new ShipmentDomainError({ code: "FACILITY_UNAVAILABLE", message: "Facility no longer has sufficient available capacity." });

      const shipment = await tx.shipment.create({ data: { wasteLotId, facilityId, distanceKm: route.distanceKm, durationMinutes: Math.round(route.durationMinutes), transportCost: route.estimatedTransportCostInr, transportEmissionsKgCo2e, routeGeometry: route.geometry, status: ShipmentStatus.SCHEDULED, scheduledAt: new Date() } });
      return shipmentSummary(shipment);
    });
  } catch (error) {
    if (error instanceof ShipmentDomainError) return error.result;
    return { code: "WASTE_LOT_NOT_ELIGIBLE", message: "Unable to create shipment because the waste lot was already claimed." };
  }
}

export async function completeShipment(shipmentId: string): Promise<CompletedShipmentResult | ShipmentError> {
  try {
    return await prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({ where: { id: shipmentId }, include: { wasteLot: true, facility: true, carbonRecord: true } });
      if (!shipment) return { code: "NOT_FOUND", message: "Shipment not found" };
      const makeResult = (record: NonNullable<typeof shipment.carbonRecord>): CompletedShipmentResult => {
        const assumptions = getCarbonAssumptions(shipment.wasteLot.wasteType, shipment.facility.facilityType);
        if (!assumptions) throw new RangeError("Carbon assumptions for the recorded transaction are unavailable.");
        const carbon = { wasteQuantityTonnes: Number(record.wasteQuantityTonnes), wasteType: shipment.wasteLot.wasteType, conversionPathway: shipment.facility.facilityType, conversionOutputTonnes: Number(record.conversionOutputTonnes), routeDistanceKm: Number(shipment.distanceKm), avoidedLandfillEmissionsKgCo2e: Number(record.avoidedLandfillEmissionsKgCo2e), carbonStoredKgCo2e: Number(record.carbonStoredKgCo2e), processEmissionsKgCo2e: Number(record.processEmissionsKgCo2e), transportEmissionsKgCo2e: Number(record.transportEmissionsKgCo2e), netCo2eBenefitKgCo2e: Number(record.netCo2eBenefitKg), assumptions };
        const economicAssumptions = getEconomicAssumptions(shipment.wasteLot.wasteType, shipment.facility.facilityType);
        if (!economicAssumptions) throw new RangeError("Economic assumptions for the recorded transaction are unavailable.");
        const economics = { wasteQuantityTonnes: carbon.wasteQuantityTonnes, conversionOutputTonnes: carbon.conversionOutputTonnes, transportCostInr: Number(shipment.transportCost), avoidedLandfillValueInr: Number(record.avoidedLandfillValueInr), conversionOutputValueInr: Number(record.conversionOutputValueInr), carbonRelatedValueInr: Number(record.carbonRelatedValueInr), estimatedEconomicValueInr: Number(record.estimatedEconomicValueInr), assumptions: economicAssumptions };
        return { shipment: shipmentSummary(shipment), carbon, economics, carbonRecordId: record.id };
      };
      if (shipment.carbonRecord) return makeResult(shipment.carbonRecord);
      if (!COMPLETABLE_SHIPMENT_STATUSES.includes(shipment.status)) return { code: "INVALID_SHIPMENT_STATE", message: "Shipment cannot be completed from its current state." };
      const claimed = await tx.shipment.updateMany({ where: { id: shipmentId, status: { in: COMPLETABLE_SHIPMENT_STATUSES } }, data: { status: ShipmentStatus.PROCESSED, completedAt: new Date() } });
      if (claimed.count !== 1) return { code: "INVALID_SHIPMENT_STATE", message: "Shipment completion is already in progress." };
      const carbon = calculateCarbonBreakdown({ wasteType: shipment.wasteLot.wasteType, conversionPathway: shipment.facility.facilityType, quantityTonnes: Number(shipment.wasteLot.quantityTonnes), processingEfficiency: Number(shipment.facility.processingEfficiency), routeDistanceKm: Number(shipment.distanceKm) });
      const economics = calculateEconomicBreakdown({ wasteType: shipment.wasteLot.wasteType, conversionPathway: shipment.facility.facilityType, wasteQuantityTonnes: carbon.wasteQuantityTonnes, conversionOutputTonnes: carbon.conversionOutputTonnes, transportCostInr: Number(shipment.transportCost), netCo2eBenefitKgCo2e: carbon.netCo2eBenefitKgCo2e });
      const record = await tx.carbonRecord.create({ data: { shipmentId, wasteQuantityTonnes: carbon.wasteQuantityTonnes, conversionPathway: shipment.facility.facilityType, conversionOutputTonnes: carbon.conversionOutputTonnes, avoidedLandfillEmissionsKgCo2e: carbon.avoidedLandfillEmissionsKgCo2e, carbonStoredKgCo2e: carbon.carbonStoredKgCo2e, processEmissionsKgCo2e: carbon.processEmissionsKgCo2e, transportEmissionsKgCo2e: carbon.transportEmissionsKgCo2e, netCo2eBenefitKg: carbon.netCo2eBenefitKgCo2e, avoidedLandfillValueInr: economics.avoidedLandfillValueInr, conversionOutputValueInr: economics.conversionOutputValueInr, carbonRelatedValueInr: economics.carbonRelatedValueInr, estimatedEconomicValueInr: economics.estimatedEconomicValueInr } });
      await tx.wasteLot.update({ where: { id: shipment.wasteLotId }, data: { status: WasteLotStatus.PROCESSED } });
      const completedShipment = { ...shipment, status: ShipmentStatus.PROCESSED, completedAt: new Date() };
      return { shipment: shipmentSummary(completedShipment), carbon, economics, carbonRecordId: record.id };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof RangeError) {
      // The carbon/economic engines (and the assumption lookups in makeResult) intentionally
      // throw RangeError for a validation failure such as an unsupported waste-type/pathway
      // combination. That is a genuine, expected domain error — preserve its existing mapping.
      return { code: "INVALID_SHIPMENT_STATE", message: "Unable to complete shipment transaction." };
    }
    // Anything else — a dropped connection, a Serializable write conflict, or any other
    // infrastructure failure — is unexpected, not a client mistake. Log it server-side and
    // report a generic internal error rather than misrepresenting it as an invalid request
    // or leaking internal error details to the caller.
    console.error("Unexpected error while completing shipment:", error);
    return { code: "INTERNAL_ERROR", message: "Unable to complete shipment due to an unexpected error." };
  }
}
