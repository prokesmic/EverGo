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
    // Additional ignores
    "playwright-report/**",
    "test-results/**",
    "public/sw.js",
    "prisma/seed.js",
  ]),
  // Custom rules
  {
    rules: {
      // Downgrade no-explicit-any to warning - needed for Prisma and dynamic data
      "@typescript-eslint/no-explicit-any": "warn",
      // Downgrade no-unused-vars to warning
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_|^error$|^e$"
      }],
      // Allow require imports in specific files
      "@typescript-eslint/no-require-imports": "warn",
      // Use ts-expect-error instead of ts-ignore
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-ignore": "allow-with-description",
        "ts-expect-error": "allow-with-description"
      }],
      // Allow unescaped quotes in JSX - they render fine in browsers
      "react/no-unescaped-entities": "off",
      // React 19 compiler rules - downgrade to warnings as they are optimizations not bugs
      // These rules are from eslint-plugin-react-hooks v7+ (React 19 compiler integration)
      "react-hooks/rules-of-hooks": "error", // Keep this as error - it's critical
      "react-hooks/exhaustive-deps": "warn", // Keep as warning - important but sometimes false positives
      // React Compiler optimization rules - downgrade from error to warn
      // These are strict optimization hints for the React 19 compiler, not actual bugs
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
    }
  },
  // Stricter rules for Mike testing agent
  {
    files: ["mike/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    }
  },
  // Allow any in test files
  {
    files: ["e2e/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    }
  },
]);

export default eslintConfig;
