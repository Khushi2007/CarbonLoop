import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEMO_WASTE_LOT_IDS, seedDatabase } from "../prisma/seed";
import { findMatchesForWasteLot } from "../src/lib/matching/matching";
import { MatchingResult } from "../src/lib/matching/types";

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const describeDatabase = databaseTestsEnabled ? describe : describe.skip;
const client = new PrismaClient();

const testLotId = "eeeeeeee-eeee-4eee-8eee-000000000010";
const inactiveFacilityId = "eeeeeeee-eeee-4eee-8eee-000000000011";
const insufficientCapacityFacilityId = "eeeeeeee-eeee-4eee-8eee-000000000012";
const incompatibleFacilityId = "eeeeeeee-eeee-4eee-8eee-000000000013";
const generatorId = "eeeeeeee-eeee-4eee-8eee-000000000014";

describeDatabase("Smart Matching Engine - Integration Tests", () => {
  beforeAll(async () => {
    await client.$connect();
    // Use the existing seed function to ensure foundation data is present
    await seedDatabase(client);

    // Setup specific test data for edge cases
    await client.user.upsert({
      where: { id: generatorId },
      update: {},
      create: { id: generatorId, name: "Test Generator", role: "GENERATOR", latitude: 23, longitude: 72 },
    });

    await client.wasteLot.upsert({
      where: { id: testLotId },
      update: { quantityTonnes: 100 },
      create: {
        id: testLotId,
        generatorId: generatorId,
        wasteType: "Rice Husk",
        quantityTonnes: 100,
        latitude: 23,
        longitude: 72,
        availableFrom: new Date(),
      },
    });

    // Inactive facility
    await client.facility.upsert({
      where: { id: inactiveFacilityId },
      update: {},
      create: {
        id: inactiveFacilityId,
        name: "Inactive Biochar",
        facilityType: "BIOCHAR",
        latitude: 23,
        longitude: 72,
        capacityTonnesPerDay: 500,
        availableCapacityTonnes: 500,
        processingEfficiency: 80,
        acceptedWasteTypes: ["Rice Husk"],
        status: "INACTIVE",
      },
    });

    // Insufficient capacity
    await client.facility.upsert({
      where: { id: insufficientCapacityFacilityId },
      update: {},
      create: {
        id: insufficientCapacityFacilityId,
        name: "Small Biochar",
        facilityType: "BIOCHAR",
        latitude: 23,
        longitude: 72,
        capacityTonnesPerDay: 50,
        availableCapacityTonnes: 50, // Less than the 100 needed
        processingEfficiency: 80,
        acceptedWasteTypes: ["Rice Husk"],
        status: "ACTIVE",
      },
    });

    // Incompatible facility
    await client.facility.upsert({
      where: { id: incompatibleFacilityId },
      update: {},
      create: {
        id: incompatibleFacilityId,
        name: "Food Waste Only Biogas",
        facilityType: "BIOGAS",
        latitude: 23,
        longitude: 72,
        capacityTonnesPerDay: 500,
        availableCapacityTonnes: 500,
        processingEfficiency: 80,
        acceptedWasteTypes: ["Food Waste"], // Doesn't accept Rice Husk
        status: "ACTIVE",
      },
    });
  });

  afterAll(async () => {
    // Cleanup specific test data
    await client.facility.deleteMany({
      where: { id: { in: [inactiveFacilityId, insufficientCapacityFacilityId, incompatibleFacilityId] } },
    });
    await client.wasteLot.deleteMany({ where: { id: testLotId } });
    await client.user.deleteMany({ where: { id: generatorId } });
    await client.$disconnect();
  });

  it("12. A seeded waste lot can be matched against the seeded facilities", async () => {
    // Use one of the real seeded waste lots
    const result = await findMatchesForWasteLot(DEMO_WASTE_LOT_IDS[0]);
    
    expect("code" in result).toBe(false); // Should not be an error
    
    const matchingResult = result as MatchingResult;
    expect(matchingResult.wasteLot).toBeDefined();
    expect(matchingResult.matches.length).toBeGreaterThan(0);
    
    // 10. Ranking is descending by overall score
    const matches = matchingResult.matches;
    for (let i = 0; i < matches.length - 1; i++) {
      expect(matches[i].overallScore).toBeGreaterThanOrEqual(matches[i + 1].overallScore);
    }
  });

  it("13. PostGIS distance is used correctly", async () => {
    const result = await findMatchesForWasteLot(testLotId) as MatchingResult;
    const matches = result.matches;
    
    // All returned matches should have a valid distance calculation
    for (const match of matches) {
      expect(match.distanceKm).toBeGreaterThanOrEqual(0);
      expect(typeof match.distanceKm).toBe("number");
    }
  });

  it("14. Inactive facilities are excluded", async () => {
    const result = await findMatchesForWasteLot(testLotId) as MatchingResult;
    const matches = result.matches;
    
    const inactiveFound = matches.some((m) => m.facility.id === inactiveFacilityId);
    expect(inactiveFound).toBe(false);
  });

  it("15. Insufficient-capacity facilities are excluded", async () => {
    const result = await findMatchesForWasteLot(testLotId) as MatchingResult;
    const matches = result.matches;
    
    const smallFound = matches.some((m) => m.facility.id === insufficientCapacityFacilityId);
    expect(smallFound).toBe(false);
  });

  it("16. Incompatible facilities are excluded", async () => {
    const result = await findMatchesForWasteLot(testLotId) as MatchingResult;
    const matches = result.matches;
    
    const incompatibleFound = matches.some((m) => m.facility.id === incompatibleFacilityId);
    expect(incompatibleFound).toBe(false);
  });

  it("17. Missing waste lot produces a clean error", async () => {
    const result = await findMatchesForWasteLot("00000000-0000-0000-0000-000000000000");
    
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NOT_FOUND");
    }
  });
});
