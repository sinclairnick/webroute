import { createRouter as _createRouter, toRouteMatcher } from "radix3";
import { RequestRouter, RouteInput } from "./types";
import { WILDCARD_METHOD_KEY } from "./util";

type MethodMap<T> = {
  [key: string]: T[];
};

/**
 * Creates a radix web router.
 *
 * Route matching is determined by the radix algorithm.
 * Handlers associated with specific methods are prioritised over wildcard methods.
 */
export const createRouter = <T>(
  initialRoutes: RouteInput<T>[]
): RequestRouter<T> => {
  const routes: Record<string, MethodMap<T>> = {};

  for (const route of initialRoutes) {
    add(route);
  }

  const router = _createRouter({ routes });
  const matcher = toRouteMatcher(router);

  function add(route: RouteInput<T>) {
    routes[route.path] ??= {};
    for (const _method of route.methods) {
      const method = _method.toUpperCase();
      routes[route.path][method] ??= [];
      routes[route.path][method].push(route.payload);
    }
  }

  function match(request: Request) {
    const path = new URL(request.url).pathname;
    const method = request.method;

    const match = router.lookup(path);
    if (!match) return;

    const { params: _, ...methods } = match;
    if (!methods) return;

    const handlers = methods[method] ?? methods[WILDCARD_METHOD_KEY];

    return handlers?.[0];
  }

  function matchAll(request: Request) {
    const path = new URL(request.url).pathname;
    const method = request.method;

    const matches = matcher.matchAll(path);

    const result: T[] = [];

    for (const match of matches) {
      const { params: _, ...methods } = match;
      if (!methods) continue;
      const specificHandlers = methods[method] ?? [];
      const wildcardHandlers = methods[WILDCARD_METHOD_KEY] ?? [];
      result.push(...specificHandlers, ...wildcardHandlers);
    }

    return result;
  }

  return {
    match,
    matchAll,
  };
};
