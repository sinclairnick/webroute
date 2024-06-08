import type { ToClient } from "@webroute/route";
import type { AxiosRequestConfig } from "axios";
import { appRoutes } from "./routes";
import { createTypedClient, createUrl } from "@webroute/client";
import axios from "axios";

type AppDef = ToClient.InferApp<typeof appRoutes>;

export const client = createTypedClient<AppDef>()({
  fetcher: async (config, options?: AxiosRequestConfig) => {
    const url = createUrl(config);

    return axios(url, { data: config.body, ...options });
  },
});

const postPost = client("POST /api/post");

const res = postPost(
  { body: { title: "hi" } },
  {
    headers: {
      foo: "bar",
    },
  }
);
