import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";
import { SchemaDefOptions } from "../def/core";
import * as Y from "yup";
import { SchemaDiscriminator } from "../discriminator/types";
import { createJsonSchemaFormatter } from "../util";

export type AnyYupSchema =
  | Y.AnyObjectSchema
  | Y.NumberSchema<any, any, any, any>
  | Y.StringSchema<any, any, any, any>
  | Y.BooleanSchema<any, any, any, any>
  | Y.ArraySchema<any, any, any, any>
  | Y.DateSchema<any, any, any, any>
  | Y.TupleSchema<any, any, any, any>
  | Y.DateSchema<any, any, any, any>
  | Y.MixedSchema<any, any, any, any>;

export const YupParser = (): SchemaParser<any> => {
  return {
    identifyType(schema) {
      const opts: SchemaDefOptions = {};

      if (schema.spec.nullable) {
        opts.nullable = true;
      }

      if (schema instanceof Y.ObjectSchema) {
        return { ...opts, type: "object", properties: schema.fields };
      }

      if (schema instanceof Y.ArraySchema) {
        return { ...opts, type: "array", element: schema.spec.types };
      }

      // Primitives
      if (schema instanceof Y.StringSchema) {
        return { ...opts, type: "string" };
      }

      if (schema instanceof Y.NumberSchema) {
        return { ...opts, type: "number" };
      }

      if (schema instanceof Y.BooleanSchema) {
        return { ...opts, type: "boolean" };
      }

      if (schema instanceof Y.DateSchema) {
        return { ...opts, type: "date" };
      }

      if (schema instanceof Y.TupleSchema) {
        return { ...opts, type: "tuple", entries: schema.spec.types as any };
      }

      if (schema instanceof Y.MixedSchema) {
        const { _whitelist, _blacklist } = schema as any;

        // If no white or blacklist, and nullable -> any
        if (_whitelist?.size === 0 && _blacklist.size === 0 && opts.nullable) {
          return { ...opts, type: "any" };
        }

        const options = Array.from(_whitelist).map((key) => [key, key]);

        return {
          ...opts,
          type: "enum",
          members: Object.fromEntries(options),
        };
      }

      return { ...opts, type: "unknown" };
    },
  };
};

export const YupFormatter = (): SchemaFormatter<AnyYupSchema> => {
  return {
    format(def) {
      let s: AnyYupSchema;

      switch (def.type) {
        case "object": {
          s = Y.object(def.properties);
          break;
        }
        case "array": {
          s = Y.array(def.element);
          break;
        }
        case "enum": {
          s = Y.mixed().oneOf(Object.values(def.members));
          break;
        }
        case "tuple": {
          const [first, ...rest] = def.entries;
          s = Y.tuple([first, ...rest]);
          break;
        }

        // Primitive
        case "string": {
          s = Y.string();
          break;
        }
        case "number": {
          s = Y.number();
          break;
        }
        case "boolean": {
          s = Y.boolean();
          break;
        }
        case "any": {
          s = Y.mixed().nullable();
          break;
        }
        case "date": {
          s = Y.date();
          break;
        }
      }

      s ??= Y.mixed();

      if (def.optional) {
        s = s.optional();
      }

      if (def.nullable) {
        s = s.nullable();
      }

      if (def.description) {
        s.meta({ description: def.description });
      }

      return s;
    },
  };
};

export const YupDiscriminator = (): SchemaDiscriminator<AnyYupSchema> => {
  return {
    isSchema: (schema): schema is AnyYupSchema =>
      typeof schema === "object" && "__isYupSchema__" in schema,
  };
};

export const YupJsonSchemaFormatter = () =>
  createJsonSchemaFormatter(YupParser());
