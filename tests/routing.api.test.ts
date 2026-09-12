import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { POST } from "../src/app/api/routes/route";

// Mock the business logic to test just the API boundary
vi.mock("../src/lib/routing/routing", () => ({
  calculateRoute: vi.fn((wasteLotId, facilityId) => {
    if (wasteLotId === "00000000-0000-4000-8000-000000000000") {
      return Promise.resolve({
        code: "NOT_FOUND",
        message: "Waste lot not found",
      });
    }

    if (wasteLotId === "11111111-1111-4111-8111-111111111111") {
      return Promise.resolve({
        code: "NO_ROUTE",
        message: "No route found",
      });
    }

    return Promise.resolve({
      wasteLot: {
        id: wasteLotId,
        wasteType: "Rice Husk",
        quantityTonnes: 10,
        latitude: 22.5,
        longitude: 72.5,
      },
      facility: {
        id: facilityId,
        name: "Test Facility",
        facilityType: "BIOCHAR",
        latitude: 22.6,
        longitude: 72.6,
      },
      route: {
        distanceKm: 15,
        durationMinutes: 20,
        estimatedTransportCostInr: 1800,
        geometry: {
          type: "LineString",
          coordinates: [[72.5, 22.5], [72.6, 22.6]],
        },
      },
    });
  }),
}));

describe("POST /api/routes", () => {
  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost:3000/api/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  it("should return 400 for missing wasteLotId", async () => {
    const req = createRequest({ facilityId: "33333333-3333-4333-8333-000000000001" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing facilityId", async () => {
    const req = createRequest({ wasteLotId: "33333333-3333-4333-8333-000000000001" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for invalid UUID", async () => {
    const req = createRequest({ wasteLotId: "invalid-uuid", facilityId: "invalid-uuid" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 if waste lot not found", async () => {
    const req = createRequest({
      wasteLotId: "00000000-0000-4000-8000-000000000000",
      facilityId: "33333333-3333-4333-8333-000000000001",
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should return 422 if no route found", async () => {
    const req = createRequest({
      wasteLotId: "11111111-1111-4111-8111-111111111111",
      facilityId: "33333333-3333-4333-8333-000000000001",
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("should return 200 and route details on success", async () => {
    const req = createRequest({
      wasteLotId: "33333333-3333-4333-8333-000000000001",
      facilityId: "22222222-2222-4222-8222-000000000001",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.route).toBeDefined();
    expect(data.route.distanceKm).toBe(15);
  });
});
