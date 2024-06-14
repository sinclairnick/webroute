import { oas31 } from "openapi3-ts";
import { pascalCase, upperFirst } from "scule";

const PathParamRegex = /\/\:([a-zA-Z0-9]+)/g;

const getOperationIdPrefix = (method: string) => {
  const methodLower = method.toLowerCase();

  switch (methodLower) {
    case "get":
      return "Get";
    case "post":
      return "Create";
    case "put":
      return "Update";
    case "patch":
      return "Patch";
    case "delete":
      return "Delete";
    default: {
      return upperFirst(methodLower).replace(/ /g, "");
    }
  }
};

export type DeriveOperationIdFn = (
  input: oas31.OperationObject & {
    path: string;
    method: string;
  }
) => string;

export const deriveOperationId: DeriveOperationIdFn = ({ method, path }) => {
  const prefix = getOperationIdPrefix(method);

  const pathPart = pascalCase(
    path
      .replace(/{.*}/g, "") // Remove OpenAPI path params style
      .replace("/", "_")
  );
  return `${prefix}${pathPart}`;
};

export const formatPath = (path: string) => {
  return path.replace(PathParamRegex, "/{$1}");
};
export const getPathParams = (path: string) => {
  const [_, ...params] = PathParamRegex.exec(path) ?? [];
  return params;
};