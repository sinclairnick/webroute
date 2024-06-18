export type GeneratorMode = "standalone" | "framework";

export type StandaloneTemplate = "bun" | "deno" | "node" | "cloudflare";

export const StandaloneOptions = [
  { value: "bun", label: "Bun" },
  { value: "node", label: "Node" },
  { value: "deno", label: "Deno" },
  { value: "cloudflare", label: "Cloudflare Workers" },
] satisfies { value: StandaloneTemplate; label: string }[];

export type FrameworkTemplate =
  | "nextjs"
  | "remix"
  | "solid-start"
  | "svelte-kit";

export const FrameworkOptions = [
  { value: "nextjs", label: "NextJS" },
  { value: "remix", label: "Remix" },
  { value: "solid-start", label: "SolidStart" },
  { value: "svelte-kit", label: "SvelteKit" },
] satisfies { value: FrameworkTemplate; label: string }[];
export const FrameworkTemplates = FrameworkOptions.map((x) => x.value);

export type GeneratorBaseOptions = {
  dest?: string;
  withClient: boolean;
  withOpenApi: boolean;
};
