import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST as create } from "../src/app/api/shipments/route";
import { POST as complete } from "../src/app/api/shipments/[id]/complete/route";
import * as authSession from "../src/lib/auth/session";
import { prisma } from "../src/lib/db/prisma";
import * as shipmentService from "../src/lib/shipments/shipments";

vi.mock("../src/lib/shipments/shipments", () => ({ createShipment: vi.fn(), completeShipment: vi.fn() }));
vi.mock("../src/lib/auth/session", () => ({ requireCarbonLoopUser: vi.fn() }));
vi.mock("../src/lib/db/prisma", () => ({
  prisma: { wasteLot: { findUnique: vi.fn() }, shipment: { findUnique: vi.fn() } },
}));

const ids = { wasteLotId: "33333333-3333-4333-8333-000000000001", facilityId: "22222222-2222-4222-8222-000000000001", shipmentId: "44444444-4444-4444-8444-000000000001" };
const generator = { id: "11111111-1111-4111-8111-000000000001", name: "Test Generator", role: "GENERATOR", organization: null, latitude: null, longitude: null, createdAt: new Date() };
const otherGenerator = { ...generator, id: "11111111-1111-4111-8111-000000000002", name: "Other Generator" };

describe("Shipment APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: true, user: generator } as never);
    vi.mocked(prisma.wasteLot.findUnique).mockResolvedValue({ generatorId: generator.id } as never);
    vi.mocked(prisma.shipment.findUnique).mockResolvedValue({ wasteLot: { generatorId: generator.id } } as never);
  });

  it("creates a shipment for the authenticated generator who owns the waste lot", async () => {
    vi.mocked(shipmentService.createShipment).mockResolvedValue({ id: ids.shipmentId, wasteLotId: ids.wasteLotId, facilityId: ids.facilityId, distanceKm: 25, durationMinutes: 30, transportCostInr: 2400, transportEmissionsKgCo2e: 24, routeGeometry: null, status: "SCHEDULED", scheduledAt: null, completedAt: null });
    const response = await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(ids) }));
    expect(response.status).toBe(201);
    expect((await response.json()).transportEmissionsKgCo2e).toBe(24);
  });

  it("rejects an unauthenticated shipment creation request with 401", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: false, status: 401, code: "UNAUTHENTICATED", message: "Authentication required." } as never);
    const response = await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(ids) }));
    expect(response.status).toBe(401);
    expect(shipmentService.createShipment).not.toHaveBeenCalled();
  });

  it("rejects shipment creation for a waste lot the authenticated generator does not own (403)", async () => {
    vi.mocked(prisma.wasteLot.findUnique).mockResolvedValue({ generatorId: otherGenerator.id } as never);
    const response = await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(ids) }));
    expect(response.status).toBe(403);
    expect(shipmentService.createShipment).not.toHaveBeenCalled();
  });

  it("cannot be tricked into a different owner by any client-supplied field — ownership always comes from the authenticated session, not the request body", async () => {
    // Even though the request body only ever contains wasteLotId/facilityId
    // (no generatorId field exists in the schema at all), this proves the
    // route's ownership decision is driven by requireCarbonLoopUser()'s
    // server-resolved identity, not anything read from `request`.
    vi.mocked(shipmentService.createShipment).mockResolvedValue({ id: ids.shipmentId, wasteLotId: ids.wasteLotId, facilityId: ids.facilityId, distanceKm: 25, durationMinutes: 30, transportCostInr: 2400, transportEmissionsKgCo2e: 24, routeGeometry: null, status: "SCHEDULED", scheduledAt: null, completedAt: null });
    const spoofedBody = { ...ids, generatorId: otherGenerator.id, userId: otherGenerator.id };
    const response = await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(spoofedBody) }));
    expect(response.status).toBe(201);
    expect(prisma.wasteLot.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: ids.wasteLotId } }));
  });

  it("a facility-role (or any role outside GENERATOR/ADMIN) user is forbidden from creating a shipment", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: false, status: 403, code: "FORBIDDEN", message: "You do not have permission to perform this action." } as never);
    const response = await create(new NextRequest("http://localhost/api/shipments", { method: "POST", body: JSON.stringify(ids) }));
    expect(response.status).toBe(403);
    expect(shipmentService.createShipment).not.toHaveBeenCalled();
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

  it("rejects completion by a generator who does not own the shipment's waste lot (403)", async () => {
    vi.mocked(prisma.shipment.findUnique).mockResolvedValue({ wasteLot: { generatorId: otherGenerator.id } } as never);
    const response = await complete(new NextRequest("http://localhost/api/shipments/x/complete", { method: "POST" }), { params: Promise.resolve({ id: ids.shipmentId }) });
    expect(response.status).toBe(403);
    expect(shipmentService.completeShipment).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated completion request with 401", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: false, status: 401, code: "UNAUTHENTICATED", message: "Authentication required." } as never);
    const response = await complete(new NextRequest("http://localhost/api/shipments/x/complete", { method: "POST" }), { params: Promise.resolve({ id: ids.shipmentId }) });
    expect(response.status).toBe(401);
    expect(shipmentService.completeShipment).not.toHaveBeenCalled();
  });

  it("returns a generic 500 for an unexpected completion failure, without leaking internal details", async () => {
    vi.mocked(shipmentService.completeShipment).mockResolvedValue({ code: "INTERNAL_ERROR", message: "connection terminated unexpectedly: password authentication failed for user \"internal\"" });
    const response = await complete(new NextRequest("http://localhost/api/shipments/x/complete", { method: "POST" }), { params: Promise.resolve({ id: ids.shipmentId }) });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal Server Error");
    expect(body.error).not.toContain("password");
  });
});
