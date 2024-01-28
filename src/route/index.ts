import { createBuilder } from "./handler";
import express from "express";
import { AnyCompiledRoute } from "./handler/types";
import { Log } from "../internal/logger";

type RouteMeta = {};

type DefaultConfig = {
  $types: {
    meta: RouteMeta;
    ctx: {};
  };
};

export const route = <TPath extends string>(path: TPath) =>
  createBuilder<DefaultConfig>({ path });

/**
 * Iterates over the routes, registering each route to their specified
 * paths and methods
 */
export const registerRoutes = (
  app: express.Express,
  routes: AnyCompiledRoute | AnyCompiledRoute[]
) => {
  const _routes = Array.isArray(routes) ? routes : [routes];

  for (const route of _routes) {
    const { _def } = route;

    if (_def.path == null) {
      throw new Error(
        "Unable to register handler: No handler path was provided"
      );
    }

    if (_def.methods == null || _def.methods.length === 0) {
      throw new Error(
        "Unable to register handler: No methods were provided.\n" +
          "Use the `.method` function to add one."
      );
    }

    const uniqueMethods = Array.from(new Set(_def.methods));

    for (const method of uniqueMethods) {
      const methodAsKey = method.toLowerCase() as keyof typeof app;

      // Not extracting app[methodAsKey] into var to retain `this` references
      // otherwise express errors
      if (app[methodAsKey] && typeof app[methodAsKey] === "function") {
        Log(methodAsKey, "->", route._def.path);
        app[methodAsKey](_def.path, route);
      }
    }
  }
};
