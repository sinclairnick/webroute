import { CompiledRoute } from "./types";

export const isCompiledRoute = (x: unknown): x is CompiledRoute<any> => {
  return (
    x != null &&
    typeof x === "function" &&
    (x as any).__harissaType === CompiledRouteSymbol
  );
};

export const CompiledRouteSymbol = Symbol("compiled-route");
