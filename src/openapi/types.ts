import { oas31 } from "openapi3-ts";
import { JSONSchema } from "json-schema-to-typescript";

export type JsonSchema = Partial<oas31.SchemaObject & JSONSchema>;
