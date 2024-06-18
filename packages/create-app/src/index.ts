import { generateStandalone } from "./standalone/generator";
import { intro } from "@clack/prompts";
import pc from "picocolors";
import { promptStandalone } from "./standalone/prompt";
import { program } from "@commander-js/extra-typings";

program
  .description("Initialize a webroute app")
  .argument("<dest>", "Destination folder")
  .action(async (dest, opts) => {
    intro(pc.bold("Create Webroute App"));

    const mode = "standalone";

    // const mode = await select({
    //   message: "What type of app would you like to create?",
    //   options: [
    //     {
    //       value: "standalone",
    //       label: "Standalone App",
    //       hint: "e.g. bun, node etc.",
    //     },
    //     {
    //       value: "framework",
    //       label: "Using another Framework",
    //       hint: "e.g. next, remix etc.",
    //     },
    //   ],
    //   initialValue: "standalone" as GeneratorMode,
    // });

    switch (mode) {
      // case "framework": {
      //   const result = await promptFramework();
      //   await generateFramework({ ...result, ...opts, dest });
      //   break;
      // }
      case "standalone": {
        const result = await promptStandalone(dest);
        await generateStandalone({ ...result, ...opts, dest });
        break;
      }
    }
  });

program.parse();
