# 0013. Symbolic regions substitute the values defined above them

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** A2; MTH-09, D7

## Context

A symbolic region (`expr →`) simplifies, expands, factors, differentiates, integrates or solves. When a name in it has a definition above, the question is whether it stays a free symbol. Three options were considered (A2):

- (a) Names stay free symbols.
- (b) Defined values are substituted, as in MathCAD.
- (c) A per-region toggle.

## Decision

Use (b). A symbolic region substitutes every name defined above it before calling `ComputeBackend.symbolic`. Names with no definition above stay free symbols.

## Consequences

- Behaviour is consistent with numeric regions and with top-to-bottom evaluation ([0007](0007-worker-evaluation.md)). What's defined above is what's used.
- To keep a symbol free, the author must not define it above the region.
- Substituted values carry units, which reopened A1. That is resolved by [0014](0014-symbolic-units.md).
