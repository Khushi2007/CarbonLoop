import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { POST } from "../src/app/api/carbon/route";
import * as carbonService from "../src/lib/carbon/carbon";

vi.mock("../src/lib/carbon/carbon", () => ({ calculateCarbonImpact: vi.fn() }));

const ids = { wasteLotId: "33333333-3333-4333-8333-000000000001", facilityId: "22222222-2222-4222-8222-000000000001" };
const request = (body: object) => new NextRequest("http://localhost/api/carbon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

describe("POST /api/carbon", () => {
  it("returns the complete numeric carbon breakdown", async () => {
    vi.mocked(carbonService.calculateCarbonImpact).mockResolvedValue({
      wasteLot: { id: ids.wasteLotId, wasteType: "Rice Husk", quantityTonnes: 10 },
      facility: { id: ids.facilityId, name: "Test", facilityType: "BIOCHAR" },
      route: { distanceKm: 25, durationMinutes: 30, estimatedTransportCostInr: 3000 },
      carbon: { wasteQuantityTonnes: 10, wasteType: "Rice Husk", conversionPathway: "BIOCHAR", conversionOutputTonnes: 8.2, routeDistanceKm: 25, avoidedLandfillEmissionsKgCo2e: 4200, carbonStoredKgCo2e: 11000, processEmissionsKgCo2e: 1700, transportEmissionsKgCo2e: 30, netCo2eBenefitKgCo2e: 13470, assumptions: {} as never },
    });
    const response = await POST(request(ids));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.carbon.netCo2eBenefitKgCo2e).toBe(13470);
    expect(body.carbon.transportEmissionsKgCo2e).toBe(30);
  });

  it("rejects malformed input", async () => {
    expect((await POST(request({ wasteLotId: "bad" }))).status).toBe(400);
  });

  it.each([
    ["missing waste lot", "NOT_FOUND", 404],
    ["missing facility", "NOT_FOUND", 404],
    ["incompatible facility", "INCOMPATIBLE_FACILITY", 422],
    ["unsupported pathway", "UNSUPPORTED_CONVERSION_PATHWAY", 422],
    ["route failure", "NETWORK_ERROR", 502],
  ])("maps %s errors", async (_label, code, status) => {
    vi.mocked(carbonService.calculateCarbonImpact).mockResolvedValue({ code: code as never, message: "Expected failure" });
    const response = await POST(request(ids));
    expect(response.status).toBe(status);
    expect((await response.json()).error).toBe("Expected failure");
  });
});
