import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  ONE,
  ZERO,
  add,
  div,
  equals,
  isInteger,
  isZero,
  mul,
  neg,
  pow,
  rat,
  sub,
  toNumber,
} from "./rational";
import type { Rational } from "./rational";

/** Reference gcd, written independently of the code under test. */
function refGcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  return b === 0n ? a : refGcd(b, a % b);
}

const nonZero = fc.bigInt().filter((n) => n !== 0n);
/** Any fraction, built through `rat` like all real ones. */
const arbRational: fc.Arbitrary<Rational> = fc
  .tuple(fc.bigInt(), nonZero)
  .map(([n, d]) => rat(n, d));
const arbNonZeroRational = arbRational.filter((r) => !isZero(r));

describe("rat", () => {
  it("[MNT-04][UNT-08] every fraction is reduced, with a positive denominator", () => {
    fc.assert(
      fc.property(fc.bigInt(), nonZero, (n, d) => {
        const r = rat(n, d);
        return r.den > 0n && refGcd(r.num, r.den) === 1n;
      }),
    );
  });

  it("[MNT-04][UNT-08] scaling top and bottom gives the same value", () => {
    fc.assert(
      fc.property(fc.bigInt(), nonZero, nonZero, (n, d, k) => equals(rat(n * k, d * k), rat(n, d))),
    );
  });

  it("[UNT-08] moves the sign to the numerator and reduces", () => {
    expect(rat(1n, -2n)).toEqual({ num: -1n, den: 2n });
    expect(rat(-10n, -4n)).toEqual({ num: 5n, den: 2n });
    expect(rat(0n, -7n)).toEqual({ num: 0n, den: 1n });
    expect(rat(3n)).toEqual({ num: 3n, den: 1n });
  });

  it("[REL-02] a zero denominator throws a RangeError", () => {
    expect(() => rat(1n, 0n)).toThrow(RangeError);
  });
});

describe("arithmetic", () => {
  it("[MNT-04][UNT-08] add and mul do not depend on order", () => {
    fc.assert(
      fc.property(arbRational, arbRational, (a, b) => {
        return equals(add(a, b), add(b, a)) && equals(mul(a, b), mul(b, a));
      }),
    );
  });

  it("[MNT-04][UNT-08] add and mul do not depend on grouping", () => {
    fc.assert(
      fc.property(arbRational, arbRational, arbRational, (a, b, c) => {
        return (
          equals(add(add(a, b), c), add(a, add(b, c))) &&
          equals(mul(mul(a, b), c), mul(a, mul(b, c)))
        );
      }),
    );
  });

  it("[MNT-04][UNT-08] mul distributes over add", () => {
    fc.assert(
      fc.property(arbRational, arbRational, arbRational, (a, b, c) =>
        equals(mul(a, add(b, c)), add(mul(a, b), mul(a, c))),
      ),
    );
  });

  it("[MNT-04][UNT-08] subtraction and division undo addition and multiplication", () => {
    fc.assert(
      fc.property(arbRational, arbNonZeroRational, (a, b) => {
        return (
          equals(sub(add(a, b), b), a) &&
          equals(div(mul(a, b), b), a) &&
          equals(sub(a, a), ZERO) &&
          equals(div(b, b), ONE) &&
          equals(neg(neg(a)), a)
        );
      }),
    );
  });

  it("[MNT-04][UNT-08] powers combine: xᵐ × xⁿ = xᵐ⁺ⁿ, including negative exponents", () => {
    const exponent = fc.integer({ min: -6, max: 6 }).map(BigInt);
    fc.assert(
      fc.property(arbNonZeroRational, exponent, exponent, (x, m, n) =>
        equals(mul(pow(x, m), pow(x, n)), pow(x, m + n)),
      ),
    );
  });

  it("[UNT-08] inch factors stay exact: (127/5000)² and 127/5000 × 5000/127", () => {
    const inch = rat(127n, 5000n);
    expect(pow(inch, 2n)).toEqual({ num: 16129n, den: 25000000n });
    expect(mul(inch, rat(5000n, 127n))).toEqual(ONE);
    expect(pow(inch, -1n)).toEqual({ num: 5000n, den: 127n });
    expect(pow(inch, 0n)).toEqual(ONE);
  });

  it("[UNT-08] psi = lbf / in² is an exact fraction until toNumber", () => {
    const lbf = mul(rat(45359237n, 100000000n), rat(980665n, 100000n)); // lbm × standard g
    expect(lbf).toEqual({ num: 8896443230521n, den: 2000000000000n });
    const psi = div(lbf, pow(rat(127n, 5000n), 2n));
    expect(psi).toEqual({ num: 8896443230521n, den: 1290320000n });
    expect(toNumber(psi)).toBeCloseTo(6894.757293168361, 9);
  });

  it("[REL-02] dividing by zero throws, including a negative power of zero", () => {
    expect(() => div(ONE, ZERO)).toThrow(RangeError);
    expect(() => pow(ZERO, -1n)).toThrow(RangeError);
  });

  it("[UNT-08] isInteger and isZero", () => {
    expect(isInteger(rat(6n, 3n))).toBe(true);
    expect(isInteger(rat(1n, 2n))).toBe(false);
    expect(isZero(rat(0n, 5n))).toBe(true);
    expect(isZero(ONE)).toBe(false);
  });
});

describe("toNumber", () => {
  it("[MNT-04][ACC-01] matches plain division when both parts fit exactly in a double", () => {
    const safe = fc.bigInt({ min: -(2n ** 53n), max: 2n ** 53n });
    const safeNonZero = safe.filter((n) => n !== 0n);
    fc.assert(
      fc.property(safe, safeNonZero, (n, d) => toNumber(rat(n, d)) === Number(n) / Number(d)),
    );
  });

  it("[ACC-01] stays accurate when both parts are beyond a double's range", () => {
    // 3^700 / 2^1000 ≈ 10^32.9; both parts are over 1000 bits. Neither is
    // divisible by the other's prime, so rat cannot reduce them.
    const big = rat(3n ** 700n, 2n ** 1000n);
    const expected = Math.exp(700 * Math.log(3) - 1000 * Math.log(2));
    expect(Math.abs(toNumber(big) / expected - 1)).toBeLessThan(1e-12);
    expect(Math.abs(toNumber(neg(big)) / -expected - 1)).toBeLessThan(1e-12);
    // (10^400 + 1) / 10^399 is just over 10 and does not reduce.
    expect(toNumber(rat(10n ** 400n + 1n, 10n ** 399n))).toBeCloseTo(10, 12);
  });

  it("[ACC-01] values truly beyond range become ±Infinity or 0", () => {
    expect(toNumber(rat(10n ** 400n))).toBe(Infinity);
    expect(toNumber(rat(-(10n ** 400n)))).toBe(-Infinity);
    expect(toNumber(rat(1n, 10n ** 400n))).toBe(0);
    expect(toNumber(rat(-1n, 10n ** 400n))).toBe(-0);
  });
});
