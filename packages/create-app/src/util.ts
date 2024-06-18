import { fs, glob, path } from "zx";
import { PackageJson } from "pkg-types";
import { FrameworkTemplate, FrameworkTemplates, GeneratorMode } from "./types";
import { confirm, log } from "@clack/prompts";
import pc from "picocolors";
import { detect } from "detect-package-manager";

export const getPackageJsonOrThrow = async (dir = process.cwd()) => {
  const pkgPath = path.resolve(dir, "package.json");

  const stat = await fs.promises.stat(pkgPath).catch(console.warn);

  if (!stat) {
    throw new Error(
      "package.json not found in current directory.\n" +
        "Ensure you're in a directory with a valid package.json file present."
    );
  }

  const data = await fs.promises.readFile(pkgPath, "utf-8");

  try {
    const json = JSON.parse(data);

    return json as PackageJson;
  } catch (e) {
    throw new Error("Failed to parse package.json.");
  }
};

export const findFramework = (pkg: PackageJson) => {
  for (const dep in pkg.dependencies ?? {}) {
    if (FrameworkTemplates.includes(dep as FrameworkTemplate)) {
      return dep as FrameworkTemplate;
    }
  }
};

export const commonPromptOpts = {
  withClient: () =>
    confirm({
      message: "Do you want client-side type safety?",
    }),
  withOpenApi: () =>
    confirm({
      message: "Do you want automatic OpenAPI spec generation?",
    }),
};

/**
 * Merge two directories deeply, B takes precedence.
 */
export const mergeDirectoryFiles = (
  ...dirs: {
    files: string[];
    base: string;
  }[]
) => {
  const files: Record<string, string> = {};

  for (const dir of dirs) {
    for (const file of dir.files) {
      const key = path.relative(dir.base, file);
      files[key] = file;
    }
  }

  if (files["package.json"]) {
    delete files["package.json"];
  }

  return files;
};

export const mergePkgJson = (...pkgs: PackageJson[]): PackageJson => {
  let result: PackageJson = {};

  for (const { scripts, dependencies, devDependencies, ...rest } of pkgs) {
    result = {
      ...rest,
      scripts: {
        ...result.scripts,
        ...scripts,
      },
      dependencies: {
        ...result.dependencies,
        ...dependencies,
      },
      devDependencies: {
        ...result.devDependencies,
        ...devDependencies,
      },
    };
  }

  return result;
};

export const validateDest = async (destPath: string) => {
  await fs.ensureDir(destPath);
  const files = await fs.promises.readdir(destPath);

  if (files.length > 0) {
    throw new Error("Destination directory is not empty. Aborting.");
  }
};

export const printSuccess = async (destPath: string) => {
  log.success("Weboute app created");
  const pkgMngr = await detect();

  const relative = path.relative(process.cwd(), destPath);
  console.log(
    `\nRun the following:\n\n` +
      `\t${pc.green(`cd ${relative}`)}\n` +
      `\t${pc.green(`${pkgMngr} install`)}`
  );
};

type TemplateConfig = {
  files: string[];
  base: string;
  pkg: PackageJson;
};

export const collectTemplates = async (
  mode: GeneratorMode,
  templates: string[]
) => {
  const base = path.resolve(import.meta.dirname, "..");
  const baseDir = path.join(base, "templates", mode, "base");
  const baseFiles = await glob(`${baseDir}/**`);

  const configs: TemplateConfig[] = [
    {
      base: baseDir,
      files: baseFiles,
      pkg: await getPackageJsonOrThrow(baseDir),
    },
  ];

  for (const template of templates) {
    const templateDir = path.join(base, "templates", mode, template);
    const templateFiles = await glob(`${templateDir}/**`);
    const pkg = await getPackageJsonOrThrow(templateDir);

    configs.push({
      base: templateDir,
      files: templateFiles,
      pkg,
    });
  }

  return configs;
};

export const copyFiles = async (
  destPath: string,
  configs: TemplateConfig[]
) => {
  const files = mergeDirectoryFiles(...configs);
  const pkg = mergePkgJson(...configs.map((x) => x.pkg));

  // Copy files over
  for (const file in files) {
    const src = files[file];

    const outPath = path.join(destPath, file);

    await fs.ensureDir(path.dirname(outPath));
    await fs.copyFile(src, outPath);
  }

  await fs.writeFile(
    path.join(destPath, "package.json"),
    JSON.stringify(pkg, null, 2)
  );
};
