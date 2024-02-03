import { FSRouterFormattedRoute } from "./format";
import { isCompiledRoute } from "../route/handler";
import { route } from "../../dist";
import { AnyRequestHandlerModified } from "../util";
import { AnyCompiledRoute } from "../route/handler/types";
export type * from "./format";
export { NextJS } from "./formats/nextjs";

export const createRoutes = (
  path: FSRouterFormattedRoute & { relativePath: string },
  handlers: Record<string, unknown>
): AnyCompiledRoute[] => {
  const { relativePath, pathMatch } = path;

  const routes: AnyCompiledRoute[] = [];

  // Rules:
  // - .methods() is always ignored, unless default export
  // - When there is more than one handler, both are registered
  for (const method in handlers) {
    const handler = handlers[method];

    if (handler == null) continue;

    if (typeof handler !== "function") {
      throw new Error(
        `[${relativePath}] Invalid handler found for '${method}' method.`
      );
    }

    let compiled = route(pathMatch).method(
      method === "default" ? "all" : method
    );
    let handlerFn = handler as AnyRequestHandlerModified;

    if (isCompiledRoute(handler)) {
      // Copy existing fields over
      if (handler._def.meta) {
        compiled = compiled.meta(handler._def.meta);
      }
      if (handler._def.body) {
        compiled = compiled.body(handler._def.body.schema);
      }
      if (handler._def.query) {
        compiled = compiled.query(handler._def.query.schema);
      }
      if (handler._def.params) {
        compiled = compiled.params(handler._def.params.schema);
      }
      if (handler._def.output) {
        compiled = compiled.output(handler._def.output.schema);
      }
      if (handler._def.rawHandler) {
        handlerFn = handler._def.rawHandler;
      }
      if (method === "default" && handler._def.methods) {
        compiled = compiled.method(handler._def.methods);
      }

      if (handler._def.path != null) {
        console.warn(
          `[${relativePath}] Handler for '${method}' method specifies a route path which will be ignored for the path derived from the file system.`
        );
      }

      if (handler._def.methods && handler._def.methods.length > 0) {
        if (method === "default") {
          for (const specifiedMethod of handler._def.methods) {
            if (handlers[specifiedMethod] != null) {
              console.info(
                `[${relativePath}] Both default and a named export will handle the ${specifiedMethod} method.`
              );
            }
          }
        } else {
          console.warn(
            `[${relativePath}] Handler for '${method}' method specifies .methods() which will be ignored in favour of '${method}'.`
          );
        }
      }
    }

    routes.push(compiled.handle(handlerFn));
  }

  return routes;
};
