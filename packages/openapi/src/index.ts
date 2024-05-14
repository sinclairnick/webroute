export * from "./spec";
import { oas31 } from "openapi3-ts";
import type { RouteMeta } from "@webroute/core";

declare module "@webroute/core" {
  export interface RouteMeta {
    /**
     * Route name used to identify the route.
     * May be used for improved OpenAPI operation naming.
     */
    name?: string;
    /**
     * Customise this routes OpenAPI config.
     * If an object is provided, it will be _shallow_ merged with the existing object.
     * If a function is provided, the return value will be used as the config.
     */
    openApi?:
      | oas31.OperationObject
      | ((operation: oas31.OperationObject) => oas31.OperationObject);
  }
}
