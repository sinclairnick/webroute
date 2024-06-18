import { createFormatter } from "./formatter/formatter";
import { createParser } from "./parser/parser";
import { SchemaParser } from "./parser/types";
import { TypeBoxFormatter } from "./validators/typebox";
import { oas31 } from "openapi3-ts";

export const createJsonSchemaFormatter = (schemaParser: SchemaParser<any>) => {
  const parser = createParser(schemaParser);
  const formatter = createFormatter(TypeBoxFormatter());

  return (schema: unknown) => {
    return formatter.format(parser.parse(schema)) as oas31.SchemaObject;
  };
};
