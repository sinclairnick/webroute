/** Simplify ({...} & {...}) types into a unified object */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

/** Default `undefined` to V */
export type Defaulted<T, V> = T extends undefined ? V : T;

/** Default `unknown` to V */
export type DefaultUnknownTo<T, D> = unknown extends T ? D : T;

/** Convert a union to an intersection */
export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

/** Make {unknown, undefined, null} optional */
export type FormatOptionals<T> = Simplify<
  {
    [Key in keyof T as T[Key] extends {} ? Key : never]: T[Key];
  } & {
    [Key in keyof T as T[Key] extends {} ? never : Key]?: T[Key];
  }
>;

/** Remove object keys which correspond to `never` values */
export type RemoveNeverKeys<T> = {
  [Key in keyof T as [T[Key]] extends [never] ? never : Key]: T[Key];
};

/**
 * Merge two objects, at a depth of 1, where keys of B take precedence over A
 */
export type MergeObjectsShallow<A, B> = Simplify<
  {
    [K in keyof A]: K extends keyof B ? B[K] : A[K];
  } & B
>;

/** An awaitable version of the response type */
export type Awaitable<T> = T | Promise<T>;
