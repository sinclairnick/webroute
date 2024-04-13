<center>

![Cover](./static/harissa-cover.jpg)

</center>

# Harissa

![GitHub License](https://img.shields.io/github/license/sinclairnick/harissa)
![NPM Version](https://img.shields.io/npm/v/harissa)

> The modern toolkit for type-safe express apps

Harissa provides a set of helpers to make working with `express.js` in <current year> more enjoyable, secure, and rapid.

Harissa is explicitly not a framework. It merely provides a handful of tools to make common tasks like validation, type-safety and async first-class citizens with express.

```sh
npm i harissa
```

The goal of harissa is to provide a slim – but powerful – set of express utilities, and nothing more.

<details>
<summary>
    Table of contents
</summary>

1. [Route](./route)
2. [Composability](./composablity)
3. [Client](./client)
4. [Primitives](./primitives)
5. [OpenAPI](./openapi)

</details>

> [!IMPORTANT]  
> Harissa is currently used in production internally, but is not recommended for large scale projects just yet - expect some API tweaks

## Route

**The `route` utility is the centerpiece of harissa.** It provides a simple, chainable trpc-like interface for defining endpoints in a more declarative fashion. Consequently, routes are easily composed and highly declarative, enabling the out-of-the-box schema definitions (OpenAPI and typescript).

A simple example might look like:

```ts
const userRoute = route("/user/:id")
  .method("post")
  .body(z.object({ field: z.string() }))
  .handle((req, res, next) => req.body.field);
```

Or a more complete example:

```ts
const userRoute = route("/user/:id")
  .use(...middleware)
  .method("post")
  .params(ParamSchema)
  .body(BodySchema)
  .output(OutputSchema)
  .headers(HeaderSchema)
  .handle(async (req) => req.user);
```

> [!TIP]
> Most popular validation libraries are supported by Harissa

This returns a regular express route handler/middleware, designed to be used as per normal:

```ts
app.route(
  "/user/:id",
  route().handle(async (req) => {})
);
```

Or many routes can be registered at once:

```ts
const appRoutes = [userRoute, postsRoute, authRoute];

registerRoutes(app, appRoutes);
```

## Composability

Routes can be chained for better composability:

```ts
const authedRoute = route().use<{ userId: string }>(hasUserMiddleware);

const getUserRoute = authedUserRoute
  .path("/user/me")
  .method("get")
  .handle((req) => typeof req.userId === "string"); // -> true
```

Paths and middleware can be appended:

_Paths:_

```ts
const postRoute = route("/post");

const getAllPostsRoute = postRoute.path("/all").method("get");
const deletePostRoute = postRoute.path("/:postId").method("delete");
```

_Middleware:_

```ts
const withFoo = (x: any) =(req, res, next) => {
    console.log(x)
    req.foo = x
    next()
}

route()
  .use<{ foo: string }>(withFoo("foo"))
  .use<{ foo: number }>(withFoo(1))
  .use<{ foo: boolean }>(withFoo(true))
  .handle((req) => typeof req.foo === "boolean"); // -> true

// 3x middleware are called:
// Log: foo
// Log: 1
// Log: true
```

Whereas schema override eachother:

```ts
route()
  .body(CreateUserBody) // <- This one is overridden
  .body(CreatePostBody);
```

## Client

On the client side, Harissa provides a slim, unopinionated utility for type-safe API calls, if you're into that sort of thing.

```ts
// backend.ts
import { H } from "harissa";
const AppRoutes = [userRoute, authRoute, ...otherRoutes];
export type App = H.Infer<typeof AppRoutes>;
```

```ts
// client.ts
import { createTypedClient } from "harissa/client";

export const api = createTypedClient<App>({
  fetcher: (
    { path, method, body, params, query },
    opts?: AxiosOptions // Any arbitrary type
  ) => {
    // TODO: Call your API with axios, fetch, etc.
  },
});

api("/user/:id").get(
  { params: { id: "..." }, ...etc }, // Config derived from API schema
  { ...myOptions } // Type inferred from `opts` above
);
```

You can also infer specific endpoint information, fairly egonomically.

```ts
type GetUserEndpoint = H.Endpoint<App, "/user/:id", "get">;

type GetUserParams = GetUserEndpoint["params"];
type GetUserResponse = GetUserEndpoint["output"];

export const getUser = (
  params: GetUserEndpoint["params"]
): Promise<GetUserEndpoint["output"]> => api("/user/:id").get({ params });
```

## Primitives

Several lower-level primitives are exposed.

### Exceptions

`createHttpException` can be used to create common HTTP exceptions.

```ts
export class NotFoundException extends createHttpException("NOT_FOUND") {}

throw new NotFoundException("User not found");
// status = 404, name = "NOT_FOUND", message = "User not found"
```

### Handlers

Less feature-full handler primitives are exposed, providing `async` and raw return functionality.

```ts
import {
    middlewareHandler,
    routeHandler,
    errorHandler
} from "harissa"

app.use(
  middlewareHandler((req, res, next) => {
    req.foo = "bar";
    return next();
  })
);

app.get(
  "/",
  routeHandler((req, res, next) => {
    return "Some data";
  })
);

app.use(errorHandler(err, req, res, next) => {
    console.error(err)

    res.status(500)

    return err
})
```

## OpenAPI

> [!WARNING]  
> OpenAPI support is currently experimental and also varies according to validation library

We can create OpenAPI routes given our express app. While harissa `route`s with schema information are encouraged, any express route can be included in our api spec.

```ts
const spec = createOpenApiSpec(app, {
  /** Options */
});

// Optionally: Add/remove/modify spec if you wish

app.get("/openapi.json", (req, res) => {
  res.json(spec.asJson());
});
```

Currently supported schema with OpenAPI schema generation:

- ✅ Zod

> [!TIP]
> If you'd like support for your validation library added, please create a new [issue](./issues).
