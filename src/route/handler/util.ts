import { CompiledRoute } from "./types";

export const isCompiledRoute = (x: unknown): x is CompiledRoute<any> => {
  return x != null && typeof x === "function" && (x as any).__isCompiledRoute__;
};
