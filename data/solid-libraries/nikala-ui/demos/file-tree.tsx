import { FileTree, FileTreeFolder, FileTreeFile } from "@/components/ui/file-tree";
import { Box, Sparkles, Terminal, FileCode2, Settings } from "lucide-solid";
const importCode = `import { FileTree, FileTreeFolder, FileTreeFile } from "@/components/ui/file-tree";`;
const defaultCode = `<FileTree>
  <FileTreeFolder name="src" defaultOpen={true}>
    <FileTreeFolder name="components" defaultOpen={true}>
      <FileTreeFolder name="ui" defaultOpen={true}>
        <FileTreeFile name="button.tsx" />
        <FileTreeFile name="card.tsx" />
        <FileTreeFile name="dialog.tsx" />
      </FileTreeFolder>
      <FileTreeFile name="navbar.tsx" />
    </FileTreeFolder>
    <FileTreeFolder name="routes">
      <FileTreeFile name="index.tsx" />
      <FileTreeFile name="about.tsx" />
    </FileTreeFolder>
    <FileTreeFile name="app.tsx" />
    <FileTreeFile name="app.css" />
  </FileTreeFolder>
  <FileTreeFile name="package.json" />
  <FileTreeFile name="tsconfig.json" />
  <FileTreeFile name="README.md" />
</FileTree>`;
const customIconsCode = `<FileTree>
  <FileTreeFolder
    name="packages"
    defaultOpen={true}
    icon={<Box class="size-3.5 text-purple-500" />}
  >
    <FileTreeFolder
      name="core"
      defaultOpen={true}
      icon={<Sparkles class="size-3.5 text-amber-500" />}
    >
      <FileTreeFile
        name="index.ts"
        icon={<FileCode2 class="size-3.5 text-sky-500" />}
      />
    </FileTreeFolder>
    <FileTreeFolder
      name="cli"
      icon={<Terminal class="size-3.5 text-emerald-500" />}
    >
      <FileTreeFile name="bin.ts" />
    </FileTreeFolder>
  </FileTreeFolder>
  <FileTreeFile
    name="turbo.json"
    icon={<Settings class="size-3.5 text-rose-500" />}
  />
</FileTree>`;
export default function Demo() {

return <>
          <div class="w-full max-w-sm">
            <FileTree>
              <FileTreeFolder name="src" defaultOpen={true}>
                <FileTreeFolder name="components" defaultOpen={true}>
                  <FileTreeFolder name="ui" defaultOpen={true}>
                    <FileTreeFile name="button.tsx" />
                    <FileTreeFile name="card.tsx" />
                    <FileTreeFile name="dialog.tsx" />
                  </FileTreeFolder>
                  <FileTreeFile name="navbar.tsx" />
                </FileTreeFolder>
                <FileTreeFolder name="routes">
                  <FileTreeFile name="index.tsx" />
                  <FileTreeFile name="about.tsx" />
                </FileTreeFolder>
                <FileTreeFile name="app.tsx" />
                <FileTreeFile name="app.css" />
              </FileTreeFolder>
              <FileTreeFile name="package.json" />
              <FileTreeFile name="tsconfig.json" />
              <FileTreeFile name="README.md" />
            </FileTree>
          </div>
        </>;
}
