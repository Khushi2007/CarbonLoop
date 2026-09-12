-- Enable Row Level Security (default-deny, zero policies) on every
-- application table.
--
-- Supabase provisions the `anon` and `authenticated` PostgREST roles with
-- full table grants by default; without RLS enabled, those roles could read
-- and write every row via the project's auto-generated REST API. The
-- application itself never uses that API — it connects directly via Prisma
-- using the table-owner role, which bypasses RLS entirely — so enabling RLS
-- here has no effect on existing application behavior. No policies are
-- created, so PostgREST access is denied by default unless a policy is
-- explicitly added later.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "waste_lots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "facilities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carbon_records" ENABLE ROW LEVEL SECURITY;
