export type StateResult =
  | number
  | string
  // This value param must be unknown otherwise arbitrary functions are accepted
  | Record<PropertyKey, unknown>
  | boolean
  | symbol
  | any[];

export type Awaitable<T> = T | Promise<T>;

export type ResponseHandler<TRest extends any[] = any[]> = (
  response: Response,
  ...rest: TRest
) => Response;

/**
 * Could be empty, a state update value (primitive, object or array value), or a response handler.
 *
 * - If a state update is returned, the consumer is responsible for mutating the request state to append this information.
 * - If a response handler is returnned, the consumer is responsible for calling this at the appropriate time during the request.
 */
export type MiddlewareResult<T> = Awaitable<
  Response | T | void | ResponseHandler
>;

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
  T extends StateResult = StateResult,
  TRest extends any[] = any[]
> = (request: Request, ...rest: TRest) => MiddlewareResult<T>;

/**
 * A middleware builder which takes 0..n config arguments.
 *
 * Returns a middleware function.
 *
 * @param {TOpts} Opts
 *
 * @returns {MiddlewareFn<T, TRest>}
 */
export type MiddlewareBuilder<
  T extends StateResult = StateResult,
  TOpts extends any[] = any[],
  TRest extends any[] = any[]
> = (...opts: TOpts) => MiddlewareFn<T, TRest>;
