import { oas31 } from "openapi3-ts";
import { SchemaFormatter } from "../types";
import { OperationsArrayInput, OperationsRecordInput } from "./types";
import { deriveOperationId, formatPath } from "../util";
import { createOperation } from "./operation";
import { SchemaStore } from "./store";

type CreateSpecInput = {
  /**
   * A function which converts a given schema into a JSON/OAS Schema definition.
   *
   * Formatters for most popular schema libraries can be found in the `@webroute/schema` package.
   */
  formatter: SchemaFormatter<any>;

  operations: OperationsArrayInput | OperationsRecordInput;

  /**
   * An existing OpenAPI spec builder to extend from.
   */
  spec?: oas31.OpenApiBuilder;

  onCollision?: (operation: oas31.OperationObject) => any;
};

export const createSpec = (input: CreateSpecInput) => {
  const {
    formatter,
    spec = new oas31.OpenApiBuilder(),
    operations,
    onCollision,
  } = input;

  const paths: oas31.PathsObject = {};
  const store = new SchemaStore();

  // Create operations from input
  for (const key in operations) {
    const value = (operations as any)[key];
    let path: string;
    let methods: string[];

    if ("path" in value) {
      path = value.path;
      methods = value.methods;
    } else {
      const [_method, _path] = key.split(" ");
      path = _path;
      methods = [_method];
    }
    methods = methods.map((x) => x.toLowerCase());

    const formattedPath = formatPath(path);

    paths[formattedPath] ??= {};

    for (const _method of methods) {
      const method = _method as keyof oas31.PathItemObject;
      const operation = createOperation(value, { formatter, store });

      if (operation.operationId == null) {
        operation.operationId = deriveOperationId({
          method,
          path: formattedPath,
        });
      }

      if (paths[formattedPath][method] != null) {
        onCollision?.(paths[formattedPath][method]);
        continue;
      }

      paths[formattedPath][method] = operation;
    }
  }

  // Construct the final schema
  spec.rootDoc.paths = {
    ...spec.rootDoc.paths,
    ...paths,
  };

  return spec;
};
