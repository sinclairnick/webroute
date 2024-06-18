import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { Pre, CodeBlock } from "fumadocs-ui/components/codeblock";

export type InstallProps = {
  name: string;
};

export const Install = ({ name }: InstallProps) => {
  return (
    <Tabs items={["npm", "pnpm", "yarn", "bun"]} defaultIndex={0}>
      <Tab value="npm">
        <CodeBlock>
          <Pre lang="sh">npm i {name}</Pre>
        </CodeBlock>
      </Tab>
      <Tab value="pnpm">
        <CodeBlock>
          <Pre lang="sh">pnpm add {name}</Pre>
        </CodeBlock>
      </Tab>
      <Tab value="yarn">
        <CodeBlock>
          <Pre lang="sh">yarn add {name}</Pre>
        </CodeBlock>
      </Tab>
      <Tab value="bun">
        <CodeBlock>
          <Pre lang="sh">bun add {name}</Pre>
        </CodeBlock>
      </Tab>
    </Tabs>
  );
};
