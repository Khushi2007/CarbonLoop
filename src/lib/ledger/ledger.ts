import { Prisma } from "@prisma/client";

import { prisma } from "../db/prisma";

const includeTransaction = { shipment: { include: { wasteLot: { include: { generator: true } }, facility: true } } } satisfies Prisma.CarbonRecordInclude;
type RecordWithTransaction = Prisma.CarbonRecordGetPayload<{ include: typeof includeTransaction }>;

function serialize(record: RecordWithTransaction) {
  const shipment = record.shipment;
  return {
    id: record.id, shipmentId: record.shipmentId, createdAt: record.createdAt,
    waste: { id: shipment.wasteLotId, type: shipment.wasteLot.wasteType, quantityTonnes: Number(record.wasteQuantityTonnes), generator: { id: shipment.wasteLot.generator.id, name: shipment.wasteLot.generator.name, organization: shipment.wasteLot.generator.organization } },
    conversion: { facility: { id: shipment.facility.id, name: shipment.facility.name, facilityType: shipment.facility.facilityType }, pathway: record.conversionPathway, outputTonnes: Number(record.conversionOutputTonnes) },
    logistics: { distanceKm: Number(shipment.distanceKm), durationMinutes: shipment.durationMinutes, transportCostInr: Number(shipment.transportCost), transportEmissionsKgCo2e: Number(record.transportEmissionsKgCo2e), shipmentStatus: shipment.status },
    carbon: { avoidedLandfillEmissionsKgCo2e: Number(record.avoidedLandfillEmissionsKgCo2e), carbonStoredKgCo2e: Number(record.carbonStoredKgCo2e), processEmissionsKgCo2e: Number(record.processEmissionsKgCo2e), transportEmissionsKgCo2e: Number(record.transportEmissionsKgCo2e), netCo2eBenefitKgCo2e: Number(record.netCo2eBenefitKg) },
    economics: { transportCostInr: Number(shipment.transportCost), avoidedLandfillValueInr: Number(record.avoidedLandfillValueInr), conversionOutputValueInr: Number(record.conversionOutputValueInr), carbonRelatedValueInr: Number(record.carbonRelatedValueInr), estimatedEconomicValueInr: Number(record.estimatedEconomicValueInr) },
  };
}

export async function listCarbonRecords() { return (await prisma.carbonRecord.findMany({ include: includeTransaction, orderBy: { createdAt: "desc" } })).map(serialize); }
export async function getCarbonRecord(id: string) { const record = await prisma.carbonRecord.findUnique({ where: { id }, include: includeTransaction }); return record ? serialize(record) : null; }
