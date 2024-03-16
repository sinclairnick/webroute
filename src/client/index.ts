import { H } from "../infer";
import { MakeUnknownOptional } from "../util";

export type Fetcher = (
  path: string,
  method: string,
  config: { params: any; query: any; body: any }
) => any;

export type CreateTypedClientOpts<TApp extends H.AnyAppDef> = {
  fetcher: Fetcher;
};

export type TypedClient<TApp extends H.AnyAppDef> = <TPath extends keyof TApp>(
  path: TPath
) => {
  [TMethod in keyof TApp[TPath]]: H.Endpoint<
    TApp,
    TPath,
    TMethod
  > extends infer TEndpoint
    ? TEndpoint extends H.DefinedEndpoint<any>
      ? (
          config: MakeUnknownOptional<
            Pick<TEndpoint, "params" | "query" | "body">
          >
        ) => Promise<TEndpoint["output"]>
      : never
    : never;
};

export const createTypedClient = <TApp extends H.AnyAppDef>({
  fetcher,
}: CreateTypedClientOpts<TApp>): TypedClient<TApp> => {
  return (path) => {
    const proxy = new Proxy(
      {},
      {
        get(_, method) {
          return fetcher(String(path), String(method), arguments[1]);
        },
      }
    );

    return proxy as any;
  };
};
