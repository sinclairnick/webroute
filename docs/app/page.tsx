import Link from "next/link";

const Data = [
  {
    name: "Route",
    npm: "route",
    href: "/docs/route/overview",
    about: "A powerful web-standard route-builder",
  },
  {
    name: "Client",
    npm: "client",
    href: "/docs/client/overview",
    about: "Interact with any REST API with full type-safety",
  },
  {
    name: "Middleware",
    npm: "middleware",
    href: "/docs/middleware/overview",
    about: "A spec for defining middleware reusable across frameworks",
  },
  {
    name: "Router",
    npm: "router",
    href: "/docs/router/overview",
    about: "Basic router matching for web Requests",
  },
  {
    name: "OpenAPI",
    npm: "oas",
    href: "/docs/oas/overview",
    about:
      "Helpers for building OpenAPI definitions with schema/validation libraries",
  },
  {
    name: "Schema",
    npm: "schema",
    href: "/docs/schema/overview",
    about: "Utilities for wrangling the diverse schema library ecosystem",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col text-center max-w-4xl mx-auto">
      <div className="flex flex-col gap-y-8 py-16 px-4">
        <div className="flex flex-col gap-y-2">
          <img src="/webroute.png" className="w-[100px] h-auto mx-auto" />
          <h1 className="text-4xl font-medium mb-4">
            <pre>webroute</pre>
          </h1>
          <p>A toolkit for building scalable web-standard APIs</p>

          <Link
            href="/docs"
            className="underline text-lg font-medium text-blue-500 mt-4"
          >
            View docs
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Data.map((x, i) => {
            return (
              <Link
                key={i}
                href={x.href}
                className="w-full px-4 py-4 rounded-md border text-black dark:text-white flex flex-col gap-y-4 items-start hover:border-black dark:hover:border-white duration-100"
              >
                <div className="flex flex-col items-start gap-y-2">
                  <h2 className="text-xl font-medium">{x.name}</h2>
                  <p className="opacity-60 text-left">{x.about}</p>
                </div>
                <p className="text-sm">
                  <span className="opacity-50">@webroute/</span>
                  <span className="font-medium">{x.npm}</span>
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
