import { ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Parser } from "../route/parser/types";
import { Debug } from "../debug";
import { JsonSchema } from "./types";

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
  schema: Parser;
}): JsonSchema | undefined => {
  if (isZod(schema)) {
    Debug.openapi("Is zod schema.");
    const { $schema, ...rest } = zodToJsonSchema(schema);
    return rest as any; // The types from ^ are wrong
  }

  Debug.openapi(`No json schema formatter found for schema`, schema);
};