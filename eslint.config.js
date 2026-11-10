// @ts-check
import js from "@eslint/js";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * SEC-01: document content must never become code. These rules ban every
 * way we know of to turn a string into code, plus raw HTML injection.
 * scripts/check-forbidden.mjs repeats the core checks as a plain code search.
 */
const securityRules = {
  "no-eval": "error",
  "no-new-func": "error",
  "no-script-url": "error",
  "no-restricted-globals": [
    "error",
    { name: "Function", message: "SEC-01: the Function constructor runs strings as code." },
  ],
  "no-restricted-properties": [
    "error",
    { object: "globalThis", property: "Function", message: "SEC-01: no Function constructor." },
    { object: "window", property: "Function", message: "SEC-01: no Function constructor." },
    { object: "self", property: "Function", message: "SEC-01: no Function constructor." },
    { object: "globalThis", property: "eval", message: "SEC-01: no eval." },
    { object: "window", property: "eval", message: "SEC-01: no eval." },
    { object: "self", property: "eval", message: "SEC-01: no eval." },
    { object: "document", property: "write", message: "SEC-01: no document.write." },
  ],
  "no-restricted-syntax": [
    "error",
    {
      selector: "ImportExpression",
      message: "SEC-01: no dynamic import(). Use a static import.",
    },
    {
      selector: "CallExpression[callee.property.name='compile']",
      message:
        "SEC-01: CortexJS compile() generates JavaScript. Evaluate validated MathJSON through ComputeBackend.",
    },
    {
      selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
      message: "SEC-01/SEC-12: no raw HTML injection.",
    },
    {
      selector: "AssignmentExpression > MemberExpression[property.name=/^(innerHTML|outerHTML)$/]",
      message: "SEC-01/SEC-12: no raw HTML injection.",
    },
    {
      selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
      message: "SEC-01/SEC-12: no raw HTML injection.",
    },
  ],
};

export default tseslint.config(
  {
    ignores: ["dist/", "coverage/", "src-tauri/", "node_modules/"],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  comments.recommended,

  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      ...securityRules,
      "@typescript-eslint/no-implied-eval": "error",

      // MNT-01: `any` is an error; a justified exception needs a
      // `// eslint-disable-next-line ... -- reason` comment.
      "@typescript-eslint/no-explicit-any": "error",
      "@eslint-community/eslint-comments/require-description": "error",
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",

      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },

  // Browser code: UI, editor, platform and the entry point.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/core/**", "src/worker/**"],
    ...reactHooks.configs.flat["recommended-latest"],
    languageOptions: { globals: globals.browser },
  },

  // Web Worker: no DOM.
  {
    files: ["src/worker/**/*.ts"],
    languageOptions: { globals: globals.worker },
  },

  // Core: pure TypeScript, no environment globals at all (PLT-02).

  // Node: config files and scripts.
  {
    files: ["*.config.{js,ts}", "scripts/**/*.{js,mjs}"],
    languageOptions: { globals: globals.node },
  },

  // Plain JS files are not in a tsconfig, so skip type-aware rules for them.
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Must stay last: turns off rules that conflict with Prettier.
  prettier,
);
