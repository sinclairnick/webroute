import { NextFunction, Request, Response } from "express";

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type ErrorMessage<TMessage extends string> = TMessage;

export type RootConfig<TContext, TMeta extends Record<PropertyKey, any>> = {
  $types: {
    ctx: TContext;
    meta: TMeta;
  };
};

export type AnyRootConfig = RootConfig<any, any>;

export const nextFnSymbol = Symbol("next");
export type NextFnSymbol = typeof nextFnSymbol;

const RES_KEY = "__isResponse";

export const ResponseUtil = {
  brand: (res: Response) => {
    (res as any)[RES_KEY] = true;
  },
  isResponse: (res: unknown): res is Response => {
    return typeof res === "object" && Boolean((res as any)[RES_KEY]);
  },
};

export interface NextFunctionWithReturn {
  (err?: any): Symbol;
  /**
   * "Break-out" of a router by calling {next('router')};
   * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.router}
   */
  (deferToNext: "router"): Symbol;
  /**
   * "Break-out" of a route by calling {next('route')};
   * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.application}
   */
  (deferToNext: "route"): Symbol;
}

export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

export type AnyRequestHandlerModified = RequestHandlerModified<
  any,
  any,
  any,
  any,
  any
>;
export type RequestHandlerModified<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj extends Record<string, any> = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: Response<ResBody, LocalsObj>,
  next: NextFunctionWithReturn
) =>
  | Response<ResBody, LocalsObj>
  | void
  | undefined
  | NextFnSymbol
  | ResBody
  | Promise<ResBody>;

export const NextUtil = {
  wrap: (next: NextFunction): NextFunctionWithReturn => {
    return (...args) => {
      next(...args);
      return nextFnSymbol;
    };
  },
};

export const isArray = (
  arg: ReadonlyArray<any> | any
): arg is ReadonlyArray<any> => Array.isArray(arg);
