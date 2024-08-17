import type { Awaitable } from "@webroute/common";

/**
 * Data or state produced in the middleware.
 *
 * Used to enable the consumer to attach any necessary data to state, or
 * otherwise use the resulting information.
 */
export type DataResult =
  // This value param must be unknown otherwise arbitrary functions are accepted
  Record<PropertyKey, unknown>;

export type ResponseHandler<TRest extends any[] = []> = (
  response: Response,
  ...rest: TRest
) => Awaitable<Response | undefined | void>;

/**
 * Could be empty, a state update value (primitive, object or array value), or a response handler.
 *
 * - If a state update is returned, the consumer is responsible for mutating the request state to append this information.
 * - If a response handler is returnned, the consumer is responsible for calling this at the appropriate time during the request.
 */
export type MiddlewareResult<
  T extends DataResult | void = void,
  TRest extends any[] = any[]
> = Response | T | ResponseHandler<TRest> | undefined;

/**
 *
 * A framework agnostic middleware function.
 *
 * Returns a middleware result, which is either void, a state update or a response handler.
 *
 * @param {Request} request
 * The web request object.
 *
 * @param {TRest} rest...
 * Optional array of additional parameters
 *
 * @returns {MiddlewareResult<T>}
 */
export type MiddlewareFn<
  T extends DataResult | void = void,
  TRest extends any[] = any[],
  TRestRes extends any[] = any[]
> = (
  request: Request,
  ...rest: TRest
) => Awaitable<MiddlewareResult<T, TRestRes>>;

export type InferMiddlewareFnResult<T extends MiddlewareFn> = Awaited<
  ReturnType<T>
>;

export type AnyMiddlewareFn = MiddlewareFn<
  DataResult | void | undefined,
  any[]
>;
