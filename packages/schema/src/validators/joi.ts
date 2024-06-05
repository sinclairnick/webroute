import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";
import { SchemaDefOptions } from "../def/core";
import * as J from "joi";
import { SchemaDiscriminator } from "../discriminator/types";

export type AnyJoiSchema =
  | J.AnySchema
  | J.ArraySchema
  | J.ObjectSchema
  | J.NumberSchema
  | J.BooleanSchema
  | J.SymbolSchema
  | J.DateSchema
  | J.StringSchema
  | J.AlternativesSchema;

export const JoiParser = (): SchemaParser<AnyJoiSchema> => {
  return {
    identifyType(schema) {
      const opts: SchemaDefOptions = {};

      const type = (schema as any)._definition?.type ?? (schema as any).type;

      const flags = schema._flags;
      const valids: { _values: Set<any> } = (schema as any)._valids;

      if (flags.presence === "optional") {
        opts.optional = true;
      }

      if (valids?._values?.has(null)) {
        opts.nullable = true;
      }

      switch (type) {
        case "string": {
          const valids = (schema as any)._valids;
          if (valids) {
            const members = Object.fromEntries(
              Array.from(valids._values).map((key) => [key, key])
            );

            return { ...opts, type: "enum", members };
          }
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
        case "date": {
          return { ...opts, type: "date" };
        }
        case "any": {
          // If J.any().valid(null) -> type is `null`
          if (valids?._values.has(null) && valids?._values.size === 1) {
            const { nullable, ..._opts } = opts; // Strip nullable

            return { ..._opts, type: "null" };
          }

          return { ...opts, type: "any" };
        }

        // Containers
        case "object": {
          const properties = Object.fromEntries(
            schema.$_terms.keys.map(({ key, schema }: any) => [key, schema])
          );

          return { ...opts, type: "object", properties };
        }
        case "array": {
          const items = schema.$_terms.items;
          // Convert mixed array elements into an array of unions
          const element = items.length > 1 ? J.alternatives(items) : items[0];

          return { ...opts, type: "array", element };
        }
        case "alternatives": {
          const members = schema.$_terms.matches.map((x: any) => x.schema);
          const setType =
            schema._flags.match === "all"
              ? ("intersection" as const)
              : ("union" as const);

          return { ...opts, type: setType, members };
        }
      }

      return { ...opts, type: "unknown" };
    },
  };
};

export const JoiFormatter = (): SchemaFormatter<AnyJoiSchema> => {
  return {
    format(def) {
      let s: AnyJoiSchema;

      switch (def.type) {
        case "object": {
          s = J.object(def.properties);
          break;
        }
        case "array": {
          s = J.array().items(def.element);
          break;
        }
        case "enum": {
          s = J.string().valid(...Object.values(def.members));
          break;
        }
        case "function": {
          s = J.function();

          if (def.parameters != null) {
            s = (s as any).arity(def.parameters.length);
          }
          break;
        }
        case "intersection": {
          s = J.alternatives(...def.members).match("all");
          break;
        }
        case "union": {
          s = J.alternatives(...def.members).match("any");
          break;
        }

        // Primitive
        case "string": {
          s = J.string();
          break;
        }
        case "number": {
          s = J.number();
          break;
        }
        case "boolean": {
          s = J.boolean();
          break;
        }
        case "symbol": {
          s = J.symbol();
          break;
        }
        case "null": {
          s = J.any().valid(null);
          break;
        }
        case "any": {
          s = J.any();
          break;
        }
        case "date": {
          s = J.date();
          break;
        }
      }

      s ??= J.any().valid();

      if (def.optional) {
        s = s.optional();
      }

      if (def.nullable) {
        s = s.allow(null);
      }

      return s;
    },
  };
};

export const JoiDiscriminator = (): SchemaDiscriminator<AnyJoiSchema> => {
  return {
    isSchema: (schema): schema is AnyJoiSchema =>
      typeof schema === "object" && "_flags" in schema,
  };
};
