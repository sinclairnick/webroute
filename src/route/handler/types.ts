import express, { RequestHandler, Response } from "express";
import { Parser } from "../parser/types";
import {
  AnyRequestHandlerModified,
  AnyRootConfig,
  DefaultUnknownTo,
  MergeObjectsShallow,
  RequestHandlerModified,
  Simplify,
} from "../../util";
import { ParseFn } from "../parser";
import { oas31 } from "openapi3-ts";

export interface RouteMeta {
  /**
   * Route name used to identify the route.
   * May be used for improved OpenAPI operation naming.
   */
  name?: string;
  /**
   * Customise this routes OpenAPI config.
   * If an object is provided, it will be _shallow_ merged with the existing object.
   * If a function is provided, the return value will be used as the config.
   */
  openApi?:
    | oas31.OperationObject
    | ((operation: oas31.OperationObject) => oas31.OperationObject);
}

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
  TInferredParams = unknown
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
  meta?: TParams["_meta"];
  rawHandler?: AnyRequestHandlerModified;
}

export type ResponseOrLiteral<T> = Response<T> | T | void;

export interface HandlerFunction<TParams extends HandlerParams>
  extends RequestHandlerModified<
    TParams["_inferredParams"] extends never
      ? DefaultUnknownTo<TParams["_params_out"], express.Request["params"]>
      : DefaultUnknownTo<
          MergeObjectsShallow<
            TParams["_inferredParams"],
            TParams["_params_out"]
          >,
          express.Request["params"]
        >,
    DefaultUnknownTo<TParams["_output_in"], any>,
    DefaultUnknownTo<TParams["_body_out"], express.Request["body"]>,
    DefaultUnknownTo<TParams["_query_out"], express.Request["query"]>,
    Record<string, any>,
    TParams["_headers_req_out"]
  > {}

export interface AnyCompiledRoute extends CompiledRoute<any> {}

export type CompiledRoute<TParams extends HandlerParams> = RequestHandler & {
  _def: HandlerDefinition<TParams>;
  __isCompiledRoute__: true;
};

export type InferParamsFromPath<T extends string> =
  T extends `${string}:${infer P}/${infer R}`
    ? Simplify<{ [K in P]: string } & InferParamsFromPath<R>>
    : T extends `${string}:${infer P}`
    ? { [K in P]: string }
    : never;
