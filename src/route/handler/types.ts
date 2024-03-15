import { RequestHandler, Response } from "express";
import { Parser } from "../parser/types";
import {
  AnyRequestHandlerModified,
  AnyRootConfig,
  RequestHandlerModified,
  UnsetMarker,
} from "../../util";
import { ParseFn } from "../parser";
import { oas31 } from "openapi3-ts";

export type RouteMeta = {
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
};

export interface HandlerParams<
  TConfig extends AnyRootConfig = AnyRootConfig,
  TPath extends string | UnsetMarker = UnsetMarker,
  TContext = unknown,
  TQueryIn = unknown,
  TQueryOut = unknown,
  TParamsIn = unknown,
  TParamsOut = unknown,
  TBodyIn = unknown,
  TBodyOut = unknown,
  TOutputIn = unknown,
  TOutputOut = unknown,
  TMeta = TConfig["$types"]["meta"]
> {
  /** @internal */
  _config: TConfig;
  /** @internal */
  _path: TPath;
  /** @internal */
  _ctx: TContext;
  /** @internal */
  _meta: TMeta;
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
}

export type AnyHandlerDefinition = HandlerDefinition<any>;

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
  methods?: string[];
  path?: string;
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
  meta?: TParams["_meta"];
  rawHandler?: AnyRequestHandlerModified;
}

export type ResponseOrLiteral<T> = Response<T> | T | void;

export type HandlerFunction<TParams extends HandlerParams> =
  RequestHandlerModified<
    TParams["_params_out"] extends UnsetMarker
      ? unknown
      : TParams["_params_out"],
    TParams["_output_in"] extends UnsetMarker ? unknown : TParams["_output_in"],
    TParams["_body_out"] extends UnsetMarker ? undefined : TParams["_body_out"],
    TParams["_query_out"] extends UnsetMarker
      ? undefined
      : TParams["_query_out"]
  >;

export type AnyCompiledRoute = CompiledRoute<any>;

export type CompiledRoute<TParams extends HandlerParams> = RequestHandler & {
  _def: HandlerDefinition<TParams>;
  __isCompiledRoute__: true;
};
