import { Awaitable } from "@webroute/common";
import { DataResult, MiddlewareResult, ResponseHandler } from "./types";

export type AnyMiddlewareResult = MiddlewareResult<DataResult, any[]>;

export type AnyFrameworkMiddlewareFn = (...args: any[]) => Awaitable<any>;

/**
 * A set of _mutually exclusive_ handlers called depending on the middleware return type.
 *
 * **Only one** of the functions will be called for each request.
 */
export type ToFrameworkHandlers<
  T extends AnyFrameworkMiddlewareFn = AnyFrameworkMiddlewareFn,
  TResult extends AnyMiddlewareResult = AnyMiddlewareResult
> = (...args: Parameters<T>) => {
  /**
   * Called when nothing was returned.
   *
   * @example
   *
   * ```ts
   * // Continuing app execution.
   * `next()`
   * ```
   */
  onEmpty: () => Awaitable<ReturnType<T>>;

  /**
   * Called when data is returned from the middleware.
   *
   * @example
   *
   * ```ts
   * req.field = data.field
   * next() // Next should be called, if necessary
   * ```
   */
  onData: (data: Extract<TResult, DataResult>) => Awaitable<ReturnType<T>>;

  /**
   * Called when a response is returned from the middleware.
   *
   * @example
   *
   * ```ts
   * // Pass to next app function...
   * next(response)
   *
   * // ...or return it
   * return response
   *
   * // ...or send response
   * res.json(await response.json())
   * ```
   */
  onResponse: (response: Response) => Awaitable<ReturnType<T>>;

  /**
   * Called when a response handler is returned from the middleware.
   *
   * @example
   *
   * ```ts
   * // Get the response...
   * const response = await next()
   *
   * // ...then pass to handler
   * return handler(response)
   * ```
   */
  onResponseHandler: (
    handler: ResponseHandler
  ) => Awaitable<ReturnType<T>>;

  /**
   * Called when the middleware throws an error.
   *
   * @example
   *
   * ```ts
   * // Throw the error
   * throw error;
   * ```
   */
  onError?: (error: unknown) => Awaitable<ReturnType<T>>;
};

export type ToFrameworkMiddlewareFn<
  T extends AnyFrameworkMiddlewareFn = AnyFrameworkMiddlewareFn,
  TResult extends AnyMiddlewareResult = AnyMiddlewareResult
> = (...args: Parameters<T>) => Awaitable<TResult>;

export type AdaptedMiddleware<
  T extends AnyFrameworkMiddlewareFn = AnyFrameworkMiddlewareFn
> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;

/**
 * An optional utility for converting middleware to a format another framework
 * understands.
 *
 * The middleware can be manually invoked within the framework, alternatively.
 */
export const toFramework = <
  T extends AnyFrameworkMiddlewareFn = AnyFrameworkMiddlewareFn,
  TResult extends AnyMiddlewareResult = AnyMiddlewareResult
>(
  middlware: ToFrameworkMiddlewareFn<T, TResult>,
  handlers: ToFrameworkHandlers<T, TResult>
): AdaptedMiddleware<T> => {
  const adapter = async (...args: Parameters<T>) => {
    const {
      onData,
      onEmpty,
      onResponse,
      onResponseHandler,
      onError = (e) => {
        throw e;
      },
    } = handlers(...args);

    try {
      const result = await middlware(...args);

      // onEmpty
      if (result == null) {
        return await onEmpty();
      }

      // onRespose
      if (result instanceof Response) {
        return await onResponse(result);
      }

      switch (typeof result) {
        // onData
        case "object": {
          return await onData(result as any);
        }

        // onResponseHandler
        case "function": {
          return await onResponseHandler(result);
        }
      }
    } catch (e) {
      return await onError(e);
    }
  };

  return adapter as AdaptedMiddleware<T>;
};

export const createAdapter = <
  T extends AnyFrameworkMiddlewareFn = AnyFrameworkMiddlewareFn,
  TResult extends AnyMiddlewareResult = AnyMiddlewareResult
>(
  handlers: ToFrameworkHandlers<T, TResult>
) => {
  return (middlware: ToFrameworkMiddlewareFn<T, TResult>) => {
    return toFramework(middlware, handlers);
  };
};
