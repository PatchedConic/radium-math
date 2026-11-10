# 0012. Enter units in an explicit unit slot; units and variables never share names

- **Status:** Accepted (input trigger to be confirmed by a MathLive spike at the start of M1)
- **Date:** 2026-11-09
- **Source:** A3; UNT-01, UNT-05

## Context

Many unit symbols are also natural variable names. Is `m` a metre or a mass? Is `s` seconds or a distance? Two approaches were considered (A3):

- (a) Unit names are predefined identifiers that user definitions can shadow, as in MathCAD.
- (b) Units are entered explicitly, shown upright, and stored as a distinct node.

Option (a) is ambiguous for both the reader and the engine, and a later definition can silently change what a unit means.

## Decision

Use (b). Units never share a namespace with variables.

- **Opening the slot:** a space typed right after a number or a closing parenthesis opens a unit slot. An "Insert unit" toolbar button does the same.
- **Inside the slot:** it accepts only unit names and the operators ·, / and ^, with autocomplete from the unit registry. Enter or Tab closes it.
- **Display:** units render upright and variables render italic.
- **Storage:** a quantity is stored in MathJSON as `["Quantity", value, unitExpr]`. The validator accepts it only with a registry unit expression, and flags an unknown name with a suggestion.
- **Paste:** pasted text such as `3.4 in` becomes a quantity when the unit is recognized.

## Consequences

- No ambiguity between units and variables, and a user definition can never shadow a unit.
- Entry is slightly more deliberate than typing bare unit names.
- It depends on MathLive supporting the space trigger cleanly. If it doesn't, the fallback is a dedicated key such as `'`. A spike at the start of M1 confirms this.
