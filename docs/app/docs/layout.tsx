import { pageTree } from "../source";
import { DocsLayout } from "fumadocs-ui/layout";
import type { ReactNode } from "react";

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="w-full py-2 px-4 flex items-center justify-center bg-blue-900 text-white text-xs gap-x-1 flex-wrap">
        <span className="font-semibold">Webroute </span>
        <span className="bg-white/50 px-2 rounded-full uppercase text-[9px] font-semibold">
          beta
        </span>
        <span>
          Relatively stable. Looking for more feedback before stabilising on
          v1.0.
        </span>
      </section>
      <DocsLayout
        tree={pageTree}
        nav={{
          title: "Webroute",
          githubUrl: "https://github.com/sinclairnick/webroute",
        }}
      >
        {children}
      </DocsLayout>
    </>
  );
}
