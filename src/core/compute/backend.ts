/**
 * The only way to reach a CAS (MNT-03). Implementations take validated
 * trees and plain SI numbers and know nothing about units.
 * Draft contract from architecture Section 4; refined in M1.
 */
import type { ErrorCode, SymbolicOp } from "../model";
import type { ValidExpr } from "../validate";

export interface ComputeError {
  readonly code: ErrorCode;
  readonly message: string;
}

export interface ComputeBackend {
  evaluate(expr: ValidExpr, env: ReadonlyMap<string, number>): number | ComputeError;
  symbolic(op: SymbolicOp, expr: ValidExpr, wrt?: string): ValidExpr | ComputeError;
}
