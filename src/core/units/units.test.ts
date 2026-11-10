import fc from "fast-check";
import { describe, expectTypeOf, it } from "vitest";
import type { Dimension, Quantity, Rational } from ".";

describe("core/units", () => {
  it("[UNT-02] a dimension has exactly the 7 SI base exponents", () => {
    expectTypeOf<Dimension["length"]>().toEqualTypeOf<7>();
    expectTypeOf<Dimension[number]>().toEqualTypeOf<Rational>();
  });

  it("[UNT-08] rationals and quantities are exact and read-only", () => {
    expectTypeOf<Rational["num"]>().toEqualTypeOf<bigint>();
    const q: Quantity = {
      si: 0.17272,
      dim: [
        { num: 2n, den: 1n },
        { num: 0n, den: 1n },
        { num: 0n, den: 1n },
        { num: 0n, den: 1n },
        { num: 0n, den: 1n },
        { num: 0n, den: 1n },
        { num: 0n, den: 1n },
      ],
    };
    // @ts-expect-error quantities are immutable plain data
    q.si = 1;
  });

  // Placeholder until M1-T3 adds the real property tests (MNT-04).
  it("[placeholder] fast-check is wired up", () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a));
  });
});
