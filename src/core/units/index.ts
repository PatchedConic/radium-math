/**
 * Dimensions, unit registry and conversion (UNT-*), architecture Section 6.
 * Exact fractions live in ./rational and dimensions in ./dimension (M1-T3);
 * the unit registry arrives in M1-T4.
 */
import type { Dimension } from "./dimension";

export * from "./rational";
export * from "./dimension";

/** A value inside the engine: magnitude in coherent SI plus its dimension. */
export interface Quantity {
  readonly si: number;
  readonly dim: Dimension;
}
