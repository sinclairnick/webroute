import * as T from "@sinclair/typebox";
import { SchemaParser } from "../parser/types";
import { SchemaFormatter } from "../formatter/types";
import { SchemaDefOptions } from "../def/core";
import { SchemaDiscriminator } from "../discriminator/types";

export const TypeBoxParser = (): SchemaParser<T.TAnySchema> => {
  return {
    identifyType(schema) {
      const opts: SchemaDefOptions = {};

      if (schema.description) {
        opts.description = schema.description;
      }

      if (schema[T.OptionalKind] === "Optional") {
        opts.optional = true;
      }

      if (schema[T.ReadonlyKind] === "Readonly") {
        opts.readonly_ = true;
      }

      switch (schema[T.Kind]) {
        // Container
        case "Array": {
          return { ...opts, type: "array", element: schema.items };
        }
        case "Object": {
          return { ...opts, type: "object", properties: schema.properties };
        }
        case "Tuple": {
          return { ...opts, type: "tuple", entries: schema.items ?? [] };
        }
        case "Intersect": {
          return { ...opts, type: "intersection", members: schema.allOf ?? [] };
        }
        case "Union": {
          return { ...opts, type: "union", members: schema.anyOf ?? [] };
        }

        // Primitive
        case "String": {
          return { ...opts, type: "string" };
        }
        case "Number": {
          return { ...opts, type: "number" };
        }
        case "Boolean": {
          return { ...opts, type: "boolean" };
        }
        case "Symbol": {
          return { ...opts, type: "symbol" };
        }
        case "Null": {
          return { ...opts, type: "null" };
        }
        case "Undefined": {
          return { ...opts, type: "undefined" };
        }
        case "Any": {
          return { ...opts, type: "any" };
        }
      }

      return { ...opts, type: "unknown" };
    },
  };
};

export const TypeBoxFormatter = (): SchemaFormatter<T.TAnySchema> => {
  return {
    format(def) {
      let s: T.TAnySchema;

      switch (def.type) {
        case "object": {
          s = T.Object(def.properties, {
            additionalProperties: def.additionalProperties,
          });
          break;
        }
        case "array": {
          s = T.Array(def.element);
          break;
        }
        case "enum": {
          s = T.Enum(def.members);
          break;
        }
        case "function": {
          s = T.Function(def.parameters ?? [], def.result ?? T.Unknown());
          break;
        }
        case "intersection": {
          s = T.Intersect(def.members);
          break;
        }
        case "tuple": {
          s = T.Tuple(def.entries);
          break;
        }
        case "union": {
          s = T.Union(def.members);
          break;
        }

        // Primitive
        case "string": {
          s = T.String();
          break;
        }
        case "number": {
          s = T.Number();
          break;
        }
        case "boolean": {
          s = T.Boolean();
          break;
        }
        case "symbol": {
          s = T.Symbol();
          break;
        }
        case "undefined": {
          s = T.Undefined();
          break;
        }
        case "null": {
          s = T.Null();
          break;
        }
        case "any": {
          s = T.Any();
          break;
        }
        case "date": {
          s = T.Date();
          break;
        }
      }

      s ??= T.Unknown();

      if (def.optional) {
        s = T.Optional(s);
      }

      if (def.description) {
        s.description = def.description;
      }

      if (def.default_) {
        s.default = def.default_;
      }

      return s;
    },
  };
};

export const TypeBoxDiscriminator = (): SchemaDiscriminator<T.TAnySchema> => {
  return {
    isSchema: (schema): schema is T.TAnySchema =>
      typeof schema === "object" && T.Kind in schema,
  };
};
