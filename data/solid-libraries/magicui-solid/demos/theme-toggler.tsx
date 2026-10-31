import { createSignal } from "solid-js";
import { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";
export default function ThemeTogglerDemo() { const [theme,setTheme]=createSignal<"light"|"dark">(document.documentElement.dataset.theme==="dark"?"dark":"light"); return <div class="flex justify-center p-6"><AnimatedThemeToggler theme={theme()} onThemeChange={setTheme} /></div>; }
