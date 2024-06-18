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
