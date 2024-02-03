<center>

![Cover](./static/harissa-cover.jpg)

</center>

# Harissa

> The 🌶️ spiciest DX for express

![GitHub License](https://img.shields.io/github/license/sinclairnick/harissa)
![NPM Version](https://img.shields.io/npm/v/harissa)

Express is a great web framework. It’s simple, easy to learn, and flexible…. But it hasn’t been updated in years, and every time I start a new express project I’m left wanting for better DX.

**On the other hand**, competing frameworks tend to be heavy, complicated, or full of their own quirks not worth learning the hard way.

### Enter Harissa

🌶️ **Harissa** humbly bridges this gap by providing a selection of simple, opt-in utilities which make things like validation, OpenAPI support, type-safety etc. easier, without abstracting away too much or forcing new paradigms on you.

```sh
npm i harissa
```

It's a slim toolkit extending or sitting atop vanilla express, providing common functionality that one might argue should be part of express itself.

It was built to be:

- 🤸‍♀️ Flexible
- 🔍 Transparent
- 🧩 Incrementally adoptable
- 🤯 Full of options, not headaches
- 🚶‍♀️ Low risk to adopt/switch away from
- 🧙‍♂️ Non-magical

# Example usage

```tsx
// E.g. using the `route` helper

import { route } from "harissa";

app.get(
  "/user/:id",
  route()
    .params(z.object({ id: z.string() }))
    .output(UserSchema)
    .handle((req, res, next) => {
      // `req.params` is correctly parsed/transformed and typed
      const user = await findUser(req.params.id);

      return user; // <- Type safe return

      // Can also use res.json methods as per usual
    })
);
```

### Roadmap (to 1.0)

- [x] FS Router

  - [x] NextJS format
  - [ ] Remix format

- [ ] OpenAPI Support
  - [ ] With zod
  - [ ] With superstruct
  - [ ] With valibot
  - [ ] With yup
  - [ ] ... others

## API Reference

The Harissa API is intentionally fairly minimal. It contains utilities ranging from higher to lower level, where higher level abstractions are slightly more abstracted yet powerful and lower levels ones are more primitive and simple.

**High level**

- [createFSRouter(...)](#createfsrouter)

**Mid level**

- [route(...)](#route)
- [createStorage(...)](#createstorage)

**Low level**

- [createHttpException(...)](#createHttpException)
- [middlewareHandler(..)](#middlewarehandler)
- [routeHandler(...)](#routehandler)
- [errorHandler(...)](#errorhandler)

---

## High Level

### `createFSRouter()`

Create a filesystem router, similar to NextJS or Remix, but exporting express endpoints. The fs router expects files to return

```tsx
import { createFSRouter, registerRoutes, NextJS } from "harissa";

const fsRouter = createFSRouter({
  format: NextJS(),
  rootDir: "src/routes", // <- Optional
});

const initApp = async () => {
  const routes = await fsRouter.collect();

  registerRoutes(app, routes);
};
```

Example route file:

```tsx
// ./src/routes/user/[id].tsx

// GET /user/:id
export const get = (req, res, next) => {
  /**...*/
};

// POST /user/:id
export const POST = (req, res, next) => {
  //         ^ Names can be in 'POST' or 'post' form
};

// ALL /user/:id
export default (req, res, next) => {
  /**...*/
};
```

> (Optionally) Using the below utilities further enhances fs router

## Mid Level

### `route()`

`route` is a trpc-inspired utility which allows an entire route to be defined at once, including path pattern, validation, method and handler. The route handler is async-enabled and knows to automatically return data as json (unless its a request, or `next()` call).

```ts
route("/article")
  // Use zod/yup/valibot/superstruct etc.
  .body(CreateArticleInput) // and .query(), .params()
  .output(CreateArticleResult) // Validate res.body
  .method("post") // Or a list of methods
  .handle(async (req, res) => {
    // `req` and `res` are now fully parsed and typed
    return createArticle(req.body);
  });

// Add to express manually
app.post("/article", createArticleRoute);

// Or auto-register many at once
registerRoutes(app, [
  createArticleRoute,
  getArticleRoute,
  /** ...etc. */
]);
```

> Can happily be used in conjunction with fs router, where fs router config takes precedence over route() config in the case of conflicting information.

### `createStorage()`

A simple interface for asynchronous `continuation-local-storage` which allows you to correlate logs by ID, for example.

```ts
// Init a store
const storage = createStorage<{
  userId?: string;
  logId?: string;
}>();

// Register middleware (before routes)
app.use(storage.middleware());

// You can now set and get per-request-specific data
app.use((req, res, next) => {
  const jwt = req.headers[AUTH_HEADER];
  const user = getUser(jwt);

  // Update store (shallow property overwrite)
  storage.set({ userId: user.id });
});

app.use("/secret", (req, res) => {
  // Retrieve
  const store = storage.get();

  if (store.userId == null) {
    throw new UnauthorizedException("Log in bro");
  }

  return next();
});
```

## Low level

### `HttpException` and `createHttpException`

A simple and non-opinionated error wrapper with helpful conversions between HTTP codes and names. Can easily be extended.

```ts
// Here, "NOT_FOUND" is strongly typed/hinted
export class NotFoundException extends createHttpException("NOT_FOUND") {}

// Can now be thrown in application code
throw new NotFoundException("Thing not found", {
  /** extra */
});

// And easily handled in an error handler
if (err instanceof HttpException) {
  if (err.code === "NOT_FOUND") {
    return { message: "Couldn't find it, mate – sorry" };
  }

  return { message: "Something secret went wrong." };
}
```

### `middlewareHandler()`

A simple wrapper for defining custom middleware, with async/await and type inference. For routes intended to return data, `routeHandler` might be more helpful.

```ts
middlewareHandler(async (req, res, next) => {
  return { foo: "bar" }; // Warn: This would not do anything

  // In `middlewareHandler` you must explicitly run `res.send()` and the like
});
```

### `routeHandler()`

Route handlers provide basic async/await and auto-json functionality, allowing you to return data directly from the handler. Additionally, it infers the types instead of requiring explicit type signatures.

```ts
routeHandler(async (req, res, next) => {
  // This would be caught and passed to the express exception handler
  const res = await Promise.reject();

  return { foo: "bar" }; // This would be sent as JSON
});
```

### `errorHandler()`

SImilar to `routeHandler()`, but for error handling – takes the additional `error` argument.

```ts
errorHandler(async (err, req, res, next) => {
  // This would be caught and passed to the express exception handler
  const res = await Promise.reject();

  // Useful with HttpException (documented above)
  if (err instanceof HttpException) {
    // Do something...
  }

  return { message: "Internal server error" };
});
```
