# CarbonLoop

## Authentication (Supabase Auth)

CarbonLoop uses Supabase Auth for identity/sessions (login, signup, logout).
Prisma remains the only domain-data access layer — Supabase Auth is never
used to read or write `waste_lots`, `facilities`, `shipments`, or
`carbon_records`.

Set these two variables (from the **same** Supabase project `DATABASE_URL`
points at — Project Settings > API in the Supabase dashboard):

```
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-SUPABASE-ANON-KEY]"
```

The anon key is Supabase's public/publishable key — it is safe to expose to
the browser (this is why it is `NEXT_PUBLIC_`), and it never grants elevated
access. The service-role key is intentionally **not** used anywhere in this
app and should never be added to any `NEXT_PUBLIC_*` variable.

**Dashboard configuration required once, before signup/login will work:**

1. In the Supabase dashboard, go to Authentication > Providers and confirm
   the **Email** provider is enabled (it is by default on a new project).
2. Decide whether to require email confirmation (Authentication > Providers >
   Email > "Confirm email"). If enabled, a new signup will not receive a
   session until the user clicks the confirmation link; the signup UI
   already handles this and shows a "check your email" message instead of
   signing the user in immediately.
3. No RLS policies need to be added for this app to function — see
   "Row Level Security" below.

Until these two environment variables are set, every page continues to work
exactly as before Stage 7 (the auth layer treats every request as
unauthenticated rather than failing); only signup/login and the new
authenticated actions require them.

### Row Level Security

The database has RLS enabled with zero policies on every table (see
`prisma/migrations/20260912100000_enable_rls_default_deny`). This is
intentional and unrelated to Supabase Auth: the application connects to
Postgres directly via Prisma using the table-owner role, which bypasses RLS
entirely, so authorization is enforced in the Next.js server layer
(`src/lib/auth/session.ts`) rather than in Postgres policies. Do not add
RLS policies to make Supabase's separate, unused PostgREST API work — this
app never calls it.

## Running the database integration test suite safely

`RUN_DATABASE_TESTS=true` enables integration tests (`tests/*.integration.test.ts`)
that call `deleteMany()`/full-table wipes against whatever `DATABASE_URL` resolves
to. **Never run these against the shared/demo Supabase project** — a shared guard
(`tests/helpers/db-safety.ts`) refuses to run them unless `DATABASE_URL` resolves
to a known-safe target, and throws immediately (before any destructive call) if it
doesn't.

Two ways to run the suite safely:

1. **Local disposable Postgres+PostGIS (recommended).** Start a throwaway
   container, point `DATABASE_URL` at it, run migrations, then run the suite:

   ```sh
   docker run --rm -d --name carbonloop-test-db -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgis/postgis:16-3.4
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/postgres"
   npx prisma migrate deploy
   RUN_DATABASE_TESTS=true npm test
   docker rm -f carbonloop-test-db
   ```

   Because the container is disposable, prefer removing and recreating it between
   full suite runs rather than relying on reseeding to reset state.

2. **A dedicated Supabase *test* project.** Only if you don't have Docker
   available. Create a second, disposable Supabase project used for nothing else,
   then explicitly opt it in:

   ```sh
   export DATABASE_URL="<the test project's connection string>"
   export TEST_DATABASE_HOST_ALLOWLIST="<the test project's db host>"
   RUN_DATABASE_TESTS=true npm test
   ```

Setting `RUN_DATABASE_TESTS=true` with `DATABASE_URL` pointing anywhere else
(including the shared demo project) fails immediately with an explanatory error
instead of running.
