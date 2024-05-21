import { getParseFn } from "../parser";
import { AnyRootConfig, cached } from "../../util";
import {
  AnyHandlerDefinition,
  LazyValidator,
  InferParamsFromPath,
  HandlerDefinition,
  MiddlewareOutFn,
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
  def: Partial<AnyHandlerDefinition> = {}
): HandlerBuilder<{
  Path: TPath;
  InferredParams: InferParamsFromPath<TPath>;
  Meta: TConfig["~types"]["Meta"];
  QueryIn: unknown;
  QueryOut: unknown;
  ParamsIn: unknown;
  ParamsOut: unknown;
  BodyIn: unknown;
  BodyOut: unknown;
  OutputIn: unknown;
  OutputOut: unknown;
  Methods: string;
  HeadersReqIn: unknown;
  HeadersReqOut: unknown;
  State: unknown;
}> {
  return {
    "~def": def,
    path(path) {
      return createNewBuilder(def, {
        path: def.path ? `${def.path}${path}` : path,
      }) as AnyHandlerBuilder;
    },
    query(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(def, {
        query: { parser, schema },
      }) as AnyHandlerBuilder;
    },
    params(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(def, {
        params: { parser, schema },
      }) as AnyHandlerBuilder;
    },
    body(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(def, {
        body: { parser, schema },
      }) as AnyHandlerBuilder;
    },
    output(output) {
      const parser = getParseFn(output);

      return createNewBuilder(def, {
        output: { parser, schema: output },
      }) as AnyHandlerBuilder;
    },
    meta(meta) {
      return createNewBuilder(def, {
        meta: meta as Record<string, unknown>,
      }) as AnyHandlerBuilder;
    },
    method(method) {
      if (Array.isArray(method)) {
        const unique = [...new Set(method.map((m) => m.toUpperCase()))];

        return createNewBuilder(def, {
          methods: unique,
        }) as AnyHandlerBuilder;
      }

      return createNewBuilder(def, {
        methods: [String(method).toUpperCase()],
      }) as AnyHandlerBuilder;
    },
    headers(schema) {
      return createNewBuilder(def, {
        headersReq: {
          parser: getParseFn(schema),
          schema,
        },
      }) as AnyHandlerBuilder;
    },
    use(...handlers) {
      return createNewBuilder(def, {
        middleware: [...(def.middleware ?? []), ...(handlers as any[])],
      }) as AnyHandlerBuilder;
    },
    handle(handler) {
      const _handler = async (req: Request) => {
        const validators = createLazyValidators(req, def);
        const middlewareOut: MiddlewareOutFn[] = [];

        const ctx = { ...validators, state: {} };

        let response: Response | undefined;

        // -- REQ MIDDLEWARE --
        // Run middleware in sequence, recursively updating state
        if (def.middleware) {
          for (const middleware of def.middleware) {
            const result = await middleware(req, ctx);

            // If early exit, return response
            if (result instanceof Response) {
              response = result;

              // Don't run remaining request middleware.
              // WARN: This also prevents the subsequent response middleware from
              // not being registered.
              break;
            }

            // If result is a function, it is a response handler
            if (typeof result === "function") {
              middlewareOut.push(result as MiddlewareOutFn);
              continue;
            }

            if (typeof result === "object") {
              // Otherwise modify state
              ctx.state = result;
            }
          }
        }

        // --- HANDLER ---
        // Skip handler if response has been acquired
        if (response == null) {
          const result = await handler(req, ctx as any);

          // Assign response, depending on handler return type
          if (result instanceof Response) {
            Log("Result is response");
            response = result;
          } else {
            Log("Parsing result.");
            const parsed = def.output
              ? await def.output?.parser(result)
              : result;

            Log("Sending parsed result as JSON");
            response = Response.json(parsed);
          }
        }

        // --- RES MIDDLEWARE ---
        // Run through outgoing middleware
        if (middlewareOut.length > 0) {
          // Iterate through middleware out backwards
          for (let i = middlewareOut.length - 1; i >= 0; i--) {
            const middleware = middlewareOut[i];
            response = await middleware(response, ctx);
          }
        }

        return response;
      };

      return Object.assign(_handler, { "~def": def });
    },
  };
}

const createLazyValidators = (req: Request, def: HandlerDefinition<any>) => {
  let query: LazyValidator<any> | undefined;
  let params: LazyValidator<any> | undefined;
  let body: LazyValidator<any> | undefined;
  let headers: LazyValidator<any> | undefined;

  const url = new URL(req.url);

  if (def.query) {
    query = cached(async () => {
      const map: Record<string, any> = {};
      for (const [key, value] of url.searchParams.entries()) {
        map[key] = value;
      }

      return def.query?.parser(map);
    });
  }

  if (def.params) {
    params = cached(async () => {
      const patternParts = def.path.split("/");
      const PathParts = url.pathname.split("/");

      const map: Record<string, any> = {};
      for (let i = 0; i <= patternParts.length; i++) {
        const pattern: string | undefined = patternParts[i];
        const Path: string | undefined = PathParts[i];

        if (pattern == null || Path == null) break;

        if (pattern.startsWith(":")) {
          map[pattern.slice(1)] = Path;
        }
      }

      return def.params?.parser(map);
    });
  }

  if (def.body) {
    body = cached(async () => {
      const data = await req.json();
      return def.body?.parser(data);
    });
  }

  if (def.headersReq) {
    headers = cached(async () => {
      const map: Record<string, any> = {};
      for (const [key, value] of req.headers.entries()) {
        map[key] = value;
      }

      return def.headersReq?.parser(map);
    });
  }

  return { query, params, body, headers };
};
