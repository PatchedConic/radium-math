# 0006. Build our own units layer: SI magnitude plus a rational dimension vector

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** D6; UNT-01 to UNT-10, G2, ACC-01

## Context

Dimensional soundness is a core goal (G2): every numeric result is unit-checked, and inconsistent units are errors, never silent. The app needs SI and US customary units with prefixes (UNT-05), offset temperatures (UNT-06), angles (UNT-07), exact conversion factors (UNT-08), and automatic conversion between compatible units (UNT-10). Delegating units to the CAS would tie this core function to one backend.

## Decision

Write the units layer in TypeScript, in `src/core/units`, working over the MathJSON tree.

- **Quantities:** each quantity is a coherent-SI magnitude (`number`) plus a dimension vector of 7 rational exponents (L, M, T, I, Θ, N, J). Rational exponents let `sqrt(m²)` work.
- **Unit registry:** each unit records its symbols, dimension, SI factor and optional offset, and whether SI prefixes apply. The SI factor is an exact `Rational` where the definition is exact. Derived units are defined from other units, so exactness carries through, and factors become doubles only at the last step.
- **Dimension checks:** the rules in architecture Section 6 run before any arithmetic.
- **Angles:** the radian is dimensionless, and the degree is a unit with factor π/180.
- **Offset temperatures:** absolute °C and °F are flagged and follow the absolute/difference rules in Section 6. Δ°C and Δ°F are ordinary units.
- **Default display:** each unit system has a table of preferred units keyed by dimension (UNT-04).

## Consequences

- Mixed compatible units combine with no special handling. For example, 2 m × 3.4 in = 0.17272 m² (UNT-10).
- The CAS only ever sees plain numbers, which keeps it swappable ([0005](0005-cortexjs-compute-backend.md)).
- We own a correctness-critical component. It needs property-based tests (MNT-04, e.g. A→B→A returns A) and hand-checked golden problems (ACC-02).
- Display rounding never touches stored values (ACC-01).
