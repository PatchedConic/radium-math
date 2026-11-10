/**
 * Region input types, block ids and schema version (architecture Section 4).
 * Draft contract from M0; refined in M1.
 */

/** UUID, stable for the block's life (FIL-04). */
export type BlockId = string;

/** Raw MathLive output. Untrusted until it passes core/validate (SEC-02). */
export type MathJson = unknown;

export type SymbolicOp = "simplify" | "expand" | "factor" | "differentiate" | "integrate" | "solve";

export type ErrorCode =
  | "undefined-symbol"
  | "defined-below"
  | "dimension-mismatch"
  | "bad-display-unit"
  | "disallowed"
  | "too-large"
  | "unsupported"
  | "timeout"
  | "internal";
