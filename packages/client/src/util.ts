import { FetcherConfig } from "./client";
import { withQuery, encodeParam, parseURL, stringifyParsedURL } from "ufo";

export const substitutePathParams = (
  config: Pick<FetcherConfig, "params" | "path">,
  opts?: { encodePathParam?: (value: unknown) => string }
) => {
  const { encodePathParam = encodeParam } = opts ?? {};
  let url = parseURL(config.path);
  const params: Record<any, any> = Object.assign({}, config.params);

  // Substitute values in path
  let path = "";
  for (const part of url.pathname.split("/")) {
    if (part.length === 0) continue;
    if (part.startsWith(":")) {
      const key = part.replace(":", "");
      const value = params[key];

      // Even if its undefined, this should be substituted
      path += "/" + encodePathParam(value);
      continue;
    }

    path += "/" + part;
  }

  url.pathname = path;

  return stringifyParsedURL(url);
};

export const appendQueryParams = (
  url: string,
  config: Pick<FetcherConfig, "query">
) => {
  const query: Record<any, any> = Object.assign({}, config.query);

  return withQuery(url, query);
};

export const createUrl = (
  config: Pick<FetcherConfig, "path" | "params" | "query">
) => {
  const url = substitutePathParams(config);
  return appendQueryParams(url, config);
};
