# 0016. Open the unit slot with Space after a number, and mark it with `\htmlData{unit}`

- **Status:** Accepted
- **Date:** 2026-11-09
- **Source:** A3, M1-T1; UNT-01, SEC-07, SEC-08

## Context

[0012](0012-unit-slot.md) chose an explicit unit slot and proposed opening it with a space typed right after a number or a closing parenthesis, falling back to a dedicated key such as `'` if MathLive could not support the space cleanly. M1-T1 was a spike to settle that, and to check MathLive under `freezePrototype: true`.

The spike used MathLive 0.111.4 in the Tauri dev window (WebKitGTK on Fedora, with Tauri's `freezePrototype` and dev CSP active). A scripted run covered 22 keystroke cases, and the user confirmed the main cases by typing on a real keyboard. The spike code was not kept.

Findings:

- **Space is free.** In math mode MathLive inserts nothing for Space (`mathModeSpace` defaults to `""`), so taking it over breaks no existing behaviour. A `keydown` listener with `capture: true` on the `<math-field>` element runs before MathLive's own handler, which listens inside the field's shadow root, so the trigger can intercept the key and cancel it.
- **The caret context is readable.** `mf.getValue(0, mf.position, "latex")` gives the LaTeX before the caret. The trigger opens the slot when that LaTeX ends in a digit, `)` or `\right)`, so a space after a letter does nothing, as before.
- **The slot is an editable group.** `mf.insert("\\htmlData{unit}{\\placeholder{}}")` inserts a group the caret can enter. `mf.getElementInfo(mf.position).data` contains `unit` while the caret is inside it. If the atom just before the caret is the slot itself, the caret is after the slot, not in it.
- **Units render upright.** An `onInsertStyle` hook returns `{ variant: "normal", variantStyle: "up" }` inside the slot. Typed letters serialize as `\mathrm{…}`, and `/` and `^` build fractions and powers as usual: `9.81 m/s^2` gives `9.81\htmlData{unit}{\frac{\mathrm{m}}{\mathrm{s}^2}}`. Note that the hook's `sender` is MathLive's internal `Mathfield`, not the element, so the hook must close over the element.
- **Leaving the slot:** intercepting Enter and Tab inside the slot and calling `moveAfterParent` until the caret is out of the slot leaves it cleanly, even from inside an exponent. Text typed next (`+x`) lands outside the slot.
- **Filtering:** cancelling a `keydown` blocks a key inside the slot, so `+` and `=` were refused there.
- **No shortcut clash:** `3.4 in` stays the unit "in" and does not become `\in`, whether inline shortcuts are on or off inside the slot.
- **Round trip and undo:** setting the field's value to `2\htmlData{unit}{\mathrm{kN}\cdot\mathrm{m}^{2}}` reads back unchanged. Undo steps back through the slot.
- **The fallback key also works.** `'` after a number opened the same slot, and `x'` still gave a prime. The fallback is not needed.
- **freezePrototype:** MathLive loaded and edited with `Object.prototype` frozen and raised no errors. Its code contains no `eval`, `new Function` or dynamic `import()`, and it only reads `Object.prototype`.
- **CSP and network:** there were no CSP violations under the dev CSP. MathLive styles its shadow DOM through `adoptedStyleSheets` (5 sheets) and added no `<style>` elements in this run. Fonts loaded through `FontFace` from `MathfieldElement.fontsDirectory`, set to a same-origin path. Sounds are off with `soundsDirectory = null` and the sound properties set to `null`. Every request went to the app's own origin.

## Decision

- Space typed right after a number, `)` or `\right)` opens the unit slot. The `'` fallback is not used.
- The slot is `\htmlData{unit}{…}` in the field's LaTeX. Units inside it render upright through an `onInsertStyle` hook.
- Inside the slot, Enter and Tab leave it, and any key that is not a unit letter, a digit, `*`, `/`, `^` or `-` is blocked.
- MathLive is configured with sounds off, its virtual keyboard on demand only, and fonts served from the app's own origin.
- The stored and exchanged form of the slot follows [0017](0017-latex-storage.md).

## Consequences

- Entry matches [0012](0012-unit-slot.md) as written, and no extra key needs to be learned.
- The node view (M2) has to implement the following, all found in the spike:
  - In the slot, `*` stays a literal `*` (`\mathrm{in*}`) rather than becoming `\cdot`, so the slot must turn `*` into `·` itself.
  - Digits should be allowed only in exponents, not after a unit name (`in*3`).
  - Deleting all of a unit leaves an empty slot (`2\htmlData{unit}{}`); the node view should remove it.
  - Unit autocomplete inside the slot is still to be built.
- The release build copies MathLive's `fonts/` folder into the bundle and points `fontsDirectory` at it, so no font request leaves the app (SEC-07).
- The production CSP is still checked in M2, as [0004](0004-mathlive-mathjson.md) planned. The spike found no need for `style-src 'unsafe-inline'` under the dev CSP.
- MathLive uses `innerHTML` internally. Before M2 ships, check that no document text can reach it unescaped.
- Revisit if a MathLive upgrade changes `getElementInfo`, `onInsertStyle` or `\htmlData` behaviour. The node view's tests should cover the cases above.
