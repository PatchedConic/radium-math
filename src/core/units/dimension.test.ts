import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DIMENSIONLESS,
  dim,
  dimDiv,
  dimEquals,
  dimMul,
  dimPow,
  isDimensionless,
} from "./dimension";
import type { Dimension } from "./dimension";
import { ONE, ZERO, rat } from "./rational";
import type { Rational } from "./rational";

/** Exponents like those real units produce: small fractions such as -3/2. */
const exponent: fc.Arbitrary<Rational> = fc
  .tuple(fc.bigInt({ min: -12n, max: 12n }), fc.bigInt({ min: 1n, max: 6n }))
  .map(([n, d]) => rat(n, d));
const arbDimension: fc.Arbitrary<Dimension> = fc.tuple(
  exponent,
  exponent,
  exponent,
  exponent,
  exponent,
  exponent,
  exponent,
);
const nonZeroInt = fc.bigInt({ min: -6n, max: 6n }).filter((n) => n !== 0n);

const length = dim({ L: 1 });
const force = dim({ M: 1, L: 1, T: -2 });

describe("dimension laws", () => {
  it("[MNT-04][UNT-02] multiplication does not depend on order", () => {
    fc.assert(
      fc.property(arbDimension, arbDimension, (a, b) => dimEquals(dimMul(a, b), dimMul(b, a))),
    );
  });

  it("[MNT-04][UNT-02] division undoes multiplication", () => {
    fc.assert(
      fc.property(arbDimension, arbDimension, (a, b) => dimEquals(dimDiv(dimMul(a, b), b), a)),
    );
  });

  it("[MNT-04][UNT-02] dimensionless is the identity, and a ÷ a is dimensionless", () => {
    fc.assert(
      fc.property(arbDimension, (a) => {
        return dimEquals(dimMul(a, DIMENSIONLESS), a) && isDimensionless(dimDiv(a, a));
      }),
    );
  });

  it("[MNT-04][UNT-02] a root undoes the matching power: (dⁿ)^(1/n) = d", () => {
    fc.assert(
      fc.property(arbDimension, nonZeroInt, (d, n) =>
        dimEquals(dimPow(dimPow(d, rat(n)), rat(1n, n)), d),
      ),
    );
  });

  it("[MNT-04][UNT-02] power 1 changes nothing and power 0 removes the dimension", () => {
    fc.assert(
      fc.property(
        arbDimension,
        (d) => dimEquals(dimPow(d, ONE), d) && isDimensionless(dimPow(d, ZERO)),
      ),
    );
  });

  it("[MNT-04][UNT-02] equality is exact: changing any one exponent breaks it", () => {
    fc.assert(
      fc.property(arbDimension, fc.integer({ min: 0, max: 6 }), (d, i) => {
        const bumped: Dimension = [
          i === 0 ? rat(d[0].num + d[0].den, d[0].den) : d[0],
          i === 1 ? rat(d[1].num + d[1].den, d[1].den) : d[1],
          i === 2 ? rat(d[2].num + d[2].den, d[2].den) : d[2],
          i === 3 ? rat(d[3].num + d[3].den, d[3].den) : d[3],
          i === 4 ? rat(d[4].num + d[4].den, d[4].den) : d[4],
          i === 5 ? rat(d[5].num + d[5].den, d[5].den) : d[5],
          i === 6 ? rat(d[6].num + d[6].den, d[6].den) : d[6],
        ];
        return !dimEquals(d, bumped);
      }),
    );
  });
});

describe("worked examples", () => {
  it("[UNT-02] stress = force ÷ area is M¹L⁻¹T⁻², the same as the dimension of psi", () => {
    const area = dimMul(length, length);
    expect(dimEquals(area, dim({ L: 2 }))).toBe(true);
    const stress = dimDiv(force, area);
    expect(dimEquals(stress, dim({ M: 1, L: -1, T: -2 }))).toBe(true);
  });

  it("[UNT-02] force and area are not equal, so F + A is a mismatch", () => {
    expect(dimEquals(force, dim({ L: 2 }))).toBe(false);
  });

  it("[UNT-02] √(m²) is exactly m, and (m^(1/3))³ is exactly m", () => {
    expect(dimPow(dim({ L: 2 }), rat(1n, 2n))).toEqual(length);
    expect(dimPow(dimPow(length, rat(1n, 3n)), rat(3n))).toEqual(length);
  });

  it("[UNT-02] dim fills missing names with 0 and keeps L M T I Θ N J order", () => {
    const d = dim({ J: 1, Θ: -1 });
    expect(d.map((r) => r.num)).toEqual([0n, 0n, 0n, 0n, -1n, 0n, 1n]);
    expect(isDimensionless(DIMENSIONLESS)).toBe(true);
    expect(isDimensionless(length)).toBe(false);
  });

  it("[UNT-02] dim rejects fractional and unknown exponents", () => {
    expect(() => dim({ L: 1.5 })).toThrow(RangeError);
    // @ts-expect-error X is not one of the 7 base dimensions
    dim({ X: 1 });
  });
});
