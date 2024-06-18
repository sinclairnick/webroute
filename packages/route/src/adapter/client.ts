import { AnyCompiledRoute, Route } from "../route";
import { Simplify } from "@webroute/common";
import { DenormalisedInput } from "./types";

export namespace ToClient {
  export interface AnyRouteDef extends RouteDef<any> {}
  export type RouteDef<TRoute extends AnyCompiledRoute> =
    Route.InferRouteDef<TRoute>;

  export interface AnyEndpointDef extends EndpointDef<any> {}
  export type EndpointDef<TRoute extends AnyCompiledRoute> = {
    [TMethod in Route.InferMethods<TRoute>]: RouteDef<TRoute>;
  };

  export type ToAppRoute<TRoute extends AnyRouteDef> = {
    Query: TRoute["QueryIn"];
    Params: TRoute["ParamsIn"];
    Body: TRoute["BodyIn"];
    Output: TRoute["OutputOut"];
  };

  export type InferApp<TRoutes extends DenormalisedInput> = Simplify<{
    [Key in keyof TRoutes as `${Uppercase<
      Route.InferMethods<TRoutes[Key]>
    >} ${Route.InferPath<TRoutes[Key]>}`]: Simplify<
      ToAppRoute<RouteDef<TRoutes[Key]>>
    >;
  }>;
}
