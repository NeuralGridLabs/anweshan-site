import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /* Stray, unrelated Laravel project parked in the repo root (57k files of
       vendored jQuery/Bootstrap/AdminLTE). Overriding the default ignores
       above removed eslint-config-next's own exclusions, so without this
       every one of those files gets parsed as source of THIS app. */
    "anweshan/**",
  ]),
]);

export default eslintConfig;
