import { createBuilder } from "./handler";
import {
  AnyCompiledRoute,
  CompiledRoute,
  HandlerParams,
  RouteMeta,
} from "./handler/types";
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
    meta: RouteMeta;
    ctx: {};
  };
};

export const route = <TPath extends string>(path?: TPath) =>
  createBuilder<DefaultConfig, TPath>({ path });

export namespace route {
  export type InferPart<
    TRoute extends AnyCompiledRoute,
    TPart extends keyof HandlerParams
  > = TRoute extends CompiledRoute<infer TParams> ? TParams[TPart] : never;

  export type InferBodyIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_body_in"
  >;
  export type InferBodyOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_body_out"
  >;

  export type InferQueryIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_query_in"
  >;
  export type InferQueryOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_query_out"
  >;

  export type InferParamsIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_params_in"
  >;
  export type InferParamsOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_params_out"
  >;

  export type InferOutputIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_output_in"
  >;
  export type InferOutputOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_output_out"
  >;

  export type InferMeta<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_meta"
  >;

  export type InferPath<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_path"
  >;

  export type InferMethods<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "_methods"
  >;
}
