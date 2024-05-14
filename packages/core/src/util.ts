export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export interface AnyRootConfig extends RootConfig<any> {}
export interface RootConfig<TMeta extends Record<PropertyKey, any>> {
  "~types": {
    Meta: TMeta;
  };
}

export const isArray = (
  arg: ReadonlyArray<any> | any
): arg is ReadonlyArray<any> => Array.isArray(arg);

export type MakeUnknownOptional<T extends Record<any, any>> = Simplify<
  {
    [TKey in keyof T as unknown extends T[TKey] ? never : TKey]: T[TKey];
  } & {
    [TKey in keyof T as unknown extends T[TKey] ? TKey : never]?: T[TKey];
  }
>;

export type RemoveNeverKeys<T> = {
  [Key in keyof T as [T[Key]] extends [never] ? never : Key]: T[Key];
};

export type DefaultUnknownTo<T, D> = unknown extends T ? D : T;

/** B keys take precedence over A */
export type MergeObjectsShallow<A, B> = Simplify<
  {
    [K in keyof A]: K extends keyof B ? B[K] : A[K];
  } & B
>;

export const cached = <T extends () => any>(fn: T) => {
  let called = false;
  let result: ReturnType<T>;

  return async () => {
    if (called) return result;
    result = await fn();
    called = true;
    return result;
  };
};
