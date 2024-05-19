import { AnyCompiledRoute, route, Simplify } from "@webroute/core";

export namespace FromWebroutes {
  export interface AnyRouteDef extends RouteDef<any> {}
  export type RouteDef<TRoute extends AnyCompiledRoute> =
    route.InferRouteDef<TRoute>;

  export interface AnyEndpointDef extends EndpointDef<any> {}
  export type EndpointDef<TRoute extends AnyCompiledRoute> = {
    [TMethod in route.InferMethods<TRoute>]: RouteDef<TRoute>;
  };

  export type ToAppRoute<TRoute extends AnyRouteDef> = {
    Query: TRoute["QueryIn"];
    Params: TRoute["ParamsIn"];
    Body: TRoute["BodyIn"];
    Output: TRoute["OutputOut"];
  };

  export type InferApp<TRoutes extends Record<string, AnyCompiledRoute>> =
    Simplify<{
      [Key in keyof TRoutes as `${Uppercase<
        route.InferMethods<TRoutes[Key]>
      >} ${route.InferPath<TRoutes[Key]>}`]: Simplify<
        ToAppRoute<RouteDef<TRoutes[Key]>>
      >;
    }>;
}
