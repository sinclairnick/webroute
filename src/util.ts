import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export interface RootConfig<TContext, TMeta extends Record<PropertyKey, any>> {
  $types: {
    ctx: TContext;
    meta: TMeta;
  };
}

export interface AnyRootConfig extends RootConfig<any, any> {}

export const nextFnSymbol = Symbol("next");
export type NextFnSymbol = typeof nextFnSymbol;

const RES_KEY = "__isResponse";

export const ResponseUtil = {
  brand: (res: Response) => {
    if (res && typeof res === "object") {
      (res as any)[RES_KEY] = true;
    }
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

export interface AnyRequestHandlerModified
  extends RequestHandlerModified<any, any, any, any, any> {}
export interface RequestHandlerModified<
  P = Record<string, string>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj extends Record<string, any> = Record<string, any>,
  Headers = {},
  ReqMutations = {}
> {
  (
    req: MergeObjectsShallow<
      Omit<Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>, "headers"> & {
        headers: MergeObjectsShallow<IncomingHttpHeaders, Headers>;
      },
      ReqMutations
    >,
    res: Response<ResBody, LocalsObj>,
    next: NextFunctionWithReturn
  ):
    | Response<ResBody, LocalsObj>
    | void
    | undefined
    | NextFnSymbol
    | ResBody
    | Promise<ResBody>;
}

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

export type MakeUnknownOptional<T extends Record<any, any>> = Simplify<
  {
    [TKey in keyof T as unknown extends T[TKey] ? never : TKey]: T[TKey];
  } & {
    [TKey in keyof T as unknown extends T[TKey] ? TKey : never]?: T[TKey];
  }
>;

export type DefaultUnknownTo<T, D> = unknown extends T ? D : T;

/** B keys take precedence over A */
export type MergeObjectsShallow<A, B> = Simplify<
  {
    [K in keyof A]: K extends keyof B ? B[K] : A[K];
  } & B
>;
