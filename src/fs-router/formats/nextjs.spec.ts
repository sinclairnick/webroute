import { URL } from "url";
import { describe, test, expect } from "vitest";
import { NextJS } from "./nextjs";

const DOMAIN = "https://google.com";

const NextCases: [
  string,
  { pathMatch: string; params: Record<PropertyKey, any>; url: URL }
][] = [
  ["index.ts", { pathMatch: "/", params: {}, url: new URL("", DOMAIN) }],
  [
    "/static.ts",
    { pathMatch: "/static", params: {}, url: new URL("/static", DOMAIN) },
  ],
  [
    "/user/[id].ts",
    {
      pathMatch: "/user/:id",
      params: { id: "123" },
      url: new URL("/user/123", DOMAIN),
    },
  ],
  [
    "/user/[id]/index.ts",
    {
      pathMatch: "/user/:id",
      params: { id: "123" },
      url: new URL("/user/123", DOMAIN),
    },
  ],
  [
    "/user/[...id].ts",
    {
      pathMatch: "/user/:id*",
      params: { id: ["123"] },
      url: new URL("/user/123", DOMAIN),
    },
  ],
  [
    "/user/[...id]/index.ts",
    {
      pathMatch: "/user/:id*",
      params: { id: ["123"] },
      url: new URL("/user/123", DOMAIN),
    },
  ],
];

describe("FS Router Format > NextJS", () => {
  test.each(NextCases)("NextJS format works %s", (path, expected) => {
    const result = NextJS()(path);

    expect(result).toBeDefined();
    expect(result?.pathMatch).toEqual(expected.pathMatch);
    expect(result?.methods).toEqual("*");
  });
});
