import { AppDef, AppRoute } from "./infer";
import type { FormatOptionals } from "@webroute/common";

export type FetcherReturn<TResult, TFetcherRes> = {
  [TKey in keyof TFetcherRes]: TKey extends "data"
    ? TResult
    : TFetcherRes[TKey];
};

export type FetcherConfig = {
  path: string;
  method: string;
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export type Fetcher<
  TOpts extends unknown[] = unknown[],
  TResponse = unknown
> = (
  config: FetcherConfig,
  ...opts: TOpts
) => Promise<FetcherReturn<unknown, TResponse>>;

export type CreateTypedClientOpts<
  TOpts extends unknown[] = unknown[],
  TResponse = unknown
> = {
  fetcher: Fetcher<TOpts, TResponse>;
};

export type TypedClient<
  TApp extends AppDef,
  TFetcher extends Fetcher<any, any>
> = <TKey extends keyof TApp & string>(
  key: TKey
) => TApp[TKey] extends infer TEndpoint
  ? TEndpoint extends AppRoute
    ? TFetcher extends Fetcher<infer TOpts, infer TResponse>
      ? (
          config: FormatOptionals<{
            params: TEndpoint["Params"];
            body: TEndpoint["Body"];
            query: TEndpoint["Query"];
          }>,
          ...args: TOpts
        ) => Promise<FetcherReturn<TEndpoint["Output"], TResponse>>
      : never
    : never
  : never;

export const createTypedClient = <TApp extends AppDef>() => {
  return <TConfig extends CreateTypedClientOpts<any, any>>(
    config: TConfig
  ): TypedClient<TApp, TConfig["fetcher"]> => {
    return (operation) => {
      const [methodUpper, pathPattern] = operation.split(" ");

      const fn: any = async (...args: any[]) => {
        return config.fetcher(
          {
            path: pathPattern,
            method: methodUpper.toLowerCase(),
            ...args[0],
          },
          args[1]
        );
      };

      return fn;
    };
  };
};
