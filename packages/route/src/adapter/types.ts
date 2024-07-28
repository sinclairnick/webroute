import { AnyCompiledRoute, WebRequestHandler } from "../route/handler/types";

export type DenormalisedInput = Record<string, AnyCompiledRoute>;

export type NormalisedOperation = {
  path: string;
  methods: string[];
  payload: WebRequestHandler;
  // Schema
  Query?: any;
  Params?: any;
  Headers?: any;
  Body?: any;
  Output?: any;
};
