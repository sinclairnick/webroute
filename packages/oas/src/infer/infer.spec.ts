import { describe, expectTypeOf, test } from "vitest";
import {
  ParseArray,
  ParseBody,
  ParseBodyOrResponseObject,
  ParseBodyOrResponseReference,
  ParseBoolean,
  ParseIntersection,
  ParseNull,
  ParseNumber,
  ParseObject,
  ParseOperation,
  ParseParameter,
  ParseParameterReference,
  ParseParameters,
  ParseResponse,
  ParseResponses,
  ParseSchemaReference,
  ParseSpec,
  ParseString,
  ParseUnion,
} from "./infer";
import type spec from "../../example/spec";
import { createTypedClient } from "@webroute/client";

describe("Infer", () => {
  describe("Schema", () => {
    describe("Union", () => {
      test("Single member", () => {
        type Result = ParseUnion<{ anyOf: [{ type: "string" }] }, {}>;
        expectTypeOf<Result>().toEqualTypeOf<string>();
      });

      test("Two members", () => {
        type Result = ParseUnion<
          {
            anyOf: [{ type: "string" }, { type: "number" }];
          },
          {}
        >;

        expectTypeOf<Result>().toEqualTypeOf<string | number>();
      });
    });

    describe("Intersection", () => {
      test("Single member", () => {
        type Result = ParseIntersection<{ allOf: [{ type: "string" }] }, {}>;
        expectTypeOf<Result>().toEqualTypeOf<string>();
      });

      test("Two members", () => {
        type Result = ParseIntersection<
          {
            allOf: [{ type: "string" }, { type: "number" }];
          },
          {}
        >;

        expectTypeOf<Result>().toEqualTypeOf<string & number>();
      });
    });

    describe("Object", () => {
      test("Simple object", () => {
        type Result = ParseObject<
          {
            type: "object";
            properties: {
              a: { type: "number" };
            };
          },
          {}
        >;

        expectTypeOf<Result>().toMatchTypeOf<{ a?: number }>();
      });

      test("Semi-required object", () => {
        type Result = ParseObject<
          {
            type: "object";
            properties: {
              a: { type: "number" };
              b: { type: "number" };
              c: { type: "number" };
            };
            required: ["c"];
          },
          {}
        >;

        expectTypeOf<Result>().toMatchTypeOf<{
          a?: number;
          b?: number;
          c: number;
        }>();
      });

      test("Nested object", () => {
        type Result = ParseObject<
          {
            type: "object";
            properties: {
              a: {
                type: "object";
                properties: {
                  b: { type: "number" };
                };
              };
            };
          },
          {}
        >;

        expectTypeOf<Result>().toEqualTypeOf<{ a?: { b?: number } }>();
      });
    });

    describe("Array", () => {
      test("Simple array", () => {
        type Result = ParseArray<
          { type: "array"; items: { type: "string" } },
          {}
        >;

        expectTypeOf<Result>().toEqualTypeOf<string[]>();
      });

      test("Object array", () => {
        type Result = ParseArray<
          {
            type: "array";
            items: {
              type: "object";
              properties: {
                a: { type: "number" };
              };
            };
          },
          {}
        >;

        expectTypeOf<Result>().toEqualTypeOf<{ a?: number }[]>();
      });
    });

    describe("String", () => {
      test("Basic string", () => {
        type Result = ParseString<{ type: "string" }>;

        expectTypeOf<Result>().toEqualTypeOf<string>();
      });

      test("Enum string", () => {
        type Result = ParseString<{ type: "string"; enum: ["a", "b"] }>;

        expectTypeOf<Result>().toEqualTypeOf<"a" | "b">();
      });
    });

    describe("Boolean", () => {
      test("Boolean", () => {
        type Result = ParseBoolean<{ type: "boolean" }>;

        expectTypeOf<Result>().toEqualTypeOf<boolean>();
      });
    });

    describe("Number", () => {
      test("Number", () => {
        type Result = ParseNumber<{ type: "number" }>;

        expectTypeOf<Result>().toEqualTypeOf<number>();
      });
    });

    describe("Null", () => {
      test("Null", () => {
        type Result = ParseNull<{ type: "null" }>;

        expectTypeOf<Result>().toEqualTypeOf<null>();
      });
    });

    describe("Reference", () => {
      test("Resolves present reference", () => {
        type Result = ParseSchemaReference<
          {
            $ref: "#/components/schemas/User";
          },
          {
            schemas: {
              User: { type: "string" };
            };
          }
        >;

        expectTypeOf<Result>().toEqualTypeOf<string>();
      });

      test("Unknown for missing reference", () => {
        type Result = ParseSchemaReference<
          {
            $ref: "#/components/schemas/User";
          },
          {}
        >;

        expectTypeOf<Result>().toEqualTypeOf<unknown>();
      });
    });
  });

  describe("Params", () => {
    test("Reference", () => {
      type Result = ParseParameterReference<
        {
          $ref: "#/components/parameters/Foo";
        },
        {
          parameters: {
            Foo: {
              name: "hi";
              in: "path";
              schema: {
                type: "string";
              };
            };
          };
        }
      >;

      expectTypeOf<Result>().toEqualTypeOf<{ Params: { hi?: string } }>();
    });

    test("Path param", () => {
      type Result = ParseParameter<
        {
          name: "hi";
          in: "path";
          schema: {
            type: "string";
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<{ Params: { hi?: string } }>();
    });

    test("One parameter", () => {
      type Result = ParseParameters<
        [{ name: "hi"; in: "path"; schema: { type: "string" } }],
        {}
      >;

      expectTypeOf<Result>().toMatchTypeOf<{
        Params: { hi?: string };
      }>();
    });

    test("Two parameters", () => {
      type Result = ParseParameters<
        [
          { name: "a"; in: "path"; schema: { type: "string" } },
          { name: "b"; in: "path"; schema: { type: "string" } }
        ],
        {}
      >;

      expectTypeOf<Result>().toMatchTypeOf<{
        Params: { a?: string; b?: string };
      }>();
    });

    test("Two parameters in different parts", () => {
      type Result = ParseParameters<
        [
          { name: "a"; in: "path"; schema: { type: "string" } },
          { name: "b"; in: "header"; schema: { type: "string" } }
        ],
        {}
      >;

      expectTypeOf<Result>().toMatchTypeOf<{
        Params: { a?: string };
        Headers: { b?: string };
      }>();
    });
  });

  describe("Body", () => {
    test("Reference", () => {
      type Result = ParseBodyOrResponseReference<
        { $ref: "#/components/requestBodies/User" },
        "requestBodies",
        {
          requestBodies: {
            User: {
              content: {
                "application/json": {
                  schema: {
                    type: "string";
                  };
                };
              };
            };
          };
        }
      >;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    test("One content type", () => {
      type Result = ParseBodyOrResponseObject<
        {
          content: {
            "application/json": {
              schema: {
                type: "string";
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    test("Two content types of same type", () => {
      type Result = ParseBodyOrResponseObject<
        {
          content: {
            "application/json": {
              schema: {
                type: "string";
              };
            };
            "application/xml": {
              schema: {
                type: "string";
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    test("Two content types of different type", () => {
      type Result = ParseBodyOrResponseObject<
        {
          content: {
            "application/json": {
              schema: {
                type: "string";
              };
            };
            "application/xml": {
              schema: {
                type: "number";
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<string | number>();
    });

    test("Handles requireds", () => {
      type Result = ParseBody<
        {
          content: {
            "application/xml": {
              schema: {
                type: "number";
              };
            };
          };
        },
        {}
      >;
      type Result2 = ParseBody<
        {
          content: {
            "application/xml": {
              schema: {
                type: "number";
              };
            };
          };
          required: true;
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<number | undefined>();
      expectTypeOf<Result2>().toEqualTypeOf<number>();
    });
  });

  describe("Response", () => {
    test("Single response reference", () => {
      type Result = ParseResponse<
        { $ref: "#/components/responses/User" },
        {
          responses: {
            User: {
              description: "";
              content: {
                "application/json": {
                  schema: {
                    type: "string";
                  };
                };
              };
            };
          };
        }
      >;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    test("Single response object", () => {
      type Result = ParseResponse<
        {
          description: "";
          content: {
            "application/json": {
              schema: {
                type: "string";
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });

    test("Multiple responses", () => {
      type Result = ParseResponses<
        {
          "200": {
            description: "";
            content: {
              "application/json": {
                schema: {
                  type: "string";
                };
              };
            };
          };
          "201": {
            description: "";
            content: {
              "application/json": {
                schema: {
                  type: "number";
                };
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<string | number>();
    });

    test("Ignores non-200 codes", () => {
      type Result = ParseResponses<
        {
          "200": {
            description: "";
            content: {
              "application/json": {
                schema: {
                  type: "string";
                };
              };
            };
          };
          "302": {
            description: "";
            content: {
              "application/json": {
                schema: {
                  type: "number";
                };
              };
            };
          };
          "404": {
            description: "";
            content: {
              "application/json": {
                schema: {
                  type: "boolean";
                };
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result>().toEqualTypeOf<string>();
    });
  });

  describe("Operation", () => {
    test("Simple", () => {
      type Result = ParseOperation<
        {
          parameters: [
            { name: "limit"; in: "query"; schema: { type: "number" } },
            { name: "Authorization"; in: "header"; schema: { type: "string" } }
          ];
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "string";
                };
              };
            };
          };
          responses: {
            "200": {
              description: "";
              content: {
                "application/json": {
                  schema: {
                    type: "string";
                  };
                };
              };
            };
            "201": {
              description: "";
              content: {
                "application/json": {
                  schema: {
                    type: "number";
                  };
                };
              };
            };
          };
        },
        {}
      >;

      expectTypeOf<Result["Output"]>().toEqualTypeOf<string | number>();
      expectTypeOf<Result["Body"]>().toEqualTypeOf<string | undefined>();
      expectTypeOf<Result["Query"]>().toMatchTypeOf<{ limit?: number }>();
      expectTypeOf<Result["Headers"]>().toMatchTypeOf<{
        Authorization?: string;
      }>();
    });
  });

  describe("Spec", () => {
    test("JSON.d.ts works", () => {
      expectTypeOf<
        (typeof spec)["components"]["schemas"]["Pet"]["type"]
      >().toEqualTypeOf<"object">();
    });

    test("Produces parsed spec", () => {
      type Spec = ParseSpec<typeof spec>;

      expectTypeOf<
        Spec["GET /pet/{petId}"]["Params"]["petId"]
      >().toEqualTypeOf<number>();
    });

    test("Works with @webroute/client", () => {
      type Spec = ParseSpec<typeof spec>;

      const client = createTypedClient<Spec>()({
        fetcher: async () => {
          return { data: {} };
        },
      });

      const findByTags = client("GET /pet/findByTags");

      type Config = Parameters<typeof findByTags>[0];

      expectTypeOf<Config["query"]>().toMatchTypeOf<{ tags?: string[] }>();
    });
  });
});
