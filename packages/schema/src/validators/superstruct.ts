import * as S from "superstruct";
import { ValueConfig, ValueOptions, ValueSchemaMap } from "../typedef/types";
import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";

type SuperstructValueSchemaMap = ValueSchemaMap<{
  any: S.Struct<any>;
  array: S.Struct<any[], any>;
  boolean: S.Struct<boolean, any>;
  function: S.Struct<Function, any>;
  number: S.Struct<number, any>;
  object: S.Struct<Record<string, any>, any>;
  string: S.Struct<string, any>;
  intersection: S.Struct<[any, ...any[]], any>;
  tuple: S.Struct<[any, ...any[]], any>;
  union: S.Struct<[any, ...any[]], any>;
  optional: S.Struct<any, any>;
  nullable: S.Struct<any, any>;
}>;

const TypeMap = [
  ["string", "string"],
  ["boolean", "boolean"],
  ["object", "object"],
  ["func", "function"],
  ["number", "number"],
  ["array", "array"],
  ["intersection", "intersection"],
  ["union", "union"],
  ["tuple", "tuple"],
  ["any", "any"],
] as const;

export const SupertstructParser = (): SchemaParser<
  S.Struct<any, any>,
  SuperstructValueSchemaMap
> => {
  return {
    identifyType(schema): ValueConfig {
      const opts: ValueOptions = {};

      for (const [sType, type] of TypeMap) {
        if (schema.type === sType) {
          return { ...opts, type };
        }
      }

      return { ...opts, type: "unknown" };
    },
    getArrayElement(val) {
      return val.schema;
    },
    getObjectEntries(val) {
      return Object.entries(val.schema);
    },
    getIntersectionMembers(val) {
      return val.schema;
    },
    getUnionMembers(val) {
      return val.schema;
    },
    getTupleEntries(val) {
      return val.schema;
    },
    getOptionalMember(val) {
      return val.schema;
    },
    getNullableMember(val) {
      return val.schema;
    },
  };
};

export const SuperstructFormatter = (): SchemaFormatter<S.Struct<any, any>> => {
  return {
    formatDefault() {
      return S.any();
    },
    applyDecorators(schema, opts) {
      let s = schema;

      if (opts.nullable) {
        s = S.nullable(s);
      }

      if (opts.optional) {
        s = S.optional(s);
      }

      if (opts.default_) {
        s = S.defaulted(s, opts.default_);
      }

      return s;
    },
    formatAny() {
      return S.any();
    },
    formatArray(def) {
      return S.array(def.element);
    },
    formatObject(def) {
      return S.object(Object.fromEntries(def.entries));
    },
    formatUnion(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.members;
      return S.union([first, second, ...rest]);
    },
    formatIntersection(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.members;
      return S.intersection([first, second, ...rest]);
    },
    formatTuple(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.entries;
      return S.tuple([first, second, ...rest]);
    },
    formatString() {
      return S.string();
    },
    formatNumber() {
      return S.number();
    },
    formatBoolean() {
      return S.boolean();
    },
    formatFunction() {
      return S.func();
    },
  };
};
