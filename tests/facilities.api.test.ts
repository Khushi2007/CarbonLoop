import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET } from "../src/app/api/facilities/route";
import * as facilitiesService from "../src/lib/facilities/facilities";

vi.mock("../src/lib/facilities/facilities", () => ({ listFacilities: vi.fn() }));

describe("GET /api/facilities", () => {
  it("defaults to ACTIVE facilities when no status filter is given", async () => {
    vi.mocked(facilitiesService.listFacilities).mockResolvedValue([{ id: "22222222-2222-4222-8222-000000000001" } as never]);
    const response = await GET(new NextRequest("http://localhost/api/facilities"));
    expect(response.status).toBe(200);
    expect((await response.json()).facilities).toHaveLength(1);
    expect(facilitiesService.listFacilities).toHaveBeenCalledWith({ status: undefined });
  });

  it("filters by an explicit status", async () => {
    vi.mocked(facilitiesService.listFacilities).mockResolvedValue([]);
    const response = await GET(new NextRequest("http://localhost/api/facilities?status=MAINTENANCE"));
    expect(response.status).toBe(200);
    expect(facilitiesService.listFacilities).toHaveBeenCalledWith({ status: "MAINTENANCE" });
  });

  it("supports status=ALL to remove the filter", async () => {
    vi.mocked(facilitiesService.listFacilities).mockResolvedValue([]);
    const response = await GET(new NextRequest("http://localhost/api/facilities?status=ALL"));
    expect(response.status).toBe(200);
    expect(facilitiesService.listFacilities).toHaveBeenCalledWith({ status: "ALL" });
  });

  it("rejects an invalid status value", async () => {
    const response = await GET(new NextRequest("http://localhost/api/facilities?status=NOT_A_STATUS"));
    expect(response.status).toBe(400);
  });
});
