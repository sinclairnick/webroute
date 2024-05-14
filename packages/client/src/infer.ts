import { AnyCompiledRoute, Simplify, route } from "@webroute/core";

export namespace W {
  export interface AnyRouteDef extends RouteDef<any> {}
  export type RouteDef<TRoute extends AnyCompiledRoute> =
    route.InferRouteDef<TRoute>;

  export interface AnyEndpointDef extends EndpointDef<any> {}
  export type EndpointDef<TRoute extends AnyCompiledRoute> = {
    [TMethod in route.InferMethods<TRoute>]: RouteDef<TRoute>;
  };

  export interface AnyAppDef extends Infer<any> {}

  export type Infer<TRoutes extends Record<string, AnyCompiledRoute>> =
    Simplify<{
      [Key in keyof TRoutes as `${Uppercase<
        route.InferMethods<TRoutes[Key]>
      >} ${route.InferPath<TRoutes[Key]>}`]: RouteDef<TRoutes[Key]>;
    }>;

  export type InferPaths<TApp extends AnyAppDef> =
    keyof TApp extends `${string} ${infer TPath}` ? TPath : never;

  export type DefinedEndpoint<TRoute extends AnyRouteDef> = {
    query: TRoute["queryIn"];
    params: TRoute["paramsIn"];
    body: TRoute["bodyIn"];
    output: TRoute["outputOut"];
    path: TRoute["path"];
  };

  export type Endpoint<
    TApp extends Infer<any>,
    TPath extends keyof TApp
  > = TApp[TPath] extends infer TRoute
    ? TRoute extends AnyRouteDef
      ? DefinedEndpoint<TRoute>
      : never
    : never;
}
