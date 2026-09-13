import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../src/app/api/waste-lots/route";
import { GET as getMine } from "../src/app/api/waste-lots/mine/route";
import * as authSession from "../src/lib/auth/session";
import * as wasteLotsService from "../src/lib/waste-lots/waste-lots";

vi.mock("../src/lib/waste-lots/waste-lots", () => ({ listWasteLots: vi.fn(), createWasteLot: vi.fn() }));
vi.mock("../src/lib/auth/session", () => ({ requireCarbonLoopUser: vi.fn() }));

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

const generator = { id: "11111111-1111-4111-8111-000000000001", name: "Test Generator", role: "GENERATOR", organization: null, latitude: null, longitude: null, createdAt: new Date() };
const validBody = {
  wasteType: "Rice Husk",
  quantityTonnes: 10,
  latitude: 22.5,
  longitude: 72.5,
  availableFrom: "2026-09-20T00:00:00.000Z",
};

describe("POST /api/waste-lots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: true, user: generator } as never);
  });

  it("rejects an unauthenticated request with 401 and never touches the database", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: false, status: 401, code: "UNAUTHENTICATED", message: "Authentication required." } as never);
    const response = await POST(new NextRequest("http://localhost/api/waste-lots", { method: "POST", body: JSON.stringify(validBody) }));
    expect(response.status).toBe(401);
    expect(wasteLotsService.createWasteLot).not.toHaveBeenCalled();
  });

  it("rejects a facility/non-generator caller with 403", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: false, status: 403, code: "FORBIDDEN", message: "You do not have permission to perform this action." } as never);
    const response = await POST(new NextRequest("http://localhost/api/waste-lots", { method: "POST", body: JSON.stringify(validBody) }));
    expect(response.status).toBe(403);
    expect(wasteLotsService.createWasteLot).not.toHaveBeenCalled();
  });

  it("creates a waste lot owned by the authenticated generator", async () => {
    vi.mocked(wasteLotsService.createWasteLot).mockResolvedValue({ id: "new-lot", generator: { id: generator.id } } as never);
    const response = await POST(new NextRequest("http://localhost/api/waste-lots", { method: "POST", body: JSON.stringify(validBody) }));
    expect(response.status).toBe(201);
    expect(wasteLotsService.createWasteLot).toHaveBeenCalledWith(expect.objectContaining({ generatorId: generator.id, wasteType: "Rice Husk" }));
  });

  it("ignores a client-supplied generatorId — ownership always comes from the authenticated session", async () => {
    vi.mocked(wasteLotsService.createWasteLot).mockResolvedValue({ id: "new-lot" } as never);
    const spoofedBody = { ...validBody, generatorId: "22222222-2222-4222-8222-000000000099" };
    await POST(new NextRequest("http://localhost/api/waste-lots", { method: "POST", body: JSON.stringify(spoofedBody) }));
    const callArg = vi.mocked(wasteLotsService.createWasteLot).mock.calls[0][0];
    expect(callArg.generatorId).toBe(generator.id);
    expect(callArg).not.toHaveProperty("userId");
  });

  it("rejects an invalid request body", async () => {
    const response = await POST(new NextRequest("http://localhost/api/waste-lots", { method: "POST", body: JSON.stringify({ wasteType: "Rice Husk" }) }));
    expect(response.status).toBe(400);
    expect(wasteLotsService.createWasteLot).not.toHaveBeenCalled();
  });
});

const generatorA = generator;
const generatorB = { ...generator, id: "11111111-1111-4111-8111-000000000002", name: "Generator B" };
const lotsOwnedByA = [
  { id: "aaaaaaaa-0000-4000-8000-000000000001", generator: { id: generatorA.id } },
  { id: "aaaaaaaa-0000-4000-8000-000000000002", generator: { id: generatorA.id } },
];
const lotsOwnedByB = [
  { id: "bbbbbbbb-0000-4000-8000-000000000001", generator: { id: generatorB.id } },
  { id: "bbbbbbbb-0000-4000-8000-000000000002", generator: { id: generatorB.id } },
];

describe("GET /api/waste-lots/mine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unauthenticated request with 401 and never touches the database", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: false, status: 401, code: "UNAUTHENTICATED", message: "Authentication required." } as never);
    const response = await getMine();
    expect(response.status).toBe(401);
    expect(wasteLotsService.listWasteLots).not.toHaveBeenCalled();
  });

  it("returns only Generator A's own lots (every status) when Generator A is authenticated", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: true, user: generatorA } as never);
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue(lotsOwnedByA as never);
    const response = await getMine();
    expect(response.status).toBe(200);
    expect(wasteLotsService.listWasteLots).toHaveBeenCalledWith({ status: "ALL", generatorId: generatorA.id });
    const body = await response.json();
    expect(body.wasteLots).toEqual(lotsOwnedByA);
  });

  it("returns only Generator B's own lots when Generator B is authenticated — the same endpoint scopes by whoever is signed in", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: true, user: generatorB } as never);
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue(lotsOwnedByB as never);
    const response = await getMine();
    expect(response.status).toBe(200);
    expect(wasteLotsService.listWasteLots).toHaveBeenCalledWith({ status: "ALL", generatorId: generatorB.id });
    const body = await response.json();
    expect(body.wasteLots).toEqual(lotsOwnedByB);
  });

  it("Generator A cannot obtain Generator B's lots by supplying a generatorId query parameter — the route never reads one", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: true, user: generatorA } as never);
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue(lotsOwnedByA as never);
    // GET takes no arguments at all in this route handler — there is no
    // request object to read a spoofed query parameter from in the first
    // place, which is itself the strongest form of this guarantee. This
    // test documents that the resolved scope is always the authenticated
    // caller's own ID regardless of any input.
    await getMine();
    expect(wasteLotsService.listWasteLots).toHaveBeenCalledWith({ status: "ALL", generatorId: generatorA.id });
    expect(wasteLotsService.listWasteLots).not.toHaveBeenCalledWith(expect.objectContaining({ generatorId: generatorB.id }));
  });

  it("returns an empty list when the authenticated generator owns no waste lots", async () => {
    vi.mocked(authSession.requireCarbonLoopUser).mockResolvedValue({ ok: true, user: generatorB } as never);
    vi.mocked(wasteLotsService.listWasteLots).mockResolvedValue([]);
    const response = await getMine();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.wasteLots).toEqual([]);
  });
});
