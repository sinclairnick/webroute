import { cached } from "../../util";
import { RouteDefInner, InputTypeKey, ParseInputsFn } from "./types";

export const Def = Symbol("Def");

export const createParseFn = (
  _req: Request,
  def: RouteDefInner<any>
): ParseInputsFn<any, any, any, any> => {
  const req = _req.clone();
  const url = new URL(req.url);

  const query = cached(async () => {
    const map: Record<string, any> = {};
    for (const [key, value] of url.searchParams.entries()) {
      map[key] = value;
    }

    return def.query?.parser(map) ?? map;
  });

  const params = cached(async () => {
    const patternParts = def.path.split("/");
    const PathParts = url.pathname.split("/");

    const map: Record<string, any> = {};
    for (let i = 0; i <= patternParts.length; i++) {
      const pattern: string | undefined = patternParts[i];
      const Path: string | undefined = PathParts[i];

      if (pattern == null || Path == null) break;

      if (pattern.startsWith(":")) {
        map[pattern.slice(1)] = Path;
      }
    }

    return def.params?.parser(map) ?? map;
  });

  const body = cached(async () => {
    const contentType = req.headers.get("content-type");

    if (def.body) {
      const data = await req.json();
      return def.body?.parser(data);
    }

    if (contentType === "application/json") {
      return req.json();
    }

    if (contentType?.startsWith("text/")) {
      return req.text();
    }

    return req.body;
  });

  const headers = cached(async () => {
    const map: Record<string, any> = {};
    req.headers.forEach((value, key) => {
      map[key] = value;
    });

    return def.headersReq?.parser(map) ?? map;
  });

  const parseFn = async <T extends InputTypeKey>(key?: T) => {
    if (key) {
      return { query, params, headers, body }[key]() as any;
    }

    const [_query, _params, _headers, _body] = await Promise.all([
      query(),
      params(),
      headers(),
      body(),
    ]);

    return {
      query: _query,
      params: _params,
      headers: _headers,
      body: _body,
    };
  };

  return parseFn as ParseInputsFn;
};
