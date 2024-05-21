import { AnyMiddlewareFn } from "./types";

export * from "./types";

/**
 * An (optional) helper for defining a middleware function.
 *
 * Ensures the correct type signature is used, without losing the function type.
 *
 * Alternatively, you can define your middleware using the `satisfies MiddlewareFn` TypeScript syntax.
 *
 */
export const defineMiddleware = <
  TOpts extends any[],
  TMiddleware extends AnyMiddlewareFn
>(
  fn: (...opt: TOpts) => TMiddleware
) => fn;

