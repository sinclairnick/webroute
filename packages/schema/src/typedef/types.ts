export type PrimtiveValueType =
  | "string"
  | "boolean"
  | "number"
  | "symbol"
  | "null"
  | "undefined";

export type ComplexValueType = "object" | "function" | "array";

export type AbstractType =
  | "any"
  | "union"
  | "intersection"
  | "tuple"
  | "unknown"
  // Optional and nullable are not valid _output_ types
  | "optional"
  | "nullable";

export type ValueType = PrimtiveValueType | ComplexValueType | AbstractType;

export type ValueOptions = {
  optional?: boolean;
  nullable?: boolean;
  default_?: any;
  description?: string;
};

export type ValueConfig = { type: ValueType } & ValueOptions;

export type AnySchemaMap = {
  [Key in Exclude<ValueType, "unknown">]?: unknown;
};

export type ValueSchemaMap<T extends AnySchemaMap = AnySchemaMap> = T;

export type ObjectDef = {
  type: "object";
  entries: [string, SchemaDef][];
} & ValueOptions;

export type ArrayDef = {
  type: "array";
  element: SchemaDef;
} & ValueOptions;

export type TupleDef = {
  type: "tuple";
  entries: SchemaDef[];
} & ValueOptions;

export type UnionDef = {
  type: "union";
  members: SchemaDef[];
} & ValueOptions;

export type IntersectionDef = {
  type: "intersection";
  members: SchemaDef[];
} & ValueOptions;

export type StringDef = {
  type: Extract<PrimtiveValueType, "string">;
} & ValueOptions;

export type NumberDef = {
  type: Extract<PrimtiveValueType, "number">;
} & ValueOptions;

export type BooleanDef = {
  type: Extract<PrimtiveValueType, "boolean">;
} & ValueOptions;

export type NullDef = {
  type: Extract<PrimtiveValueType, "null">;
} & ValueOptions;

export type SymbolDef = {
  type: Extract<PrimtiveValueType, "symbol">;
} & ValueOptions;

export type UndefinedDef = {
  type: Extract<PrimtiveValueType, "undefined">;
} & ValueOptions;

export type FunctionDef = {
  type: Extract<ComplexValueType, "function">;
} & ValueOptions;

export type AnyDef = {
  type: Extract<AbstractType, "any">;
} & ValueOptions;

export type UnkownDef = {
  type: Extract<AbstractType, "unknown">;
} & ValueOptions;

export type SchemaDef =
  | ArrayDef
  | ObjectDef
  | TupleDef
  | UnionDef
  | IntersectionDef
  | StringDef
  | NumberDef
  | BooleanDef
  | NullDef
  | SymbolDef
  | UndefinedDef
  | FunctionDef
  | AnyDef
  | UnkownDef;

export type SchemaDefType = SchemaDef["type"];
