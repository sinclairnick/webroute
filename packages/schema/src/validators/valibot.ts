import * as v from "valibot";
import { SchemaParser } from "../parser/types";
import { ValueConfig, ValueOptions, ValueSchemaMap } from "../typedef/types";
import { SchemaFormatter } from "../formatter/types";

type ValibotSchemaMap = ValueSchemaMap<{
  any: v.AnySchema;
  array: v.ArraySchema<any, any>;
  boolean: v.BooleanSchema<any>;
  function: v.FunctionReference<any, any>;
  null: v.NullSchema<any>;
  number: v.NumberSchema<any>;
  object: v.ObjectSchema<any, any>;
  string: v.StringSchema<any>;
  symbol: v.SymbolSchema<any>;
  undefined: v.UndefinedSchema<any>;
  intersection: v.IntersectSchema<any, any>;
  tuple: v.TupleSchema<any, any>;
  union: v.UnionSchema<any, any>;
  nullable: v.NullableSchema<any, any>;
  optional: v.OptionalSchema<any, any>;
}>;

export const ValibotParser = (): SchemaParser<
  v.BaseSchema<any, any, any>,
  ValibotSchemaMap
> => {
  return {
    identifyType(schema): ValueConfig {
      const opts: ValueOptions = {};

      switch (schema.type) {
        case "string":
        case "boolean":
        case "object":
        case "number":
        case "symbol":
        case "array":
        case "undefined":
        case "null":
        case "union":
        case "any":
        case "tuple":
        case "optional":
        case "nullable":
        case "function": {
          return {
            ...opts,
            type: schema.type,
          };
        }
        case "intersect": {
          return {
            ...opts,
            type: "intersection",
          };
        }
      }

      return { ...opts, type: "unknown" };
    },
    getArrayElement(val) {
      return val.item;
    },
    getObjectEntries(val) {
      return Object.entries(val.entries);
    },
    getOptionalMember(val) {
      return val.wrapped;
    },
    getNullableMember(val) {
      return val.wrapped;
    },
    getIntersectionMembers(val) {
      return val.options;
    },
    getUnionMembers(val) {
      return val.options;
    },
    getTupleEntries(val) {
      return val.items;
    },
  };
};

export const ValibotFormatter = (): SchemaFormatter<
  v.BaseSchema<any, any, any>
> => {
  return {
    formatDefault() {
      return v.any();
    },
    applyDecorators(schema, opts) {
      let s = schema;

      if (opts.optional) {
        s = v.optional(s, opts.default_);
      }

      if (opts.nullable) {
        s = v.nullable(s, opts.default_);
      }

      return s;
    },
    formatAny() {
      return v.any();
    },
    formatArray(def) {
      return v.array(def.element);
    },
    formatBoolean(def) {
      return v.boolean();
    },
    formatIntersection(def) {
      return v.intersect(def.members);
    },
    formatNull() {
      return v.null_();
    },
    formatUndefined() {
      return v.undefined_();
    },
    formatNumber() {
      return v.number();
    },
    formatObject(def) {
      return v.object(Object.fromEntries(def.entries));
    },
    formatString() {
      return v.string();
    },
    formatSymbol() {
      return v.symbol();
    },
    formatTuple(def) {
      return v.tuple(def.entries);
    },
    formatUnion(def) {
      return v.union(def.members);
    },
  };
};
