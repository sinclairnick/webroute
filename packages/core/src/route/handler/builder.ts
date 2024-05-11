import { MergeObjectsShallow } from "../../util";
import { Parser, inferParser } from "../parser/types";
import {
  CompiledRoute,
  DecoratedRequestHandler,
  HandlerDefinition,
  HandlerFunction,
  HandlerParams,
  HttpMethod,
} from "./types";

export type AnyHandlerBuilder = HandlerBuilder<any>;

export interface HandlerBuilder<TParams extends HandlerParams> {
  /**
   * @internal
   */
  _def: HandlerDefinition<TParams>;

  path<TPath extends string>(
    path: TPath
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"] extends string
      ? `${TParams["_path"]}${TPath}`
      : TPath;
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: TParams["_state"];
  }>;

  /**
   * Add parser for req.query
   */
  query<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: inferParser<$Parser>["in"];
    _query_out: inferParser<$Parser>["out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: TParams["_state"];
  }>;

  /**
   * Add parser for req.params
   */
  params<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: inferParser<$Parser>["in"];
    _params_out: inferParser<$Parser>["out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: TParams["_state"];
  }>;

  /**
   * Add parser for req.body
   */
  body<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: inferParser<$Parser>["in"];
    _body_out: inferParser<$Parser>["out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: TParams["_state"];
  }>;

  headers<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
    _headers_req_in: inferParser<$Parser>["in"];
    _headers_req_out: inferParser<$Parser>["out"];
    _state: TParams["_state"];
  }>;

  /**
   * Add parser for res.body
   */
  output<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: inferParser<$Parser>["in"];
    _output_out: inferParser<$Parser>["out"];
    _methods: TParams["_methods"];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: TParams["_state"];
  }>;

  method<TMethod extends HttpMethod | HttpMethod[]>(
    method: TMethod
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TMethod extends HttpMethod ? TMethod : TMethod[number];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: TParams["_state"];
  }>;

  use<TState extends Record<PropertyKey, any> = {}>(
    handler: DecoratedRequestHandler<
      // Params
      TParams["_inferredParams"] extends never
        ? TParams["_params_out"]
        : MergeObjectsShallow<
            TParams["_inferredParams"],
            TParams["_params_out"]
          >,
      // Query
      TParams["_query_out"],
      // Body
      TParams["_body_out"],
      // Headers
      TParams["_headers_req_out"],
      // Output
      TState,
      // Mods
      TParams["_state"]
    >
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
    _inferredParams: TParams["_inferredParams"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: TParams["_params_in"];
    _params_out: TParams["_params_out"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
    _headers_req_in: TParams["_headers_req_in"];
    _headers_req_out: TParams["_headers_req_out"];
    _state: MergeObjectsShallow<TParams["_state"], TState>;
  }>;

  /**
   * Add a meta data to the procedure.
   */
  meta(meta: TParams["_meta"]): HandlerBuilder<TParams>;

  handle(handler: HandlerFunction<TParams>): CompiledRoute<TParams>;
}
