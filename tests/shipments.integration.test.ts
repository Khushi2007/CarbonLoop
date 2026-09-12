import "dotenv/config";

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DEMO_FACILITY_IDS, DEMO_WASTE_LOT_IDS, seedDatabase } from "../prisma/seed";
import { prisma } from "../src/lib/db/prisma";
import { CONVERSION_OUTPUT_VALUE_INR_PER_TONNE } from "../src/lib/economics/constants";
import { getCarbonRecord, listCarbonRecords } from "../src/lib/ledger/ledger";
import { completeShipment, createShipment } from "../src/lib/shipments/shipments";

const enabled = process.env.RUN_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const describeDatabase = enabled ? describe : describe.skip;
const mockFetch = vi.fn();
global.fetch = mockFetch;

describeDatabase("Shipment and ledger integration", () => {
  beforeAll(async () => { await prisma.carbonRecord.deleteMany({}); await prisma.shipment.deleteMany({}); await seedDatabase(prisma); });
  afterEach(() => vi.clearAllMocks());
  afterAll(async () => prisma.$disconnect());

  it("persists OSRM logistics, transitions waste status, completes once, and preserves a ledger record", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 25_000, duration: 1_800, geometry: { type: "LineString", coordinates: [[72.9289, 22.5645], [72.94, 22.558]] } }] }) });
    const created = await createShipment(DEMO_WASTE_LOT_IDS[0], DEMO_FACILITY_IDS[0]);
    expect("code" in created).toBe(false);
    if ("code" in created) return;
    expect(created.distanceKm).toBe(25);
    expect(created.transportCostInr).toBe(2400); // 25 km × 8t × ₹12
    expect(created.transportEmissionsKgCo2e).toBe(24); // 8t × 25 km × 0.12
    expect(created.routeGeometry?.type).toBe("LineString");
    expect((await prisma.wasteLot.findUniqueOrThrow({ where: { id: DEMO_WASTE_LOT_IDS[0] } })).status).toBe("MATCHED");

    const completed = await completeShipment(created.id);
    expect("code" in completed).toBe(false);
    if ("code" in completed) return;
    expect(completed.shipment.status).toBe("PROCESSED");
    expect(completed.shipment.completedAt).not.toBeNull();
    expect(completed.carbon.transportEmissionsKgCo2e).toBe(24);
    expect(completed.economics.estimatedEconomicValueInr).toBe(completed.economics.avoidedLandfillValueInr + completed.economics.conversionOutputValueInr - completed.economics.transportCostInr);
    expect(await prisma.carbonRecord.count({ where: { shipmentId: created.id } })).toBe(1);
    expect((await prisma.wasteLot.findUniqueOrThrow({ where: { id: DEMO_WASTE_LOT_IDS[0] } })).status).toBe("PROCESSED");

    const repeated = await completeShipment(created.id);
    expect("code" in repeated).toBe(false);
    expect(await prisma.carbonRecord.count({ where: { shipmentId: created.id } })).toBe(1);
  });

  it("rejects a second active shipment for the same claimed waste lot", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 10_000, duration: 600, geometry: { type: "LineString", coordinates: [[72, 22], [72.1, 22.1]] } }] }) });
    const first = await createShipment(DEMO_WASTE_LOT_IDS[1], DEMO_FACILITY_IDS[0]);
    expect("code" in first).toBe(false);
    const second = await createShipment(DEMO_WASTE_LOT_IDS[1], DEMO_FACILITY_IDS[0]);
    expect("code" in second).toBe(true);
    if ("code" in second) expect(second.code).toBe("WASTE_LOT_NOT_ELIGIBLE");
  });

  it("returns stored economic snapshots after current coefficients change", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 12_000, duration: 720, geometry: { type: "LineString", coordinates: [[72.9289, 22.5645], [72.94, 22.558]] } }] }) });
    const created = await createShipment(DEMO_WASTE_LOT_IDS[8], DEMO_FACILITY_IDS[0]);
    expect("code" in created).toBe(false);
    if ("code" in created) return;
    const completed = await completeShipment(created.id);
    expect("code" in completed).toBe(false);
    if ("code" in completed) return;
    const biocharCoefficient = CONVERSION_OUTPUT_VALUE_INR_PER_TONNE.BIOCHAR;
    if (!biocharCoefficient) throw new Error("Expected BIOCHAR demo coefficient");
    const originalValue = biocharCoefficient.value;
    try {
      biocharCoefficient.value = originalValue * 100;
      const record = await getCarbonRecord(completed.carbonRecordId);
      expect(record?.economics.conversionOutputValueInr).toBe(completed.economics.conversionOutputValueInr);
      expect(record?.economics.estimatedEconomicValueInr).toBe(completed.economics.estimatedEconomicValueInr);
      expect((await listCarbonRecords()).find((item) => item.id === completed.carbonRecordId)?.economics.avoidedLandfillValueInr).toBe(completed.economics.avoidedLandfillValueInr);
    } finally {
      biocharCoefficient.value = originalValue;
    }
  });

  it("rolls back completion state when ledger calculation cannot be created", async () => {
    const facilityId = "66666666-6666-4666-8666-000000000001";
    const lotId = "77777777-7777-4777-8777-000000000001";
    await prisma.facility.upsert({ where: { id: facilityId }, update: {}, create: { id: facilityId, name: "Unsupported pathway test facility", facilityType: "OTHER", latitude: 22.6, longitude: 72.9, capacityTonnesPerDay: 100, availableCapacityTonnes: 100, processingEfficiency: 80, acceptedWasteTypes: ["Rice Husk"], status: "ACTIVE" } });
    await prisma.wasteLot.upsert({ where: { id: lotId }, update: { status: "AVAILABLE" }, create: { id: lotId, generatorId: "11111111-1111-4111-8111-000000000001", wasteType: "Rice Husk", quantityTonnes: 5, latitude: 22.5, longitude: 72.8, availableFrom: new Date(), status: "AVAILABLE" } });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 10_000, duration: 600, geometry: { type: "LineString", coordinates: [[72.8, 22.5], [72.9, 22.6]] } }] }) });
    const created = await createShipment(lotId, facilityId);
    expect("code" in created).toBe(false);
    if ("code" in created) return;
    const completion = await completeShipment(created.id);
    expect("code" in completion).toBe(true);
    expect((await prisma.shipment.findUniqueOrThrow({ where: { id: created.id } })).status).toBe("SCHEDULED");
    expect((await prisma.wasteLot.findUniqueOrThrow({ where: { id: lotId } })).status).toBe("MATCHED");
    expect(await prisma.carbonRecord.count({ where: { shipmentId: created.id } })).toBe(0);
    await prisma.shipment.delete({ where: { id: created.id } });
    await prisma.wasteLot.delete({ where: { id: lotId } });
    await prisma.facility.delete({ where: { id: facilityId } });
  });
});
