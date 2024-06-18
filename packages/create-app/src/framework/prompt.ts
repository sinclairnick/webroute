import { group, cancel, log } from "@clack/prompts";
import { FrameworkTemplates } from "../types";
import {
  commonPromptOpts,
  findFramework,
  getPackageJsonOrThrow,
} from "../util";
import { GeneratorFrameworkConfig } from "../framework/generator";

export const promptFramework = async (): Promise<GeneratorFrameworkConfig> => {
  const pkg = await getPackageJsonOrThrow();
  const framework = findFramework(pkg);

  if (framework == null) {
    throw new Error(
      "Could not detect a supported framework in package.json.\n" +
        `Supported frameworks: ${FrameworkTemplates.join(", ")}`
    );
  }

  log.info(
    `Detected framework ${framework} in package.json. Using ${framework} template.`
  );

  const opts = await group(
    {
      ...commonPromptOpts,
    },
    {
      onCancel: () => {
        cancel("Installation Stopped.");
        process.exit(0);
      },
    }
  );

  return { ...opts, framework };
};
