import "dotenv/config";

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DEMO_FACILITY_IDS, DEMO_WASTE_LOT_IDS, seedDatabase } from "../prisma/seed";
import { calculateCarbonImpact } from "../src/lib/carbon/carbon";
import { prisma } from "../src/lib/db/prisma";

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const describeDatabase = databaseTestsEnabled ? describe : describe.skip;
const mockFetch = vi.fn();
global.fetch = mockFetch;

describeDatabase("Carbon engine integration", () => {
  beforeAll(async () => {
    await seedDatabase(prisma);
  });

  afterEach(() => vi.clearAllMocks());
  afterAll(async () => prisma.$disconnect());

  it("calculates a deterministic breakdown for a compatible seeded lot and facility using OSRM distance", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: "Ok",
        routes: [{ distance: 25_000, duration: 1_800, geometry: { type: "LineString", coordinates: [[72.9289, 22.5645], [72.94, 22.558]] } }],
      }),
    });
    const result = await calculateCarbonImpact(DEMO_WASTE_LOT_IDS[0], DEMO_FACILITY_IDS[0]);
    expect("code" in result).toBe(false);
    if ("code" in result) return;

    // Seeded lot is 8t Rice Husk; configured BIOCHAR coefficients are 420/1100/170.
    expect(result.route.distanceKm).toBe(25);
    expect(result.carbon.transportEmissionsKgCo2e).toBe(24); // 8 × 25 × 0.12
    expect(result.carbon.avoidedLandfillEmissionsKgCo2e).toBe(3360);
    expect(result.carbon.carbonStoredKgCo2e).toBe(8800);
    expect(result.carbon.processEmissionsKgCo2e).toBe(1360);
    expect(result.carbon.netCo2eBenefitKgCo2e).toBe(10776);
  });
});
