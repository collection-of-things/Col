import { createSignal } from "solid-js";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
const importCode = `import {
  RichTextEditor,
  EditorToolbar,
  EditorFooter,
  EditorBubbleMenu,
  useRichTextEditor,
} from "@/components/ui/rich-text-editor";`;
const defaultCode = `<RichTextEditor
  value={content()}
  onChange={setContent}
  placeholder="Write your story or type '/' for commands..."
/>`;
const customContent = `<h2>Welcome to Nikala UI Editor 🎨</h2>
<p>A high-performance, full-featured <strong>rich text editor</strong> built natively for SolidJS and Tailwind CSS v4.</p>
<ul data-type="taskList">
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Fine-grained SolidJS reactivity</p></div></li>
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Tailwind CSS v4 semantic design tokens</p></div></li>
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Built-in Markdown and HTML dual view</p></div></li>
</ul>
<blockquote>"Simplicity is the highest goal, achievable when you have overcome all difficulties."</blockquote>
<pre><code>// Copy and paste into your SolidJS app
bunx @nikala-ui/cli add rich-text-editor</code></pre>`;
export default function Demo() {
const [demoValue, setDemoValue] = createSignal(customContent);
return <>
          <div class="w-full max-w-4xl">
            <RichTextEditor
              value={demoValue()}
              onChange={setDemoValue}
              placeholder="Start writing something wonderful..."
            />
          </div>
        </>;
}
