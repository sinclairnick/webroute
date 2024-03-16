import { AnyCompiledRoute } from "../route/handler/types";
import { route } from "../route";
import { Simplify } from "../util";

export namespace H {
  export type RouteDef<TRoute extends AnyCompiledRoute> = {
    paramsIn: route.InferParamsIn<TRoute>;
    paramsOut: route.InferParamsOut<TRoute>;
    bodyIn: route.InferBodyIn<TRoute>;
    bodyOut: route.InferBodyOut<TRoute>;
    queryIn: route.InferQueryIn<TRoute>;
    queryOut: route.InferQueryOut<TRoute>;
    outputIn: route.InferOutputIn<TRoute>;
    outputOut: route.InferOutputOut<TRoute>;
    path: route.InferPath<TRoute>;
  };

  export type EndpointDef<TRoute extends AnyCompiledRoute> = {
    [TMethod in route.InferMethods<TRoute>]: RouteDef<TRoute>;
  };

  export type Infer<TRoutes extends readonly AnyCompiledRoute[]> =
    TRoutes extends readonly [infer TLast, ...infer TRest]
      ? TLast extends AnyCompiledRoute
        ? TRest extends readonly AnyCompiledRoute[]
          ? Infer<TRest> extends infer TInferRest
            ? {
                [TPath in route.InferPath<TLast>]: Simplify<
                  EndpointDef<TLast>
                > &
                  TInferRest[TPath];
              } & TInferRest
            : {}
          : {}
        : {}
      : {};

  export type InferPaths<TApp extends AnyAppDef> = keyof TApp;

  export type Endpoint<
    TApp extends Infer<any>,
    TPath extends keyof TApp,
    TMethod extends keyof TApp[TPath]
  > = TApp[TPath][TMethod] extends infer TRoute
    ? TRoute extends AnyRouteDef
      ? {
          query: TRoute["queryIn"];
          params: TRoute["paramsIn"];
          body: TRoute["bodyIn"];
          output: TRoute["outputOut"];
          path: TRoute["path"];
        }
      : never
    : never;
}

export type AnyAppDef = H.Infer<any>;
export type AnyEndpointDef = H.EndpointDef<any>;
export type AnyRouteDef = H.RouteDef<any>;
