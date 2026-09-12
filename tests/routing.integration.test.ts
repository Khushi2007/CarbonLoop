import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/db/prisma";
import { calculateRoute } from "../src/lib/routing/routing";
import { DEMO_FACILITY_IDS, DEMO_WASTE_LOT_IDS, seedDatabase } from "../prisma/seed";
import { resolveDatabaseIntegrationMode } from "./helpers/db-safety";

// This file gates each test body on RUN_DATABASE_TESTS individually rather than
// via describe.skip (pre-existing pattern, unchanged here). Calling the shared
// guard at module scope still ensures that flipping RUN_DATABASE_TESTS=true
// against an unsafe DATABASE_URL fails loudly before beforeAll's full-table
// deleteMany calls ever run.
resolveDatabaseIntegrationMode();

// We mock fetch to avoid hitting real OSRM server during normal DB tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Routing Integration (Database)", () => {
  beforeAll(async () => {
    if (process.env.RUN_DATABASE_TESTS !== "true") {
      return;
    }
    // Clean and seed DB
    await prisma.shipment.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.wasteLot.deleteMany({});
    await prisma.facility.deleteMany({});
    await prisma.user.deleteMany({});
    await seedDatabase(prisma);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should calculate route successfully for seeded waste lot and facility", async () => {
    if (process.env.RUN_DATABASE_TESTS !== "true") {
      console.warn("Skipping DB test: RUN_DATABASE_TESTS is not true");
      return;
    }

    const wasteLotId = DEMO_WASTE_LOT_IDS[0];
    const facilityId = DEMO_FACILITY_IDS[0];

    // Mock successful OSRM response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: "Ok",
        routes: [
          {
            distance: 25000, // 25 km
            duration: 1800, // 30 minutes
            geometry: {
              type: "LineString",
              coordinates: [
                [72.9289, 22.5645],
                [72.94, 22.558],
              ],
            },
          },
        ],
      }),
    });

    const result = await calculateRoute(wasteLotId, facilityId);

    expect("code" in result).toBe(false);

    if (!("code" in result)) {
      expect(result.route.distanceKm).toBe(25);
      expect(result.route.durationMinutes).toBe(30);
      expect(result.route.geometry.type).toBe("LineString");

      // Verify that waste lot was loaded
      expect(result.wasteLot.id).toBe(wasteLotId);
      
      // Verify that facility was loaded
      expect(result.facility.id).toBe(facilityId);

      // Verify transport cost: distanceKm (25) * quantity (from seed) * rate (12)
      // We don't hardcode quantity as it's from seed, just check it is calculated correctly
      const expectedCost = 25 * result.wasteLot.quantityTonnes * 12;
      expect(result.route.estimatedTransportCostInr).toBe(expectedCost);
    }
  });

  it("should return NOT_FOUND for missing waste lot", async () => {
    if (process.env.RUN_DATABASE_TESTS !== "true") return;

    const fakeId = "00000000-0000-0000-0000-000000000000";
    const result = await calculateRoute(fakeId, DEMO_FACILITY_IDS[0]);

    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NOT_FOUND");
      expect(result.message).toContain("Waste lot");
    }
  });

  it("should return NOT_FOUND for missing facility", async () => {
    if (process.env.RUN_DATABASE_TESTS !== "true") return;

    const fakeId = "00000000-0000-0000-0000-000000000000";
    const result = await calculateRoute(DEMO_WASTE_LOT_IDS[0], fakeId);

    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NOT_FOUND");
      expect(result.message).toContain("Facility");
    }
  });
});
