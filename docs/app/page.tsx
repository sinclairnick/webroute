import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webroute",
  description: "Rethinking APIs, from the route up.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col text-center max-w-4xl mx-auto items-center justify-center">
      <img src="/webroute.png" className="w-[100px] h-auto mx-auto" />
      <h1 className="text-4xl font-medium mb-4">
        <pre>webroute</pre>
      </h1>
      <p>{metadata.description}</p>

      <div className="flex gap-x-4 justify-center mx-auto mt-8">
        <Link
          href="/docs"
          className="underline text-lg font-medium text-blue-500 mt-4"
        >
          Documentation
        </Link>
        <Link
          href="https://github.com/sinclairnick/webroute"
          className="underline text-lg font-medium text-blue-500 mt-4"
        >
          Github
        </Link>
      </div>
    </main>
  );
}
