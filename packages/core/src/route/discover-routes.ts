import express, { RequestHandler } from "express";

export type DiscoveredRoute = {
  method: string;
  path?: string;
  matchRegex?: RegExp;
  handler: RequestHandler;
};

export const discoverRoutes = (app: express.Express) => {
  const routes: DiscoveredRoute[] = [];

  for (const layer of app._router.stack) {
    if (layer.name === "bound dispatch") {
      const { regexp, route } = layer;

      const { path, stack } = route;

      for (const layer of stack) {
        const { method, handle } = layer;

        routes.push({
          handler: handle,
          method,
          matchRegex: regexp,
          path,
        });
      }
    }
  }

  return routes;
};
