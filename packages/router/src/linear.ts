import { RequestRouter, RouteInput } from "./types";
import { WILDCARD_METHOD_KEY } from "./util";
import { URLPattern as _URLPattern } from "urlpattern-polyfill";

const URLPattern: typeof _URLPattern =
  (globalThis as any).URLPattern ?? _URLPattern;

type MethodMap<T> = {
  [key: string]: { pattern: URLPattern; payload: T }[];
};

/**
 * Creates a linear web router.
 *
 * Route matching is determined by:
 * 1. Method specificity: more specific methods are prioritised, wildcards deprioritised.
 * 2. Registration order: within a method, routes registered earlier are prioritised.
 */
export const createRouter = <T>(
  initialRoutes: RouteInput<T>[]
): RequestRouter<T> => {
  const routes: MethodMap<T> = {};

  for (const route of initialRoutes) {
    add(route);
  }

  function add(route: RouteInput<T>) {
    for (const _method of route.methods) {
      const method = _method.toUpperCase();
      routes[method] ??= [];
      routes[method].push({
        pattern: new URLPattern({ pathname: route.path }),
        payload: route.payload,
      });
    }
  }

  function match(request: Request) {
    const path = new URL(request.url).pathname;
    const method = request.method;

    const handlers = routes[method] ?? routes[WILDCARD_METHOD_KEY];
    if (!handlers) return;

    return handlers.find((x) => x.pattern.exec({ pathname: path }))?.payload;
  }

  function matchAll(request: Request) {
    const path = new URL(request.url).pathname;
    const method = request.method;

    const result: T[] = [];
    for (const { pattern, payload } of routes[method]) {
      if (pattern.exec({ pathname: path })) {
        result.push(payload);
      }
    }
    for (const { pattern, payload } of routes[WILDCARD_METHOD_KEY]) {
      if (pattern.exec({ pathname: path })) {
        result.push(payload);
      }
    }

    return result;
  }

  return {
    match,
    matchAll,
  };
};
