# Webroute

> Building toward a web-standard future

<div>

![Core version](https://img.shields.io/npm/v/%40webroute%2Fcore?label=%40webroute%2Fcore)
![Core size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fcore)
![Client version](https://img.shields.io/npm/v/%40webroute%2Fclient?label=%40webroute%2Fclient)
![Client size](https://img.shields.io/bundlephobia/minzip/%40webroute%2Fclient)

</div>

Webroute is an initiative to build framework-agnostic tooling for web standard APIs.

[**View documentation ->**](https://webroute.vercel.app)

---


### Philosophy

Webroute adheres to a philosophy where tools should be interoperable to avoid repeating the same effort time and time again. As such, the various packages provided are isolated and independent. The goal is to create functionality that can be swapped in and out with other tools that adhere to the same, underlying, web standards.

## In a Nutshell

Webroute boils down to a single export, `route`, which is a tiny utility that makes it easy to build web standard API endpoints that are:
- Declarative
- Atomic
- Interoperable/standard
- Enterprise-grade
- Composible

This is all achieved with this single import:

```ts
import { route } from "@webroute/core
```

This allows us to e.g. validate HTTP inputs and outputs, declare schema shape to enable automatic Open API definitions, and is radically compatible with web standards and any frameworks that might run on web-standards (e.g. nextjs, Hono, Bun, Deno, and many more).

To understand why this might be a good idea, please [read the docs](https://webroute.vercel.app).

## Contribution

Feel free to open any PRs or issues.

## Author

Webroute was initially developed by [Nick Sinclair](https://github.com/sinclairnick)
