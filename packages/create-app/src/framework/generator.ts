import { $ } from "zx";
import { FrameworkTemplate, GeneratorBaseOptions } from "../types";

export type GeneratorFrameworkConfig = GeneratorBaseOptions & {
  framework: FrameworkTemplate;
};

export const generateFramework = async (config: GeneratorFrameworkConfig) => {
  const { framework, withClient, withOpenApi, dest } = config;

  // TODO: Implement one day?
};
