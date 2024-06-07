import type { oas31 } from "openapi3-ts";

export class SchemaStore {
  private schema: Record<string, oas31.SchemaObject> = {};

  put(
    schema: oas31.SchemaObject,
    id?: string
  ): oas31.SchemaObject | { $ref: string } {
    if (id == null) return schema;

    const $ref = `#/components/schemas/${id}`;

    this.schema[id] ??= schema;
    return { $ref };
  }

  getSpec = (): oas31.SchemasObject => {
    return this.schema;
  };
}

export class OperationIdStore {
  private ids: Record<string, number> = {};

  /**
   * Non-idempotent
   */
  getUniqueId(id: string) {
    const existingCount = this.ids[id] ?? 0;
    // Increment count of operation name
    this.ids[id] = existingCount + 1;

    return `${id}${existingCount === 0 ? "" : existingCount}`;
  }
}
