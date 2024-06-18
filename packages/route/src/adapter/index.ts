import { Route } from "../route";
import { Def } from "../route/handler/util";
import { DenormalisedInput, NormalisedOperation } from "./types";

export * from "./client";

export const normaliseRoutes = (
  input: DenormalisedInput
): NormalisedOperation[] => {
  const operations: NormalisedOperation[] = [];

  for (const key in input) {
    const _route = input[key];

    const path = Route.getPath(_route);
    const methods = Route.getMethods(_route);

    if (path == null) {
      throw new Error(`No path provided for route with key: ${key}`);
    }

    if (methods == null || methods.length === 0) {
      throw new Error(`No method(s) provided for route with key: ${key}`);
    }

    operations.push({
      path,
      methods,
      payload: _route,
      Query: _route[Def].query?.schema,
      Params: _route[Def].params?.schema,
      Body: _route[Def].body?.schema,
      Headers: _route[Def].headersReq?.schema,
      Output: _route[Def].output?.schema,
    });
  }

  return operations;
};
