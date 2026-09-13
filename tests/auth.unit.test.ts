import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getAuthenticatedUser,
  getCurrentCarbonLoopUser,
  requireAuthenticatedUser,
  requireCarbonLoopUser,
  requireRole,
} from "../src/lib/auth/session";
import { prisma } from "../src/lib/db/prisma";
import { createSupabaseServerClient } from "../src/lib/supabase/server";

vi.mock("../src/lib/db/prisma", () => ({ prisma: { user: { findUnique: vi.fn() } } }));
vi.mock("../src/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

const supabaseUser = { id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000001", email: "generator@example.com" };
const generatorRow = { id: supabaseUser.id, name: "Test Generator", role: "GENERATOR", organization: null, latitude: null, longitude: null, createdAt: new Date() };

function mockSupabaseSession(user: typeof supabaseUser | null) {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  } as never);
}

describe("getAuthenticatedUser", () => {
  it("returns null when there is no session", async () => {
    mockSupabaseSession(null);
    expect(await getAuthenticatedUser()).toBeNull();
  });

  it("returns the Supabase user when a session exists", async () => {
    mockSupabaseSession(supabaseUser);
    expect(await getAuthenticatedUser()).toEqual(supabaseUser);
  });

  it("degrades to null (not a crash) when Supabase Auth is not configured", async () => {
    vi.mocked(createSupabaseServerClient).mockRejectedValue(new Error("Supabase Auth is not configured"));
    expect(await getAuthenticatedUser()).toBeNull();
  });
});

describe("requireAuthenticatedUser", () => {
  it("returns a 401 UNAUTHENTICATED failure when there is no session", async () => {
    mockSupabaseSession(null);
    const result = await requireAuthenticatedUser();
    expect(result).toEqual({ ok: false, status: 401, code: "UNAUTHENTICATED", message: expect.any(String) });
  });

  it("returns the Supabase user on success", async () => {
    mockSupabaseSession(supabaseUser);
    const result = await requireAuthenticatedUser();
    expect(result).toEqual({ ok: true, user: supabaseUser });
  });
});

describe("getCurrentCarbonLoopUser", () => {
  it("resolves the authenticated Supabase session to the matching CarbonLoop users row", async () => {
    mockSupabaseSession(supabaseUser);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(generatorRow as never);
    const result = await getCurrentCarbonLoopUser();
    expect(result).toEqual({ ok: true, user: generatorRow });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: supabaseUser.id } });
  });

  it("returns 404 PROFILE_NOT_FOUND when the session has no matching users row", async () => {
    mockSupabaseSession(supabaseUser);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await getCurrentCarbonLoopUser();
    expect(result).toEqual({ ok: false, status: 404, code: "PROFILE_NOT_FOUND", message: expect.any(String) });
  });

  it("propagates 401 UNAUTHENTICATED without querying the database when there is no session", async () => {
    mockSupabaseSession(null);
    const result = await getCurrentCarbonLoopUser();
    expect(result.ok).toBe(false);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("requireRole", () => {
  it("allows a user whose role is in the allowlist", () => {
    expect(requireRole(generatorRow as never, ["GENERATOR", "ADMIN"] as never)).toEqual({ ok: true, user: generatorRow });
  });

  it("forbids (403) a user whose role is not in the allowlist", () => {
    const result = requireRole(generatorRow as never, ["FACILITY", "ADMIN"] as never);
    expect(result).toEqual({ ok: false, status: 403, code: "FORBIDDEN", message: expect.any(String) });
  });
});

describe("requireCarbonLoopUser", () => {
  it("composes authentication and role-checking: 401 when signed out", async () => {
    mockSupabaseSession(null);
    const result = await requireCarbonLoopUser(["GENERATOR"] as never);
    expect(result).toEqual(expect.objectContaining({ ok: false, status: 401 }));
  });

  it("composes authentication and role-checking: 403 when signed in with the wrong role", async () => {
    mockSupabaseSession(supabaseUser);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(generatorRow as never);
    const result = await requireCarbonLoopUser(["FACILITY", "ADMIN"] as never);
    expect(result).toEqual(expect.objectContaining({ ok: false, status: 403 }));
  });

  it("succeeds when signed in with an allowed role", async () => {
    mockSupabaseSession(supabaseUser);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(generatorRow as never);
    const result = await requireCarbonLoopUser(["GENERATOR", "ADMIN"] as never);
    expect(result).toEqual({ ok: true, user: generatorRow });
  });

  it("only requires authentication (any role) when no allowlist is given", async () => {
    mockSupabaseSession(supabaseUser);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(generatorRow as never);
    const result = await requireCarbonLoopUser();
    expect(result).toEqual({ ok: true, user: generatorRow });
  });
});
