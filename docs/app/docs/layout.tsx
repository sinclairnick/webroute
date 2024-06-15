import { pageTree } from "../source";
import { DocsLayout } from "fumadocs-ui/layout";
import type { ReactNode } from "react";

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <DocsLayout
        tree={pageTree}
        nav={{
          title: (
            <div className="flex items-center gap-x-2">
              <img src="/webroute.png" className="w-[32px] h-auto mx-auto" />
              <p className="text-blue-600 dark:text-blue-200">Webroute</p>
            </div>
          ),
          githubUrl: "https://github.com/sinclairnick/webroute",
        }}
        sidebar={{ defaultOpenLevel: 0 }}
        links={[
          {
            text: "Documentation",
            url: "/docs",
            external: false,
            type: "main",
          },
          {
            text: "Example",
            url: "https://stackblitz.com/github/sinclairnick/webroute/tree/main/examples/full",
            external: true,
            type: "main",
          },
        ]}
      >
        {children}
      </DocsLayout>
    </>
  );
}
