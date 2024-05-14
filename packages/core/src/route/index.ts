import { createBuilder } from "./handler";
import {
  AnyCompiledRoute,
  CompiledRoute,
  HandlerParams,
  RouteMeta,
} from "./handler/types";

// Export all types
export type * from "./handler";
export type * from "./handler/types";
export type * from "./parser";
export type * from "./parser/types";

interface DefaultConfig {
  "~types": {
    Meta: RouteMeta;
  };
}

export const route = <TPath extends string>(Path?: TPath) =>
  createBuilder<DefaultConfig, TPath>({ path: Path });

export namespace route {
  export type InferPart<
    TRoute extends AnyCompiledRoute,
    TPart extends keyof HandlerParams
  > = TRoute extends CompiledRoute<infer TParams> ? TParams[TPart] : never;

  export type InferBodyIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "BodyIn"
  >;
  export type InferBodyOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "BodyOut"
  >;

  export type InferQueryIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "QueryIn"
  >;
  export type InferQueryOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "QueryOut"
  >;

  export type InferParamsIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "ParamsIn"
  >;
  export type InferParamsOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "ParamsOut"
  >;

  export type InferOutputIn<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "OutputIn"
  >;
  export type InferOutputOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "OutputOut"
  >;

  export type InferMeta<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "Meta"
  >;

  export type InferPath<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "Path"
  >;

  export type InferMethods<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "Methods"
  >;

  export interface DefinedRouteDef<TParams extends HandlerParams> {
    ParamsIn: TParams["ParamsIn"];
    paramsOut: TParams["ParamsOut"];
    BodyIn: TParams["BodyIn"];
    BodyOut: TParams["BodyOut"];
    QueryIn: TParams["QueryIn"];
    QueryOut: TParams["QueryOut"];
    OutputIn: TParams["OutputIn"];
    OutputOut: TParams["OutputOut"];
    Path: TParams["Path"];
  }

  export type InferRouteDef<TRoute extends AnyCompiledRoute> =
    TRoute extends CompiledRoute<infer TParams>
      ? DefinedRouteDef<TParams>
      : never;
}
