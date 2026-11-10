/**
 * Region inputs and results: the contract between editor, worker and engine
 * (architecture Section 4). Plain, immutable data with no behaviour.
 */

/** UUID, stable for the block's life (FIL-04). */
export type BlockId = string;

/**
 * MathLive LaTeX exactly as stored in the document (ADR 0017). Untrusted:
 * only the CortexJS adapter in the worker parses it.
 */
export type Latex = string;

/** Parsed from `Latex` in the worker. Untrusted until it passes core/validate (SEC-02). */
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

/** Number format, set per document and overridable per region (MTH-11). */
export interface NumberFormat {
  readonly notation: "fixed" | "scientific" | "engineering";
  /** Whether `digits` counts significant figures or decimal places. */
  readonly precision: "significant" | "decimals";
  readonly digits: number;
}

/** Per-region display options. */
export interface DisplaySpec {
  /** Display unit, e.g. MPa (UNT-03). */
  readonly unit?: Latex;
  /** Overrides the document number format (MTH-11). */
  readonly format?: NumberFormat;
  /** Show formula, substituted values, then result (MTH-10). */
  readonly showWork?: boolean;
}

/**
 * One math region as the editor sends it to the engine. The editor splits
 * `name := expr` into its parts, so the engine never parses left-hand sides.
 */
export type RegionInput =
  | {
      readonly kind: "definition";
      readonly id: BlockId;
      readonly name: string;
      readonly params?: readonly string[];
      readonly expr: Latex;
      readonly display?: DisplaySpec;
    }
  | {
      readonly kind: "evaluation";
      readonly id: BlockId;
      readonly expr: Latex;
      readonly display?: DisplaySpec;
    }
  | {
      readonly kind: "symbolic";
      readonly id: BlockId;
      readonly op: SymbolicOp;
      readonly expr: Latex;
      readonly wrt?: string;
    }
  | { readonly kind: "check"; readonly id: BlockId; readonly expr: Latex };

/** Document default unit system (UNT-04). */
export type UnitSystem = "SI" | "US";

/** Document-wide settings sent with every evaluation. */
export interface DocSettings {
  readonly unitSystem: UnitSystem;
  readonly format: NumberFormat;
}

/** A result ready for display. Draft; M1-T11 may add fields. */
export interface FormattedValue {
  readonly latex: Latex;
}

/** One show-work step (MTH-10). Draft until Q6 is settled (M3-T3). */
export interface WorkStep {
  readonly latex: Latex;
}

/**
 * What the engine returns per region. Never stored in the document (FIL-03).
 * A region that reads a failed definition is `blocked`, never stale (MTH-12).
 */
export type RegionResult =
  | {
      readonly id: BlockId;
      readonly status: "ok";
      readonly value: FormattedValue;
      readonly work?: readonly WorkStep[];
      readonly pass?: boolean;
    }
  | {
      readonly id: BlockId;
      readonly status: "error";
      readonly error: { readonly code: ErrorCode; readonly message: string };
    }
  | { readonly id: BlockId; readonly status: "blocked"; readonly blockedBy: BlockId };
