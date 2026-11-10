/**
 * MathJSON allow-list validator (SEC-02, SEC-05).
 * Placeholder (M0); implemented in M1.
 */

declare const validExprBrand: unique symbol;

/**
 * A MathJSON tree that has passed validation. The brand means the only
 * way to get one is through this module.
 */
export type ValidExpr = { readonly [validExprBrand]: true };
