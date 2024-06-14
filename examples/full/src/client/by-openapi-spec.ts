import type { AxiosRequestConfig } from "axios";
import { createTypedClient, createUrl } from "@webroute/client";
import axios from "axios";
import type { ParseSpec } from "@webroute/oas";
import type Spec from "./openapi-spec";

type AppDef = ParseSpec<typeof Spec>;

export const client = createTypedClient<AppDef>()({
  fetcher: async (config, options?: AxiosRequestConfig) => {
    const url = createUrl(config);

    return axios(url, { data: config.body, ...options });
  },
});

const postPost = client("POST /api/post");

const res = postPost(
  { body: { title: "hi" }, params: {}, query: {} },
  {
    headers: {
      foo: "bar",
    },
  }
);
