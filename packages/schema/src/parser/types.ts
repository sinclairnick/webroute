import { ValueSchemaMap, ValueConfig } from "../typedef/types";

export interface SchemaParser<
  TSchemaAny = unknown,
  TSchemaMap extends Partial<ValueSchemaMap> = Partial<ValueSchemaMap>
> {
  /**
   * Given the input value, return what type it is.
   *
   * If nothing is returned, this value will be skipped over or replaced with `any`.
   */
  identifyType: (val: TSchemaAny) => ValueConfig | undefined;

  /**
   * Given the input object type, return an array of all entries
   * in [key, value][] form.
   */
  getObjectEntries: (val: TSchemaMap["object"]) => Array<[string, TSchemaAny]>;

  /**
   * Given the input array schema, return the element type.
   */
  getArrayElement: (val: TSchemaMap["array"]) => TSchemaAny | undefined;

  // Abstract
  getOptionalMember?: (val: TSchemaMap["optional"]) => TSchemaAny | undefined;
  getNullableMember?: (val: TSchemaMap["nullable"]) => TSchemaAny | undefined;
  getUnionMembers?: (val: TSchemaMap["union"]) => TSchemaAny[];
  getIntersectionMembers?: (
    val: TSchemaMap["intersection"]
  ) => TSchemaAny[] | undefined;
  getTupleEntries?: (val: TSchemaMap["tuple"]) => TSchemaAny[];
}

export type InferParserSchemaAny<T extends SchemaParser> =
  T extends SchemaParser<infer TSchema, any> ? TSchema : never;
