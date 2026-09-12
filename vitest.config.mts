import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Disable file parallelism to prevent database race conditions
    // and connection pool exhaustion across integration tests.
    fileParallelism: false,
  },
});
