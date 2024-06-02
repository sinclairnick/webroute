<center>

<img src="./static/webroute.png" style="width: 100px"/>

# Webroute

**Webroute is a suite of independent tools for building server-side apps and APIs, based on the [WinterCG Minimum Common Web API](https://common-min-api.proposal.wintercg.org/).**

</center>

## Philosophy

Webroute adheres to a philosophy where tools should be interoperable to avoid repeating the same effort time and time again. As such, the various packages provided are isolated, independent and will play nicely with the tools of today _and tomorrow_.

**Find more via the [documentation](https://webroute.vercel.app).**

## Compatibility

### Frameworks:

- ✅ Express (via adapter)
- ✅ NextJS
- ✅ Remix
- ✅ SolidStart

### Runtimes:

- ✅ Bun
- ✅ Deno
- ✅ Node (via adapter)
- ✅ Cloudflare Workers
- ✅ Vercel Edge

## [Packages](https://webroute.vercel.app/docs/packages)

Webroute provides several packages that are entirely independent of one another. Combined, they can be used to create fully-fledged apps.

They will work with any framework or runtime that utilises web-standard `Request` and `Response` objects.

---

### [Route](https://webroute.vercel.app/docs/route/overview)

![Core Version](https://img.shields.io/npm/v/%40webroute%2Fcore?label=%40webroute%2Fcore)
![Core License](https://img.shields.io/npm/l/%40webroute%2Fcore)
![Core Size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fcore)

The `@webroute/core` package primarily exports the `route` builder. This enables building routes which support declaring and composing input/output schema, headers, middleware and paths all at once. The result is a single standard request handler which can be used anywhere.

```ts
export const GET = route()
  .use(someMiddleware)
  .params(ParamsSchema)
  .handle(() => {
    /**...*/
  });
```

---

### [Client](https://webroute.vercel.app/docs/client/overview)

![Client Version](https://img.shields.io/npm/v/%40webroute%2Fclient?label=%40webroute%2Fclient)
![Client License](https://img.shields.io/npm/l/%40webroute%2Fclient)
![Client Size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fclient)

`@webroute/client` provides helpers for calling APIs on the client-side with full type-safety. This reduces errors and expedites frontend development.

Unlike most client-side API helpers, `@webroute/client` is agnostic to what tech you're running on the backend. It will work with any REST API regardless of framework, runtime or language.

```ts
// Define endpoints here
type App = DefineApp<{
  // GET /posts?limit=X
  "GET /posts": {
    Query: { limit?: number };
  };
}>;

const client = createTypedClient<App>({
  fetcher: async (
    config,
    opts: AxiosRequestConfig // Provide custom input parameters
  ) => {
    return axios(/**...*/); //  and result type
  },
});

// All of the below is fully type-safe
const getPost = client("GET /post/:id");
const axiosRes = getPost({ id: 123 }, axiosOpts);
```

---

### Middleware

![Middleware version](https://img.shields.io/npm/v/%40webroute%2Fclient?label=%40webroute%2Fmiddleware)
![Client License](https://img.shields.io/npm/l/%40webroute%2Fmiddleware)![Middleware size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fmiddleware)

`@webroute/middleware` is a tiny helper for _defining_ framework-agnostic middleware.

Middleware implementations will be added to separate packages in the future.

---

## Background

To understand why webroute was developed, we should first look at the issues or drawbacks with the current approaches.

```ts
const app = new FrameworkApp();

app.use((req, res, next) => {
  req.doSomething();
  next();
});

app.get("/posts/:id", (req, res) => res.send("..."));
```

This example is what you might see in a typical JS web framework. While familiar, and simple to write, it has several problems. We've largely become numb to these problems, but that doesn't mean they stop being problems.

> [!NOTE]
> The point of this section is not to disparage the existing tools.

### Bespoke Request/Response

Each framework tends to create it's own `Request` and `Response` abstraction. When middleware or other tooling builds on this basis, it immediately becomes coupled to the given framework. Consquently, the reach of it's utility is diminished, and the next framework requires a reimplementation.

For end developers creating backend applications, this additionally means they must learn the ins, outs and various edge cases or idiosyncracies for this particular implementation. This adds mental overhead and often results in unexpected issues. For example, `express` will error if you `res.send` after middleware has already `sent the headers`, which is not remotely obvious.

This leads us to the second issue.

### Visibility and Comprehensibility

Using approaches like the above, where middleware is defined _somewhere_ and handlers _somewhere else_, makes it difficult to answer the question: "what code is actually executed during this request?".

These approaches use the framework, and more specifically it's router, as the source of truth for orchestration. But when our API recieves a request it has a single endpoint, a single destination. Following this logic instead, our route handlers should really be the "true" basis or source of truth for what happens. Additionally, by deferring execution to a router, instead of just using the programming language itself to run the code, the ability for us (and our compiler) to associate related code is greatly diminished, making e.g. type-safety impossible.

### Responsibility

In typical web frameworks, middleware are granted the ability to imperatively orchestrate the app. Given middleware is often non-owned code (third party), this further obscures what's going on under the hood. In actuality, middleware operates in such a way that this affordance is often not worth it.

Instead, webroute _inverts the responsibility_ for orchestration. Middleware is only responsible for _doing work_, and returns values that indicate a _suggestion_ for what should happen next. Instead of `next()`, middleware can return data, a `Response` or a response handler, to indicate whether it has computed some data or state, wants to terminate the request early, or do some post-processing on the outgoing `Response`.

### Mutability

Web frameworks frequently employ mutability as the central mechanism for communication and effecting change. Once again, this makes it more difficult to determine what is happening, or to create robust systems.

Instead, webroute prefers a kind of "functional pipeline" approach, where data flows through various functions which can offer to update that data. It is loosely immutable, meaning it's not _truly_ immutable, but leans into immutability as the primary mechanism, over mutating data.

Every piece of functionality, thus becomes a _producer_, instead of a _mutator_. The end user can then decide what to do with the "produce", if anything. Consequently, our system becomes much more observable and trivially customiseable.

### No Web Standards

Aside from the _bespokeness_ of the `Request` and `Response` objects, described above, most frameworks additionally suffer from not leaning into standards. Web standards are a relatively new and evolving standard which provide an opportunity for more standardised tooling too, if we choose to sieze it.

---

All of these improvements over the traditional approaches enable much more observable and reliable backends. Perhaps even more importantly, any code we (or others) write has a much longer lifetime since it is decoupled from any framework, and built on web-standards.

---

## Contribution

Feel free to [open any PRs or issues](https://github.com/sinclairnick/webroute/issues) or [start a discussion](https://github.com/sinclairnick/webroute/issues).

## Author

Webroute was initially developed by [Nick Sinclair](https://github.com/sinclairnick)
