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
        <div>
          <h1 className="text-4xl font-medium mb-4">
            <pre>webroute</pre>
          </h1>
          <p>A toolkit for building scalable web-standard APIs</p>
        </div>

        <div>
          <Link href="/docs" className="underline text-lg font-medium">
            View documentation
          </Link>
        </div>
      </div>

      <hr />

      <div className="flex flex-col items-center mx-8 rounded-xl overflow-hidden border mb-16 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t bg-gray-100 dark:bg-slate-900">
          <Card title="Web Standards" icon={<GlobeLock className="w-6 h-6" />}>
            Future-proof your APIs by leveraging web standards.
          </Card>
          <Card title="Declarative" icon={<NotebookPen className="w-6 h-6" />}>
            Define your route path, methods, validation and more, all in one
            place.
          </Card>
          <Card title="Composable" icon={<Component className="w-6 h-6" />}>
            Use composition to create traceable, type-safe middleware chains.
          </Card>
          <Card title="Atomic" icon={<Atom className="w-6 h-6" />}>
            Each route is a atomic, standalone and easily understood.
          </Card>
          <Card title="Immutable" icon={<Lock className="w-6 h-6" />}>
            No monkey-patching or otherwise altering of <code>Request</code> or{" "}
            <code>Response</code> objects.
          </Card>
          <Card title="Agnostic" icon={<Shapes className="w-6 h-6" />}>
            Use it with your favourite framework or none at all.{" "}
            <code>webroute</code> is router, runtime, framework agnostic.
          </Card>
        </div>
      </div>
    </main>
  );
}
