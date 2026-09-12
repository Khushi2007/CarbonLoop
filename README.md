# CarbonLoop

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
