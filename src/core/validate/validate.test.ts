import { describe, expectTypeOf, it } from "vitest";
import type { ValidExpr } from ".";

describe("core/validate", () => {
  it("[SEC-02] ValidExpr cannot be forged from a raw value", () => {
    // Only core/validate can produce a ValidExpr; plain trees must not type-check as one.
    expectTypeOf<unknown>().not.toExtend<ValidExpr>();
    expectTypeOf<["Add", 1, 2]>().not.toExtend<ValidExpr>();
    expectTypeOf<Record<string, unknown>>().not.toExtend<ValidExpr>();
  });
});
