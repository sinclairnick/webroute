import { SchemaDefOptions } from "./core";
import {
  AnyDef,
  ArrayDef,
  BooleanDef,
  DateDef,
  EnumDef,
  FunctionDef,
  IntersectionDef,
  NullDef,
  NumberDef,
  ObjectDef,
  StringDef,
  SymbolDef,
  TupleDef,
  UndefinedDef,
  UnionDef,
  UnknownDef,
} from "./schema-def";

export type ObjectDefRaw<TAnySchema = unknown> = Omit<
  ObjectDef,
  "properties"
> & {
  properties: Record<PropertyKey, TAnySchema>;
};

export type ArrayDefRaw<TAnySchema = unknown> = Omit<ArrayDef, "element"> & {
  element: TAnySchema;
};

export type TupleDefRaw<TAnySchema = unknown> = Omit<TupleDef, "entries"> & {
  entries: TAnySchema[];
};

export type UnionDefRaw<TAnySchema = unknown> = Omit<UnionDef, "members"> & {
  members: TAnySchema[];
};

export type IntersectionDefRaw<TAnySchema = unknown> = Omit<
  IntersectionDef,
  "members"
> & {
  members: TAnySchema[];
};

export type FunctionDefRaw<TAnySchema = unknown> = Omit<
  FunctionDef,
  "parameters" | "result"
> & {
  parameters?: TAnySchema[];
  result?: TAnySchema;
};

/**
 * Unwrap is a special type which allows picking inner types.
 *
 * Any options provided will be shallow merged with options subsequenty
 * inner type extractions.
 */
export type UnwrapDefRaw<TAnySchema = unknown> = {
  type: "unwrap";
  innerType: TAnySchema;
} & SchemaDefOptions;

export type EnumDefRaw = EnumDef;
export type StringDefRaw = StringDef;
export type NumberDefRaw = NumberDef;
export type BooleanDefRaw = BooleanDef;
export type NullDefRaw = NullDef;
export type SymbolDefRaw = SymbolDef;
export type UndefinedDefRaw = UndefinedDef;
export type AnyDefRaw = AnyDef;
export type UnknownDefRaw = UnknownDef;
export type DateDefRaw = DateDef;

// "Raw" defs are defs where referenced/nested schema are unprocessed, raw
// schema.
export type DefRaw<T = unknown> =
  | ObjectDefRaw<T>
  | ArrayDefRaw<T>
  | TupleDefRaw<T>
  | UnionDefRaw<T>
  | IntersectionDefRaw<T>
  | FunctionDefRaw<T>
  | UnwrapDefRaw<T>
  | StringDefRaw
  | NumberDefRaw
  | BooleanDefRaw
  | NullDefRaw
  | SymbolDefRaw
  | UndefinedDefRaw
  | AnyDefRaw
  | UnknownDefRaw
  | DateDef
  | EnumDef;
