import { AsyncLocalStorage } from "node:async_hooks";
import express, { RequestHandler } from "express";
import { middlewareHandler } from "../handlers";

export type StorageData<T> = { data: T };
export type StoragePlugin = (storage: AnyStorage) => RequestHandler;
export type Storage<TStore, TInitStore> = {
  store: AsyncLocalStorage<StorageData<TInitStore & Partial<TStore>>>;
  get: () => StorageData<TInitStore & Partial<TStore>> | undefined;
  set: (updates: Partial<TStore>) => void;
};
export type AnyStorage = Storage<any, any>;

export type AnyCreateStorageReturn = CreateStorageReturn<any, any>;
export type CreateStorageReturn<TStore, TInitStore> = Storage<
  TStore,
  TInitStore
> & {
  middleware: () => express.RequestHandler<any, any, any, any, any>;
};

export const createStorage = <
  TStore extends Record<PropertyKey, any>,
  TInitStore extends Partial<TStore> | undefined = Partial<TStore>
>(
  initStore?: TInitStore
): CreateStorageReturn<TStore, TInitStore> => {
  const store = new AsyncLocalStorage<
    StorageData<TInitStore & Partial<TStore>>
  >();

  const storage = {
    store,
    get: () => store.getStore(),
    set: (updates: Partial<TStore>) => {
      const _store = store.getStore();
      if (_store) {
        _store.data = {
          ..._store.data,
          ...updates,
        };
      }
    },
  };

  return {
    ...storage,
    middleware: () => {
      return middlewareHandler((req, res, next) => {
        store.run(initStore ?? ({} as any), () => {
          next();
        });
      });
    },
  };
};
