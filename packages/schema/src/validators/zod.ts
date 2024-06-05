import {
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodEffects,
  ZodEnum,
  ZodIntersection,
  ZodNativeEnum,
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
import { SchemaFormatter } from "../formatter/types";
import { SchemaDefOptions } from "../def/core";
import { SchemaDiscriminator } from "../discriminator/types";

export type AnyZodType = ZodType;

export const ZodParser = (): SchemaParser<AnyZodType> => {
  return {
    identifyType(schema) {
      const opts: SchemaDefOptions = {};

      if (schema._def.description) {
        opts.description = schema._def.description;
      }

      // Wrapped types
      if (schema instanceof ZodEffects) {
        const innerType = schema._def.schema;
        return { ...opts, type: "unwrap", innerType };
      }

      if (schema instanceof ZodOptional) {
        const innerType = schema._def.innerType;
        return { ...opts, optional: true, type: "unwrap", innerType };
      }

      if (schema instanceof ZodNullable) {
        const innerType = schema._def.innerType;
        return { ...opts, nullable: true, type: "unwrap", innerType };
      }

      // Container types
      if (schema instanceof ZodObject) {
        return {
          ...opts,
          type: "object",
          properties: schema.shape,
          additionalProperties: schema._def.unknownKeys === "passthrough",
        };
      }

      if (schema instanceof ZodArray) {
        return { ...opts, type: "array", element: schema.element };
      }

      if (schema instanceof ZodTuple) {
        return { ...opts, type: "tuple", entries: schema._def.items };
      }

      if (schema instanceof ZodIntersection) {
        return {
          ...opts,
          type: "intersection",
          members: [schema._def.left, schema._def.right],
        };
      }

      if (schema instanceof ZodUnion) {
        return { ...opts, type: "union", members: schema._def.options };
      }

      if (schema instanceof ZodEnum || schema instanceof ZodNativeEnum) {
        return { ...opts, type: "enum", members: schema.enum };
      }

      // Primitive types
      if (schema instanceof ZodString) {
        return { ...opts, type: "string" };
      }

      if (schema instanceof ZodNumber) {
        return { ...opts, type: "number" };
      }

      if (schema instanceof ZodBoolean) {
        return { ...opts, type: "boolean" };
      }

      if (schema instanceof ZodNull) {
        return { ...opts, type: "null" };
      }

      if (schema instanceof ZodUndefined) {
        return { ...opts, type: "undefined" };
      }

      if (schema instanceof ZodSymbol) {
        return { ...opts, type: "symbol" };
      }

      if (schema instanceof ZodAny) {
        return { ...opts, type: "any" };
      }

      if (schema instanceof ZodDate) {
        return { ...opts, type: "date" };
      }

      return { ...opts, type: "unknown" };
    },
  };
};

export const ZodFormatter = (): SchemaFormatter<AnyZodType> => {
  return {
    format(def) {
      let s: ZodType;

      switch (def.type) {
        // Primitives
        case "string": {
          s = z.string();
          break;
        }
        case "number": {
          s = z.number();
          break;
        }
        case "boolean": {
          s = z.boolean();
          break;
        }
        case "symbol": {
          s = z.symbol();
          break;
        }
        case "any": {
          s = z.any();
          break;
        }
        case "enum": {
          const [first, ...rest] = Object.values(def.members);
          s = z.enum([first, ...rest]);
          break;
        }
        case "date": {
          s = z.date();
          break;
        }
        case "null": {
          s = z.null();
          break;
        }
        case "undefined": {
          s = z.undefined();
          break;
        }

        // Wrappers
        case "object": {
          s = z.object(def.properties);

          if (def.additionalProperties) {
            s = (s as any).passthrough();
          }

          break;
        }
        case "array": {
          s = z.array(def.element);
          break;
        }
        case "function": {
          s = z.function();

          if (def.parameters) {
            s = (s as any).args(...def.parameters);
          }

          if (def.result) {
            s = (s as any).returns(def.result);
          }

          break;
        }
        case "intersection": {
          const [first, second] = def.members;
          s = z.intersection(first, second);
          break;
        }
        case "union": {
          const [first, second, ...rest] = def.members;
          s = z.union([first, second, ...rest]);
          break;
        }
        case "tuple": {
          const [first, ...rest] = def.entries;
          s = z.tuple([first, ...rest]);
          break;
        }
      }

      s ??= z.unknown();

      if (def.nullable) {
        s = s.nullable();
      }

      if (def.optional) {
        s = s.optional();
      }

      if (def.description) {
        s = s.describe(def.description);
      }

      if (def.default_) {
        s = s.default(def.default_);
      }

      return s;
    },
  };
};

export const ZodDiscriminator = (): SchemaDiscriminator<AnyZodType> => {
  return {
    isSchema: (schema): schema is AnyZodType =>
      typeof schema === "object" && "_def" in schema,
  };
};
