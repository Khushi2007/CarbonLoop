import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET } from "../src/app/api/waste-lots/route";
import * as wasteLotsService from "../src/lib/waste-lots/waste-lots";

vi.mock("../src/lib/waste-lots/waste-lots", () => ({ listWasteLots: vi.fn() }));

describe("GET /api/waste-lots", () => {
  it("defaults to AVAILABLE lots when no status filter is given", async () => {
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue([{ id: "33333333-3333-4333-8333-000000000001" } as never]);
    const response = await GET(new NextRequest("http://localhost/api/waste-lots"));
    expect(response.status).toBe(200);
    expect((await response.json()).wasteLots).toHaveLength(1);
    expect(wasteLotsService.listWasteLots).toHaveBeenCalledWith({ status: undefined });
  });

  it("filters by an explicit status", async () => {
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue([]);
    const response = await GET(new NextRequest("http://localhost/api/waste-lots?status=PROCESSED"));
    expect(response.status).toBe(200);
    expect(wasteLotsService.listWasteLots).toHaveBeenCalledWith({ status: "PROCESSED" });
  });

  it("supports status=ALL to remove the filter", async () => {
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue([]);
    const response = await GET(new NextRequest("http://localhost/api/waste-lots?status=ALL"));
    expect(response.status).toBe(200);
    expect(wasteLotsService.listWasteLots).toHaveBeenCalledWith({ status: "ALL" });
  });

  it("rejects an invalid status value", async () => {
    const response = await GET(new NextRequest("http://localhost/api/waste-lots?status=NOT_A_STATUS"));
    expect(response.status).toBe(400);
  });
});
