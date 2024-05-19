export type AppRoute = {
  Query?: any;
  Params?: any;
  Body?: any;
  Output?: any;
};

export type AppDef = {
  [operation: `${string} ${string}`]: AppRoute;
};

export type DefineApp<T extends AppDef> = T;

export type InferPaths<T extends AppDef> =
  keyof T extends `${string} ${infer TPath}` ? TPath : never;
