import * as v from "valibot";
import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";
import { SchemaDefOptions } from "../def/core";
import { SchemaDiscriminator } from "../discriminator/types";
import { createJsonSchemaFormatter } from "../util";

export type AnyValibotSchema =
  | v.AnySchema
  | v.ArraySchema<any, any>
  | v.BooleanSchema<any>
  | v.NullSchema<any>
  | v.NumberSchema<any>
  | v.ObjectSchema<any, any>
  | v.StringSchema<any>
  | v.SymbolSchema<any>
  | v.UndefinedSchema<any>
  | v.IntersectSchema<any, any>
  | v.TupleSchema<any, any>
  | v.UnionSchema<any, any>
  | v.NullableSchema<any, any>
  | v.OptionalSchema<any, any>
  | v.DateSchema<any>
  | v.UnknownSchema
  | v.EnumSchema<any, any>;

export const ValibotParser = (): SchemaParser<AnyValibotSchema> => {
  return {
    identifyType(schema) {
      const opts: SchemaDefOptions = {};

      switch (schema.type) {
        // Container types
        case "object": {
          return { ...opts, type: "object", properties: schema.entries };
        }
        case "array": {
          return { ...opts, type: "array", element: schema.item };
        }
        case "union": {
          return { ...opts, type: "union", members: schema.options };
        }
        case "intersect": {
          return { ...opts, type: "intersection", members: schema.options };
        }
        case "tuple": {
          return { ...opts, type: "tuple", entries: schema.items };
        }

        // Primitives
        case "string": {
          return { ...opts, type: "string" };
        }
        case "number": {
          return { ...opts, type: "number" };
        }
        case "boolean": {
          return { ...opts, type: "boolean" };
        }
        case "symbol": {
          return { ...opts, type: "symbol" };
        }
        case "undefined": {
          return { ...opts, type: "undefined" };
        }
        case "null": {
          return { ...opts, type: "null" };
        }
        case "any": {
          return { ...opts, type: "any" };
        }

        // Wrapped types
        case "optional": {
          return {
            ...opts,
            innerType: schema.wrapped,
            type: "unwrap",
            optional: true,
          };
        }
        case "nullable": {
          return {
            ...opts,
            innerType: schema.wrapped,
            type: "unwrap",
            nullable: true,
          };
        }
      }
    },
  };
};

export const ValibotFormatter = (): SchemaFormatter<
  v.BaseSchema<any, any, any>
> => {
  return {
    format(def) {
      let s: AnyValibotSchema;

      switch (def.type) {
        // Primitives
        case "number": {
          s = v.number();
          break;
        }
        case "boolean": {
          s = v.boolean();
          break;
        }
        case "string": {
          s = v.string();
          break;
        }
        case "undefined": {
          s = v.undefined_();
          break;
        }
        case "null": {
          s = v.null_();
          break;
        }
        case "any": {
          s = v.any();
          break;
        }
        case "date": {
          s = v.date();
          break;
        }
        case "symbol": {
          s = v.symbol();
          break;
        }

        // Containers
        case "object": {
          s = v.object(def.properties);
          break;
        }
        case "array": {
          s = v.array(def.element);
          break;
        }
        case "enum": {
          s = v.enum_(def.members);
          break;
        }
        case "tuple": {
          s = v.tuple(def.entries);
          break;
        }
        case "intersection": {
          s = v.intersect(def.members);
          break;
        }
        case "union": {
          s = v.union(def.members);
          break;
        }
      }

      s ??= v.unknown();

      if (def.optional) {
        s = v.optional(s);
      }
      if (def.nullable) {
        s = v.nullable(s);
      }

      return s;
    },
  };
};

export const ValibotDiscriminator =
  (): SchemaDiscriminator<AnyValibotSchema> => {
    return {
      isSchema: (schema): schema is AnyValibotSchema =>
        typeof schema === "object" && "async" in schema,
    };
  };

export const ValibotJsonSchemaFormatter = () =>
  createJsonSchemaFormatter(ValibotParser());
