import { describe, expect, it, vi } from "vitest";

import { GET as list } from "../src/app/api/carbon-records/route";
import { GET as detail } from "../src/app/api/carbon-records/[id]/route";
import * as ledger from "../src/lib/ledger/ledger";

vi.mock("../src/lib/ledger/ledger", () => ({ listCarbonRecords: vi.fn(), getCarbonRecord: vi.fn() }));
const id = "55555555-5555-4555-8555-000000000001";
describe("Carbon ledger APIs", () => {
  it("lists carbon records", async () => { vi.mocked(ledger.listCarbonRecords).mockResolvedValue([{ id }] as never); const response = await list(); expect(response.status).toBe(200); expect((await response.json()).records).toHaveLength(1); });
  it("returns ledger transaction detail and validates IDs", async () => { vi.mocked(ledger.getCarbonRecord).mockResolvedValue({ id } as never); expect((await detail(new Request("http://localhost"), { params: Promise.resolve({ id }) })).status).toBe(200); expect((await detail(new Request("http://localhost"), { params: Promise.resolve({ id: "bad" }) })).status).toBe(400); vi.mocked(ledger.getCarbonRecord).mockResolvedValue(null); expect((await detail(new Request("http://localhost"), { params: Promise.resolve({ id }) })).status).toBe(404); });
});
