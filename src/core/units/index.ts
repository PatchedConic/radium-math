/**
 * Dimensions, unit registry and conversion (UNT-*), architecture Section 6.
 * M1-T2: types only. Arithmetic arrives in M1-T3, the registry in M1-T4.
 */

/** Exact fraction. Always reduced, with `den > 0`. */
export interface Rational {
  readonly num: bigint;
  readonly den: bigint;
}

/**
 * Exponents over the 7 SI base dimensions, in this order:
 * length L, mass M, time T, current I, temperature Θ, amount N, luminous intensity J.
 * Exponents are rational so that sqrt(m²) works.
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

/** A value inside the engine: magnitude in coherent SI plus its dimension. */
export interface Quantity {
  readonly si: number;
  readonly dim: Dimension;
}
