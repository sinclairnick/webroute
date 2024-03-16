import { getParseFn } from "../parser";
import { Parser, inferParser } from "../parser/types";
import {
  AnyRootConfig,
  ErrorMessage,
  NextUtil,
  ResponseUtil,
  nextFnSymbol,
} from "../../util";
import {
  AnyHandlerDefinition,
  CompiledRoute,
  HandlerDefinition,
  HandlerFunction,
  HandlerParams,
  HttpMethod,
} from "./types";
import { RequestHandler } from "express";
import { Log } from "../../internal/logger";

export type AnyHandlerBuilder = HandlerBuilder<any>;

export interface HandlerBuilder<TParams extends HandlerParams> {
  /**
   * @internal
   */
  _def: HandlerDefinition<TParams>;

  /**
   * Add parser for req.query
   */
  query<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
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
  }>;

  /**
   * Add parser for req.params
   */
  params<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _ctx: TParams["_ctx"];
    _meta: TParams["_meta"];
    _query_in: TParams["_query_in"];
    _query_out: TParams["_query_out"];
    _params_in: inferParser<$Parser>["in"];
    _params_out: inferParser<$Parser>["out"];
    _path: TParams["_path"];
    _body_in: TParams["_body_in"];
    _body_out: TParams["_body_out"];
    _output_in: TParams["_output_in"];
    _output_out: TParams["_output_out"];
    _methods: TParams["_methods"];
  }>;

  /**
   * Add parser for req.body
   */
  body<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
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
  }>;

  // TODO: Add headers parser?

  /**
   * Add parser for res.body
   */
  output<$Parser extends Parser>(
    schema: $Parser
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
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
  }>;

  method<TMethod extends HttpMethod | HttpMethod[]>(
    method: TMethod
  ): HandlerBuilder<{
    _config: TParams["_config"];
    _path: TParams["_path"];
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
  }>;

  /**
   * Add a meta data to the procedure.
   */
  meta(meta: TParams["_meta"]): HandlerBuilder<TParams>;

  handle(handler: HandlerFunction<TParams>): CompiledRoute<TParams>;
}

function createNewBuilder(
  configA: AnyHandlerDefinition,
  configB: Partial<AnyHandlerDefinition>
) {
  return createBuilder({ ...configA, ...configB });
}

export function createBuilder<
  TConfig extends AnyRootConfig,
  TPath extends string
>(
  initDef: Partial<AnyHandlerDefinition> = {}
): HandlerBuilder<{
  _config: TConfig;
  _path: TPath;
  _ctx: TConfig["$types"]["ctx"];
  _meta: TConfig["$types"]["meta"];
  _query_in: unknown;
  _query_out: unknown;
  _params_in: unknown;
  _params_out: unknown;
  _body_in: unknown;
  _body_out: unknown;
  _output_in: unknown;
  _output_out: unknown;
  _methods: string;
}> {
  const _def = {
    ...initDef,
  };

  return {
    _def,
    query(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(_def, {
        query: { parser, schema },
      }) as AnyHandlerBuilder;
    },
    params(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(_def, {
        params: { parser, schema },
      }) as AnyHandlerBuilder;
    },
    body(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(_def, {
        body: { parser, schema },
      }) as AnyHandlerBuilder;
    },
    output(output) {
      const parser = getParseFn(output);

      return createNewBuilder(_def, {
        output: { parser, schema: output },
      }) as AnyHandlerBuilder;
    },
    meta(meta) {
      return createNewBuilder(_def, {
        meta: meta as Record<string, unknown>,
      }) as AnyHandlerBuilder;
    },
    method(method) {
      return createNewBuilder(_def, {
        methods: Array.isArray(method) ? method : [method],
      }) as AnyHandlerBuilder;
    },
    handle(handler) {
      const _handler: RequestHandler = async (req, res, next) => {
        if (res.headersSent) {
          return next();
        }

        ResponseUtil.brand(res);

        try {
          if (_def.query) {
            req.query = (await _def.query.parser(req.query)) as any;
          }

          let params: any = req.params;
          if (_def.params) {
            req.params = (await _def.params.parser(params)) as any;
          }

          let body: any = req.body;
          if (_def.body) {
            req.body = await _def.body.parser(body);
          }

          const result = await handler(req as any, res, NextUtil.wrap(next));

          if (result === nextFnSymbol) {
            Log("Next");
            return;
          }

          if (ResponseUtil.isResponse(result)) {
            Log("Is response. Next");
            return next();
          }

          Log("Parsing result.");
          const parsed = _def.output
            ? await _def.output?.parser(result)
            : result;
          Log("Sending parsed result as JSON");
          return res.json(parsed);
        } catch (e) {
          return next(e);
        }
      };

      _def.rawHandler = handler;

      return Object.assign(_handler, {
        _def,
        __isCompiledRoute__: true as const,
      });
    },
  };
}
