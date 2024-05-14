import { MergeObjectsShallow } from "../../util";
import { Parser, inferParser } from "../parser/types";
import {
  CompiledRoute,
  DecoratedRequestHandler,
  HandlerDefinition,
  HandlerFunction,
  HandlerParams,
  HttpMethodInput,
} from "./types";

export type AnyHandlerBuilder = HandlerBuilder<any>;

export interface HandlerBuilder<TParams extends HandlerParams> {
  /**
   * @internal
   */
  "~def": HandlerDefinition<TParams>;

  path<TPath extends string>(
    path: TPath
  ): HandlerBuilder<{
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
  }>;

  /**
   * Add parser for req.query
   */
  query<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: inferParser<$Parser>["in"];
    QueryOut: inferParser<$Parser>["out"];
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
  }>;

  /**
   * Add parser for req.params
   */
  params<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: inferParser<$Parser>["in"];
    ParamsOut: inferParser<$Parser>["out"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
  }>;

  /**
   * Add parser for req.body
   */
  body<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: inferParser<$Parser>["in"];
    BodyOut: inferParser<$Parser>["out"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
  }>;

  headers<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
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
    HeadersReqIn: inferParser<$Parser>["in"];
    HeadersReqOut: inferParser<$Parser>["out"];
    State: TParams["State"];
  }>;

  /**
   * Add parser for res.body
   */
  output<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    Path: TParams["Path"];
    InferredParams: TParams["InferredParams"];
    Meta: TParams["Meta"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    ParamsIn: TParams["ParamsIn"];
    ParamsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    OutputIn: inferParser<$Parser>["in"];
    OutputOut: inferParser<$Parser>["out"];
    Methods: TParams["Methods"];
    HeadersReqIn: TParams["HeadersReqIn"];
    HeadersReqOut: TParams["HeadersReqOut"];
    State: TParams["State"];
  }>;

  method<TMethod extends HttpMethodInput | HttpMethodInput[]>(
    method: TMethod
  ): HandlerBuilder<{
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
  }>;

  use<TState extends Record<PropertyKey, any> = {}>(
    handler: DecoratedRequestHandler<
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
      TState,
      // Mods
      TParams["State"]
    >
  ): HandlerBuilder<{
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
    State: MergeObjectsShallow<TParams["State"], TState>;
  }>;

  /**
   * Add a Meta data to the procedure.
   */
  meta(meta: TParams["Meta"]): HandlerBuilder<TParams>;

  handle(handler: HandlerFunction<TParams>): CompiledRoute<TParams>;
}
