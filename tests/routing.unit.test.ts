import { afterEach, describe, expect, it, vi } from "vitest";

import { getRouteFromOSRM } from "../src/lib/routing/osrm";
import { OSRMResponse } from "../src/lib/routing/types";

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("OSRM Routing Client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return invalid coordinates for out-of-bounds latitude", async () => {
    const result = await getRouteFromOSRM([0, 91], [0, 0]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("INVALID_COORDINATES");
    }
  });

  it("should return invalid coordinates for out-of-bounds longitude", async () => {
    const result = await getRouteFromOSRM([181, 0], [0, 0]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("INVALID_COORDINATES");
    }
  });

  it("should successfully return route for valid input", async () => {
    const mockOSRMResponse: OSRMResponse = {
      code: "Ok",
      routes: [
        {
          distance: 10000,
          duration: 600,
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOSRMResponse,
    });

    const result = await getRouteFromOSRM([0, 0], [1, 1]);
    expect("code" in result).toBe(false);
    
    if (!("code" in result)) {
      expect(result.distance).toBe(10000);
      expect(result.duration).toBe(600);
      expect(result.geometry.type).toBe("LineString");
    }
  });

  it("should return NO_ROUTE when OSRM says NoRoute (200 response)", async () => {
    const mockOSRMResponse = {
      code: "NoRoute",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOSRMResponse,
    });

    const result = await getRouteFromOSRM([0, 0], [1, 1]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NO_ROUTE");
    }
  });

  it("should return NO_ROUTE when OSRM returns 400 NoRoute", async () => {
    const mockOSRMResponse = {
      code: "NoRoute",
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockOSRMResponse,
    });

    const result = await getRouteFromOSRM([0, 0], [1, 1]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NO_ROUTE");
    }
  });

  it("should handle NETWORK_ERROR on 500 status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const result = await getRouteFromOSRM([0, 0], [1, 1]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NETWORK_ERROR");
    }
  });

  it("should handle INVALID_RESPONSE for malformed geometries", async () => {
    const mockOSRMResponse = {
      code: "Ok",
      routes: [
        {
          distance: 10000,
          duration: 600,
          geometry: {
            type: "Point", // Invalid
            coordinates: [0, 0],
          },
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOSRMResponse,
    });

    const result = await getRouteFromOSRM([0, 0], [1, 1]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("INVALID_RESPONSE");
    }
  });

  it("should handle timeout correctly", async () => {
    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await getRouteFromOSRM([0, 0], [1, 1]);
    expect("code" in result).toBe(true);
    if ("code" in result) {
      expect(result.code).toBe("NETWORK_ERROR");
      expect(result.message).toContain("timed out");
    }
  });
});
