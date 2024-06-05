import Link from "next/link";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { PropsWithChildren, ReactNode } from "react";
import {
  Atom,
  Component,
  GlobeLock,
  Lock,
  NotebookPen,
  Shapes,
} from "lucide-react";

const Card = ({
  title,
  icon,
  children,
}: PropsWithChildren<{ title: string; icon?: ReactNode }>) => {
  return (
    <div className="flex flex-col py-8 pb-8 px-8 gap-y-2 text-start flex-1">
      <div className="flex flex-row items-center gap-x-2">
        {icon}
        <h4 className="text-lg font-medium">{title}</h4>
      </div>
      <p className="max-w-[400px] text-start">{children}</p>
    </div>
  );
};

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
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded py-2 px-4 w-max mx-auto">
          <table>
            <tbody>
              <tr>
                <td>
                  <code>npm i</code>
                </td>
                <td />
              </tr>
              <tr>
                <td />
                <td align="right">
                  <code>@webroute/core</code>
                </td>
              </tr>
              <tr>
                <td />
                <td align="right">
                  <code>@webroute/client</code>
                </td>
              </tr>
              <tr>
                <td />
                <td align="right">
                  <code>@webroute/middleware</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <Link
            href="/docs"
            className="underline text-lg font-medium text-blue-500"
          >
            View docs
          </Link>
        </div>
      </div>
    </main>
  );
}
