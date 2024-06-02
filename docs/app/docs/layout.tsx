import { pageTree } from "../source";
import { DocsLayout } from "fumadocs-ui/layout";
import type { ReactNode } from "react";

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="w-full py-2 px-4 flex items-center justify-center bg-blue-900 text-white text-xs gap-x-1 flex-wrap">
        <span className="font-semibold">Webroute </span>
        <span className="bg-white/50 px-2 rounded-full uppercase text-[9px] font-semibold">
          alpha
        </span>
        <span>
          Core functionality is defined. Docs and API are being refined.
        </span>
      </section>
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
      >
        {children}
      </DocsLayout>
    </>
  );
}
