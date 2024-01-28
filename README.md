# Harissa

> The 🌶️ spiciest DX for express

Harissa is thin set of plug-and-play functions that modernise the DX of express. Picture express with async/await, validation, continuation-local-storage and type-safety.

**Why?**

Express boasts great simplicity, stability and community adoption – but also requires a bit of nudging to set it up beyond a basic "hello world" app.

Harissa is a **set of utilities** that makes [`express`](https://github.com/expressjs/express) nicer to work with, and more production-ready. It is minimal and doesn't require learning new mental models or complicated framework architectures.

Harissa brings 90% of the convenience of a heavy framework with 1% of the overhead.

### Roadmap (to 1.0)

[ ] OpenAPI Support

## Reference

The API aims to only provide the bare essentials with the biggest bang-for-your-buck.

As a result, I think it provides a lovely DX, encourages secure practices (like validation) and ultimately speeds up development.

## `route()`

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

## `createStorage()`

A simple interface for asynchronous `continuation-local-storage` which allows you to correlate logs by ID, for example.

```ts
// Init a store
const storage = createStorage<{ userId: string; logId: string }>();

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

## `HttpException` and `createHttpException`

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

## `middlewareHandler()`

A simple wrapper for defining custom middleware, with async/await and type inference. For routes intended to return data, `routeHandler` might be more helpful.

```ts
middlewareHandler(async (req, res, next) => {
  return { foo: "bar" }; // Warn: This would not do anything

  // In `middlewareHandler` you must explicitly run `res.send()` and the like
});
```

## `routeHandler()`

Route handlers provide basic async/await and auto-json functionality, allowing you to return data directly from the handler. Additionally, it infers the types instead of requiring explicit type signatures.

```ts
routeHandler(async (req, res, next) => {
  // This would be caught and passed to the express exception handler
  const res = await Promise.reject();

  return { foo: "bar" }; // This would be sent as JSON
});
```

## `errorHandler()`

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
