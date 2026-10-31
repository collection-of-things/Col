import { CodeBlock } from "@/components/ui/code-block";
const importCode = `import { CodeBlock } from "@/components/ui/code-block";`;
const defaultCode = `<CodeBlock
  code="bunx @nikala-ui/cli add button"
  isCli={true}
/>`;
const pmSwitcherCode = `<CodeBlock
  code="bunx @nikala-ui/cli add button"
  lang="bash"
  showPmSwitcher={true}
  managers={["bunx", "npx", "pnpm", "yarn"]}
/>`;
const filenameCode = `<CodeBlock
  filename="App.tsx"
  lang="tsx"
  code={\`import { createSignal } from "solid-js";
import { Button } from "@/components/ui/button";

export default function App() {
  const [count, setCount] = createSignal(0);
  return <Button onClick={() => setCount(c => c + 1)}>Count: {count()}</Button>;
}\`}
/>`;
const floatingCopyCode = `<CodeBlock
  lang="javascript"
  code="const greeting = 'Hello, Nikala UI!';\\nconsole.log(greeting);"
/>`;
export default function Demo() {

return <>
          <div class="w-full max-w-xl">
            <CodeBlock
              code="bunx @nikala-ui/cli add button"
              lang="bash"
              isCli={false}
            />
          </div>
        </>;
}
