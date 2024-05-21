import { Parser } from "../parser/types";
import { MergeObjectsShallow, RemoveNeverKeys, Simplify } from "../../util";
import { ParseFn } from "../parser";
import { DataResult, MiddlewareFn } from "@webroute/middleware";

export type Awaitable<T> = Promise<T> | T;

export interface RouteMeta {}

export interface HandlerParams<
  TPath = unknown,
  TQueryIn = unknown,
  TQueryOut = unknown,
  TParamsIn = unknown,
  TParamsOut = unknown,
  TBodyIn = unknown,
  TBodyOut = unknown,
  TOutputIn = unknown,
  TOutputOut = unknown,
  TReqHeadersIn = unknown,
  TReqHeadersOut = unknown,
  TMeta = unknown,
  TMethods = HttpMethodInput,
  TInferredParams = unknown,
  TState = unknown
> {
  /** @internal */
  Path: TPath;
  /** @internal */
  InferredParams: TInferredParams;
  /** @internal */
  Meta: TMeta;
  /** @internal */
  Methods: TMethods;
  /** @internal */
  QueryIn: TQueryIn;
  /** @internal */
  QueryOut: TQueryOut;
  /** @internal */
  ParamsIn: TParamsIn;
  /** @internal */
  ParamsOut: TParamsOut;
  /** @internal */
  BodyIn: TBodyIn;
  /** @internal */
  BodyOut: TBodyOut;
  /** @internal */
  OutputIn: TOutputIn;
  /** @internal */
  OutputOut: TOutputOut;
  /** @internal */
  HeadersReqIn: TReqHeadersIn;
  /** @internal */
  HeadersReqOut: TReqHeadersOut;
  /** @internal */
  State: TState;
}

export interface AnyHandlerDefinition extends HandlerDefinition<any> {}

export type HttpVerb =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";

export type HttpMethodInput = HttpVerb | Uppercase<HttpVerb> | (string & {});

export interface HandlerDefinition<TParams extends HandlerParams> {
  methods?: TParams["Methods"][];
  path?: TParams["Path"];
  query?: {
    parser: ParseFn<unknown>;
    schema: Parser;
  };
  params?: {
    parser: ParseFn<unknown>;
    schema: Parser;
  };
  body?: {
    parser: ParseFn<unknown>;
    schema: Parser;
  };
  output?: {
    parser: ParseFn<unknown>;
    schema: Parser;
  };
  headersReq?: {
    parser: ParseFn<unknown>;
    schema: Parser;
  };
  middleware?: MiddlewareInFn[];
  meta?: TParams["Meta"];
}

export type ResponseOrLiteral<T> =
  | Promise<Response>
  | Response
  | T
  | Promise<T>;

export interface HandlerFunction<TParams extends HandlerParams>
  extends DecoratedRequestHandler<
    TParams["InferredParams"] extends never
      ? TParams["ParamsOut"]
      : MergeObjectsShallow<TParams["InferredParams"], TParams["ParamsOut"]>,
    TParams["QueryOut"],
    TParams["BodyOut"],
    TParams["HeadersReqOut"],
    TParams["OutputIn"],
    TParams["State"]
  > {}

export interface AnyCompiledRoute extends CompiledRoute<any> {}

export interface CompiledRoute<TParams extends HandlerParams>
  extends WebRequestHandler {
  "~def": HandlerDefinition<TParams>;
}

export interface WebRequestHandler {
  (request: Request): Awaitable<Response>;
}

export type InferParamsFromPath<T> = T extends `${string}:${infer P}/${infer R}`
  ? Simplify<{ [K in P]: string } & InferParamsFromPath<R>>
  : T extends `${string}:${infer P}`
  ? { [K in P]: string }
  : never;

export interface LazyValidator<T> {
  (): Promise<T>;
}

export type RequestCtx<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TState = unknown
> = Simplify<
  RemoveNeverKeys<{
    params: unknown extends TParams ? never : LazyValidator<TParams>;
    query: unknown extends TQuery ? never : LazyValidator<TQuery>;
    body: unknown extends TBody ? never : LazyValidator<TBody>;
    headers: unknown extends THeaders ? never : LazyValidator<THeaders>;
    state: Simplify<TState>;
  }>
>;

export interface DecoratedRequestHandler<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TOutput = unknown,
  TState = unknown
> {
  (
    request: Request,
    ctx: RequestCtx<TParams, TQuery, TBody, THeaders, TState>
  ): Awaitable<Response | TOutput>;
}

// -- Middleware --

export type MiddlewareResult<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TState = unknown,
  TResult = unknown
> =
  | Response
  | ((
      response: Response,
      ctx: RequestCtx<TParams, TQuery, TBody, THeaders, TState>
    ) => Response)
  | TResult;

export interface UseMiddlewareInput<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TState = unknown,
  TResult extends DataResult | void = void
> extends MiddlewareFn<
    TResult,
    [ctx: RequestCtx<TParams, TQuery, TBody, THeaders, TState>]
  > {}

export interface MiddlewareInFn {
  (request: Request, ctx: RequestCtx): Awaitable<any>;
}

export interface MiddlewareOutFn {
  (response: Response, ctx: RequestCtx): Awaitable<Response>;
}
