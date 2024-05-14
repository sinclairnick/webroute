import { Parser } from "../parser/types";
import { MergeObjectsShallow, RemoveNeverKeys, Simplify } from "../../util";
import { ParseFn } from "../parser";

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
  TState = {}
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
  middleware?: DecoratedRequestHandler[];
  meta?: TParams["Meta"];
}

export type ResponseOrLiteral<T> =
  | Promise<Response>
  | Response
  | T
  | Promise<T>;

export interface HandlerFunction<TParams extends HandlerParams>
  extends DecoratedRequestHandler<
    // Params
    TParams["InferredParams"] extends never
      ? TParams["ParamsOut"]
      : MergeObjectsShallow<TParams["InferredParams"], TParams["ParamsOut"]>,
    // Query
    TParams["QueryOut"],
    // Body
    TParams["BodyOut"],
    // Headers
    TParams["HeadersReqOut"],
    // Output
    TParams["OutputIn"],
    // Mods
    TParams["State"]
  > {}

export interface HandlerFunction<TParams extends HandlerParams>
  extends DecoratedRequestHandler<
    // Params
    TParams["InferredParams"] extends never
      ? TParams["ParamsOut"]
      : MergeObjectsShallow<TParams["InferredParams"], TParams["ParamsOut"]>,
    // Query
    TParams["QueryOut"],
    // Body
    TParams["BodyOut"],
    // Headers
    TParams["HeadersReqOut"],
    // Output
    TParams["OutputIn"],
    // Mods
    TParams["State"]
  > {}

export interface MiddlewareFunction<
  TParams extends HandlerParams,
  TMutations extends Record<PropertyKey, any> = {}
> extends DecoratedRequestHandler<
    // Params
    TParams["InferredParams"] extends never
      ? TParams["ParamsOut"]
      : MergeObjectsShallow<TParams["InferredParams"], TParams["ParamsOut"]>,
    // Query
    TParams["QueryOut"],
    // Body
    TParams["BodyOut"],
    // Headers
    TParams["HeadersReqOut"],
    // Output
    TMutations,
    // Mods
    TParams["State"]
  > {}

export interface AnyCompiledRoute extends CompiledRoute<any> {}

export type CompiledRoute<TParams extends HandlerParams> = WebRequestHandler & {
  "~def": HandlerDefinition<TParams>;
};

export type WebRequestHandler = (
  request: Request
) => Response | Promise<Response>;

export type InferParamsFromPath<T> = T extends `${string}:${infer P}/${infer R}`
  ? Simplify<{ [K in P]: string } & InferParamsFromPath<R>>
  : T extends `${string}:${infer P}`
  ? { [K in P]: string }
  : never;

export interface LazyValidator<T> {
  (): Promise<T>;
}

export type DecoratedRequestHandler<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown,
  THeaders = unknown,
  TOutput = unknown,
  TState = {}
> = (
  request: Request,
  ctx: RemoveNeverKeys<{
    params: unknown extends TParams ? never : LazyValidator<TParams>;
    query: unknown extends TQuery ? never : LazyValidator<TQuery>;
    body: unknown extends TBody ? never : LazyValidator<TBody>;
    headers: unknown extends THeaders ? never : LazyValidator<THeaders>;
    state: TState;
  }>
) => ResponseOrLiteral<TOutput>;
