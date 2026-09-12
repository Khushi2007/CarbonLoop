import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { POST as create } from "../src/app/api/shipments/route";
import { POST as complete } from "../src/app/api/shipments/[id]/complete/route";
import * as shipmentService from "../src/lib/shipments/shipments";

vi.mock("../src/lib/shipments/shipments", () => ({ createShipment: vi.fn(), completeShipment: vi.fn() }));
const ids = { wasteLotId: "33333333-3333-4333-8333-000000000001", facilityId: "22222222-2222-4222-8222-000000000001", shipmentId: "44444444-4444-4444-8444-000000000001" };

describe("Shipment APIs", () => {
  it("creates a shipment", async () => {
    vi.mocked(shipmentService.createShipment).mockResolvedValue({ id: ids.shipmentId, wasteLotId: ids.wasteLotId, facilityId: ids.facilityId, distanceKm: 25, durationMinutes: 30, transportCostInr: 2400, transportEmissionsKgCo2e: 24, routeGeometry: null, status: "SCHEDULED", scheduledAt: null, completedAt: null });
    const response = await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(ids) }));
    expect(response.status).toBe(201);
    expect((await response.json()).transportEmissionsKgCo2e).toBe(24);
  });
  it("validates creation input and maps domain errors", async () => {
    expect((await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: "{}" }))).status).toBe(400);
    vi.mocked(shipmentService.createShipment).mockResolvedValue({ code: "INCOMPATIBLE_FACILITY", message: "incompatible" });
    expect((await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(ids) }))).status).toBe(422);
  });
  it("validates completion input and returns completion results", async () => {
    vi.mocked(shipmentService.completeShipment).mockResolvedValue({ shipment: { id: ids.shipmentId, wasteLotId: ids.wasteLotId, facilityId: ids.facilityId, distanceKm: 25, durationMinutes: 30, transportCostInr: 2400, transportEmissionsKgCo2e: 24, routeGeometry: null, status: "PROCESSED", scheduledAt: null, completedAt: new Date() }, carbon: {} as never, economics: { estimatedEconomicValueInr: 100 } as never, carbonRecordId: "55555555-5555-4555-8555-000000000001" });
    const response = await complete(new NextRequest("http://localhost/api/shipments/x/complete", { method: "POST" }), { params: Promise.resolve({ id: ids.shipmentId }) });
    expect(response.status).toBe(200);
    expect((await response.json()).carbonRecordId).toBeDefined();
    expect((await complete(new NextRequest("http://localhost", { method: "POST" }), { params: Promise.resolve({ id: "no" }) })).status).toBe(400);
  });
});
