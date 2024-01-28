import { Log } from "./internal/logger";
import {
  NextFunctionWithReturn,
  NextUtil,
  ResponseUtil,
  nextFnSymbol,
} from "./util";
import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

/**
 * A lower-level, generic handler with no special returning behaviour.
 * Hence, res.end()/send() etc. must be manually called.
 *
 * Async errors are still caught.
 */
export const middlewareHandler = <TParams, TQuery, TReqBody, TResBody>(
  handler: (
    req: Request<TParams, TResBody, TReqBody, TQuery>,
    res: Response<TResBody>,
    next: NextFunction
  ) => any
): RequestHandler<TParams, TResBody, TReqBody, TQuery> => {
  return async (req, res, next) => {
    if (res.headersSent) {
      return next();
    }

    try {
      await handler(req, res, NextUtil.wrap(next));
    } catch (e) {
      return next(e);
    }
  };
};

/**
 * An express handler that must either return or `next()` explicitly
 */
export const routeHandler = <TParams, TQuery, TReqBody, TResBody>(
  handler: (
    req: Request<TParams, TResBody, TReqBody, TQuery>,
    res: Response<TResBody>,
    next: NextFunctionWithReturn
  ) => any
): RequestHandler<TParams, TResBody, TReqBody, TQuery> => {
  return async (req, res, next) => {
    if (res.headersSent) {
      return next();
    }

    ResponseUtil.brand(res);

    try {
      const result = await handler(req, res, NextUtil.wrap(next));

      if (result === nextFnSymbol) {
        Log("NextFn. Returning");
        return;
      }

      if (ResponseUtil.isResponse(result)) {
        Log("Is response. Next()");
        return next();
      }

      Log("JSON(result)");
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  };
};

export const errorHandler = <TParams, TQuery, TReqBody, TResBody>(
  handler: (
    err: unknown,
    req: Request<TParams, TResBody, TReqBody, TQuery>,
    res: Response<TResBody>,
    next: NextFunctionWithReturn
  ) => any
): ErrorRequestHandler<TParams, TResBody, TReqBody, TQuery> => {
  return async (err, req, res, next) => {
    if (err == null) return next();

    ResponseUtil.brand(res);

    // // Default status to 500
    res.status(500);

    try {
      const result = await handler(err, req, res, NextUtil.wrap(next));

      if (res.headersSent) {
        Log("Headers already sent. Exiting req handling.");
        return;
      }

      if (result === nextFnSymbol) {
        Log("Next fn called");
        return;
      }

      if (ResponseUtil.isResponse(result)) {
        Log("Is response. Ending");
        return res.end();
      }

      return res.json(result).end();
    } catch (e) {
      Log("Error handling error", e);
      return res.status(500).end();
    }
  };
};
