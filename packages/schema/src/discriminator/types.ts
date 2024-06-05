export interface SchemaDiscriminator<T extends object> {
  isSchema: (schema: object) => schema is T;
}
