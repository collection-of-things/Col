import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info } from "lucide-solid";
const installCliCode = `bunx @nikala-ui/cli add theme-manager`;
const solidStartSetupCode = `// src/app.tsx
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemeScript } from "@/providers/theme-script";
import "@/app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <ThemeProvider defaultTheme="system" storageKey="nikala-theme">
            {/* Anti-FOUC script executes synchronously before hydration */}
            <ThemeScript storageKey="nikala-theme" />
            <Suspense>{props.children}</Suspense>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}`;
const viteSpaSetupCode = `// src/index.tsx (Vite / Tauri SPA)
import { render } from "solid-js/web";
import { ThemeProvider } from "@/providers/theme-provider";
import App from "./App";
import "./index.css";

render(
  () => (
    <ThemeProvider defaultTheme="system" storageKey="nikala-theme">
      <App />
    </ThemeProvider>
  ),
  document.getElementById("root")!
);`;
const programmaticCode = `import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function CustomThemeSwitcher() {
  const { theme, setTheme, resolvedTheme, accent, setAccent } = useTheme();

  return (
    <div class="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(resolvedTheme() === "dark" ? "light" : "dark")}
      >
        Toggle Theme (Current: {resolvedTheme()})
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setAccent("violet")}
      >
        Set Violet Accent
      </Button>
    </div>
  );
}`;
const buttonCode = `<ThemeToggle mode="button" effect="circular" />`;
const miniCode = `<ThemeToggle mode="mini" effect="circular" />`;
const maxCode = `<ThemeToggle mode="max" effect="circular" />`;
const effectsCode = `<div class="flex flex-wrap items-center gap-6">
  <div class="flex flex-col items-center gap-2">
    <span class="text-xs text-muted-foreground font-mono">effect="circular"</span>
    <ThemeToggle mode="mini" effect="circular" />
  </div>

  <div class="flex flex-col items-center gap-2">
    <span class="text-xs text-muted-foreground font-mono">effect="fade"</span>
    <ThemeToggle mode="mini" effect="fade" />
  </div>

  <div class="flex flex-col items-center gap-2">
    <span class="text-xs text-muted-foreground font-mono">effect="none"</span>
    <ThemeToggle mode="mini" effect="none" />
  </div>
</div>`;
function Demo() {

return <>
          <div class="flex items-center justify-center p-4">
            <ThemeToggle mode="max" effect="circular" />
          </div>
        </>;
}

import { ThemeProvider } from "@/providers/theme-provider";
export default function ThemeDemo() { return <ThemeProvider defaultTheme={document.documentElement.classList.contains("dark") ? "dark" : "light"}><Demo /></ThemeProvider>; }
