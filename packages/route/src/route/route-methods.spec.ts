import { describe, expect, test } from "vitest";
import { route } from ".";
import { Def } from "./handler/util";

describe("route().methods", () => {
  test(".method takes lowercase http verb", () => {
    const r = route()
      .method("get")
      .handle(() => {});

    expect(r[Def].methods).toHaveLength(1);
    expect(r[Def].methods).includes("GET");
  });

  test(".method takes uppercase http verb", () => {
    const r = route()
      .method("GET")
      .handle(() => {});

    expect(r[Def].methods).toHaveLength(1);
    expect(r[Def].methods).includes("GET");
  });

  test(".method takes many http verbs", () => {
    const r = route()
      .method(["GET", "POST"])
      .handle(() => {});

    expect(r[Def].methods).toHaveLength(2);
    expect(r[Def].methods).includes("GET");
    expect(r[Def].methods).includes("POST");
  });

  test(".method takes mixed http verb casing", () => {
    const r = route()
      .method(["GET", "post"])
      .handle(() => {});

    expect(r[Def].methods).toHaveLength(2);
    expect(r[Def].methods).includes("GET");
    expect(r[Def].methods).includes("POST");
  });

  test(".method takes uppercase http verb", () => {
    const r = route()
      .method("GET")
      .handle(() => {});

    expect(r[Def].methods).toHaveLength(1);
    expect(r[Def].methods).includes("GET");
  });
});
