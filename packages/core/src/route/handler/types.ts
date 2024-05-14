import { Parser } from "../parser/types";
import {
  AnyRootConfig,
  MergeObjectsShallow,
  RemoveNeverKeys,
  Simplify,
} from "../../util";
import { ParseFn } from "../parser";

export interface RouteMeta {}

export interface HandlerParams<
  TConfig extends AnyRootConfig = AnyRootConfig,
  TPath = unknown,
  TContext = unknown,
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
  TMeta = TConfig["$types"]["meta"],
  TMethods = HttpMethod,
  TInferredParams = unknown,
  TState = {}
> {
  /** @internal */
  _config: TConfig;
  /** @internal */
  _path: TPath;
  /** @internal */
  _inferredParams: TInferredParams;
  /** @internal */
  _ctx: TContext;
  /** @internal */
  _meta: TMeta;
  /** @internal */
  _methods: TMethods;
  /** @internal */
  _query_in: TQueryIn;
  /** @internal */
  _query_out: TQueryOut;
  /** @internal */
  _params_in: TParamsIn;
  /** @internal */
  _params_out: TParamsOut;
  /** @internal */
  _body_in: TBodyIn;
  /** @internal */
  _body_out: TBodyOut;
  /** @internal */
  _output_in: TOutputIn;
  /** @internal */
  _output_out: TOutputOut;
  /** @internal */
  _headers_req_in: TReqHeadersIn;
  /** @internal */
  _headers_req_out: TReqHeadersOut;
  /** @internal */
  _state: TState;
}

export interface AnyHandlerDefinition extends HandlerDefinition<any> {}

export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head"
  | (string & {});

export interface HandlerDefinition<TParams extends HandlerParams> {
  methods?: TParams["_methods"][];
  path?: TParams["_path"];
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
  meta?: TParams["_meta"];
}

export type ResponseOrLiteral<T> =
  | Promise<Response>
  | Response
  | T
  | Promise<T>;

export interface HandlerFunction<TParams extends HandlerParams>
  extends DecoratedRequestHandler<
    // Params
    TParams["_inferredParams"] extends never
      ? TParams["_params_out"]
      : MergeObjectsShallow<TParams["_inferredParams"], TParams["_params_out"]>,
    // Query
    TParams["_query_out"],
    // Body
    TParams["_body_out"],
    // Headers
    TParams["_headers_req_out"],
    // Output
    TParams["_output_in"],
    // Mods
    TParams["_state"]
  > {}

export interface HandlerFunction<TParams extends HandlerParams>
  extends DecoratedRequestHandler<
    // Params
    TParams["_inferredParams"] extends never
      ? TParams["_params_out"]
      : MergeObjectsShallow<TParams["_inferredParams"], TParams["_params_out"]>,
    // Query
    TParams["_query_out"],
    // Body
    TParams["_body_out"],
    // Headers
    TParams["_headers_req_out"],
    // Output
    TParams["_output_in"],
    // Mods
    TParams["_state"]
  > {}

export interface MiddlewareFunction<
  TParams extends HandlerParams,
  TMutations extends Record<PropertyKey, any> = {}
> extends DecoratedRequestHandler<
    // Params
    TParams["_inferredParams"] extends never
      ? TParams["_params_out"]
      : MergeObjectsShallow<TParams["_inferredParams"], TParams["_params_out"]>,
    // Query
    TParams["_query_out"],
    // Body
    TParams["_body_out"],
    // Headers
    TParams["_headers_req_out"],
    // Output
    TMutations,
    // Mods
    TParams["_state"]
  > {}

export interface AnyCompiledRoute extends CompiledRoute<any> {}

export type CompiledRoute<TParams extends HandlerParams> = WebRequestHandler & {
  _def: HandlerDefinition<TParams>;
  __isCompiledRoute__: true;
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
  ctx: { req: Request } & RemoveNeverKeys<{
    params: unknown extends TParams ? never : LazyValidator<TParams>;
    query: unknown extends TQuery ? never : LazyValidator<TQuery>;
    body: unknown extends TBody ? never : LazyValidator<TBody>;
    headers: unknown extends THeaders ? never : LazyValidator<THeaders>;
    state: TState;
  }>
) => ResponseOrLiteral<TOutput>;
