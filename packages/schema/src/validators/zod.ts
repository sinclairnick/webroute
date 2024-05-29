import {
  AnyZodObject,
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodFunction,
  ZodIntersection,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodSymbol,
  ZodTuple,
  ZodType,
  ZodUndefined,
  ZodUnion,
  z,
} from "zod";
import { SchemaParser } from "../parser/types";
import { ValueConfig, ValueOptions, ValueSchemaMap } from "../typedef/types";
import { SchemaFormatter } from "../formatter/types";

type ZodValueSchemaMap = ValueSchemaMap<{
  any: ZodAny;
  array: ZodArray<any>;
  boolean: ZodBoolean;
  function: ZodFunction<any, any>;
  null: ZodNull;
  number: ZodNumber;
  object: AnyZodObject;
  string: ZodString;
  symbol: ZodSymbol;
  undefined: ZodUndefined;
  intersection: ZodIntersection<any, any>;
  tuple: ZodTuple;
  union: ZodUnion<any>;
  nullable: ZodNullable<any>;
  optional: ZodOptional<any>;
}>;

const TypeMap = [
  [ZodString, "string"],
  [ZodBoolean, "boolean"],
  [ZodObject, "object"],
  [ZodFunction, "function"],
  [ZodNumber, "number"],
  [ZodSymbol, "symbol"],
  [ZodArray, "array"],
  [ZodUndefined, "undefined"],
  [ZodNull, "null"],
  [ZodIntersection, "intersection"],
  [ZodUnion, "union"],
  [ZodTuple, "tuple"],
  [ZodAny, "any"],
  [ZodOptional, "optional"],
  [ZodNullable, "nullable"],
] as const;

export const ZodParser = (): SchemaParser<ZodType, ZodValueSchemaMap> => {
  return {
    identifyType(schema): ValueConfig {
      const opts: ValueOptions = {};

      if (schema._def.description) {
        opts.description = schema._def.description;
      }

      for (const [_Class, type] of TypeMap) {
        if (schema instanceof _Class) {
          return { ...opts, type };
        }
      }

      return { ...opts, type: "unknown" };
    },
    getArrayElement(val) {
      return val.element;
    },
    getObjectEntries(val) {
      return Object.entries(val.shape);
    },
    getOptionalMember(val) {
      return val._def.innerType;
    },
    getNullableMember(val) {
      return val._def.innerType;
    },
    getIntersectionMembers(val) {
      return [val._def.left, val._def.right];
    },
    getUnionMembers(val) {
      return val._def.options;
    },
    getTupleEntries(val) {
      return val._def.items;
    },
  };
};

export const ZodFormatter = (): SchemaFormatter<ZodType> => {
  return {
    formatDefault() {
      return z.any();
    },
    applyDecorators(schema, opts) {
      let s = schema;

      if (opts.nullable) {
        s = s.nullable();
      }

      if (opts.optional) {
        s = s.optional();
      }

      if (opts.description) {
        s = s.describe(opts.description);
      }

      if (opts.default_) {
        s = s.default(opts.default_);
      }

      return s;
    },
    formatAny() {
      return z.any();
    },
    formatArray(def) {
      return def.element.array();
    },
    formatObject(def) {
      return z.object(Object.fromEntries(def.entries));
    },
    formatUnion(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.members;
      return z.union([first, second, ...rest]);
    },
    formatIntersection(def) {
      // Satisfy TS
      const [first, second] = def.members;
      return z.intersection(first, second);
    },
    formatTuple(def) {
      // Satisfy TS
      const [first, second, ...rest] = def.entries;
      return z.tuple([first, second, ...rest]);
    },
    formatString() {
      return z.string();
    },
    formatNumber() {
      return z.number();
    },
    formatBoolean() {
      return z.boolean();
    },
    formatNull() {
      return z.null();
    },
    formatUndefined() {
      return z.undefined();
    },
    formatSymbol() {
      return z.symbol();
    },
    formatFunction() {
      return z.function();
    },
  };
};
