export type PrimitiveType =
  | "string"
  | "boolean"
  | "number"
  | "symbol"
  | "null"
  | "undefined"
  | "date"
  | "any"
  | "unknown";

export type ContainerType =
  | "object"
  | "function"
  | "array"
  | "union"
  | "intersection"
  | "tuple"
  | "enum";

export type SchemaType = PrimitiveType | ContainerType;

// TODO: Use json schema options here, from TypeBox
export type SchemaDefOptions = {
  optional?: boolean;
  nullable?: boolean;
  description?: string;
  default_?: unknown;
  readonly_?: boolean;
};
