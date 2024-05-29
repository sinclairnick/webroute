import * as T from "@sinclair/typebox";
import { ValueConfig, ValueOptions, ValueSchemaMap } from "../typedef/types";
import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";

type TypeboxValueSchemaMap = ValueSchemaMap<{
  any: T.TAny;
  array: T.TArray;
  boolean: T.TBoolean;
  function: T.TFunction;
  null: T.TNull;
  number: T.TNumber;
  object: T.TObject;
  string: T.TString;
  symbol: T.TSymbol;
  undefined: T.TUndefined;
  intersection: T.TIntersect;
  tuple: T.TTuple;
  union: T.TUnion;
  optional: T.TOptional<any>;
}>;

const TypeMap = [
  ["String", "string"],
  ["Boolean", "boolean"],
  ["Object", "object"],
  ["Function", "function"],
  ["Number", "number"],
  ["Symbol", "symbol"],
  ["Array", "array"],
  ["Undefined", "undefined"],
  ["Null", "null"],
  ["Intersect", "intersection"],
  ["Union", "union"],
  ["Tuple", "tuple"],
  ["Any", "any"],
] as const;

export const TypeboxParser = (): SchemaParser<
  T.TAnySchema,
  TypeboxValueSchemaMap
> => {
  return {
    identifyType(schema): ValueConfig {
      const opts: ValueOptions = {};

      if (schema.description) {
        opts.description = schema.description;
      }

      if (schema[T.OptionalKind] === "Optional") {
        opts.optional = true;
      }

      for (const [kind, type] of TypeMap) {
        if (schema[T.Kind] === kind) {
          return { ...opts, type };
        }
      }

      return { ...opts, type: "unknown" };
    },
    getArrayElement(val) {
      return val.items;
    },
    getObjectEntries(val) {
      return Object.entries(val.properties);
    },
    getIntersectionMembers(val) {
      return val.allOf;
    },
    getUnionMembers(val) {
      return val.anyOf;
    },
    getTupleEntries(val) {
      return val.items ?? [];
    },
  };
};

export const TypeboxFormatter = (): SchemaFormatter<T.TAnySchema> => {
  return {
    formatDefault() {
      return T.Any();
    },
    applyDecorators(schema, opts) {
      let s = schema;

      if (opts.optional) {
        s = T.Optional(s);
      }

      if (opts.description) {
        s.description = opts.description;
      }

      if (opts.default_) {
        s.default = opts.default_;
      }

      return s;
    },
    formatAny() {
      return T.Any();
    },
    formatArray(def) {
      return T.Array(def.element);
    },
    formatObject(def) {
      return T.Object(Object.fromEntries(def.entries));
    },
    formatUnion(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.members;
      return T.Union([first, second, ...rest]);
    },
    formatIntersection(def) {
      // Satisfy TS
      const [first, second] = def.members;
      return T.Intersect([first, second]);
    },
    formatTuple(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.entries;
      return T.Tuple([first, second, ...rest]);
    },
    formatString() {
      return T.String();
    },
    formatNumber() {
      return T.Number();
    },
    formatBoolean() {
      return T.Boolean();
    },
    formatNull() {
      return T.Null();
    },
    formatUndefined() {
      return T.Undefined();
    },
    formatSymbol() {
      return T.Symbol();
    },
  };
};
