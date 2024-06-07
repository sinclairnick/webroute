import { InferParser, Parser } from "./validation/types";
import { getParseFn } from "./validation/validation";

export { createFormatter } from "./formatter/formatter";
export * from "./formatter/types";

export { createParser } from "./parser/parser";
export * from "./parser/types";

export type * from "./def/schema-def";
export type * from "./def/core";
export type * from "./def/schema-def";

export type Infer<T> = InferParser<T>["out"];
export type InferIn<T> = InferParser<T>["in"];
export type InferInOut<T> = InferParser<T>;

export const parse = <T extends Parser>(
  parser: T,
  value: unknown
): Infer<T> => {
  return getParseFn(parser)(value);
};
export { getParseFn, type ParseFn } from "./validation/validation";
export type { Parser } from "./validation/types";
