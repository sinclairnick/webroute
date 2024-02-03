import { RequestHandler } from "express";
import { FSRouterFormat, FSRouterFormattedRoute } from "./format";
import fs from "node:fs";
import nodePath from "node:path";
import { AnyCompiledRoute } from "../route/handler/types";
import { createRoutes } from "./create-routes";
export type * from "./format";
export { NextJS } from "./formats/nextjs";

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

  const collect = async (): Promise<AnyCompiledRoute[]> => {
    const allRoutes: AnyCompiledRoute[] = [];

    await Promise.all(
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

        const asRoutes = createRoutes(path, handlers);
        allRoutes.push(...asRoutes);

        return Object.values(handlers).filter((x) => x) as RequestHandler[];
      })
    );

    return allRoutes;
  };

  return {
    meta: () => meta,
    collect,
  };
};
