import { DefRaw } from "../def/raw-def";

export interface SchemaParser<TSchemaAny = unknown> {
  /**
   * Given the input value, return what type it is.
   */
  identifyType: (val: TSchemaAny) => DefRaw<TSchemaAny> | undefined;
}

export type InferParserSchemaAny<T extends SchemaParser> =
  T extends SchemaParser<infer TSchema> ? TSchema : never;
