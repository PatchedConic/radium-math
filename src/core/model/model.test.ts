import { describe, expectTypeOf, it } from "vitest";
import type { BlockId, Latex, MathJson, RegionInput, RegionResult } from ".";

// Type-level tests: `pnpm typecheck` enforces them, Vitest reports them.
describe("core/model", () => {
  it("[FIL-03] region inputs carry LaTeX strings, never MathJSON (ADR 0017)", () => {
    expectTypeOf<RegionInput["expr"]>().toEqualTypeOf<Latex>();
    expectTypeOf<Latex>().toBeString();
    expectTypeOf<MathJson>().not.toEqualTypeOf<Latex>();
  });

  it("[FIL-03] a definition input holds only what the user typed", () => {
    const def: RegionInput = { kind: "definition", id: "b1", name: "L", expr: "2\\,m" };
    expectTypeOf(def).toExtend<RegionInput>();
    // @ts-expect-error a computed value is not part of a region input
    const withValue: RegionInput = { kind: "evaluation", id: "b2", expr: "L", value: 2 };
    expectTypeOf(withValue).toExtend<RegionInput>();
  });

  it("[MTH-12] a blocked result must name the region that blocks it", () => {
    expectTypeOf<
      Extract<RegionResult, { status: "blocked" }>["blockedBy"]
    >().toEqualTypeOf<BlockId>();
    const stale: RegionResult = {
      id: "b3",
      status: "blocked",
      blockedBy: "b1",
      // @ts-expect-error blocked results carry no value, so nothing stale can show
      value: { latex: "2" },
    };
    expectTypeOf(stale).toExtend<RegionResult>();
  });

  it("[MTH-12] result status is a closed union", () => {
    function describeResult(r: RegionResult): string {
      switch (r.status) {
        case "ok":
          return r.value.latex;
        case "error":
          return r.error.message;
        case "blocked":
          return r.blockedBy;
        default: {
          const unreachable: never = r;
          return unreachable;
        }
      }
    }
    expectTypeOf(describeResult).returns.toBeString();
  });
});
