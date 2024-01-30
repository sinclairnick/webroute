import { RequestHandler } from "express";
import { FSRouterFormat, FSRouterFormattedRoute } from "./format";
import fs from "node:fs";
import nodePath from "node:path";
import { isCompiledRoute } from "../route/handler";
import { AnyCompiledRoute } from "../route/handler/types";
import { route } from "../../dist";

type RouterMeta = {
  formattedPaths: (FSRouterFormattedRoute & {
    relativePath: string;
    absolutePath: string;
  })[];
};

export type CreateFSRouterOptions = {
  format: FSRouterFormat;
  rootDir?: string;
};

const createRoutes = (
  path: FSRouterFormattedRoute & { relativePath: string },
  handlers: Record<string, unknown>
): [string, ...RequestHandler[]][] => {
  const { relativePath, methods, pathMatch, deriveParams } = path;

  const routes: [string][] = [];

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

    if (isCompiledRoute(handler)) {
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
  }

  return routes;
};

export const createFSRouter = ({
  format,
  rootDir = "./app",
}: CreateFSRouterOptions) => {
  if (!fs.existsSync(rootDir)) {
    throw new Error(
      `Could not find routes directory "${rootDir}".\Path should be defined relative to ${process.cwd()}`
    );
  }

  const paths = fs
    .readdirSync(rootDir, { recursive: true })
    .filter((x): x is string => typeof x === "string");

  const meta: RouterMeta = { formattedPaths: [] };

  for (const path of paths) {
    const formatted = format(path);
    if (formatted == null) continue;

    const relativePath = nodePath.join(rootDir, path);
    const absolutePath = nodePath.resolve(relativePath);

    meta.formattedPaths.push({
      relativePath,
      absolutePath,
      ...formatted,
    });
  }

  const collect = async (): Promise<RequestHandler[]> => {
    const handlers = await Promise.all(
      meta.formattedPaths.map(async (path) => {
        const mod = await import(`${path.absolutePath}`);

        const handlers = {
          get: mod.GET ?? mod.get,
          post: mod.POST ?? mod.post,
          put: mod.PUT ?? mod.put,
          delete: mod.DELETE ?? mod.delete,
          patch: mod.PATCH ?? mod.patch,
          head: mod.HEAD ?? mod.head,
          options: mod.OPTIONS ?? mod.options,
          default: mod.default,
        };

        createRoutes(path, handlers);

        return Object.values(handlers).filter((x) => x) as RequestHandler[];
      })
    );

    const routes: RequestHandler[] = [];
    for (const handlerList of handlers) {
      routes.push(...handlerList);
    }

    return routes;
  };

  return {
    meta: () => meta,
    collect,
    // match,
  };
};
