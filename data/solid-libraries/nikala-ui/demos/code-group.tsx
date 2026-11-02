import {
  CodeGroup,
  CodeGroupList,
  CodeGroupTrigger,
  CodeGroupContent,
} from "@/components/ui/code-group";
const importCode = `import {
  CodeGroup,
  CodeGroupList,
  CodeGroupTrigger,
  CodeGroupContent,
} from "@/components/ui/code-group";`;
const defaultCode = `<CodeGroup defaultValue="App.tsx">
  <CodeGroupList>
    <CodeGroupTrigger value="App.tsx">App.tsx</CodeGroupTrigger>
    <CodeGroupTrigger value="styles.css">styles.css</CodeGroupTrigger>
    <CodeGroupTrigger value="package.json">package.json</CodeGroupTrigger>
  </CodeGroupList>

  <CodeGroupContent value="App.tsx">
    <pre><code>import { Button } from "@/components/ui/button";

export default function App() {
  return &lt;Button&gt;Click me&lt;/Button&gt;;
}</code></pre>
  </CodeGroupContent>

  <CodeGroupContent value="styles.css">
    <pre><code>@import "tailwindcss";

body {
  @apply bg-background text-foreground;
}</code></pre>
  </CodeGroupContent>

  <CodeGroupContent value="package.json">
    <pre><code>{
  "name": "my-app",
  "dependencies": {
    "@nikala-ui/core": "latest"
  }
}</code></pre>
  </CodeGroupContent>
</CodeGroup>`;
export default function Demo() {

return <>
          <div class="w-full max-w-xl">
            <CodeGroup defaultValue="App.tsx">
              <CodeGroupList>
                <CodeGroupTrigger value="App.tsx">App.tsx</CodeGroupTrigger>
                <CodeGroupTrigger value="styles.css">styles.css</CodeGroupTrigger>
                <CodeGroupTrigger value="package.json">package.json</CodeGroupTrigger>
              </CodeGroupList>

              <CodeGroupContent value="App.tsx">
                <pre class="font-mono text-[13px]">
                  <code>
                    <span class="text-purple-600 dark:text-purple-400 font-medium">import</span> {"{ Button }"} <span class="text-purple-600 dark:text-purple-400 font-medium">from</span> <span class="text-emerald-600 dark:text-emerald-400">"@/components/ui/button"</span>;
                    {"\n\n"}
                    <span class="text-purple-600 dark:text-purple-400 font-medium">export default function</span> <span class="text-blue-600 dark:text-blue-400">App</span>() {"{"}
                    {"\n  "}<span class="text-purple-600 dark:text-purple-400 font-medium">return</span> &lt;<span class="text-amber-600 dark:text-amber-400">Button</span>&gt;Click me&lt;/<span class="text-amber-600 dark:text-amber-400">Button</span>&gt;;
                    {"\n}"}
                  </code>
                </pre>
              </CodeGroupContent>

              <CodeGroupContent value="styles.css">
                <pre class="font-mono text-[13px]">
                  <code>
                    <span class="text-purple-600 dark:text-purple-400 font-medium">@import</span> <span class="text-emerald-600 dark:text-emerald-400">"tailwindcss"</span>;
                    {"\n\n"}
                    <span class="text-amber-600 dark:text-amber-400">body</span> {"{"}
                    {"\n  "}<span class="text-purple-600 dark:text-purple-400">@apply</span> bg-background text-foreground;
                    {"\n}"}
                  </code>
                </pre>
              </CodeGroupContent>

              <CodeGroupContent value="package.json">
                <pre class="font-mono text-[13px]">
                  <code>
                    {"{\n  "}
                    <span class="text-sky-500 font-medium">"name"</span>: <span class="text-emerald-600 dark:text-emerald-400">"my-app"</span>,
                    {"\n  "}
                    <span class="text-sky-500 font-medium">"dependencies"</span>: {"{\n    "}
                    <span class="text-sky-500 font-medium">"@nikala-ui/core"</span>: <span class="text-emerald-600 dark:text-emerald-400">"latest"</span>
                    {"\n  }\n}"}
                  </code>
                </pre>
              </CodeGroupContent>
            </CodeGroup>
          </div>
        </>;
}
