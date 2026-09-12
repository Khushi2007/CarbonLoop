import "dotenv/config";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEMO_WASTE_LOT_IDS, seedDatabase } from "../prisma/seed";
import { prisma } from "../src/lib/db/prisma";
import { listWasteLots } from "../src/lib/wasteLots/wasteLots";

const enabled = process.env.RUN_DATABASE_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const describeDatabase = enabled ? describe : describe.skip;

describeDatabase("Waste lot listing integration", () => {
  beforeAll(async () => seedDatabase(prisma));
  afterAll(async () => prisma.$disconnect());

  it("lists seeded waste lots with numeric fields converted from Decimal", async () => {
    const wasteLots = await listWasteLots();
    expect(wasteLots.length).toBeGreaterThanOrEqual(DEMO_WASTE_LOT_IDS.length);
    const seeded = wasteLots.find((lot) => lot.id === DEMO_WASTE_LOT_IDS[0]);
    expect(seeded).toBeDefined();
    expect(typeof seeded?.quantityTonnes).toBe("number");
    expect(typeof seeded?.latitude).toBe("number");
    expect(typeof seeded?.longitude).toBe("number");
    expect(seeded?.status).toBe("AVAILABLE");
  });
});
