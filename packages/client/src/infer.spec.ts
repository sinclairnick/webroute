import { describe, expectTypeOf, test } from "vitest";
import { DefineApp } from "./infer";

describe("Infer", () => {
  test("should infer routes", () => {
    type AppDef = DefineApp<{
      "GET /posts": {
        Query: {
          limit?: number;
        };
      };
      "POST /post/:id": {
        Params: {
          id: number;
        };
      };
    }>;

    expectTypeOf<AppDef["GET /posts"]["Query"]>().toEqualTypeOf<{
      limit?: number;
    }>();
    expectTypeOf<AppDef["POST /post/:id"]["Params"]>().toEqualTypeOf<{
      id: number;
    }>();
  });
});
