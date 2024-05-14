import { MakeUnknownOptional } from "@webroute/core";
import { W } from "./infer";

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

export type Fetcher<TOpts = unknown, TResponse = unknown> = (
  config: FetcherConfig,
  opts: TOpts
) => Promise<FetcherReturn<unknown, TResponse>>;

export type CreateTypedClientOpts<TOpts, TResponse> = {
  fetcher: Fetcher<TOpts, TResponse>;
};

export type TypedClient<
  TApp extends W.AnyAppDef,
  TFetcher extends Fetcher<any, any>
> = <TPath extends keyof TApp & string>(
  path: TPath
) => W.Endpoint<TApp, TPath> extends infer TEndpoint
  ? TEndpoint extends W.DefinedEndpoint<any>
    ? TFetcher extends Fetcher<infer TOpts, infer TResponse>
      ? (
          ...args: undefined extends TOpts
            ? [
                config: MakeUnknownOptional<
                  Pick<TEndpoint, "params" | "query" | "body">
                >
              ]
            : [
                config: MakeUnknownOptional<
                  Pick<TEndpoint, "params" | "query" | "body">
                >,
                opts: TOpts
              ]
        ) => Promise<FetcherReturn<TEndpoint["output"], TResponse>>
      : never
    : never
  : never;

export const createTypedClient = <TApp extends W.AnyAppDef>() => {
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
