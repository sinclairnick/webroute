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

export const deriveOperationId = ({
  method,
  name,
  path,
}: DeriveOperationIdInput) => {
  if (name) return name;

  const prefix = getOperationIdPrefix(method);

  const pathPart = pascalCase(
    path
      .replace(PathParamRegex, "") // Remove path params
      .replace("/", "_")
  );
  return `${prefix}${pathPart}`;
};

export type DeriveOperationIdInput = {
  method: string;
  path: string;
  name?: string;
};

export const formatPath = (path: string) => {
  return path.replace(PathParamRegex, "/{$1}");
};

export class OperationIdBank {
  private ids: Record<string, number> = {};

  getUniqueId(id: string) {
    const existingCount = this.ids[id] ?? 0;
    // Increment count of operation name
    this.ids[id] = existingCount + 1;

    return `${id}${existingCount === 0 ? "" : existingCount}`;
  }
}
