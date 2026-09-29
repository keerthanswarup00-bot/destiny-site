import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

/**
 * `next lint` was removed in Next 16, so the project's old `"lint": "next lint"` script resolved
 * to a nonexistent directory and never linted anything. ESLint runs directly instead, with the
 * config Next ships.
 */
export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "snippets/**"]),
]);
