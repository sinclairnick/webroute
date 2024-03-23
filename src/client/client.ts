import { H } from "../infer";
import { MakeUnknownOptional } from "../util";

// Not entirely sure why, but using `Omit` doesn't seem to achieve
// the desired result. Have had to resort to dynamically mapping the data
// property to avoid type union from obliterating the data type itself.
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
  TApp extends H.AnyAppDef,
  TFetcher extends Fetcher<any, any>
> = <TPath extends keyof TApp>(
  path: TPath
) => {
  [TMethod in keyof TApp[TPath]]: H.Endpoint<
    TApp,
    TPath,
    TMethod
  > extends infer TEndpoint
    ? TEndpoint extends H.DefinedEndpoint<any>
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
};

export const createTypedClient = <TApp extends H.AnyAppDef>() => {
  return <TConfig extends CreateTypedClientOpts<any, any>>(
    config: TConfig
  ): TypedClient<TApp, TConfig["fetcher"]> => {
    return (path) => {
      const proxy = new Proxy(
        {},
        {
          get(_, method) {
            return (...args: any[]) =>
              config.fetcher(
                {
                  path,
                  method,
                  ...args[0],
                },
                args[1]
              );
          },
        }
      );

      return proxy as any;
    };
  };
};
