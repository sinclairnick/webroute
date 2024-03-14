import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ParseFn } from "../route/parser";
import { Parser } from "../route/parser/types";
import { Debug } from "../debug";

// Need to do this lame check because `instanceof` breaks once compiled
// (for some reason)
const isZod = (schema: unknown): schema is ZodSchema => {
  return (
    schema != null &&
    typeof schema === "object" &&
    "_def" in schema &&
    schema._def != null &&
    typeof schema._def === "object" &&
    "typeName" in schema._def &&
    typeof schema._def.typeName === "string" &&
    schema._def.typeName.startsWith("Zod")
  );
};

export const getJsonSchema = ({
  schema,
}: {
  parser: ParseFn<unknown>;
  schema: Parser;
}) => {
  if (isZod(schema)) {
    Debug.openapi("Is zod schema.");
    return zodToJsonSchema(schema);
  }

  Debug.openapi(`No json schema formatter found for schema`, schema);
};
