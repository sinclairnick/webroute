import {
  AnyHandlerDefinition,
  InferParamsFromPath,
  MiddlewareOutFn,
  RequestCtx,
  RouteMeta,
} from "./types";
import { Log } from "../../internal/logger";
import { AnyRouteBuilder, RouteBuilder } from "./builder";
import { Def, createParseFn } from "./util";
import { getParseFn } from "@webroute/schema";
import { fixRequestClone, fixResponseClone } from "../patch";
import { isBun } from "../../util";

function createNewBuilder(
  configA: AnyHandlerDefinition,
  configB: Partial<AnyHandlerDefinition>
) {
  return createBuilder({ ...configA, ...configB });
}

export function createBuilder<TPath extends string | undefined = undefined>(
  def: Partial<AnyHandlerDefinition> = {}
): RouteBuilder<{
  Path: TPath;
  InferredParams: InferParamsFromPath<TPath>;
  Meta: RouteMeta;
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
  Providers: unknown;
}> {
  return {
    "~def": def,
    path(path) {
      return createNewBuilder(def, {
        path: def.path ? `${def.path}${path}` : path,
      }) as AnyRouteBuilder;
    },
    query(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(def, {
        query: { parser, schema },
      }) as AnyRouteBuilder;
    },
    params(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(def, {
        params: { parser, schema },
      }) as AnyRouteBuilder;
    },
    body(schema) {
      const parser = getParseFn(schema);

      return createNewBuilder(def, {
        body: { parser, schema },
      }) as AnyRouteBuilder;
    },
    output(output) {
      const parser = getParseFn(output);

      return createNewBuilder(def, {
        output: { parser, schema: output },
      }) as AnyRouteBuilder;
    },
    meta(meta) {
      return createNewBuilder(def, { meta }) as AnyRouteBuilder;
    },
    method(method) {
      if (Array.isArray(method)) {
        const unique = [...new Set(method.map((m) => m.toUpperCase()))];

        return createNewBuilder(def, {
          methods: unique,
        }) as AnyRouteBuilder;
      }

      return createNewBuilder(def, {
        methods: [String(method).toUpperCase()],
      }) as AnyRouteBuilder;
    },
    headers(schema) {
      return createNewBuilder(def, {
        headersReq: {
          parser: getParseFn(schema),
          schema,
        },
      }) as AnyRouteBuilder;
    },
    use(handler) {
      return createNewBuilder(def, {
        middleware: [...(def.middleware ?? []), handler],
      }) as AnyRouteBuilder;
    },
    provide(providers) {
      return createNewBuilder(def, {
        providers: { ...def.providers, ...providers },
      }) as AnyRouteBuilder;
    },
    handle(handler) {
      const _handler = async (_req: Request) => {
        const req = isBun ? fixRequestClone(_req) : _req;

        const parse = createParseFn(req, def);
        const middlewareOut: MiddlewareOutFn[] = [];

        const ctx: RequestCtx = {
          state: {},
          services: { ...def.providers },
          parse,
        };

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
              // being registered.
              break;
            }

            // If result is a function, it is a response handler
            if (typeof result === "function") {
              middlewareOut.push(result as MiddlewareOutFn);
              continue;
            }

            if (typeof result === "object") {
              // Otherwise modify state
              ctx.state = { ...ctx.state, ...result };
            }
          }
        }

        // --- HANDLER ---
        // Skip handler if response has been acquired
        if (response == null) {
          const result = await handler(req, ctx as any);

          // Assign response, depending on handler return type

          // If return type is response
          if (result instanceof Response) {
            Log("Result is response");
            response = result;
          }
          // Otherwise is a data type
          else {
            Log("Parsing result.");
            const parsed = def.output
              ? await def.output?.parser(result)
              : result;

            Log("Sending parsed result as JSON");
            response = Response.json(parsed);
          }
        }

        if (isBun) {
          response = fixResponseClone(response);
        }

        // --- RES MIDDLEWARE ---
        // Run through outgoing middleware
        if (middlewareOut.length > 0) {
          // Iterate through middleware out backwards
          for (let i = middlewareOut.length - 1; i >= 0; i--) {
            const middleware = middlewareOut[i];
            const result = await middleware(response, ctx);

            // Set response if one was returned
            if (result && isBun) {
              response = fixResponseClone(result);
            }
          }
        }

        return response;
      };

      return Object.assign(_handler, { [Def]: def });
    },
  };
}
