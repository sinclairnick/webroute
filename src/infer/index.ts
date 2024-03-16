import { AnyCompiledRoute } from "../route/handler/types";
import { route } from "../route";
import { Simplify } from "../util";

export namespace H {
  export interface AnyRouteDef extends RouteDef<any> {}
  export type RouteDef<TRoute extends AnyCompiledRoute> =
    route.InferRouteDef<TRoute>;

  export interface AnyEndpointDef extends EndpointDef<any> {}
  export type EndpointDef<TRoute extends AnyCompiledRoute> = {
    [TMethod in route.InferMethods<TRoute>]: RouteDef<TRoute>;
  };

  export interface AnyAppDef extends Infer<any> {}
  export type Infer<TRoutes extends readonly AnyCompiledRoute[]> = Simplify<
    TRoutes extends readonly [infer TLast, ...infer TRest]
      ? TLast extends AnyCompiledRoute
        ? TRest extends readonly AnyCompiledRoute[]
          ? Infer<TRest> extends infer TInferRest
            ? {
                [TPath in route.InferPath<TLast>]: Simplify<
                  EndpointDef<TLast> & TInferRest[TPath]
                >;
              } & TInferRest
            : {}
          : {}
        : {}
      : {}
  >;

  export type InferPaths<TApp extends AnyAppDef> = keyof TApp;

  export type DefinedEndpoint<TRoute extends AnyRouteDef> = {
    query: TRoute["queryIn"];
    params: TRoute["paramsIn"];
    body: TRoute["bodyIn"];
    output: TRoute["outputOut"];
    path: TRoute["path"];
  };

  export type Endpoint<
    TApp extends Infer<any>,
    TPath extends keyof TApp,
    TMethod extends keyof TApp[TPath]
  > = TApp[TPath][TMethod] extends infer TRoute
    ? TRoute extends AnyRouteDef
      ? DefinedEndpoint<TRoute>
      : never
    : never;
}
