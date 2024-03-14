import { createBuilder } from "./handler";
export { registerRoutes } from "./register-routes";
export { type DiscoveredRoute, discoverRoutes } from "./discover-routes";

// Export all types
export type * from "./handler";
export type * from "./handler/types";
export type * from "./parser";
export type * from "./parser/types";
export type * from "./discover-routes";
export type * from "./register-routes";

export type DefaultConfig = {
  $types: {
    meta: {};
    ctx: {};
  };
};

export const route = <TPath extends string>(path?: TPath) =>
  createBuilder<DefaultConfig>({ path });
