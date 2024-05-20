import { MiddlewareBuilder } from "./types";

export * from "./types";

/**
 * An (optional) helper for defining a middleware function.
 * 
 * Ensures the correct type signature is used, without losing the function type.
 * 
 * Alternatively, you can define your middleware using the `satisfies MiddlewareFn` TypeScript syntax.
 * 
 * @param {T} fn 
 * @returns {T} fn
 */
export const defineMiddleware = <T extends MiddlewareBuilder>(fn: T): T => fn;
