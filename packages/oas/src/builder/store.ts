import type { oas31 } from "openapi3-ts";

export class SchemaStore {
  private schema: Record<string, oas31.SchemaObject> = {};

  put(
    schema: oas31.SchemaObject,
    id?: string
  ): oas31.SchemaObject | { $ref: string } {
    if (id == null) return schema;

    const $ref = `#/components/schema/id`;

    this.schema[id] ??= schema;
    return { $ref };
  }

  getSpec = (): oas31.SchemasObject => {
    return this.schema;
  };
}
