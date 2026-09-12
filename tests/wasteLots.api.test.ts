import { describe, expect, it, vi } from "vitest";

import { GET as list } from "../src/app/api/waste-lots/route";
import * as wasteLots from "../src/lib/wasteLots/wasteLots";

vi.mock("../src/lib/wasteLots/wasteLots", () => ({ listWasteLots: vi.fn() }));
const id = "33333333-3333-4333-8333-000000000001";

describe("Waste lot APIs", () => {
  it("lists waste lots", async () => {
    vi.mocked(wasteLots.listWasteLots).mockResolvedValue([{ id, wasteType: "Rice Husk", quantityTonnes: 8, status: "AVAILABLE", latitude: 22.5, longitude: 72.9, availableFrom: new Date(), createdAt: new Date() }] as never);
    const response = await list();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.wasteLots).toHaveLength(1);
    expect(body.wasteLots[0].wasteType).toBe("Rice Husk");
  });

  it("returns 500 when the service throws", async () => {
    vi.mocked(wasteLots.listWasteLots).mockRejectedValue(new Error("db down"));
    expect((await list()).status).toBe(500);
  });
});
