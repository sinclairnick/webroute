import { text, group, select, cancel } from "@clack/prompts";
import { StandaloneOptions, StandaloneTemplate } from "../types";
import { commonPromptOpts } from "../util";
import { GeneratorStandaloneConfig } from "./generator";

export const promptStandalone = async (
  dest?: string
): Promise<GeneratorStandaloneConfig> => {
  const defaultName = dest?.replace(/[\.\/]*/g, "");

  return group(
    {
      name: () =>
        text({
          message: "Project name",
          placeholder: !defaultName?.length ? "webroute-app" : defaultName,
          defaultValue: !defaultName?.length ? "webroute-app" : defaultName,
        }),
      template: () =>
        select({
          message: "Choose a template",
          initialValue: "node" as StandaloneTemplate,
          options: StandaloneOptions,
        }),
      ...commonPromptOpts,
    },
    {
      onCancel: () => {
        cancel("Installation Stopped.");
        process.exit(0);
      },
    }
  );
};
