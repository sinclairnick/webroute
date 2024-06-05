import { cached } from "../../util";
import { HandlerDefinition, LazyValidator } from "./types";

export const Def = Symbol("Def");

export const createLazyValidators = (
  req: Request,
  def: HandlerDefinition<any>
) => {
  let query: LazyValidator<any> | undefined;
  let params: LazyValidator<any> | undefined;
  let body: LazyValidator<any> | undefined;
  let headers: LazyValidator<any> | undefined;

  const url = new URL(req.url);

  if (def.query) {
    query = cached(async () => {
      const map: Record<string, any> = {};
      for (const [key, value] of url.searchParams.entries()) {
        map[key] = value;
      }

      return def.query?.parser(map);
    });
  }

  if (def.params) {
    params = cached(async () => {
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

      return def.params?.parser(map);
    });
  }

  if (def.body) {
    body = cached(async () => {
      const data = await req.json();
      return def.body?.parser(data);
    });
  }

  if (def.headersReq) {
    headers = cached(async () => {
      const map: Record<string, any> = {};
      for (const [key, value] of req.headers.entries()) {
        map[key] = value;
      }

      return def.headersReq?.parser(map);
    });
  }

  return { query, params, body, headers };
};
