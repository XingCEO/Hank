import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Keep lint focused on source files and ignore generated/worktree artifacts.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local tooling/worktrees and historical static site.
    ".claude/**",
    "legacy_v1/**",
    // Generated Prisma client and logs.
    "prisma/generated/**",
    "*.log",
  ]),
]);

export default eslintConfig;
