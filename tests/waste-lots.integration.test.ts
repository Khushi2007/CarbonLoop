import "dotenv/config";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEMO_WASTE_LOT_IDS, seedDatabase } from "../prisma/seed";
import { prisma } from "../src/lib/db/prisma";
import { listWasteLots } from "../src/lib/waste-lots/waste-lots";

const enabled = process.env.RUN_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const describeDatabase = enabled ? describe : describe.skip;

describeDatabase("Waste lot listing integration", () => {
  beforeAll(async () => seedDatabase(prisma));
  afterAll(async () => prisma.$disconnect());

  it("lists seeded AVAILABLE waste lots by default, with numeric fields converted from Decimal", async () => {
    const wasteLots = await listWasteLots();
    expect(wasteLots.length).toBeGreaterThanOrEqual(DEMO_WASTE_LOT_IDS.length);
    const seeded = wasteLots.find((lot) => lot.id === DEMO_WASTE_LOT_IDS[0]);
    expect(seeded).toBeDefined();
    expect(typeof seeded?.quantityTonnes).toBe("number");
    expect(typeof seeded?.location.latitude).toBe("number");
    expect(typeof seeded?.location.longitude).toBe("number");
    expect(seeded?.status).toBe("AVAILABLE");
    expect(seeded?.generator.id).toBeDefined();
  });

  it("supports status=ALL to remove the AVAILABLE-only default filter", async () => {
    const wasteLots = await listWasteLots({ status: "ALL" });
    expect(wasteLots.length).toBeGreaterThanOrEqual(DEMO_WASTE_LOT_IDS.length);
  });
});
