import { MergeObjectsShallow, Simplify } from "@webroute/common";
import { DataResult, MiddlewareFn } from "@webroute/middleware";
import { Def } from "./util";
import { ParseFn, Parser } from "@webroute/schema";

export type Awaitable<T> = Promise<T> | T;

export interface RouteMeta {}

export interface RouteParams<
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
  TMeta extends RouteMeta = RouteMeta,
  TMethods = HttpMethodInput,
  TInferredParams = unknown,
  TState = unknown,
  TProviders = unknown
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
  /** @internal */
  Providers: TProviders;
}

export interface AnyHandlerDefinition extends RouteDefInner<any> {}

export type HttpVerb =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";

export type HttpMethodInput = HttpVerb | Uppercase<HttpVerb> | (string & {});

export type ValidatorDef = {
  parser: ParseFn<unknown>;
  schema: Parser;
};

export interface RouteDefInner<TParams extends RouteParams> {
  methods?: TParams["Methods"][];
  path?: TParams["Path"];
  query?: ValidatorDef;
  params?: ValidatorDef;
  body?: ValidatorDef;
  output?: ValidatorDef;
  headersReq?: ValidatorDef;
  middleware?: MiddlewareInFn[];
  meta?: TParams["Meta"];
  providers?: TParams["Providers"];
}

export type ResponseOrLiteral<T> = Awaitable<Response> | Awaitable<T>;

export interface HandlerFunction<TParams extends RouteParams>
  extends DecoratedRequestHandler<
    TParams["InferredParams"] extends never
      ? TParams["ParamsOut"]
      : MergeObjectsShallow<TParams["InferredParams"], TParams["ParamsOut"]>,
    TParams["QueryOut"],
    TParams["BodyOut"],
    TParams["HeadersReqOut"],
    TParams["OutputIn"],
    TParams["State"],
    TParams["Providers"]
  > {}

export interface AnyCompiledRoute extends CompiledRoute<any> {}

export interface CompiledRoute<TParams extends RouteParams>
  extends WebRequestHandler {
  [Def]: RouteDefInner<TParams>;
}

export interface WebRequestHandler {
  (request: Request): Promise<Response>;
}

export type InferParamsFromPath<T> = T extends `${string}:${infer P}/${infer R}`
  ? Simplify<{ [K in P]: string } & InferParamsFromPath<R>>
  : T extends `${string}:${infer P}`
  ? { [K in P]: string }
  : never;

export interface LazyValidator<T> {
  (): Promise<T>;
}

export type InputTypeKey = "params" | "query" | "body" | "headers";

export interface ParseInputsFn<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown
> {
  /** Parses the selected input part */
  <T extends InputTypeKey>(key: T): Promise<
    {
      params: TParams;
      query: TQuery;
      body: TBody;
      headers: THeaders;
    }[T]
  >;

  /** Parses all inputs and returns as an object */
  (): Promise<{
    params: TParams;
    query: TQuery;
    body: TBody;
    headers: THeaders;
  }>;
}

export type InferParseInputsFn<T extends ParseInputsFn> =
  T extends ParseInputsFn<
    infer TParams,
    infer TQuery,
    infer TBody,
    infer THeaders
  >
    ? {
        Params: TParams;
        Query: TQuery;
        Body: TBody;
        Headers: THeaders;
      }
    : never;

export type ServiceMap<TProviders> = TProviders extends AnyProviderMap
  ? TProviders
  : Record<string, unknown>;

export type RequestCtx<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TState = unknown,
  TProviders = unknown
> = Simplify<{
  parse: ParseInputsFn<
    unknown extends TParams ? Record<string, string | undefined> : TParams,
    unknown extends TQuery ? Record<string, string | undefined> : TQuery,
    unknown extends TBody ? unknown : TBody,
    unknown extends THeaders ? Record<string, string | undefined> : THeaders
  >;
  services: ServiceMap<TProviders>;
  state: Simplify<TState>;
}>;

export interface DecoratedRequestHandler<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TOutput = unknown,
  TState = unknown,
  TProviders = unknown
> {
  (
    request: Request,
    ctx: RequestCtx<TParams, TQuery, TBody, THeaders, TState, TProviders>
  ): Awaitable<Response | TOutput>;
}

// -- Middleware --

export type MiddlewareResult<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TState = unknown,
  TProviders = unknown,
  TResult = unknown
> =
  | Response
  | ((
      response: Response,
      ctx: RequestCtx<TParams, TQuery, TBody, THeaders, TState, TProviders>
    ) => Response)
  | TResult;

export interface UseMiddlewareInput<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TState = unknown,
  TProviders = unknown,
  TResult extends DataResult | void = void
> extends MiddlewareFn<
    TResult,
    [ctx: RequestCtx<TParams, TQuery, TBody, THeaders, TState, TProviders>]
  > {}

export interface MiddlewareInFn {
  (request: Request, ctx: RequestCtx): Awaitable<any>;
}

export interface MiddlewareOutFn {
  (response: Response, ctx: RequestCtx): Awaitable<Response>;
}

export interface ProviderInitializer<TArgs extends any[], TRet> {
  (...args: TArgs): TRet;
}

export interface AnyProviderMap {
  [name: string]: ProviderInitializer<any, any>;
}
