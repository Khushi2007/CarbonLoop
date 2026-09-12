import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DEMO_FACILITY_IDS,
  DEMO_GENERATOR_IDS,
  DEMO_WASTE_LOT_IDS,
  seedDatabase,
} from "../prisma/seed";
import { findFacilitiesWithinKilometers } from "../src/lib/db/spatial";

const databaseTestsEnabled = process.env.RUN_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const describeDatabase = databaseTestsEnabled ? describe : describe.skip;
const client = new PrismaClient();
const testUserId = "eeeeeeee-eeee-4eee-8eee-000000000001";
const testLotId = "eeeeeeee-eeee-4eee-8eee-000000000002";

describeDatabase("database foundation", () => {
  beforeAll(async () => {
    await client.$connect();
    await seedDatabase(client);
  });

  afterAll(async () => {
    await client.wasteLot.deleteMany({ where: { id: testLotId } });
    await client.user.deleteMany({ where: { id: testUserId } });
    await client.$disconnect();
  });

  it("connects and seeds the deterministic demo data without duplicates", async () => {
    const connection = await client.$queryRaw<Array<{ value: number }>>`SELECT 1 AS value`;
    expect(connection[0]?.value).toBe(1);
    expect(await client.user.count({ where: { id: { in: DEMO_GENERATOR_IDS } } })).toBe(8);
    expect(await client.facility.count({ where: { id: { in: DEMO_FACILITY_IDS } } })).toBe(12);
    expect(await client.wasteLot.count({ where: { id: { in: DEMO_WASTE_LOT_IDS } } })).toBe(24);
  });

  it("supports CRUD and preserves the waste lot to generator relationship", async () => {
    await client.user.upsert({ where: { id: testUserId }, update: { name: "Database Test Generator" }, create: { id: testUserId, name: "Database Test Generator", role: "GENERATOR" } });
    const lot = await client.wasteLot.upsert({ where: { id: testLotId }, update: { quantityTonnes: 12.5 }, create: { id: testLotId, generatorId: testUserId, wasteType: "Rice Husk", quantityTonnes: 10, latitude: 23.0225, longitude: 72.5714, availableFrom: new Date("2026-09-15T00:00:00.000Z") }, include: { generator: true } });
    expect(lot.generator.id).toBe(testUserId);
    expect(lot.quantityTonnes.toNumber()).toBe(10);
    await expect(client.wasteLot.create({ data: { generatorId: "ffffffff-ffff-4fff-8fff-000000000001", wasteType: "Rice Husk", quantityTonnes: 1, latitude: 23, longitude: 72, availableFrom: new Date() } })).rejects.toThrow();
  });

  it("finds nearby active facilities using WGS84 PostGIS distance", async () => {
    const facilities = await findFacilitiesWithinKilometers({ latitude: 23.0225, longitude: 72.5714, radiusKilometers: 30 });
    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities.every((facility) => facility.distanceKm <= 30)).toBe(true);
  });
});
