import type { oas31 } from "openapi3-ts";
import { SchemaDef, SchemaDefType, ValueConfig } from "../typedef/types";

type JsonSchemaType = oas31.SchemaObjectType;

const ParseToSchemaType = {
  any: ["string", "number", "boolean", "array", "object", "null"],
  array: "array",
  boolean: "boolean",
  null: "null",
  number: "number",
  object: "object",
  string: "string",
  function: [],
  undefined: [],
  unknown: [],
  symbol: "string",
  tuple: "array",
} satisfies Partial<Record<SchemaDefType, JsonSchemaType[] | JsonSchemaType>>;

function decorateSchema(
  schema: oas31.SchemaObject,
  options: Omit<ValueConfig, "type">
): oas31.SchemaObject {
  let _schema = schema;

  if (options.default_) {
    // TODO: Is this correct?
    _schema.default = options.default_;
  }

  if (options.description) {
    _schema.description = options.description;
  }

  if (options.nullable) {
    _schema = {
      oneOf: [{ type: "null" }, _schema as any],
    };
  }

  if (options.optional) {
    _schema = {
      anyOf: [{}, _schema as any],
    };
  }

  return _schema;
}

const toJsonSchemaOai31 = (value: SchemaDef): oas31.SchemaObject => {
  const base: oas31.SchemaObject = {};

  const derivedType =
    ParseToSchemaType[value.type as keyof typeof ParseToSchemaType];

  if (derivedType) {
    base.type = derivedType;
  }

  // Handle non-primitives
  switch (value.type) {
    // Abstract
    case "intersection": {
      return decorateSchema(
        {
          ...base,
          allOf: value.members.map(toJsonSchemaOai31),
        },
        value
      );
    }
    case "union": {
      return decorateSchema(
        {
          ...base,
          oneOf: value.members.map(toJsonSchemaOai31),
        },
        value
      );
    }
    case "tuple": {
      return decorateSchema(
        {
          ...base,
          minItems: value.entries.length,
          maxItems: value.entries.length,
          prefixItems: value.entries.map(toJsonSchemaOai31),
        },
        value
      );
    }

    // Complex
    case "object": {
      const required: string[] = [];
      const properties: oas31.SchemaObject["properties"] = {};

      for (const [key, val] of value.entries) {
        properties[key] = toJsonSchemaOai31(val);

        if (!val.optional) {
          required.push(key);
        }
      }

      return decorateSchema({ ...base, required, properties }, value);
    }

    case "array": {
      return decorateSchema(
        {
          ...base,
          items: toJsonSchemaOai31(value.element),
        },
        value
      );
    }
  }

  return decorateSchema(base, value);
};

export const toJsonSchema = (value: SchemaDef) => {
  return toJsonSchemaOai31(value);
};
