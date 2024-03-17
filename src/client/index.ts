import { H } from "../infer";
import { MakeUnknownOptional } from "../util";

export type FetcherReturn<TResult, TFetcherRes> = TFetcherRes extends Record<
  any,
  any
>
  ? { data: TResult } & Omit<TFetcherRes, "data">
  : { data: TResult };

export type Fetcher<TOpts = unknown, TResponse = unknown> = (
  config: {
    path: string;
    method: string;
    body: unknown;
    params: unknown;
    query: unknown;
  },
  opts: TOpts
) => Promise<FetcherReturn<unknown, TResponse>>;

export type InferFetcherResponse<TFetcher> = TFetcher extends Fetcher<
  any,
  infer TResponse
>
  ? Awaited<TResponse>
  : unknown;

export type InferFetcherOpts<TFetcher> = TFetcher extends Fetcher<
  infer TOpts,
  any
>
  ? TOpts
  : undefined;

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
      ? InferFetcherOpts<TFetcher> extends infer TOpts
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
          ) => Promise<
            FetcherReturn<TEndpoint["output"], InferFetcherResponse<TFetcher>>
          >
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
