export interface AnyRootConfig extends RootConfig<any> {}
export interface RootConfig<TMeta extends Record<PropertyKey, any>> {
  "~types": {
    Meta: TMeta;
  };
}

export const isArray = (
  arg: ReadonlyArray<any> | any
): arg is ReadonlyArray<any> => Array.isArray(arg);

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