// Layer rules from architecture Section 2 (MNT-02, MNT-03, PLT-02).
// Run with `pnpm deps:check`. A wrong-direction import fails the build.

/**
 * npm packages that core may import at runtime. Keep this list short:
 * each entry is a reviewed decision (zod and fflate arrive with core/format).
 * CortexJS is handled separately: only core/compute/cortex may import it.
 */
const coreAllowedPackages = [];

const NPM = [
  "npm",
  "npm-dev",
  "npm-optional",
  "npm-peer",
  "npm-bundled",
  "npm-no-pkg",
  "npm-unknown",
];
const TEST_FILE = "\\.test\\.tsx?$";
const pkg = (names) => `(^|/)node_modules/(${names.join("|")})/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ---- core: pure TypeScript, depends on nothing outside core ----
    {
      name: "core-no-outer-layers",
      comment: "core must not import worker, editor, ui, platform or the app entry (MNT-02).",
      severity: "error",
      from: { path: "^src/core/" },
      to: { path: "^src/(worker|editor|ui|platform)/|^src/main\\.tsx$" },
    },
    {
      name: "core-no-node-builtins",
      comment: "core must run on every target, including iOS and Android (PLT-02).",
      severity: "error",
      from: { path: "^src/core/" },
      to: { dependencyTypes: ["core"] },
    },
    {
      name: "core-npm-allow-list",
      comment:
        "core may only import npm packages on coreAllowedPackages in .dependency-cruiser.cjs (MNT-02). Test files are exempt.",
      severity: "error",
      from: { path: "^src/core/", pathNot: [TEST_FILE, "^src/core/compute/cortex/"] },
      to: {
        dependencyTypes: NPM,
        ...(coreAllowedPackages.length > 0 ? { pathNot: pkg(coreAllowedPackages) } : {}),
      },
    },
    {
      name: "cortex-only-in-adapter",
      comment:
        "CortexJS is reached only through ComputeBackend; only core/compute/cortex imports it (D5, MNT-03).",
      severity: "error",
      from: { pathNot: "^src/core/compute/cortex/" },
      to: { path: pkg(["@cortex-js"]) },
    },

    // ---- worker: hosts the engine ----
    {
      name: "worker-only-core",
      comment: "The worker may import only core (Section 2).",
      severity: "error",
      from: { path: "^src/worker/" },
      to: { path: "^src/", pathNot: "^src/(worker|core)/" },
    },

    // ---- editor: core types and formatting only ----
    {
      name: "editor-no-outer-layers",
      comment: "The editor may import core, not worker, ui, platform or the app entry (Section 2).",
      severity: "error",
      from: { path: "^src/editor/" },
      to: { path: "^src/(worker|ui|platform)/|^src/main\\.tsx$" },
    },
    {
      name: "editor-no-engine",
      comment:
        "Evaluation runs in the worker; the editor must not import core/engine or core/compute.",
      severity: "error",
      from: { path: "^src/editor/" },
      to: { path: "^src/core/(engine|compute)/" },
    },

    // ---- ui: editor, platform, and core types only ----
    {
      name: "ui-no-worker",
      comment: "The UI may import editor, platform and core types only (Section 2).",
      severity: "error",
      from: { path: "^src/ui/" },
      to: { path: "^src/worker/" },
    },
    {
      name: "ui-core-types-only",
      comment: "The UI may use core types only: write `import type` (Section 2).",
      severity: "error",
      from: { path: "^src/ui/" },
      to: { path: "^src/core/", dependencyTypesNot: ["type-only"] },
    },

    // ---- platform: the only door to Tauri ----
    {
      name: "platform-isolated",
      comment: "Platform depends only on @tauri-apps/api, not on other app layers (Section 2).",
      severity: "error",
      from: { path: "^src/platform/" },
      to: { path: "^src/", pathNot: "^src/platform/" },
    },
    {
      name: "tauri-only-in-platform",
      comment: "Only src/platform may import @tauri-apps/* (Section 2, SEC-03).",
      severity: "error",
      from: { pathNot: "^src/platform/" },
      to: { path: pkg(["@tauri-apps"]) },
    },

    // ---- general hygiene ----
    {
      name: "no-circular",
      comment: "Circular imports make layers impossible to reason about.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-unresolvable",
      comment: "Every import must resolve.",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-dev-deps-in-app",
      comment: "Shipped code must not import devDependencies (test files are exempt).",
      severity: "error",
      from: { path: "^src/", pathNot: TEST_FILE },
      to: { dependencyTypes: ["npm-dev"], dependencyTypesNot: ["type-only"] },
    },
  ],

  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      mainFields: ["module", "main", "types", "typings"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
