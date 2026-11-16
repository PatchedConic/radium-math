import { describe, expectTypeOf, it } from "vitest";
import { dim } from ".";
import type { Dimension, Quantity, Rational } from ".";

// Type-level tests for the units types; arithmetic is tested in
// rational.test.ts and dimension.test.ts.
describe("core/units", () => {
  it("[UNT-02] a dimension has exactly the 7 SI base exponents", () => {
    expectTypeOf<Dimension["length"]>().toEqualTypeOf<7>();
    expectTypeOf<Dimension[number]>().toEqualTypeOf<Rational>();
  });

  it("[UNT-08] rationals and quantities are exact and read-only", () => {
    expectTypeOf<Rational["num"]>().toEqualTypeOf<bigint>();
    const q: Quantity = { si: 0.17272, dim: dim({ L: 2 }) };
    // @ts-expect-error quantities are immutable plain data
    q.si = 1;
  });
});
