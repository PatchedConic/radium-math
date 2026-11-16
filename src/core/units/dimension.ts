/**
 * Dimensions: exponents over the 7 SI base dimensions (UNT-02,
 * architecture Section 6). Multiplying quantities adds exponents, dividing
 * subtracts them, and a power multiplies them. Exponents are exact
 * fractions, so √(m²) is exactly m and never m^0.9999999999999999.
 */
import { add, isZero, mul, rat, sub } from "./rational";
import type { Rational } from "./rational";

/**
 * Exponents over the 7 SI base dimensions, in this order:
 * length L, mass M, time T, current I, temperature Θ, amount N, luminous intensity J.
 */
export type Dimension = readonly [
  L: Rational,
  M: Rational,
  T: Rational,
  I: Rational,
  Θ: Rational,
  N: Rational,
  J: Rational,
];

export type BaseName = "L" | "M" | "T" | "I" | "Θ" | "N" | "J";

/**
 * Build a dimension from whole-number exponents; missing names are 0.
 * dim({ M: 1, L: -1, T: -2 }) is pressure. A non-integer exponent throws
 * (RangeError from BigInt): fractional exponents come only from arithmetic.
 */
export function dim(exps: { readonly [K in BaseName]?: number }): Dimension {
  const e = (name: BaseName): Rational => rat(BigInt(exps[name] ?? 0));
  return [e("L"), e("M"), e("T"), e("I"), e("Θ"), e("N"), e("J")];
}

export const DIMENSIONLESS: Dimension = dim({});

/** Apply `op` position by position: [op(a.L, b.L), op(a.M, b.M), …]. */
function combine(
  a: Dimension,
  b: Dimension,
  op: (x: Rational, y: Rational) => Rational,
): Dimension {
  return [
    op(a[0], b[0]),
    op(a[1], b[1]),
    op(a[2], b[2]),
    op(a[3], b[3]),
    op(a[4], b[4]),
    op(a[5], b[5]),
    op(a[6], b[6]),
  ];
}

/** m × m = m²: exponents add. */
export function dimMul(a: Dimension, b: Dimension): Dimension {
  return combine(a, b, add);
}

/** N ÷ m²: exponents subtract. */
export function dimDiv(a: Dimension, b: Dimension): Dimension {
  return combine(a, b, sub);
}

/** (L²)^½ = L: every exponent is multiplied by `p`. */
export function dimPow(d: Dimension, p: Rational): Dimension {
  return combine(d, DIMENSIONLESS, (x) => mul(x, p));
}

/** True when all seven exponents are 0. */
export function isDimensionless(d: Dimension): boolean {
  return d.every(isZero);
}

/** Two dimensions are equal exactly when dividing one by the other leaves nothing. */
export function dimEquals(a: Dimension, b: Dimension): boolean {
  return isDimensionless(dimDiv(a, b));
}
