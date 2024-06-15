import { PrimitiveType, SchemaDefOptions } from "./core";

export type ObjectDef = {
  type: "object";
  properties: Record<PropertyKey, SchemaDef>;
  additionalProperties?: boolean;
} & SchemaDefOptions;

export type ArrayDef = {
  type: "array";
  element: SchemaDef;
} & SchemaDefOptions;

export type TupleDef = {
  type: "tuple";
  entries: SchemaDef[];
} & SchemaDefOptions;

export type UnionDef = {
  type: "union";
  members: SchemaDef[];
} & SchemaDefOptions;

export type IntersectionDef = {
  type: "intersection";
  members: SchemaDef[];
} & SchemaDefOptions;

export type EnumDef = {
  type: "enum";
  members: Record<string, any>;
} & SchemaDefOptions;

export type FunctionDef = {
  type: "function";
  parameters?: SchemaDef[];
  result?: SchemaDef;
} & SchemaDefOptions;

export type StringDef = {
  type: Extract<PrimitiveType, "string">;
  regex?: RegExp | string;
  minLength?: number;
  maxLength?: number;
} & SchemaDefOptions;

export type NumberDef = {
  type: Extract<PrimitiveType, "number">;
  min?: number;
  max?: number;
} & SchemaDefOptions;

export type BooleanDef = {
  type: Extract<PrimitiveType, "boolean">;
} & SchemaDefOptions;

export type DateDef = {
  type: Extract<PrimitiveType, "date">;
} & SchemaDefOptions;

export type NullDef = {
  type: Extract<PrimitiveType, "null">;
} & SchemaDefOptions;

export type SymbolDef = {
  type: Extract<PrimitiveType, "symbol">;
} & SchemaDefOptions;

export type UndefinedDef = {
  type: Extract<PrimitiveType, "undefined">;
} & SchemaDefOptions;

export type AnyDef = {
  type: Extract<PrimitiveType, "any">;
} & SchemaDefOptions;

export type UnknownDef = {
  type: Extract<PrimitiveType, "unknown">;
} & SchemaDefOptions;

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
  | UnknownDef
  | DateDef
  | EnumDef;

export type SchemaDefType = SchemaDef["type"];
