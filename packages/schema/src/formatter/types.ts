import {
  AnyDef,
  ArrayDef,
  BooleanDef,
  FunctionDef,
  IntersectionDef,
  NullDef,
  NumberDef,
  ObjectDef,
  SchemaDef,
  StringDef,
  SymbolDef,
  TupleDef,
  UndefinedDef,
  UnionDef,
  ValueOptions,
} from "../typedef/types";

// "Formatted" defs are just type defs with their descendents
// already formatted to the output type
export type FormattedUnionDef<TSchemaAny> = Omit<UnionDef, "members"> & {
  members: TSchemaAny[];
};
export type FormattedIntersectionDef<TSchemaAny> = Omit<
  IntersectionDef,
  "members"
> & {
  members: TSchemaAny[];
};
export type FormattedTupleDef<TSchemaAny> = Omit<TupleDef, "entries"> & {
  entries: TSchemaAny[];
};
export type FormattedArrayDef<TSchemaAny> = Omit<ArrayDef, "element"> & {
  element: TSchemaAny;
};
export type FormattedObjectDef<TSchemaAny> = Omit<ObjectDef, "entries"> & {
  entries: [string, TSchemaAny][];
};

export interface SchemaFormatter<TSchemaAny = unknown> {
  /** 
	 * The default catch-all schema to use if a formatter was not provided.
	 * This will likely be an `any` or `unknown` type.
	 */
  formatDefault: (def: SchemaDef) => TSchemaAny;

  // Abstract
  formatAny?: (def: AnyDef) => TSchemaAny;
  formatUnion?: (def: FormattedUnionDef<TSchemaAny>) => TSchemaAny;
  formatIntersection?: (
    def: FormattedIntersectionDef<TSchemaAny>
  ) => TSchemaAny;
  formatTuple?: (def: FormattedTupleDef<TSchemaAny>) => TSchemaAny;

  // Primitive
  formatString?: (def: StringDef) => TSchemaAny;
  formatNumber?: (def: NumberDef) => TSchemaAny;
  formatBoolean?: (def: BooleanDef) => TSchemaAny;
  formatSymbol?: (def: SymbolDef) => TSchemaAny;
  formatNull?: (def: NullDef) => TSchemaAny;
  formatUndefined?: (def: UndefinedDef) => TSchemaAny;

  // Complex
  formatObject?: (def: FormattedObjectDef<TSchemaAny>) => TSchemaAny;
  formatArray?: (def: FormattedArrayDef<TSchemaAny>) => TSchemaAny;
  formatFunction?: (def: FunctionDef) => TSchemaAny;

  // Decorators
  /**
   * Optionally apply "decorators" like optional, nullable, defaults and descriptions
   */
  applyDecorators?: (schema: TSchemaAny, opts: ValueOptions) => TSchemaAny;
}

export type InferFormatterSchemaAny<T extends SchemaFormatter> =
  T extends SchemaFormatter<infer TSchemaAny> ? TSchemaAny : never;
