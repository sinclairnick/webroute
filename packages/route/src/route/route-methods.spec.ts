import { describe, expect, test } from "vitest";
import { route } from ".";

describe("route().methods", () => {
  test(".method takes lowercase http verb", () => {
    const r = route()
      .method("get")
      .handle(() => {});

    expect(r["~def"].methods).toHaveLength(1);
    expect(r["~def"].methods).includes("GET");
  });

  test(".method takes uppercase http verb", () => {
    const r = route()
      .method("GET")
      .handle(() => {});

    expect(r["~def"].methods).toHaveLength(1);
    expect(r["~def"].methods).includes("GET");
  });

  test(".method takes many http verbs", () => {
    const r = route()
      .method(["GET", "POST"])
      .handle(() => {});

    expect(r["~def"].methods).toHaveLength(2);
    expect(r["~def"].methods).includes("GET");
    expect(r["~def"].methods).includes("POST");
  });

  test(".method takes mixed http verb casing", () => {
    const r = route()
      .method(["GET", "post"])
      .handle(() => {});

    expect(r["~def"].methods).toHaveLength(2);
    expect(r["~def"].methods).includes("GET");
    expect(r["~def"].methods).includes("POST");
  });

  test(".method takes uppercase http verb", () => {
    const r = route()
      .method("GET")
      .handle(() => {});

    expect(r["~def"].methods).toHaveLength(1);
    expect(r["~def"].methods).includes("GET");
  });
});
