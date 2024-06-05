import { DefRaw, UnwrapDefRaw } from "../def/raw-def";

/**
 * A definition specifying how to recreate a schema given a schema definition.
 */
export type SchemaFormatter<TSchemaAny = unknown> = {
  format: (def: Exclude<DefRaw<TSchemaAny>, UnwrapDefRaw>) => TSchemaAny;
};

export type InferFormatterSchemaAny<T extends SchemaFormatter> =
  T extends SchemaFormatter<infer TSchemaAny> ? TSchemaAny : never;
