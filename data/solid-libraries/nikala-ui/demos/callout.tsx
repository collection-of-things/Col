import { Callout, CalloutTitle, CalloutDescription } from "@/components/ui/callout";
import { Sparkles, Terminal } from "lucide-solid";
const importCode = `import { Callout, CalloutTitle, CalloutDescription } from "@/components/ui/callout";`;
const defaultCode = `<Callout title="Heads up!">
  Nikala UI is a lightweight, copy-paste component system built natively for Tailwind CSS v4 and SolidJS.
</Callout>`;
const variantsCode = `<div class="flex flex-col gap-4 w-full">
  <Callout variant="note" title="Note">
    This is a standard informational note highlighting general context.
  </Callout>

  <Callout variant="info" title="Important Information">
    Always wrap dynamic children with SolidJS's native <code>children()</code> memoization helper.
  </Callout>

  <Callout variant="tip" title="Pro Tip">
    Use <code>bunx @nikala-ui/cli add &lt;component&gt;</code> to install components directly into your codebase.
  </Callout>

  <Callout variant="warning" title="Deprecation Warning">
    Avoid direct prop destructuring in SolidJS to preserve fine-grained reactivity tracking.
  </Callout>

  <Callout variant="danger" title="Breaking Change">
    The maximum allowed border radius across Nikala UI is <code>rounded-lg</code>.
  </Callout>
</div>`;
const customIconCode = `<Callout
  icon={Sparkles}
  variant="tip"
  title="AI Automation"
>
  You can integrate Nikala UI with Model Context Protocol (MCP) servers for Cursor, Claude Code, and Antigravity.
</Callout>`;
const compoundCode = `<Callout variant="info">
  <CalloutTitle>Compound Composition</CalloutTitle>
  <CalloutDescription>
    You can also use Callout with explicit sub-components for advanced customized layouts.
  </CalloutDescription>
</Callout>`;
export default function Demo() {

return <>
          <div class="w-full max-w-xl">
            <Callout title="Heads up!">
              Nikala UI is a lightweight, copy-paste component system built natively for Tailwind CSS v4 and SolidJS.
            </Callout>
          </div>
        </>;
}
