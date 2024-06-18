import { $, path } from "zx";
import { GeneratorBaseOptions, StandaloneTemplate } from "../types";
import {
  collectTemplates,
  copyFiles,
  printSuccess,
  validateDest,
} from "../util";

export type GeneratorStandaloneConfig = GeneratorBaseOptions & {
  name: string;
  template: StandaloneTemplate;
};

export const generateStandalone = async (config: GeneratorStandaloneConfig) => {
  const { name, template, withClient, withOpenApi, dest } = config;
  const destPath = path.resolve(process.cwd(), dest ?? name);

  validateDest(destPath);

  // Compute files to move over
  const templates: string[] = [template];

  if (withClient) {
    templates.push("+client");
  }

  if (withOpenApi) {
    templates.push("+openapi");
  }

  const configs = await collectTemplates("standalone", templates);

  await copyFiles(destPath, configs);

  printSuccess(destPath);
};
