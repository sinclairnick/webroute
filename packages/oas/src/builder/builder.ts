import { oas31 } from "openapi3-ts";
import {
  CreateSpecOptions,
  OperationsArrayInput,
  OperationsRecordInput,
} from "./types";
import {
  deriveOperationId as _deriveOperationId,
  formatPath,
  getPathParams,
} from "../util";
import { createOperation } from "./operation";
import { OperationIdStore, SchemaStore } from "./store";

const onCollisionDefault: CreateSpecOptions["onCollision"] = ({
  path,
  method,
}) => {
  console.warn(
    `Found colliding operations at: ${method.toUpperCase()} ${path}`
  );
};

/**
 * Creates an OAS definition from the given operation list.
 *
 * Without providing the `formatter` option, schema are automatically coerced to the "any"
 * type: `{}`.
 *
 * Providing a `formatter` enables producing schema-rich OAS.
 *
 * @param {OperationsArrayInput} operations
 * @param {CreateSpecOptions} options
 * @returns {oas31.OperationObject}
 */
export const createSpec = (
  /**
   * A list or record of operation information.
   *
   * In record form, the keys should be in the form `{OPERATION} {path}`.
   */
  operations: OperationsArrayInput | OperationsRecordInput,
  options?: CreateSpecOptions
) => {
  const {
    formatter = () => ({}),
    spec = new oas31.OpenApiBuilder(),
    onCollision = onCollisionDefault,
    body,
    operation,
    params,
  } = options ?? {};
  const { deriveOperationId = _deriveOperationId } = operation ?? {};
  const { stripFromInvalidMethods: stripInvalidBody = true } = body ?? {};
  const {
    appendMissing: appendMissingParams = true,
    stripExtraneous: stripExtraneousParams = true,
  } = params ?? {};

  if (options?.formatter == null) {
    console.warn(
      "No OAS schema formatter was supplied. Defaulting to `{}` (any)."
    );
  }

  const paths: oas31.PathsObject = {};
  const store = new SchemaStore();
  const operationIdStore = new OperationIdStore();

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
        operation.operationId = operationIdStore.getUniqueId(
          deriveOperationId({ ...operation, method, path: formattedPath })
        );
      }

      // Ensure all path params are accounted for
      operation.parameters ??= [];

      if (appendMissingParams || stripExtraneousParams) {
        const pathParams = getPathParams(path);

        if (appendMissingParams) {
          for (const param of pathParams) {
            const hasParam = operation.parameters.find(
              (x) => "in" in x && x.in === "path" && x.name === param
            );

            // Add param if missing
            if (!hasParam) {
              operation.parameters.push({
                in: "path",
                name: param,
                schema: { type: "string" },
                required: true,
              });
            }
          }
        }

        if (stripExtraneousParams) {
          const newParams: oas31.OperationObject["parameters"] = [];

          for (const param of operation.parameters) {
            if (!("in" in param) || param.in !== "path") {
              newParams.push(param);
              continue;
            }

            const isPathParam = pathParams.find((x) => x === param.name);

            if (isPathParam) {
              newParams.push(param);
            }
          }

          if (newParams.length === 0) {
            operation.parameters = undefined;
          } else {
            operation.parameters = newParams;
          }
        }
      }

      if (paths[formattedPath][method] != null) {
        onCollision({
          path,
          method,
          existing: paths[formattedPath][method],
          attempted: operation,
        });

        continue;
      }

      if (stripInvalidBody) {
        if (method === "get" || method === "delete") {
          const { requestBody: _, ...op } = operation;
          paths[formattedPath][method] = op;
        } else {
          paths[formattedPath][method] = operation;
        }
      }
    }
  }

  // Add paths/ops
  spec.rootDoc.paths = {
    ...spec.rootDoc.paths,
    ...paths,
  };

  // Add schemas
  spec.rootDoc.components = {
    ...spec.rootDoc.components,
    schemas: {
      ...spec.rootDoc.components?.schemas,
      ...store.getSpec(),
    },
  };

  return spec;
};
