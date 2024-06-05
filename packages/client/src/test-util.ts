import { DefineApp } from "./infer";

export type TestAppDef = DefineApp<{
  "GET /hello": {
    Query: { hi: number };
    Output: { result: boolean };
  };
  "POST /hello": {
    Body: { notHi: number };
  };
  "GET /bye": {
    Params: { bye: number };
  };
  "GET /with/implicit/:paramName": {};
  "GET /with/explicit/:paramName": {
    Params: { paramName: number };
  };
}>;
