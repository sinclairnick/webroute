import { z } from "zod";
import { createBuilder } from "./handler";
import {
  AnyCompiledRoute,
  CompiledRoute,
  HandlerParams,
} from "./handler/types";
import { Def } from "./handler/util";

// Export all types
export type * from "./handler";
export type * from "./handler/types";
export type * from "./parser";
export type * from "./parser/types";

export function route<TPath extends string>(Path?: TPath) {
  return createBuilder<TPath>({ path: Path });
}

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
  > extends infer TParamsIn extends {}
    ? TParamsIn
    : InferPart<TRoute, "InferredParams">;
  export type InferParamsOut<TRoute extends AnyCompiledRoute> = InferPart<
    TRoute,
    "ParamsOut"
  > extends infer TParamsOut extends {}
    ? TParamsOut
    : InferPart<TRoute, "InferredParams">;

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
    ParamsIn: unknown extends TParams["ParamsIn"]
      ? [TParams["InferredParams"]] extends [never]
        ? unknown
        : TParams["InferredParams"]
      : TParams["ParamsIn"];
    ParamsOut: unknown extends TParams["ParamsOut"]
      ? [TParams["InferredParams"]] extends [never]
        ? unknown
        : TParams["InferredParams"]
      : TParams["ParamsOut"];
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

  export const getPath = <T extends AnyCompiledRoute>(
    route: T
  ): InferPath<T> => {
    return route[Def].path;
  };

  /**
   * Gets all operation keys in the form `{METHOD} {pathPattern}`.
   * Will return an empty array if either `methods` or `path` are undefined.
   */
  export const getOperationKeys = <T extends AnyCompiledRoute>(
    route: T
  ): InferPath<T> extends infer $Path extends string
    ? InferMethods<T> extends infer $Methods extends string
      ? Array<`${Uppercase<$Methods>} ${$Path}`>
      : []
    : [] => {
    const methods = route[Def].methods;
    const path = route[Def].path;

    if (methods == null || path == null) return [] as any;

    return methods.map(
      (method: string) => `${method.toUpperCase()} ${path}`
    ) as any;
  };

  /**
   * Retrieves the methods registered on this route.
   */
  export const getMethods = <T extends AnyCompiledRoute>(
    route: T
  ): InferMethods<T>[] => {
    return route[Def]["methods"] ?? [];
  };
}
