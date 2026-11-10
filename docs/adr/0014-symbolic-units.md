# 0014. Carry units through symbolic math as SI base-unit symbols

- **Status:** Accepted (CAS behaviour to be tested at the start of symbolic work in M3)
- **Date:** 2026-11-09
- **Source:** A1; A2, D6, MTH-09

## Context

Substituting defined values into symbolic regions ([0013](0013-symbolic-substitution.md)) means those values carry units. The CAS knows nothing about units ([0005](0005-cortexjs-compute-backend.md)). Two options were considered (A1):

- (a) Symbolic operations work on unit-free expressions, with dimensions still checked.
- (b) Unit symbols are carried through the symbolic output.

## Decision

Use (b). Each defined value enters the symbolic expression as its SI number times SI base-unit symbols. For example, 12 kN enters as 12000 · kg·m·s⁻².

- Base-unit symbols in the result render upright, as units.
- A fully numeric result goes through normal display conversion (UNT-03, UNT-04).
- Symbolic regions still run the shared validate, resolve and dimension-check steps first.

## Consequences

- Symbolic results stay dimensionally meaningful and readable.
- Results show SI base units, not the author's chosen units, unless the result is fully numeric and can be converted.
- It depends on the CAS treating base-unit symbols as ordinary symbols without mangling them. This is tested at the start of symbolic work in M3, and a failure reopens this decision.
