/**
 * Exact fractions over bigint (UNT-08). Unit factors and dimension exponents
 * use these so they never pick up rounding error; `toNumber` is the one
 * place a value becomes an ordinary double.
 *
 * Every function builds its result with `rat`, so every Rational is reduced
 * with a positive denominator. That makes each value's representation unique,
 * which is what lets `equals` compare the two parts directly.
 */

/** Exact fraction. Always reduced, with `den > 0`. */
export interface Rational {
  readonly num: bigint;
  readonly den: bigint;
}

/** Greatest common divisor of |a| and b, for b > 0 (Euclid's algorithm). */
function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Make a fraction: reduced, with the sign on the numerator.
 * Throws RangeError on a zero denominator, which is a programming error;
 * the engine reports it as "internal" (REL-02).
 */
export function rat(num: bigint, den: bigint = 1n): Rational {
  if (den === 0n) {
    throw new RangeError("Rational with zero denominator");
  }
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  // den > 0, so g > 0. gcd(0, den) = den, which turns 0/den into 0/1.
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

export const ZERO: Rational = rat(0n);
export const ONE: Rational = rat(1n);

/** a/b + c/d = (ad + cb) / bd */
export function add(a: Rational, b: Rational): Rational {
  return rat(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function neg(a: Rational): Rational {
  return rat(-a.num, a.den);
}

export function sub(a: Rational, b: Rational): Rational {
  return add(a, neg(b));
}

/** a/b × c/d = ac / bd */
export function mul(a: Rational, b: Rational): Rational {
  return rat(a.num * b.num, a.den * b.den);
}

/** a/b ÷ c/d = ad / bc. Dividing by zero throws (via `rat`). */
export function div(a: Rational, b: Rational): Rational {
  return rat(a.num * b.den, a.den * b.num);
}

/** Integer power. A negative exponent inverts first: x⁻ⁿ = (1/x)ⁿ. */
export function pow(base: Rational, exponent: bigint): Rational {
  if (exponent < 0n) {
    return pow(div(ONE, base), -exponent);
  }
  return rat(base.num ** exponent, base.den ** exponent);
}

/** Exact equality. Correct only because every Rational is reduced. */
export function equals(a: Rational, b: Rational): boolean {
  return a.num === b.num && a.den === b.den;
}

export function isZero(a: Rational): boolean {
  return a.num === 0n;
}

export function isInteger(a: Rational): boolean {
  return a.den === 1n;
}

/** Number of binary digits in a non-negative bigint. */
function bitLength(x: bigint): number {
  return x.toString(2).length;
}

/**
 * The nearest double, give or take a rounding step. This is the only place
 * exactness ends (architecture Section 6).
 */
export function toNumber(r: Rational): number {
  const n = Number(r.num);
  const d = Number(r.den);
  if (Number.isFinite(n) && Number.isFinite(d)) {
    return n / d;
  }
  // A part is beyond a double's range (about 2^1024). Shift both parts
  // right by the same number of bits, which keeps their ratio, so the
  // larger one has about 1000 bits. The sign is handled separately so that
  // shifting a negative number cannot round it away from zero.
  const sign = r.num < 0n ? -1 : 1;
  const absNum = r.num < 0n ? -r.num : r.num;
  const shift = BigInt(Math.max(bitLength(absNum), bitLength(r.den)) - 1000);
  return (sign * Number(absNum >> shift)) / Number(r.den >> shift);
}
