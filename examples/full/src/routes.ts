import { route } from "@webroute/core";
import { OAS } from "@webroute/oas";
import z from "zod";
import { isAuthed } from "./middleware";

const apiRoute = route("/api");
const authedRoute = apiRoute.use(isAuthed());

// POST /api/v1/post
const CreatePostInput = OAS.Schema(
  z.object({
    title: z.string(),
  }),
  { id: "CreatePostInput" }
);

const createPostRoute = OAS.Operation(
  authedRoute
    .path("/post")
    .method(["POST", "PUT"])
    .body(CreatePostInput)
    .handle((req, { parse }) => {
      return parse("body");
    }),
  { operationId: "CreatePost" }
);

// GET /api/v1/post/:id
const getPostRoute = apiRoute
  .path("/post/:id")
  .method("GET")
  .params(z.object({ id: z.number({ coerce: true }) }))
  .handle(async (req, { parse }) => {
    const { params } = await parse();

    return params.id;
  });

// DELETE /api/v1/post/:id
const deletePostRoute = authedRoute
  .path("/post/:id")
  .method("DELETE")
  .handle(async (req, c) => {
    return { token: c.state.token };
  });

export const appRoutes = {
  createPostRoute,
  getPostRoute,
  deletePostRoute,
};
