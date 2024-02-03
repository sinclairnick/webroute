import { createBuilder } from "./handler";
export { registerRoutes } from "./register-routes";
export { DiscoveredRoute, discoverRoutes } from "./discover-routes";

type RouteMeta = {};

type DefaultConfig = {
  $types: {
    meta: RouteMeta;
    ctx: {};
  };
};

export const route = <TPath extends string>(path?: TPath) =>
  createBuilder<DefaultConfig>({ path });
