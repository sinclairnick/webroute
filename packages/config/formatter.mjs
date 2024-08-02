// @ts-check
import { fileURLToPath } from "node:url";
import { dirname, relative } from "node:path";
import { MarkdownPageEvent } from "typedoc-plugin-markdown";

/**
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
  const root = fileURLToPath(new URL("./", import.meta.url));

  // Set "title" frontmatter for each page
  app.renderer.on(
    MarkdownPageEvent.BEGIN,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
    (page) => {
      page.frontmatter = {
        title: page.model.name,
      };
    }
  );

  // Remove ".mdx" from the file extension for each link on every page
  app.renderer.on(
    MarkdownPageEvent.END,
    /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
    (page) => {
      if (!page.contents) return;
      page.contents = page.contents.replace(/\.mdx/g, "");
    }
  );
}
