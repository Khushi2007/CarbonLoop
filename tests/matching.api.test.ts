import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { POST } from "../src/app/api/matches/route";
import * as matchingEngine from "../src/lib/matching/matching";
import { MatchingResult } from "../src/lib/matching/types";

// Mock the matching engine so we can test the API layer in isolation
vi.mock("../src/lib/matching/matching", () => ({
  findMatchesForWasteLot: vi.fn(),
}));

describe("Smart Matching Engine - API Tests", () => {
  it("18. Valid POST request returns the expected response shape", async () => {
    const mockResult: MatchingResult = {
      wasteLot: {
        id: "11111111-1111-1111-1111-111111111111",
        wasteType: "Rice Husk",
        quantityTonnes: 10,
      },
      matches: [],
    };
    
    vi.mocked(matchingEngine.findMatchesForWasteLot).mockResolvedValue(mockResult);

    const req = new NextRequest("http://localhost/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wasteLotId: "123e4567-e89b-12d3-a456-426614174000" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty("wasteLot");
    expect(data).toHaveProperty("matches");
    expect(data.wasteLot.id).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("preserves every field the candidate-facility GIS map and score-breakdown UI depend on (Stage 8A contract check)", async () => {
    const mockResult: MatchingResult = {
      wasteLot: { id: "11111111-1111-1111-1111-111111111111", wasteType: "Rice Husk", quantityTonnes: 10 },
      matches: [
        {
          facility: { id: "22222222-2222-4222-8222-000000000001", name: "Anand Biochar Unit", facilityType: "BIOCHAR", latitude: 22.558, longitude: 72.94 },
          distanceKm: 12.4,
          estimatedTransportCostInr: 1488,
          scores: { compatibility: 100, carbonImpact: 90, distance: 97.5, capacity: 80, cost: 88 },
          overallScore: 93.15,
          matchReason: "Highly compatible facility excellent for biochar conversion pathway with abundant available capacity and short transport distance.",
        },
      ],
    };
    vi.mocked(matchingEngine.findMatchesForWasteLot).mockResolvedValue(mockResult);

    const req = new NextRequest("http://localhost/api/matches", {
      method: "POST",
      body: JSON.stringify({ wasteLotId: "123e4567-e89b-12d3-a456-426614174000" }),
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();

    // The candidate map (MatchingMap) plots every candidate using exactly
    // these facility fields — if any went missing, markers couldn't be
    // placed on the map.
    expect(data.matches[0].facility).toEqual({
      id: "22222222-2222-4222-8222-000000000001",
      name: "Anand Biochar Unit",
      facilityType: "BIOCHAR",
      latitude: 22.558,
      longitude: 72.94,
    });
    // The compact candidate card's summary row.
    expect(data.matches[0].distanceKm).toBe(12.4);
    expect(data.matches[0].estimatedTransportCostInr).toBe(1488);
    expect(data.matches[0].overallScore).toBe(93.15);
    expect(data.matches[0].matchReason).toBe(mockResult.matches[0].matchReason);
    // The "Score breakdown" panel renders all five weighted components —
    // none of them may be dropped or renamed between the engine and the API.
    expect(data.matches[0].scores).toEqual({ compatibility: 100, carbonImpact: 90, distance: 97.5, capacity: 80, cost: 88 });
  });

  it("19. Missing wasteLotId is rejected (400)", async () => {
    const req = new NextRequest("http://localhost/api/matches", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe("Invalid request");
  });

  it("20. Invalid UUID is rejected (400)", async () => {
    const req = new NextRequest("http://localhost/api/matches", {
      method: "POST",
      body: JSON.stringify({ wasteLotId: "not-a-uuid" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe("Invalid request");
  });

  it("21. Unknown waste lot returns 404", async () => {
    vi.mocked(matchingEngine.findMatchesForWasteLot).mockResolvedValue({
      code: "NOT_FOUND",
      message: "Waste lot not found",
    });

    const req = new NextRequest("http://localhost/api/matches", {
      method: "POST",
      body: JSON.stringify({ wasteLotId: "00000000-0000-0000-0000-000000000000" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.error).toBe("Waste lot not found");
  });
});
