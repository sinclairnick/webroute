import { AnyCompiledRoute, WebRequestHandler } from "../route/handler/types";

export type DenormalisedInput = Record<string, AnyCompiledRoute>;

export type NormalisedOperation = {
  path: string;
  methods: string[];
  Query?: any;
  Params?: any;
  Headers?: any;
  Body?: any;
  Output?: any;
  payload: WebRequestHandler;
};
