import { getParseFn } from "../parser";
import { AnyRootConfig, cached } from "../../util";
import {
  AnyHandlerDefinition,
  LazyValidator,
  InferParamsFromPath,
  HandlerDefinition,
} from "./types";
import { Log } from "../../internal/logger";
import { AnyHandlerBuilder, HandlerBuilder } from "./builder";

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
  _inferredParams: InferParamsFromPath<TPath>;
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
  _headers_req_in: unknown;
  _headers_req_out: unknown;
  _state: {};
}> {
  const _def = {
    ...initDef,
  };

  return {
    _def,
    path(path) {
      return createNewBuilder(_def, {
        path: _def.path ? `${_def.path}${path}` : path,
      }) as AnyHandlerBuilder;
    },
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
    headers(schema) {
      return createNewBuilder(_def, {
        headersReq: {
          parser: getParseFn(schema),
          schema,
        },
      }) as AnyHandlerBuilder;
    },
    use(...handlers) {
      return createNewBuilder(_def, {
        middleware: [...(_def.middleware ?? []), ...(handlers as any[])],
      }) as AnyHandlerBuilder;
    },
    handle(handler) {
      const _handler = async (req: Request) => {
        const validators = createLazyValidators(req, _def);

        const ctx = { ...validators, req, state: {} };

        // Run middleware in sequence, recursively updating state
        if (_def.middleware) {
          for (const middleware of _def.middleware) {
            const result = await middleware(ctx);

            // If early exit, return response
            if (result instanceof Response) {
              return result;
            }

            if (typeof result === "object") {
              // Otherwise modify state
              ctx.state = { ...ctx.state, ...result };
            }
          }
        }

        const result = await handler(ctx as any);

        if (result instanceof Response) {
          Log("Is response. Next");
          return result;
        }

        Log("Parsing result.");
        const parsed = _def.output ? await _def.output?.parser(result) : result;

        Log("Sending parsed result as JSON");
        return Response.json(parsed);
      };

      return Object.assign(_handler, {
        _def,
        __isCompiledRoute__: true as const,
      }) as any;
    },
  };
}

const createLazyValidators = (req: Request, _def: HandlerDefinition<any>) => {
  let query: LazyValidator<any> | undefined;
  let params: LazyValidator<any> | undefined;
  let body: LazyValidator<any> | undefined;
  let headers: LazyValidator<any> | undefined;

  const url = new URL(req.url);

  if (_def.query) {
    query = cached(async () => {
      const map: Record<string, any> = {};
      for (const [key, value] of url.searchParams.entries()) {
        map[key] = value;
      }

      return _def.query?.parser(map);
    });
  }

  if (_def.params) {
    params = cached(async () => {
      const patternParts = _def.path.split("/");
      const pathParts = url.pathname.split("/");

      const map: Record<string, any> = {};
      for (let i = 0; i <= patternParts.length; i++) {
        const pattern: string | undefined = patternParts[i];
        const path: string | undefined = pathParts[i];

        if (pattern == null || path == null) break;

        if (pattern.startsWith(":")) {
          map[pattern.slice(1)] = path;
        }
      }

      return _def.params?.parser(map);
    });
  }

  if (_def.body) {
    body = cached(async () => {
      const data = await req.json();
      return _def.body?.parser(data);
    });
  }

  if (_def.headersReq) {
    headers = cached(async () => {
      const map: Record<string, any> = {};
      for (const [key, value] of req.headers.entries()) {
        map[key] = value;
      }

      return _def.headersReq?.parser(map);
    });
  }

  return { query, params, body, headers };
};
