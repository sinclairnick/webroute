import { map } from "@/.map";
import { createMDXSource, defaultSchemas } from "fumadocs-mdx";
import { loader } from "fumadocs-core/source";
import { icons } from "lucide-react";
import { create } from "@/components/ui/icon";
import z from "zod";

export const { getPage, getPages, pageTree } = loader({
  baseUrl: "/docs",
  rootDir: "docs",
  source: createMDXSource(map, {
    schema: {
      frontmatter: defaultSchemas.frontmatter.extend({
        index: z.boolean().default(false),
      }),
    },
  }),
  icon(icon) {
    if (icon in icons)
      return create({ icon: icons[icon as keyof typeof icons] });
  },
});
