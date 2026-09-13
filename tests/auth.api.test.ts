import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST as completeProfile } from "../src/app/api/auth/complete-profile/route";
import { POST as logout } from "../src/app/api/auth/logout/route";
import { POST as signup } from "../src/app/api/auth/signup/route";
import * as authSession from "../src/lib/auth/session";
import { prisma } from "../src/lib/db/prisma";
import { createSupabaseServerClient } from "../src/lib/supabase/server";

vi.mock("../src/lib/db/prisma", () => ({ prisma: { user: { create: vi.fn(), findUnique: vi.fn() } } }));
vi.mock("../src/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("../src/lib/auth/session", () => ({ requireAuthenticatedUser: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

const validSignupBody = { email: "new-generator@example.com", password: "correct-horse-battery", name: "New Generator", role: "GENERATOR" };
const newAuthUser = { id: "bbbbbbbb-bbbb-4bbb-8bbb-000000000001", email: validSignupBody.email };

function mockSupabase(overrides: { signUp?: unknown; signOut?: unknown } = {}) {
  const client = {
    auth: {
      signUp: vi.fn().mockResolvedValue(overrides.signUp ?? { data: { user: newAuthUser, session: { access_token: "irrelevant" } }, error: null }),
      signOut: vi.fn().mockResolvedValue(overrides.signOut ?? { error: null }),
    },
  };
  vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
  return client;
}

describe("POST /api/auth/signup", () => {
  it("creates the Supabase Auth account and the matching CarbonLoop users row with the Supabase UID as the primary key", async () => {
    mockSupabase();
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify(validSignupBody) }));
    expect(response.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { id: newAuthUser.id, name: validSignupBody.name, role: "GENERATOR", organization: undefined, latitude: undefined, longitude: undefined },
    });
  });

  it("a non-admin cannot become ADMIN through the signup payload — rejected by validation before any account is created", async () => {
    const client = mockSupabase();
    const response = await signup(
      new NextRequest("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify({ ...validSignupBody, role: "ADMIN" }) })
    );
    expect(response.status).toBe(400);
    expect(client.auth.signUp).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects an incomplete signup request with 400", async () => {
    mockSupabase();
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify({ email: "x@example.com" }) }));
    expect(response.status).toBe(400);
  });

  it("surfaces a Supabase signUp error as 422 without creating a profile row", async () => {
    mockSupabase({ signUp: { data: { user: null, session: null }, error: { message: "User already registered" } } });
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify(validSignupBody) }));
    expect(response.status).toBe(422);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("reports emailConfirmationRequired when Supabase returns no session (confirmation-required project setting)", async () => {
    mockSupabase({ signUp: { data: { user: newAuthUser, session: null }, error: null } });
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify(validSignupBody) }));
    const body = await response.json();
    expect(body.emailConfirmationRequired).toBe(true);
  });

  it("returns a safe, recoverable error — without leaking internal details — if profile creation fails after the auth account was created", async () => {
    mockSupabase();
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("connection terminated unexpectedly: password authentication failed"));
    const response = await signup(new NextRequest("http://localhost/api/auth/signup", { method: "POST", body: JSON.stringify(validSignupBody) }));
    expect(response.status).toBe(500);
    const body = await response.json();
    // The user-facing message legitimately mentions "sign in with your
    // password" — check for the actual leaked internal exception text
    // ("connection terminated unexpectedly: password authentication
    // failed"), not the innocuous word "password" on its own.
    expect(body.error).not.toContain("connection terminated");
    expect(body.error).not.toContain("authentication failed");
    // Recoverable: the response points the user toward signing in and
    // retrying profile setup (POST /api/auth/complete-profile) rather than
    // being a dead end.
    expect(body.recoverable).toBe(true);
    expect(body.error.toLowerCase()).toContain("sign in");
  });
});

describe("POST /api/auth/complete-profile", () => {
  const authUser = { id: newAuthUser.id, email: newAuthUser.email };
  const profileBody = { name: "New Generator", role: "GENERATOR", organization: "Demo Org" };

  it("rejects an unauthenticated request with 401 and never touches the database", async () => {
    vi.mocked(authSession.requireAuthenticatedUser).mockResolvedValue({ ok: false, status: 401, code: "UNAUTHENTICATED", message: "Authentication required." } as never);
    const response = await completeProfile(new NextRequest("http://localhost/api/auth/complete-profile", { method: "POST", body: JSON.stringify(profileBody) }));
    expect(response.status).toBe(401);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("creates the missing profile row for the authenticated account — recovering exactly the signup failure mode above", async () => {
    vi.mocked(authSession.requireAuthenticatedUser).mockResolvedValue({ ok: true, user: authUser } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    const response = await completeProfile(new NextRequest("http://localhost/api/auth/complete-profile", { method: "POST", body: JSON.stringify(profileBody) }));
    expect(response.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith({ data: { id: authUser.id, name: "New Generator", role: "GENERATOR", organization: "Demo Org" } });
    const body = await response.json();
    expect(body.alreadyComplete).toBe(false);
  });

  it("is idempotent — if the profile already exists, it succeeds without creating a duplicate", async () => {
    vi.mocked(authSession.requireAuthenticatedUser).mockResolvedValue({ ok: true, user: authUser } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: authUser.id } as never);
    const response = await completeProfile(new NextRequest("http://localhost/api/auth/complete-profile", { method: "POST", body: JSON.stringify(profileBody) }));
    expect(response.status).toBe(200);
    expect(prisma.user.create).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body.alreadyComplete).toBe(true);
  });

  it("a non-admin still cannot become ADMIN through this recovery path", async () => {
    vi.mocked(authSession.requireAuthenticatedUser).mockResolvedValue({ ok: true, user: authUser } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const response = await completeProfile(
      new NextRequest("http://localhost/api/auth/complete-profile", { method: "POST", body: JSON.stringify({ ...profileBody, role: "ADMIN" }) })
    );
    expect(response.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns a generic 500 without leaking internal details if profile creation still fails", async () => {
    vi.mocked(authSession.requireAuthenticatedUser).mockResolvedValue({ ok: true, user: authUser } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("connection terminated unexpectedly: password authentication failed"));
    const response = await completeProfile(new NextRequest("http://localhost/api/auth/complete-profile", { method: "POST", body: JSON.stringify(profileBody) }));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).not.toContain("password");
  });
});

describe("POST /api/auth/logout", () => {
  it("signs the current session out", async () => {
    const client = mockSupabase();
    const response = await logout();
    expect(response.status).toBe(200);
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});
