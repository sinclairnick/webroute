import { DataResult } from "@webroute/middleware";
import type { Parser, InferIn, Infer } from "@webroute/schema";
import {
  AnyProviderMap,
  CompiledRoute,
  RouteDefInner,
  HandlerFunction,
  RouteParams,
  HttpMethodInput,
  UseMiddlewareInput,
} from "./types";
import { MergeObjectsShallow } from "@webroute/common";

export type AnyRouteBuilder = RouteBuilder<any>;

export interface RouteBuilder<TParams extends RouteParams> {
  /**
   * @internal
   */
  "~def": RouteDefInner<TParams>;

  /**
   * Set the route path.
   *
   * If a path is already set upstream, this will append to the path.
   *
   * **[Appends]**
   */
  path<TPath extends string>(
    path: TPath
  ): RouteBuilder<{
    Path: TParams["Path"] extends string ? `${TParams["Path"]}${TPath}` : TPath;
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Register a parser for the request query.
   *
   * **[Overrides]**
   */
  query<$Parser extends Parser>(
    schema: $Parser
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: InferIn<$Parser>;
    QueryOut: Infer<$Parser>;
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Register a parser for the request path params.
   *
   * **[Overrides]**
   */
  params<$Parser extends Parser>(
    schema: $Parser
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: InferIn<$Parser>;
    ParamsOut: Infer<$Parser>;
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Register a parser for the request body.
   
   * **[Overrides]**
   */
  body<$Parser extends Parser>(
    schema: $Parser
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: InferIn<$Parser>;
    BodyOut: Infer<$Parser>;
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Register a parser for the request headers.
   *
   * **[Overrides]**
   */
  headers<$Parser extends Parser>(
    schema: $Parser
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: InferIn<$Parser>;
    HeadersReqOut: Infer<$Parser>;
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Register a parser for the request output (response body).
   *
   * **[Overrides]**
   */
  output<$Parser extends Parser>(
    schema: $Parser
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: InferIn<$Parser>;
    OutputOut: Infer<$Parser>;
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Set the route method(s).
   *
   * **[Overrides]**
   */
  method<TMethod extends HttpMethodInput | HttpMethodInput[]>(
    method: TMethod
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TMethod extends HttpMethodInput
      ? Uppercase<TMethod>
      : Uppercase<TMethod[number]>;
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Register a route middleware.
   *
   * Middleware may update the `state` context value.
   * It may also return a `Response` early or register a request handler which will run
   * on the egress journey.
   *
   * State return values are _shallow merged_.
   *
   * **[Appends]**
   */
  use<
    TMutations extends DataResult | unknown = unknown,
    TResult extends DataResult | void = void
  >(
    handler: UseMiddlewareInput<
      TParams["ParamsOut"],
      TParams["QueryOut"],
      TParams["BodyOut"],
      TParams["HeadersReqOut"],
      TParams["State"],
      TParams["Providers"],
      TResult | void
    >
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];

    // Update state if any has been returned
    State: void extends TResult
      ? TParams["State"] & TMutations
      : TResult & TMutations;

    Providers: TParams["Providers"];
  }>;

  /**
   * Add arbitrary metadata to the route.
   *
   * This can act as an escape hatch for declaring information on routes that doesn't
   * fit into existing `webroute` constructs.
   *
   * Meta is _shallow_ merged, so conflicting keys will override previous keys.
   *
   * Use at your own discretion.
   *
   * **[Appends: Shallow Merge]**
   */
  meta<TMeta extends TParams["Meta"]>(
    meta?: TMeta
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TMeta;
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: TParams["Providers"];
  }>;

  /**
   * Registers providers which will get exposed to the handler under `services`.
   *
   * **[Appends: Shallow Merge]**
   */
  provide<TProviders extends AnyProviderMap>(
    providers: TProviders
  ): RouteBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
    Providers: MergeObjectsShallow<TParams["Providers"], TProviders>;
  }>;

  /**
   * Defines the request handler.
   *
   * This concludes the route building process and produces a `CompiledRoute` instance.
   */
  handle(handler: HandlerFunction<TParams>): CompiledRoute<TParams>;
}
