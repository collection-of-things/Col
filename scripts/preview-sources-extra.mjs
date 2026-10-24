/** Official demo candidates at immutable upstream revisions.
 * The source builder must resolve every import and stylesheet without substituting
 * implementations. A descriptor is not runtime support: failed builds stay unavailable.
 * Exact dependency pins use versions explicitly named in upstream manifests or lockfiles.
 */
const projects = [
  {
    "library": "magic-ui",
    "repo": "magicuidesign/magicui",
    "revision": "efe76fc5755eca1142dd4f74c1d6f0ace2887e3c",
    "licensePath": "LICENSE.md",
    "aliases": {
      "@/": "apps/www/"
    },
    "dependencies": {
      "@radix-ui/react-accordion": "1.2.12",
      "@radix-ui/react-alert-dialog": "1.1.15",
      "@radix-ui/react-collapsible": "1.1.12",
      "@radix-ui/react-context-menu": "2.2.16",
      "@radix-ui/react-dialog": "1.1.15",
      "@radix-ui/react-dropdown-menu": "2.1.16",
      "@radix-ui/react-icons": "1.3.2",
      "@radix-ui/react-label": "2.1.7",
      "@radix-ui/react-popover": "1.1.15",
      "@radix-ui/react-scroll-area": "1.2.10",
      "@radix-ui/react-separator": "1.1.7",
      "@radix-ui/react-slot": "1.2.3",
      "@radix-ui/react-tabs": "1.1.13",
      "@radix-ui/react-tooltip": "1.2.8",
      "@tabler/icons-react": "3.34.1",
      "@tailwindcss/postcss": "4.1.13",
      "canvas-confetti": "1.9.3",
      "class-variance-authority": "0.7.1",
      "clsx": "2.1.1",
      "cmdk": "1.1.1",
      "cobe": "0.6.4",
      "countries-list": "3.2.2",
      "fumadocs-core": "15.8.2",
      "fumadocs-mdx": "12.0.1",
      "fumadocs-ui": "15.7.12",
      "geist": "1.5.1",
      "jotai": "2.14.0",
      "lucide-react": "0.544.0",
      "masonic": "4.1.0",
      "motion": "12.23.12",
      "next": "15.5.25",
      "next-themes": "0.4.6",
      "postcss": "8.5.28",
      "posthog-js": "1.363.1",
      "react": "19.1.1",
      "react-day-picker": "9.11.0",
      "react-dom": "19.1.1",
      "react-tweet": "3.2.2",
      "rough-notation": "0.5.1",
      "schema-dts": "1.1.5",
      "sonner": "1.7.4",
      "svg-dotted-map": "2.0.1",
      "tailwind-merge": "3.3.1",
      "tailwindcss": "4.1.13",
      "ts-morph": "27.0.2",
      "tw-animate-css": "1.3.8",
      "zod": "4.1.11",
      "@eslint/eslintrc": "3.3.1",
      "@ianvs/prettier-plugin-sort-imports": "4.7.0",
      "@shikijs/transformers": "2.5.0",
      "@tailwindcss/typography": "0.5.16",
      "@types/canvas-confetti": "1.9.0",
      "@types/mdx": "2.0.13",
      "@types/node": "22.20.1",
      "@types/react": "19.1.1",
      "@types/react-dom": "19.1.1",
      "eslint": "9.36.0",
      "eslint-config-next": "15.5.4",
      "eslint-config-prettier": "10.1.8",
      "eslint-plugin-react": "7.37.5",
      "mdast-util-toc": "7.1.0",
      "prettier": "3.6.2",
      "prettier-plugin-tailwindcss": "0.6.14",
      "rehype": "13.0.2",
      "rehype-autolink-headings": "7.1.0",
      "rehype-pretty-code": "0.14.1",
      "rehype-slug": "6.0.0",
      "remark": "15.0.1",
      "remark-code-import": "1.2.0",
      "remark-gfm": "4.0.1",
      "rimraf": "6.0.1",
      "shadcn": "3.3.1",
      "shiki": "2.5.0",
      "tsx": "4.20.5",
      "typescript": "5.9.2"
    },
    "cssPaths": [
      "apps/www/styles/globals.css"
    ],
    "entries": [
      [
        "Android",
        "apps/www/registry/example/android-demo.tsx",
        "default"
      ],
      [
        "Animated Beam",
        "apps/www/registry/example/animated-beam-demo.tsx",
        "default"
      ],
      [
        "Animated Circular Progress Bar",
        "apps/www/registry/example/animated-circular-progress-bar-demo.tsx",
        "default"
      ],
      [
        "Animated Gradient Text",
        "apps/www/registry/example/animated-gradient-text-demo.tsx",
        "default"
      ],
      [
        "Animated Grid Pattern",
        "apps/www/registry/example/animated-grid-pattern-demo.tsx",
        "default"
      ],
      [
        "Animated List",
        "apps/www/registry/example/animated-list-demo.tsx",
        "default"
      ],
      [
        "Animated Shiny Text",
        "apps/www/registry/example/animated-shiny-text-demo.tsx",
        "default"
      ],
      [
        "Theme Toggler",
        "apps/www/registry/example/animated-theme-toggler-demo.tsx",
        "default"
      ],
      [
        "Aurora Text",
        "apps/www/registry/example/aurora-text-demo.tsx",
        "default"
      ],
      [
        "Avatar Circles",
        "apps/www/registry/example/avatar-circles-demo.tsx",
        "default"
      ],
      [
        "Backlight",
        "apps/www/registry/example/backlight-image-demo.tsx",
        "default"
      ],
      [
        "Bento Grid",
        "apps/www/registry/example/bento-demo.tsx",
        "default"
      ],
      [
        "Blur Fade",
        "apps/www/registry/example/blur-fade-demo.tsx",
        "default"
      ],
      [
        "Border Beam",
        "apps/www/registry/example/border-beam-demo.tsx",
        "default"
      ],
      [
        "Code Comparison",
        "apps/www/registry/example/code-comparison-demo.tsx",
        "default"
      ],
      [
        "Comic Text",
        "apps/www/registry/example/comic-text-demo.tsx",
        "default"
      ],
      [
        "Confetti",
        "apps/www/registry/example/confetti-demo.tsx",
        "default"
      ],
      [
        "Cool Mode",
        "apps/www/registry/example/cool-mode-demo.tsx",
        "default"
      ],
      [
        "Dia Text Reveal",
        "apps/www/registry/example/dia-text-reveal-demo.tsx",
        "default"
      ],
      [
        "Dock",
        "apps/www/registry/example/dock-demo.tsx",
        "default"
      ],
      [
        "Dot Pattern",
        "apps/www/registry/example/dot-pattern-demo.tsx",
        "default"
      ],
      [
        "Dotted Map",
        "apps/www/registry/example/dotted-map-demo.tsx",
        "default"
      ],
      [
        "File Tree",
        "apps/www/registry/example/file-tree-demo.tsx",
        "default"
      ],
      [
        "Flickering Grid",
        "apps/www/registry/example/flickering-grid-demo.tsx",
        "default"
      ],
      [
        "Floating 3D Particles",
        "apps/www/registry/example/floating-3d-particles-demo.tsx",
        "default"
      ],
      [
        "Glare Hover",
        "apps/www/registry/example/glare-hover-demo.tsx",
        "default"
      ],
      [
        "Globe",
        "apps/www/registry/example/globe-demo.tsx",
        "default"
      ],
      [
        "Glyph Matrix",
        "apps/www/registry/example/glyph-matrix-demo.tsx",
        "default"
      ],
      [
        "Grid Pattern",
        "apps/www/registry/example/grid-pattern-demo.tsx",
        "default"
      ],
      [
        "Hero Video Dialog",
        "apps/www/registry/example/hero-video-dialog-demo.tsx",
        "default"
      ],
      [
        "Hexagon Pattern",
        "apps/www/registry/example/hexagon-pattern-demo.tsx",
        "default"
      ],
      [
        "Highlighter",
        "apps/www/registry/example/highlighter-demo.tsx",
        "default"
      ],
      [
        "Hyper Text",
        "apps/www/registry/example/hyper-text-demo.tsx",
        "default"
      ],
      [
        "Icon Cloud",
        "apps/www/registry/example/icon-cloud-demo.tsx",
        "default"
      ],
      [
        "Interactive Grid Pattern",
        "apps/www/registry/example/interactive-grid-pattern-demo.tsx",
        "default"
      ],
      [
        "Interactive Hover Button",
        "apps/www/registry/example/interactive-hover-button-demo.tsx",
        "default"
      ],
      [
        "iPhone",
        "apps/www/registry/example/iphone-demo.tsx",
        "default"
      ],
      [
        "Kinetic Text",
        "apps/www/registry/example/kinetic-text-demo.tsx",
        "default"
      ],
      [
        "Lens",
        "apps/www/registry/example/lens-demo.tsx",
        "default"
      ],
      [
        "Light Rays",
        "apps/www/registry/example/light-rays-demo.tsx",
        "default"
      ],
      [
        "Line Shadow Text",
        "apps/www/registry/example/line-shadow-text-demo.tsx",
        "default"
      ],
      [
        "Magic Card",
        "apps/www/registry/example/magic-card-demo.tsx",
        "default"
      ],
      [
        "Marquee",
        "apps/www/registry/example/marquee-demo.tsx",
        "default"
      ],
      [
        "Meteors",
        "apps/www/registry/example/meteors-demo.tsx",
        "default"
      ],
      [
        "Morphing Text",
        "apps/www/registry/example/morphing-text-demo.tsx",
        "default"
      ],
      [
        "Neon Gradient Card",
        "apps/www/registry/example/neon-gradient-card-demo.tsx",
        "default"
      ],
      [
        "Noise Texture",
        "apps/www/registry/example/noise-texture-demo.tsx",
        "default"
      ],
      [
        "Number Ticker",
        "apps/www/registry/example/number-ticker-demo.tsx",
        "default"
      ],
      [
        "Orbiting Circles",
        "apps/www/registry/example/orbiting-circles-demo.tsx",
        "default"
      ],
      [
        "Particles",
        "apps/www/registry/example/particles-demo.tsx",
        "default"
      ],
      [
        "Pixel Image",
        "apps/www/registry/example/pixel-image-demo.tsx",
        "default"
      ],
      [
        "Pointer",
        "apps/www/registry/example/pointer-demo-1.tsx",
        "default"
      ],
      [
        "Progressive Blur",
        "apps/www/registry/example/progressive-blur-demo.tsx",
        "default"
      ],
      [
        "Pulsating Button",
        "apps/www/registry/example/pulsating-button-demo.tsx",
        "default"
      ],
      [
        "Rainbow Button",
        "apps/www/registry/example/rainbow-button-demo.tsx",
        "default"
      ],
      [
        "Retro Grid",
        "apps/www/registry/example/retro-grid-demo.tsx",
        "default"
      ],
      [
        "Ripple",
        "apps/www/registry/example/ripple-demo.tsx",
        "default"
      ],
      [
        "Ripple Button",
        "apps/www/registry/example/ripple-button-demo.tsx",
        "default"
      ],
      [
        "Safari",
        "apps/www/registry/example/safari-demo.tsx",
        "default"
      ],
      [
        "Scroll Based Velocity",
        "apps/www/registry/example/scroll-based-velocity-demo.tsx",
        "default"
      ],
      [
        "Scroll Progress",
        "apps/www/registry/example/scroll-progress-demo.tsx",
        "default"
      ],
      [
        "Shimmer Button",
        "apps/www/registry/example/shimmer-button-demo.tsx",
        "default"
      ],
      [
        "Shine Border",
        "apps/www/registry/example/shine-border-demo.tsx",
        "default"
      ],
      [
        "Shiny Button",
        "apps/www/registry/example/shiny-button-demo.tsx",
        "default"
      ],
      [
        "Smooth Cursor",
        "apps/www/registry/example/smooth-cursor-demo.tsx",
        "default"
      ],
      [
        "Sparkles Text",
        "apps/www/registry/example/sparkles-text-demo.tsx",
        "default"
      ],
      [
        "Spinning Text",
        "apps/www/registry/example/spinning-text-demo.tsx",
        "default"
      ],
      [
        "Striped Pattern",
        "apps/www/registry/example/striped-pattern-demo.tsx",
        "default"
      ],
      [
        "Terminal",
        "apps/www/registry/example/terminal-demo.tsx",
        "default"
      ],
      [
        "Text 3D Flip",
        "apps/www/registry/example/text-3d-flip-demo.tsx",
        "default"
      ],
      [
        "Text Animate",
        "apps/www/registry/example/text-animate-demo.tsx",
        "default"
      ],
      [
        "Text Reveal",
        "apps/www/registry/example/text-reveal-demo.tsx",
        "default"
      ],
      [
        "Tweet Card",
        "apps/www/registry/example/tweet-card-demo.tsx",
        "default"
      ],
      [
        "Typing Animation",
        "apps/www/registry/example/typing-animation-demo.tsx",
        "default"
      ],
      [
        "Video Text",
        "apps/www/registry/example/video-text-demo.tsx",
        "default"
      ],
      [
        "Warp Background",
        "apps/www/registry/example/warp-background-demo.tsx",
        "default"
      ],
      [
        "Word Rotate",
        "apps/www/registry/example/word-rotate-demo.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "cult-ui",
    "repo": "nolly-studio/cult-ui",
    "revision": "7f031dc812f7bda10213bab62752dd6d080297ff",
    "licensePath": "LICENSE.md",
    "aliases": {
      "@/": "apps/www/"
    },
    "dependencies": {
      "@base-ui/react": "1.3.0",
      "@faker-js/faker": "8.2.0",
      "@hookform/resolvers": "3.10.0",
      "@hugeicons/core-free-icons": "3.1.1",
      "@hugeicons/react": "1.1.5",
      "@mdx-js/react": "3.1.1",
      "@next/third-parties": "16.0.1",
      "@paper-design/shaders-react": "0.0.72",
      "@radix-ui/react-accessible-icon": "1.1.7",
      "@radix-ui/react-accordion": "1.2.12",
      "@radix-ui/react-alert-dialog": "1.1.15",
      "@radix-ui/react-aspect-ratio": "1.1.7",
      "@radix-ui/react-avatar": "1.1.10",
      "@radix-ui/react-checkbox": "1.3.3",
      "@radix-ui/react-collapsible": "1.1.12",
      "@radix-ui/react-context-menu": "2.2.16",
      "@radix-ui/react-dialog": "1.1.15",
      "@radix-ui/react-dropdown-menu": "2.1.16",
      "@radix-ui/react-hover-card": "1.1.15",
      "@radix-ui/react-icons": "1.3.2",
      "@radix-ui/react-label": "2.1.7",
      "@radix-ui/react-menubar": "1.1.16",
      "@radix-ui/react-navigation-menu": "1.2.14",
      "@radix-ui/react-popover": "1.1.15",
      "@radix-ui/react-portal": "1.1.9",
      "@radix-ui/react-progress": "1.1.7",
      "@radix-ui/react-radio-group": "1.3.8",
      "@radix-ui/react-scroll-area": "1.2.10",
      "@radix-ui/react-select": "2.2.6",
      "@radix-ui/react-separator": "1.1.7",
      "@radix-ui/react-slider": "1.3.6",
      "@radix-ui/react-slot": "1.2.3",
      "@radix-ui/react-switch": "1.2.6",
      "@radix-ui/react-tabs": "1.1.13",
      "@radix-ui/react-toast": "1.2.15",
      "@radix-ui/react-toggle": "1.1.10",
      "@radix-ui/react-toggle-group": "1.1.11",
      "@radix-ui/react-tooltip": "1.2.8",
      "@radix-ui/react-use-controllable-state": "1.2.2",
      "@rive-app/react-webgl2": "4.26.2",
      "@streamdown/cjk": "1.0.2",
      "@streamdown/code": "1.0.2",
      "@streamdown/math": "1.0.2",
      "@streamdown/mermaid": "1.0.2",
      "@tabler/icons-react": "3.34.1",
      "@tailwindcss/postcss": "4.1.13",
      "@tailwindcss/typography": "0.5.16",
      "@tanstack/react-table": "8.9.1",
      "@types/unist": "3.0.3",
      "@vercel/analytics": "1.2.2",
      "@vercel/og": "0.0.21",
      "@xyflow/react": "12.10.0",
      "ai": "6.0.79",
      "ansi-to-react": "6.2.6",
      "border-beam": "1.0.1",
      "chroma-js": "3.0.0",
      "class-variance-authority": "0.7.1",
      "clsx": "2.1.1",
      "cmdk": "1.1.1",
      "cobe": "2.0.1",
      "date-fns": "2.30.0",
      "dither-plugin": "1.1.1",
      "embla-carousel-autoplay": "8.0.0-rc15",
      "embla-carousel-react": "8.0.0-rc15",
      "eslint-config-next": "16.0.1",
      "fumadocs-core": "15.7.11",
      "fumadocs-docgen": "3.0.0",
      "fumadocs-mdx": "11.9.1",
      "fumadocs-ui": "15.7.11",
      "geist": "1.7.0",
      "input-otp": "1.4.2",
      "jotai": "2.1.0",
      "lodash.template": "4.5.0",
      "lucide-react": "0.544.0",
      "markdown-wasm": "1.2.0",
      "media-chrome": "4.17.2",
      "metal-fx": "1.0.4",
      "motion": "12.35.2",
      "nanoid": "5.1.6",
      "next": "16.3.6",
      "next-themes": "0.4.6",
      "poline": "0.7.0",
      "radix-ui": "1.4.3",
      "react": "19.2.4",
      "react-day-picker": "9.9.0",
      "react-dom": "19.2.4",
      "react-hook-form": "7.62.0",
      "react-jsx-parser": "2.4.1",
      "react-player": "2.16.0",
      "react-resizable-panels": "0.0.55",
      "react-tweet": "3.2.2",
      "react-use-measure": "2.1.1",
      "react-wrap-balancer": "0.4.1",
      "recharts": "3.2.0",
      "rehype-pretty-code": "0.14.1",
      "rimraf": "6.0.1",
      "shadcn": "3.5.0",
      "sharp": "0.31.3",
      "shiki": "1.29.2",
      "sonner": "2.0.0",
      "streamdown": "2.2.0",
      "swr": "2.2.5",
      "tailwind-merge": "3.5.0",
      "tailwindcss-animate": "1.0.5",
      "three": "0.168.0",
      "tokenlens": "1.3.1",
      "ts-morph": "22.0.0",
      "use-stick-to-bottom": "1.1.3",
      "vaul": "1.1.2",
      "zod": "3.25.76",
      "@ianvs/prettier-plugin-sort-imports": "4.4.1",
      "@types/lodash.template": "4.5.1",
      "@types/mdx": "2.0.13",
      "@types/node": "20.11.27",
      "@types/react": "19.2.2",
      "@types/react-color": "3.0.6",
      "@types/react-dom": "19.2.2",
      "@types/three": "0.168.0",
      "esbuild": "0.17.19",
      "eslint": "8.41.0",
      "postcss": "8.5.6",
      "tailwindcss": "4.2.2",
      "typescript": "5.9.2",
      "unist-builder": "4.0.0",
      "unist-util-visit": "5.0.0"
    },
    "cssPaths": [
      "apps/www/styles/globals.css"
    ],
    "entries": [
      [
        "Agent Suggest Card Stack",
        "apps/www/registry/default/example/agent-suggest-card-stack-demo.tsx",
        "default"
      ],
      [
        "AI Blob Warp",
        "apps/www/registry/default/example/ai-blob-warp-demo.tsx",
        "default"
      ],
      [
        "AI Instructions",
        "apps/www/registry/default/example/ai-instructions-demo.tsx",
        "default"
      ],
      [
        "Analytics Chart",
        "apps/www/registry/default/example/analytics-chart-demo.tsx",
        "default"
      ],
      [
        "Apple Iphone 17 Pro",
        "apps/www/registry/default/example/apple-iphone-17-pro-demo.tsx",
        "default"
      ],
      [
        "Apple Keyboard",
        "apps/www/registry/default/example/apple-keyboard-demo.tsx",
        "default"
      ],
      [
        "Apple Pro Display Xdr",
        "apps/www/registry/default/example/apple-pro-display-xdr-demo.tsx",
        "default"
      ],
      [
        "Apple Watch Ultra",
        "apps/www/registry/default/example/apple-watch-ultra-demo.tsx",
        "default"
      ],
      [
        "Bg Animate Button",
        "apps/www/registry/default/example/bg-animate-button-demo.tsx",
        "default"
      ],
      [
        "Bg Animated Fractal Grid",
        "apps/www/registry/default/example/bg-animated-fractal-dot-grid-demo.tsx",
        "default"
      ],
      [
        "Bg Image Texture",
        "apps/www/registry/default/example/bg-image-texture-demo.tsx",
        "default"
      ],
      [
        "Bg Media",
        "apps/www/registry/default/example/bg-media-demo.tsx",
        "default"
      ],
      [
        "Border Beam Button",
        "apps/www/registry/default/example/border-beam-button-demo.tsx",
        "default"
      ],
      [
        "Border Beam Card",
        "apps/www/registry/default/example/border-beam-card-demo.tsx",
        "default"
      ],
      [
        "Border Beam Input",
        "apps/www/registry/default/example/border-beam-input-demo.tsx",
        "default"
      ],
      [
        "Canvas Fractal Grid",
        "apps/www/registry/default/example/canvas-fractal-grid-demo.tsx",
        "default"
      ],
      [
        "Choice Poll",
        "apps/www/registry/default/example/choice-poll-demo.tsx",
        "default"
      ],
      [
        "Circuit Board",
        "apps/www/registry/default/example/circuit-board-demo.tsx",
        "default"
      ],
      [
        "Code Block",
        "apps/www/registry/default/example/code-block-demo.tsx",
        "default"
      ],
      [
        "Collab Avatar",
        "apps/www/registry/default/example/collab-avatar-demo.tsx",
        "default"
      ],
      [
        "Collab Toolbar",
        "apps/www/registry/default/example/collab-toolbar-demo.tsx",
        "default"
      ],
      [
        "Color Picker",
        "apps/www/registry/default/example/color-picker-demo.tsx",
        "default"
      ],
      [
        "Copy Button",
        "apps/www/registry/default/example/copy-button-demo.tsx",
        "default"
      ],
      [
        "Cosmic Button",
        "apps/www/registry/default/example/cosmic-button-demo.tsx",
        "default"
      ],
      [
        "Cutout Card",
        "apps/www/registry/default/example/cutout-card-demo.tsx",
        "default"
      ],
      [
        "Direction Aware Tabs",
        "apps/www/registry/default/example/direction-aware-tabs-demo.tsx",
        "default"
      ],
      [
        "Distorted Glass",
        "apps/www/registry/default/example/distorted-glass-demo.tsx",
        "default"
      ],
      [
        "Dither Image",
        "apps/www/registry/default/example/dither-image-demo.tsx",
        "default"
      ],
      [
        "Dock",
        "apps/www/registry/default/example/dock-demo.tsx",
        "default"
      ],
      [
        "Dynamic Island",
        "apps/www/registry/default/example/dynamic-island-demo.tsx",
        "default"
      ],
      [
        "Edge Blur",
        "apps/www/registry/default/example/edge-blur-demo.tsx",
        "default"
      ],
      [
        "Expandable",
        "apps/www/registry/default/example/expandable-demo.tsx",
        "default"
      ],
      [
        "Expandable Screen",
        "apps/www/registry/default/example/expandable-screen-demo.tsx",
        "default"
      ],
      [
        "Family Button",
        "apps/www/registry/default/example/family-button-demo.tsx",
        "default"
      ],
      [
        "Family Drawer",
        "apps/www/registry/default/example/family-drawer-demo.tsx",
        "default"
      ],
      [
        "Feature Carousel",
        "apps/www/registry/default/example/feature-carousel-demo.tsx",
        "default"
      ],
      [
        "Feature Poll",
        "apps/www/registry/default/example/feature-poll-demo.tsx",
        "default"
      ],
      [
        "Feature Sticky Section",
        "apps/www/registry/default/example/feature-sticky-section-demo.tsx",
        "default"
      ],
      [
        "Feature Voting",
        "apps/www/registry/default/example/feature-voting-demo.tsx",
        "default"
      ],
      [
        "File Icons",
        "apps/www/registry/default/example/file-icons-demo.tsx",
        "default"
      ],
      [
        "Floating Panel",
        "apps/www/registry/default/example/floating-panel-demo.tsx",
        "default"
      ],
      [
        "Fluid AI Workloads",
        "apps/www/registry/default/example/fluid-ai-workloads-demo.tsx",
        "default"
      ],
      [
        "Fluted Glass",
        "apps/www/registry/default/example/fluted-glass-demo.tsx",
        "default"
      ],
      [
        "Folded Card",
        "apps/www/registry/default/example/folded-card-demo.tsx",
        "default"
      ],
      [
        "Gateway Endpoint Illustration",
        "apps/www/registry/default/example/gateway-endpoint-illustration-demo.tsx",
        "default"
      ],
      [
        "Gateway Route Illustration",
        "apps/www/registry/default/example/gateway-route-illustration-demo.tsx",
        "default"
      ],
      [
        "Gateway SVG Illustration",
        "apps/www/registry/default/example/gateway-svg-illustration-demo.tsx",
        "default"
      ],
      [
        "Globe",
        "apps/www/registry/default/example/globe-demo.tsx",
        "default"
      ],
      [
        "Gradient Button Group",
        "apps/www/registry/default/example/gradient-button-group-demo.tsx",
        "default"
      ],
      [
        "Gradient Heading",
        "apps/www/registry/default/example/gradient-heading-demo.tsx",
        "default"
      ],
      [
        "Grid Beam",
        "apps/www/registry/default/example/grid-beam-demo.tsx",
        "default"
      ],
      [
        "Halo Badge",
        "apps/www/registry/default/example/halo-badge-demo.tsx",
        "default"
      ],
      [
        "Halo Button",
        "apps/www/registry/default/example/halo-button-demo.tsx",
        "default"
      ],
      [
        "Halo Card",
        "apps/www/registry/default/example/halo-card-demo.tsx",
        "default"
      ],
      [
        "Halo Dropzone",
        "apps/www/registry/default/example/halo-dropzone-demo.tsx",
        "default"
      ],
      [
        "Halo Field",
        "apps/www/registry/default/example/halo-field-demo.tsx",
        "default"
      ],
      [
        "Halo Input",
        "apps/www/registry/default/example/halo-input-demo.tsx",
        "default"
      ],
      [
        "Halo Notification",
        "apps/www/registry/default/example/halo-notification-demo.tsx",
        "default"
      ],
      [
        "Halo Progress",
        "apps/www/registry/default/example/halo-progress-demo.tsx",
        "default"
      ],
      [
        "Halo Search",
        "apps/www/registry/default/example/halo-search-demo.tsx",
        "default"
      ],
      [
        "Halo Segmented",
        "apps/www/registry/default/example/halo-segmented-demo.tsx",
        "default"
      ],
      [
        "Halo Select",
        "apps/www/registry/default/example/halo-select-demo.tsx",
        "default"
      ],
      [
        "Halo Switch",
        "apps/www/registry/default/example/halo-switch-demo.tsx",
        "default"
      ],
      [
        "Halo Tabs",
        "apps/www/registry/default/example/halo-tabs-demo.tsx",
        "default"
      ],
      [
        "Halo Toast",
        "apps/www/registry/default/example/halo-toast-demo.tsx",
        "default"
      ],
      [
        "Halo Toggle Group",
        "apps/www/registry/default/example/halo-toggle-group-demo.tsx",
        "default"
      ],
      [
        "Hero Color Panels",
        "apps/www/registry/default/example/hero-color-panels-demo.tsx",
        "default"
      ],
      [
        "Hero Dithering",
        "apps/www/registry/default/example/hero-dithering-demo.tsx",
        "default"
      ],
      [
        "Hero Heatmap",
        "apps/www/registry/default/example/hero-heatmap-demo.tsx",
        "default"
      ],
      [
        "Hero Liquid Metal",
        "apps/www/registry/default/example/hero-liquid-metal-demo.tsx",
        "default"
      ],
      [
        "Hero Static Radial Gradient",
        "apps/www/registry/default/example/hero-static-radial-gradient-demo.tsx",
        "default"
      ],
      [
        "Hover Video Player",
        "apps/www/registry/default/example/hover-video-player-demo.tsx",
        "default"
      ],
      [
        "Illustration Card Grid",
        "apps/www/registry/default/example/illustration-card-grid-demo.tsx",
        "default"
      ],
      [
        "Illustration Comment Bubble",
        "apps/www/registry/default/example/illustration-comment-bubble-demo.tsx",
        "default"
      ],
      [
        "Illustration Cursor",
        "apps/www/registry/default/example/illustration-cursor-demo.tsx",
        "default"
      ],
      [
        "Illustration Fluid Rendering",
        "apps/www/registry/default/example/illustration-fluid-rendering-demo.tsx",
        "default"
      ],
      [
        "Illustration Globe Vercel",
        "apps/www/registry/default/example/illustration-globe-vercel-demo.tsx",
        "default"
      ],
      [
        "Illustration Graph",
        "apps/www/registry/default/example/illustration-graph-demo.tsx",
        "default"
      ],
      [
        "Intro Disclosure",
        "apps/www/registry/default/example/intro-disclosure-demo.tsx",
        "default"
      ],
      [
        "Kanban Board",
        "apps/www/registry/default/example/kanban-board-demo.tsx",
        "default"
      ],
      [
        "Lightboard",
        "apps/www/registry/default/example/lightboard-demo.tsx",
        "default"
      ],
      [
        "Loading Carousel",
        "apps/www/registry/default/example/loading-carousel-demo.tsx",
        "default"
      ],
      [
        "Logo Carousel",
        "apps/www/registry/default/example/logo-carousel-demo.tsx",
        "default"
      ],
      [
        "Mac Screen",
        "apps/www/registry/default/example/mac-screen-demo.tsx",
        "default"
      ],
      [
        "Marketing Feature Code",
        "apps/www/registry/default/example/marketing-feature-code-demo.tsx",
        "default"
      ],
      [
        "Marketing Hero Analytics",
        "apps/www/registry/default/example/marketing-hero-analytics-demo.tsx",
        "default"
      ],
      [
        "Merging Bubbles",
        "apps/www/registry/default/example/merging-bubbles-demo.tsx",
        "default"
      ],
      [
        "Metal Button",
        "apps/www/registry/default/example/metal-button-demo.tsx",
        "default"
      ],
      [
        "Minimal Card",
        "apps/www/registry/default/example/minimal-card-demo.tsx",
        "default"
      ],
      [
        "Mock Browser Window",
        "apps/www/registry/default/example/mock-browser-window-demo.tsx",
        "default"
      ],
      [
        "Morph Surface",
        "apps/www/registry/default/example/morph-surface-demo.tsx",
        "default"
      ],
      [
        "Neumorph Button",
        "apps/www/registry/default/example/neumorph-button-demo.tsx",
        "default"
      ],
      [
        "Neumorph Eyebrow",
        "apps/www/registry/default/example/neumorph-eyebrow-demo.tsx",
        "default"
      ],
      [
        "Onboarding",
        "apps/www/registry/default/example/onboarding-demo.tsx",
        "default"
      ],
      [
        "Organic Button",
        "apps/www/registry/default/example/organic-button-demo.tsx",
        "default"
      ],
      [
        "Organic Card",
        "apps/www/registry/default/example/organic-card-demo.tsx",
        "default"
      ],
      [
        "Organic Card Small",
        "apps/www/registry/default/example/organic-card-small-demo.tsx",
        "default"
      ],
      [
        "Pixel Heading Character",
        "apps/www/registry/default/example/pixel-heading-character-demo.tsx",
        "default"
      ],
      [
        "Pixel Heading Word",
        "apps/www/registry/default/example/pixel-heading-word-demo.tsx",
        "default"
      ],
      [
        "Pixel Paragraph Words",
        "apps/www/registry/default/example/pixel-paragraph-words-demo.tsx",
        "default"
      ],
      [
        "Pixel Paragraph Words Inverse",
        "apps/www/registry/default/example/pixel-paragraph-words-inverse-demo.tsx",
        "default"
      ],
      [
        "Poll Widget",
        "apps/www/registry/default/example/poll-widget-demo.tsx",
        "default"
      ],
      [
        "Popover",
        "apps/www/registry/default/example/popover-demo.tsx",
        "default"
      ],
      [
        "Popover Form",
        "apps/www/registry/default/example/popover-form-demo.tsx",
        "default"
      ],
      [
        "Prompt Composer",
        "apps/www/registry/default/example/prompt-composer-demo.tsx",
        "default"
      ],
      [
        "Prompt Library",
        "apps/www/registry/default/example/prompt-library-demo.tsx",
        "default"
      ],
      [
        "Rolling Number",
        "apps/www/registry/default/example/rolling-number-demo.tsx",
        "default"
      ],
      [
        "Security Checkpoint",
        "apps/www/registry/default/example/security-checkpoint-demo.tsx",
        "default"
      ],
      [
        "Shader Lens Blur",
        "apps/www/registry/default/example/shader-lens-blur-demo.tsx",
        "default"
      ],
      [
        "Shadow Card",
        "apps/www/registry/default/example/shadow-card-demo.tsx",
        "default"
      ],
      [
        "Shift Card",
        "apps/www/registry/default/example/shift-card-demo.tsx",
        "default"
      ],
      [
        "Side Panel",
        "apps/www/registry/default/example/side-panel-demo.tsx",
        "default"
      ],
      [
        "Sortable List",
        "apps/www/registry/default/example/sortable-list-demo.tsx",
        "default"
      ],
      [
        "Speech Bubble",
        "apps/www/registry/default/example/speech-bubble-demo.tsx",
        "default"
      ],
      [
        "Squiggle Arrow",
        "apps/www/registry/default/example/squiggle-arrow-demo.tsx",
        "default"
      ],
      [
        "Stripe Bg Guides",
        "apps/www/registry/default/example/stripe-bg-guides-demo.tsx",
        "default"
      ],
      [
        "SVG Bands",
        "apps/www/registry/default/example/svg-bands-demo.tsx",
        "default"
      ],
      [
        "SVG Shapes",
        "apps/www/registry/default/example/svg-shapes-demo.tsx",
        "default"
      ],
      [
        "SVG Shapes Animated",
        "apps/www/registry/default/example/svg-shapes-animated-demo.tsx",
        "default"
      ],
      [
        "Tabs Illustration Vercel",
        "apps/www/registry/default/example/tabs-illustration-vercel-demo.tsx",
        "default"
      ],
      [
        "Terminal Animation",
        "apps/www/registry/default/example/terminal-animation-demo.tsx",
        "TerminalAnimationDemo"
      ],
      [
        "Text Animate",
        "apps/www/registry/default/example/text-animate-demo.tsx",
        "default"
      ],
      [
        "Text GIF",
        "apps/www/registry/default/example/text-gif-demo.tsx",
        "default"
      ],
      [
        "Texture Button",
        "apps/www/registry/default/example/texture-button-demo.tsx",
        "default"
      ],
      [
        "Texture Card",
        "apps/www/registry/default/example/texture-card-demo.tsx",
        "default"
      ],
      [
        "Texture Overlay",
        "apps/www/registry/default/example/texture-overlay-demo.tsx",
        "default"
      ],
      [
        "Three D Carousel",
        "apps/www/registry/default/example/three-d-carousel-demo.tsx",
        "default"
      ],
      [
        "Timer",
        "apps/www/registry/default/example/timer-demo.tsx",
        "default"
      ],
      [
        "Toolbar Expandable",
        "apps/www/registry/default/example/toolbar-expandable-demo.tsx",
        "default"
      ],
      [
        "Tweet Grid",
        "apps/www/registry/default/example/tweet-grid-demo.tsx",
        "default"
      ],
      [
        "Typewriter",
        "apps/www/registry/default/example/typewriter-demo.tsx",
        "default"
      ],
      [
        "Vote Tally",
        "apps/www/registry/default/example/vote-tally-demo.tsx",
        "default"
      ],
      [
        "Wizard Expandable",
        "apps/www/registry/default/example/wizard-expandable-demo.tsx",
        "default"
      ],
      [
        "Youtube Video Player",
        "apps/www/registry/default/example/youtube-video-player-demo.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "kibo-ui",
    "repo": "shadcnblocks/kibo",
    "revision": "3d63cdb15b79d972e3dc38a10997987672f9b263",
    "licensePath": "license.md",
    "aliases": {
      "@/": "apps/docs/",
      "@/components/": "packages/shadcn-ui/components/",
      "@/lib/": "packages/shadcn-ui/lib/",
      "@repo/": "packages/"
    },
    "dependencies": {
      "@faker-js/faker": "10.0.0",
      "@hookform/resolvers": "5.2.2",
      "@icons-pack/react-simple-icons": "13.12.0",
      "@logtail/next": "0.3.1",
      "@modelcontextprotocol/sdk": "1.27.1",
      "@next/bundle-analyzer": "16.1.6",
      "@next/third-parties": "16.1.6",
      "@number-flow/react": "0.6.0",
      "@octokit/rest": "22.0.1",
      "@tailwindcss/postcss": "4.2.1",
      "@vercel/analytics": "1.6.1",
      "date-fns": "4.1.0",
      "fumadocs-core": "16.6.10",
      "fumadocs-mdx": "14.2.9",
      "fumadocs-typescript": "5.1.5",
      "fumadocs-ui": "16.6.10",
      "glob": "13.0.6",
      "import-in-the-middle": "3.0.0",
      "lodash.groupby": "4.6.0",
      "lucide-react": "0.545.0",
      "mcp-handler": "1.0.7",
      "motion": "12.23.24",
      "next": "16.1.6",
      "next-plausible": "3.12.5",
      "next-themes": "0.4.6",
      "postcss-nested": "7.0.2",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "react-hook-form": "7.65.0",
      "react-icons": "5.5.0",
      "react-player": "3.4.0",
      "react-tweet": "3.3.0",
      "recharts": "2.15.4",
      "require-in-the-middle": "8.0.1",
      "schema-dts": "1.1.5",
      "shadcn": "4.0.0",
      "shiki": "3.13.0",
      "sonner": "2.0.7",
      "ts-morph": "27.0.2",
      "tw-animate-css": "1.4.0",
      "zod": "4.1.12",
      "@types/lodash.groupby": "4.6.9",
      "@types/node": "25.3.5",
      "@types/react": "19.2.14",
      "@types/react-dom": "19.2.3",
      "postcss": "8.5.8",
      "tailwindcss": "4.2.1",
      "typescript": "5.9.3",
      "@radix-ui/react-icons": "1.3.2",
      "class-variance-authority": "0.7.1",
      "clsx": "2.1.1",
      "cmdk": "1.1.1",
      "embla-carousel-react": "8.6.0",
      "input-otp": "1.4.2",
      "react-day-picker": "9.11.1",
      "react-resizable-panels": "3.0.6",
      "tailwind-merge": "3.3.1",
      "vaul": "1.1.2",
      "@radix-ui/react-use-controllable-state": "1.2.2",
      "jotai": "2.15.0",
      "radix-ui": "1.4.3",
      "@shikijs/transformers": "3.13.0",
      "color": "5.0.2",
      "@types/color": "4.2.0",
      "react-svg-credit-card-payment-icons": "4.2.1",
      "react-dropzone": "14.3.8",
      "@floating-ui/dom": "1.7.4",
      "@tiptap/core": "3.6.6",
      "@tiptap/extension-code-block-lowlight": "3.6.6",
      "@tiptap/extension-list": "3.6.6",
      "@tiptap/extension-subscript": "3.6.6",
      "@tiptap/extension-superscript": "3.6.6",
      "@tiptap/extension-table": "3.6.6",
      "@tiptap/extension-text-style": "3.6.6",
      "@tiptap/extension-typography": "3.6.6",
      "@tiptap/extensions": "3.6.6",
      "@tiptap/pm": "3.6.6",
      "@tiptap/react": "3.6.6",
      "@tiptap/starter-kit": "3.6.6",
      "@tiptap/suggestion": "3.6.6",
      "fuse.js": "7.1.0",
      "lowlight": "3.3.0",
      "tippy.js": "6.3.7",
      "@dnd-kit/core": "6.3.1",
      "@dnd-kit/modifiers": "9.0.0",
      "@uidotdev/usehooks": "2.4.1",
      "lodash.throttle": "4.1.1",
      "@types/lodash.throttle": "4.1.9",
      "react-image-crop": "11.0.10",
      "react-medium-image-zoom": "5.4.0",
      "@dnd-kit/sortable": "10.0.0",
      "@dnd-kit/utilities": "3.2.2",
      "tunnel-rat": "0.1.2",
      "react-fast-marquee": "1.6.5",
      "@tanstack/react-table": "8.21.3",
      "culori": "4.0.2",
      "qrcode": "1.5.4",
      "@types/culori": "4.0.1",
      "@types/qrcode": "1.5.5",
      "@codesandbox/sandpack-react": "2.20.0",
      "media-chrome": "4.14.0"
    },
    "cssPaths": [
      "apps/docs/app/global.css"
    ],
    "entries": [
      [
        "Announcement",
        "apps/docs/examples/announcement.tsx",
        "default"
      ],
      [
        "Avatar Stack",
        "apps/docs/examples/avatar-stack.tsx",
        "default"
      ],
      [
        "Banner",
        "apps/docs/examples/banner.tsx",
        "default"
      ],
      [
        "Calendar",
        "apps/docs/examples/calendar.tsx",
        "default"
      ],
      [
        "Choicebox",
        "apps/docs/examples/choicebox.tsx",
        "default"
      ],
      [
        "Code Block",
        "apps/docs/examples/code-block.tsx",
        "default"
      ],
      [
        "Color Picker",
        "apps/docs/examples/color-picker.tsx",
        "default"
      ],
      [
        "Combobox",
        "apps/docs/examples/combobox.tsx",
        "default"
      ],
      [
        "Comparison",
        "apps/docs/examples/comparison.tsx",
        "default"
      ],
      [
        "Contribution Graph",
        "apps/docs/examples/contribution-graph.tsx",
        "default"
      ],
      [
        "Credit Card",
        "apps/docs/examples/credit-card.tsx",
        "default"
      ],
      [
        "Cursor",
        "apps/docs/examples/cursor.tsx",
        "default"
      ],
      [
        "Deck",
        "apps/docs/examples/deck.tsx",
        "default"
      ],
      [
        "Dialog Stack",
        "apps/docs/examples/dialog-stack.tsx",
        "default"
      ],
      [
        "Dropzone",
        "apps/docs/examples/dropzone.tsx",
        "default"
      ],
      [
        "Editor",
        "apps/docs/examples/editor.tsx",
        "default"
      ],
      [
        "Gantt",
        "apps/docs/examples/gantt.tsx",
        "default"
      ],
      [
        "Glimpse",
        "apps/docs/examples/glimpse.tsx",
        "default"
      ],
      [
        "Image Crop",
        "apps/docs/examples/image-crop.tsx",
        "default"
      ],
      [
        "Image Zoom",
        "apps/docs/examples/image-zoom.tsx",
        "default"
      ],
      [
        "Kanban",
        "apps/docs/examples/kanban.tsx",
        "default"
      ],
      [
        "List",
        "apps/docs/examples/list.tsx",
        "default"
      ],
      [
        "Marquee",
        "apps/docs/examples/marquee.tsx",
        "default"
      ],
      [
        "Mini Calendar",
        "apps/docs/examples/mini-calendar.tsx",
        "default"
      ],
      [
        "Pill",
        "apps/docs/examples/pill.tsx",
        "default"
      ],
      [
        "QR Code",
        "apps/docs/examples/qr-code.tsx",
        "default"
      ],
      [
        "Rating",
        "apps/docs/examples/rating.tsx",
        "default"
      ],
      [
        "Reel",
        "apps/docs/examples/reel.tsx",
        "default"
      ],
      [
        "Relative Time",
        "apps/docs/examples/relative-time.tsx",
        "default"
      ],
      [
        "Sandbox",
        "apps/docs/examples/sandbox.tsx",
        "default"
      ],
      [
        "Snippet",
        "apps/docs/examples/snippet.tsx",
        "default"
      ],
      [
        "Spinner",
        "apps/docs/examples/spinner.tsx",
        "default"
      ],
      [
        "Status",
        "apps/docs/examples/status.tsx",
        "default"
      ],
      [
        "Stories",
        "apps/docs/examples/stories.tsx",
        "default"
      ],
      [
        "Table",
        "apps/docs/examples/table.tsx",
        "default"
      ],
      [
        "Tags",
        "apps/docs/examples/tags.tsx",
        "default"
      ],
      [
        "Theme Switcher",
        "apps/docs/examples/theme-switcher.tsx",
        "default"
      ],
      [
        "Ticker",
        "apps/docs/examples/ticker.tsx",
        "default"
      ],
      [
        "Tree",
        "apps/docs/examples/tree.tsx",
        "default"
      ],
      [
        "Typography",
        "apps/docs/examples/typography.tsx",
        "default"
      ],
      [
        "Video Player",
        "apps/docs/examples/video-player.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "intent-ui",
    "repo": "irsyadadl/intentui",
    "revision": "28ec90171b94007f2504b229612fb59df4aa223d",
    "licensePath": "LICENSE",
    "aliases": {
      "@/": "src/"
    },
    "dependencies": {
      "@heroicons/react": "2.2.0",
      "@intentui/icons": "1.11.3",
      "@internationalized/number": "3.6.9",
      "@react-aria/i18n": "3.13.0",
      "@react-stately/color": "3.10.0",
      "@react-stately/data": "3.16.0",
      "@shikijs/rehype": "4.0.2",
      "@shikijs/transformers": "4.0.2",
      "@wandry/analytics-sdk": "1.16.0",
      "cn": "0.2.4",
      "culori": "4.0.2",
      "dotenv": "17.4.2",
      "embla-carousel-autoplay": "8.6.0",
      "embla-carousel-react": "8.6.0",
      "fumadocs-core": "16.8.10",
      "fumadocs-mdx": "15.0.3",
      "input-otp": "1.4.2",
      "motion": "12.38.0",
      "next": "16.2.6",
      "next-themes": "0.4.6",
      "ntcjs": "1.1.3",
      "onedollarstats": "0.0.23",
      "react": "19.2.6",
      "react-aria-components": "1.22.0",
      "react-dom": "19.2.6",
      "react-intersection-observer": "10.0.3",
      "react-resizable-panels": "4.11.0",
      "recharts": "3.8.1",
      "rehype-stringify": "10.0.1",
      "scroll-into-view-if-needed": "3.1.0",
      "shadcn": "4.22.1",
      "sharp": "0.35.4",
      "shiki": "4.0.2",
      "sonner": "2.0.7",
      "tailwind-variants": "3.2.2",
      "tailwindcss-react-aria-components": "2.1.1",
      "textarea-caret": "3.1.0",
      "tw-animate-css": "1.4.0",
      "use-debounce": "10.1.1",
      "@react-aria/test-utils": "1.0.0-rc.1",
      "@tailwindcss/postcss": "4.3.0",
      "@testing-library/dom": "10.4.2",
      "@testing-library/jest-dom": "7.0.1",
      "@testing-library/react": "16.3.3",
      "@testing-library/user-event": "14.6.7",
      "@types/culori": "4.0.1",
      "@types/mdx": "2.0.13",
      "@types/node": "25.6.2",
      "@types/react": "19.2.14",
      "@types/react-dom": "19.2.3",
      "@types/textarea-caret": "3.0.4",
      "babel-plugin-react-compiler": "1.0.0",
      "baseline-browser-mapping": "2.10.29",
      "encoding": "0.1.13",
      "jsdom": "30.1.0",
      "oxfmt": "0.73.0",
      "oxlint": "1.64.0",
      "postcss": "8.5.14",
      "rehype-autolink-headings": "7.1.0",
      "rehype-slug": "6.0.0",
      "tailwindcss": "4.3.0",
      "tsx": "4.21.0",
      "typescript": "6.0.3",
      "vitest": "5.0.1"
    },
    "cssPaths": [
      "src/styles/app.css"
    ],
    "entries": [
      [
        "Button",
        "src/components/examples/buttons/button/button-basic-example.tsx",
        "default"
      ],
      [
        "Combo Box",
        "src/components/examples/pickers/combo-box/combo-box-example.tsx",
        "default"
      ],
      [
        "Text Field",
        "src/components/examples/forms/text-field/text-field-example.tsx",
        "default"
      ],
      [
        "Dialog",
        "src/components/examples/overlays/dialog/dialog-example.tsx",
        "default"
      ],
      [
        "Table",
        "src/components/examples/collections/table/table-example.tsx",
        "default"
      ],
      [
        "Date Picker",
        "src/components/examples/date-and-time/date-picker/date-picker-example.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "reui",
    "repo": "keenthemes/reui",
    "revision": "067aa0dc7f8bbfec1cd76fc5ad31f842be5f569a",
    "licensePath": "LICENSE.md",
    "aliases": {
      "@/": ""
    },
    "dependencies": {
      "@base-ui/react": "1.5.0",
      "@date-fns/tz": "1.5.0",
      "@dnd-kit/core": "6.3.1",
      "@dnd-kit/modifiers": "9.0.0",
      "@dnd-kit/sortable": "10.0.0",
      "@dnd-kit/utilities": "3.2.2",
      "@headless-tree/core": "1.6.3",
      "@headless-tree/react": "1.6.3",
      "@hookform/resolvers": "5.2.2",
      "@hugeicons/core-free-icons": "4.1.4",
      "@hugeicons/react": "1.1.7",
      "@phosphor-icons/react": "2.1.10",
      "@radix-ui/react-accordion": "1.2.14",
      "@radix-ui/react-alert-dialog": "1.1.17",
      "@radix-ui/react-aspect-ratio": "1.1.10",
      "@radix-ui/react-avatar": "1.1.12",
      "@radix-ui/react-collapsible": "1.1.14",
      "@radix-ui/react-dialog": "1.1.17",
      "@radix-ui/react-dropdown-menu": "2.1.18",
      "@radix-ui/react-popover": "1.1.17",
      "@radix-ui/react-scroll-area": "1.2.12",
      "@radix-ui/react-slot": "1.2.5",
      "@radix-ui/react-tabs": "1.1.15",
      "@radix-ui/react-tooltip": "1.2.10",
      "@remixicon/react": "4.9.0",
      "@shadcn/react": "0.3.1",
      "@tabler/icons-react": "3.41.1",
      "@tailwindcss/postcss": "4.2.4",
      "@tanstack/react-table": "9.0.0",
      "@tanstack/react-virtual": "3.14.3",
      "@vercel/analytics": "2.0.1",
      "@vercel/speed-insights": "2.0.0",
      "class-variance-authority": "0.7.1",
      "cmdk": "1.1.1",
      "cn": "0.3.0",
      "date-fns": "4.1.0",
      "embla-carousel-autoplay": "8.6.0",
      "embla-carousel-react": "8.6.0",
      "front-matter": "4.0.2",
      "fumadocs-core": "16.11.5",
      "fumadocs-mdx": "14.2.14",
      "fumadocs-ui": "16.11.5",
      "input-otp": "1.4.2",
      "jotai": "2.19.1",
      "little-date": "1.2.1",
      "lru-cache": "11.2.7",
      "lucide-react": "1.17.0",
      "motion": "12.38.0",
      "next": "16.3.8",
      "next-themes": "0.4.6",
      "nuqs": "2.8.9",
      "postcss": "8.5.25",
      "radix-ui": "1.4.3",
      "react": "19.2.7",
      "react-day-picker": "9.14.0",
      "react-dom": "19.2.7",
      "react-hook-form": "7.72.1",
      "react-phone-number-input": "3.4.17",
      "react-resizable-panels": "4.7.6",
      "recharts": "3.8.1",
      "rehype-pretty-code": "0.14.3",
      "rimraf": "6.1.3",
      "shiki": "4.3.1",
      "sonner": "2.0.7",
      "ts-morph": "27.0.2",
      "vaul": "1.1.2",
      "zod": "4.3.6",
      "@eslint/eslintrc": "3.3.5",
      "@ianvs/prettier-plugin-sort-imports": "4.7.1",
      "@shadcn/lint": "0.1.0",
      "@types/mdx": "2.0.14",
      "@types/node": "25.5.2",
      "@types/react": "19.2.17",
      "@types/react-dom": "19.2.3",
      "@typescript-eslint/parser": "8.58.2",
      "concurrently": "9.1.0",
      "esbuild": "0.28.1",
      "eslint": "10.0.3",
      "eslint-config-next": "16.3.8",
      "p-limit": "7.3.0",
      "prettier": "3.8.4",
      "prettier-plugin-tailwindcss": "0.7.4",
      "shadcn": "4.18.0",
      "tailwindcss": "4.3.1",
      "tsx": "4.21.1",
      "tw-animate-css": "1.4.0",
      "typescript": "5.9.3",
      "unist-builder": "4.0.0",
      "unist-util-visit": "5.1.0"
    },
    "cssPaths": [
      "styles/globals.css"
    ],
    "entries": [
      [
        "Data Grid",
        "registry-reui/bases/base/components/data-grid/c-data-grid-1.tsx",
        "default"
      ],
      [
        "Kanban",
        "registry-reui/bases/base/components/kanban/c-kanban-1.tsx",
        "default"
      ],
      [
        "Gantt",
        "registry-reui/bases/base/components/gantt/c-gantt-1.tsx",
        "default"
      ],
      [
        "File Upload",
        "registry-reui/bases/base/components/file-upload/c-file-upload-1.tsx",
        "default"
      ],
      [
        "Number Field",
        "registry-reui/bases/base/components/number-field/c-number-field-1.tsx",
        "default"
      ],
      [
        "Tree",
        "registry-reui/bases/base/components/tree/c-tree-1.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "elevenlabs-ui",
    "repo": "elevenlabs/ui",
    "revision": "3a28ebab197f8cfa599934f52db12ad1396e54f4",
    "licensePath": "LICENSE.md",
    "aliases": {
      "@/": "apps/www/"
    },
    "dependencies": {
      "@dnd-kit/core": "6.3.1",
      "@dnd-kit/modifiers": "9.0.0",
      "@dnd-kit/sortable": "10.0.0",
      "@dnd-kit/utilities": "3.2.2",
      "@elevenlabs/client": "1.7.0",
      "@elevenlabs/elevenlabs-js": "2.20.1",
      "@elevenlabs/react": "1.6.0",
      "@faker-js/faker": "8.2.0",
      "@hookform/resolvers": "3.10.0",
      "@radix-ui/react-accessible-icon": "1.1.1",
      "@radix-ui/react-accordion": "1.2.2",
      "@radix-ui/react-alert-dialog": "1.1.5",
      "@radix-ui/react-aspect-ratio": "1.1.1",
      "@radix-ui/react-avatar": "1.1.2",
      "@radix-ui/react-checkbox": "1.1.3",
      "@radix-ui/react-collapsible": "1.1.2",
      "@radix-ui/react-context-menu": "2.2.5",
      "@radix-ui/react-dialog": "1.1.5",
      "@radix-ui/react-dropdown-menu": "2.1.5",
      "@radix-ui/react-hover-card": "1.1.5",
      "@radix-ui/react-icons": "1.3.2",
      "@radix-ui/react-label": "2.1.1",
      "@radix-ui/react-menubar": "1.1.5",
      "@radix-ui/react-navigation-menu": "1.2.4",
      "@radix-ui/react-popover": "1.1.5",
      "@radix-ui/react-portal": "1.1.3",
      "@radix-ui/react-progress": "1.1.1",
      "@radix-ui/react-radio-group": "1.2.2",
      "@radix-ui/react-scroll-area": "1.2.3",
      "@radix-ui/react-select": "2.1.5",
      "@radix-ui/react-separator": "1.1.1",
      "@radix-ui/react-slider": "1.3.5",
      "@radix-ui/react-slot": "1.2.3",
      "@radix-ui/react-switch": "1.2.5",
      "@radix-ui/react-tabs": "1.1.2",
      "@radix-ui/react-toast": "1.2.5",
      "@radix-ui/react-toggle": "1.1.1",
      "@radix-ui/react-toggle-group": "1.1.1",
      "@radix-ui/react-tooltip": "1.1.7",
      "@react-three/drei": "10.7.6",
      "@react-three/fiber": "9.3.0",
      "@tabler/icons-react": "3.31.0",
      "@tanstack/react-table": "8.9.1",
      "@types/three": "0.180.0",
      "@upstash/redis": "1.35.6",
      "@vercel/analytics": "1.4.1",
      "ai": "5.0.59",
      "change-case": "5.4.4",
      "chrono-node": "2.8.2",
      "class-variance-authority": "0.7.1",
      "clsx": "2.1.1",
      "cmdk": "1.1.1",
      "date-fns": "4.1.0",
      "embla-carousel-autoplay": "8.5.2",
      "embla-carousel-react": "8.5.2",
      "framer-motion": "12.23.19",
      "fumadocs-core": "15.3.1",
      "fumadocs-docgen": "2.0.0",
      "fumadocs-mdx": "11.6.3",
      "fumadocs-ui": "15.3.1",
      "hls.js": "1.6.13",
      "input-otp": "1.4.2",
      "jotai": "2.1.0",
      "little-date": "1.0.0",
      "lodash": "4.17.21",
      "lucide-react": "0.474.0",
      "motion": "12.12.1",
      "next": "16.0.10",
      "next-themes": "0.4.6",
      "postcss": "8.5.1",
      "react": "19.2.1",
      "react-day-picker": "9.7.0",
      "react-dom": "19.2.1",
      "react-hook-form": "7.54.2",
      "react-resizable-panels": "2.1.7",
      "recharts": "2.15.1",
      "rehype-pretty-code": "0.14.1",
      "rimraf": "6.0.1",
      "shadcn": "3.3.1",
      "shiki": "3.13.0",
      "sonner": "2.0.0",
      "streamdown": "1.6.10",
      "swiper": "12.0.2",
      "tailwind-merge": "3.0.1",
      "three": "0.180.0",
      "ts-morph": "18.0.0",
      "use-stick-to-bottom": "1.1.1",
      "vaul": "1.1.2",
      "zod": "3.24.1",
      "@ianvs/prettier-plugin-sort-imports": "4.4.1",
      "@types/lodash": "4.17.7",
      "@types/mdx": "2.0.13",
      "@types/react": "19.2.7",
      "@types/react-dom": "19.2.3",
      "eslint-config-next": "16.2.4",
      "prettier": "3.4.2",
      "prettier-plugin-tailwindcss": "0.6.11",
      "tailwindcss": "4.1.11",
      "tw-animate-css": "1.2.4",
      "unist-builder": "3.0.0",
      "unist-util-visit": "4.1.2"
    },
    "cssPaths": [
      "apps/www/styles/globals.css"
    ],
    "entries": [
      [
        "Orb",
        "apps/www/registry/elevenlabs-ui/examples/orb-demo.tsx",
        "default"
      ],
      [
        "Audio Player",
        "apps/www/registry/elevenlabs-ui/examples/audio-player-demo.tsx",
        "default"
      ],
      [
        "Waveform",
        "apps/www/registry/elevenlabs-ui/examples/waveform-demo.tsx",
        "default"
      ],
      [
        "Live Waveform",
        "apps/www/registry/elevenlabs-ui/examples/live-waveform-demo.tsx",
        "default"
      ],
      [
        "Conversation",
        "apps/www/registry/elevenlabs-ui/examples/conversation-demo.tsx",
        "default"
      ],
      [
        "Voice Button",
        "apps/www/registry/elevenlabs-ui/examples/voice-button-demo.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "tween-ui",
    "repo": "StaticMania/tween-ui",
    "revision": "11b68c10f2407af5e598aad9baeb729cbeeeda92",
    "licensePath": "LICENSE",
    "aliases": {
      "@/": "apps/docs/"
    },
    "dependencies": {
      "@gsap/react": "2.1.2",
      "@number-flow/react": "0.6.2",
      "clsx": "2.1.1",
      "docora": "0.0.4",
      "gsap": "3.13.0",
      "lucide-react": "0.545.0",
      "next": "16.3.1",
      "react": "19.2.0",
      "react-dom": "19.2.0",
      "swiper": "14.2.0",
      "tailwind-merge": "3.6.0",
      "@ianvs/prettier-plugin-sort-imports": "4.4.0",
      "@tailwindcss/postcss": "4.3.3",
      "@testing-library/dom": "10.4.0",
      "@testing-library/jest-dom": "6.6.3",
      "@testing-library/react": "16.1.0",
      "@types/node": "26.2.0",
      "@types/react": "19.2.18",
      "@types/react-dom": "19.2.4",
      "@vitejs/plugin-react": "4.3.4",
      "jsdom": "25.0.1",
      "prettier": "3.4.2",
      "prettier-plugin-tailwindcss": "0.6.11",
      "shadcn": "4.21.0",
      "shiki": "4.4.3",
      "tailwindcss": "4.3.3",
      "tsx": "4.20.0",
      "typescript": "5.9.3",
      "vitest": "3.0.5"
    },
    "cssPaths": [
      "apps/docs/app/globals.css"
    ],
    "entries": [
      [
        "Flip Card",
        "apps/docs/registry/demos/flip-card.tsx",
        "default"
      ],
      [
        "Glow Button",
        "apps/docs/registry/demos/glow-button.tsx",
        "default"
      ],
      [
        "Magnetic Button",
        "apps/docs/registry/demos/magnetic-button.tsx",
        "default"
      ],
      [
        "Morphing Text",
        "apps/docs/registry/demos/morphing-text.tsx",
        "default"
      ],
      [
        "Number Counter",
        "apps/docs/registry/demos/number-counter.tsx",
        "default"
      ],
      [
        "Sliding Tabs",
        "apps/docs/registry/demos/sliding-tabs.tsx",
        "default"
      ],
      [
        "Pricing Plan Switch",
        "apps/docs/registry/demos/pricing-plan-switch.tsx",
        "default"
      ],
      [
        "Integration Hub",
        "apps/docs/registry/demos/integration-hub.tsx",
        "default"
      ]
    ]
  },
  {
    "library": "hextaui",
    "repo": "preetsuthar17/hextaui",
    "revision": "8e1dc5a0a75944cbc971fd5c48c8339331d847d1",
    "licensePath": "LICENSE",
    "aliases": {
      "@/": ""
    },
    "dependencies": {
      "@base-ui/react": "1.9.0",
      "@better-auth/drizzle-adapter": "1.7.12",
      "@modelcontextprotocol/server": "2.3.1",
      "@next/third-parties": "16.4.2",
      "@shadcn/react": "0.3.1",
      "@tabler/icons-react": "3.49.0",
      "@tanstack/react-table": "9.3.1",
      "better-auth": "1.7.12",
      "class-variance-authority": "0.7.1",
      "cmdk": "1.1.1",
      "cn": "0.5.0",
      "date-fns": "4.4.0",
      "dodopayments": "2.55.0",
      "drizzle-orm": "0.45.4",
      "next": "16.4.2",
      "next-themes": "0.4.6",
      "react": "19.3.1",
      "react-day-picker": "10.0.2",
      "react-dom": "19.3.1",
      "react-resizable-panels": "4.14.8",
      "recharts": "3.10.1",
      "shadcn": "4.22.1",
      "shiki": "4.5.0",
      "tw-animate-css": "1.4.0",
      "zod": "4.6.7",
      "@ai-sdk/react": "4.0.152",
      "@cloudflare/workers-types": "5.20261021.1",
      "@modelcontextprotocol/client": "2.3.1",
      "@shadcn/lint": "0.2.3",
      "@testing-library/dom": "10.4.2",
      "@testing-library/react": "16.3.3",
      "@typescript-eslint/parser": "8.72.0",
      "ai": "7.0.148",
      "drizzle-kit": "0.31.11",
      "eslint": "10.13.0",
      "jsdom": "30.1.3",
      "prettier": "3.9.10",
      "prettier-plugin-tailwindcss": "0.8.1",
      "tailwindcss": "4.3.3",
      "streamdown": "2.7.1",
      "vitest": "5.0.5",
      "wrangler": "4.151.3"
    },
    "cssPaths": [
      "app/globals.css"
    ],
    "entries": [
      [
        "Button",
        "components/examples/button/demo.tsx",
        "ButtonDemo"
      ],
      [
        "Dialog",
        "components/examples/dialog/demo.tsx",
        "DialogDemo"
      ],
      [
        "Combobox",
        "components/examples/combobox/demo.tsx",
        "ComboboxDemo"
      ],
      [
        "Command",
        "components/examples/command/demo.tsx",
        "CommandDemo"
      ],
      [
        "Data Table",
        "components/examples/data-table/demo.tsx",
        "DataTableDemo"
      ],
      [
        "Date Picker",
        "components/examples/date-picker/demo.tsx",
        "DatePickerDemo"
      ],
      [
        "Sidebar",
        "components/examples/sidebar/demo.tsx",
        "SidebarDemo"
      ],
      [
        "Toast",
        "components/examples/toast/demo.tsx",
        "ToastDemo"
      ]
    ]
  },
  {
    "library": "beui",
    "repo": "starc007/ui-components",
    "revision": "eae023673c89dc9da5a12b59d43dd1b3720190c3",
    "licensePath": "LICENSE",
    "aliases": {
      "@/": ""
    },
    "dependencies": {
      "@floating-ui/dom": "1.8.0",
      "@opennextjs/cloudflare": "1.20.8",
      "@paper-design/shaders-react": "0.0.76",
      "motion": "12.43.0",
      "@shikijs/transformers": "4.2.0",
      "@tanstack/react-virtual": "3.14.4",
      "border-beam": "1.3.0",
      "clsx": "2.1.1",
      "geist": "1.7.2",
      "lenis": "1.3.23",
      "lucide-react": "1.16.0",
      "next": "16.3.8",
      "next-themes": "0.4.6",
      "react": "19.0.0",
      "react-dom": "19.0.0",
      "react-tweet": "3.3.1",
      "react-use-measure": "2.1.7",
      "shiki": "4.2.0",
      "tailwind-merge": "3.6.0",
      "tracwell": "0.4.0",
      "uqr": "0.1.3",
      "@biomejs/biome": "2.4.16",
      "@happy-dom/global-registrator": "20.10.6",
      "@tailwindcss/postcss": "4.0.0",
      "@testing-library/dom": "10.4.1",
      "@testing-library/react": "16.3.2",
      "@types/bun": "1.3.14",
      "@types/jest-axe": "3.5.9",
      "@types/node": "22.10.5",
      "@types/react": "19.0.7",
      "@types/react-dom": "19.0.3",
      "jest-axe": "10.0.0",
      "postcss": "8.5.1",
      "react-docgen-typescript": "2.4.0",
      "tailwindcss": "4.0.0",
      "typescript": "5.7.3",
      "wrangler": "4.125.0"
    },
    "cssPaths": [
      "app/globals.css"
    ],
    "entries": [
      [
        "Button",
        "components/previews/motion/button-base.preview.tsx",
        "ButtonBasePreview"
      ],
      [
        "Morphing Modal",
        "components/previews/motion/morphing-modal.preview.tsx",
        "MorphingModalPreview"
      ],
      [
        "Dynamic Island",
        "components/previews/blocks/dynamic-island.preview.tsx",
        "DynamicIslandPreview"
      ],
      [
        "Animated Toast Stack",
        "components/previews/motion/animated-toast-stack.preview.tsx",
        "AnimatedToastStackPreview"
      ],
      [
        "Tilt Card",
        "components/previews/motion/tilt-card.preview.tsx",
        "TiltCardPreview"
      ],
      [
        "Bottom Sheet",
        "components/previews/motion/bottom-sheet.preview.tsx",
        "BottomSheetPreview"
      ]
    ]
  },
  {
    "library": "loading-dev",
    "repo": "jakubkrehel/loading",
    "revision": "755235bf7eea3dfb05ec4c3661088e3521ee2d75",
    "licensePath": "LICENSE.md",
    "aliases": {},
    "dependencies": {
      "@biomejs/biome": "2.5.15",
      "@types/node": "26.6.4",
      "@types/react": "19.3.0",
      "@types/react-dom": "19.3.0",
      "oxlint": "1.88.0",
      "react": "19.3.1",
      "react-dom": "19.3.1",
      "tsdown": "0.23.0",
      "typescript": "7.0.2",
      "ultracite": "8.0.1",
      "vitest": "5.0.3"
    },
    "cssPaths": [],
    "entries": [
      [
        "Arc",
        "src/arc.tsx",
        "Arc"
      ],
      [
        "Classic",
        "src/classic.tsx",
        "Classic"
      ],
      [
        "Comet",
        "src/comet.tsx",
        "Comet"
      ],
      [
        "Ripple",
        "src/ripple.tsx",
        "Ripple"
      ],
      [
        "Wave",
        "src/wave.tsx",
        "Wave"
      ]
    ]
  }
];

export const extraSourceDescriptors = projects.flatMap(({entries, library, ...source}) =>
  entries.map(([name, entryPath, exportName]) => ({
    id: library + '/' + name, ...source, entryPath, exportName,
    gaps: [
      library === 'loading-dev' ? 'Uses the actual upstream spinner export with its default props and intrinsic styles.' : 'Uses the upstream official demo with its fixed sample data and composition. Application data, callbacks and surrounding layout are not connected.',
      'Upstream theme CSS is included where listed. Site fonts and external images, media, network services and device APIs are not copied; blocked or unavailable resources must be reported.',
    ],
  }))
);

export const extraSourceBlockers = {
  "uiarc": "The official registry has component TSX, CSS modules, arc-foundation and arc-motion-tokens, but this public source tree contains no standalone official demo composition. A registry-files loader plus CSS-module compilation and verified composition/provider are required.",
  "react-bits": "The current official license prohibits redistribution of the components themselves, including bundles. A distributable source adapter requires upstream permission.",
  "aceternity-ui": "The catalog records no official source repository. No immutable licensed source and complete demo dependency closure has been established.",
  "origin-ui": "The catalog now points to coss. The pinned upstream repository is AGPL-3.0 and the formerly referenced LICENSING.md is absent. Component-specific redistribution terms must be established before vendoring.",
  "shadcn-svelte": "These are Svelte source components backed by Bits UI. They need the Svelte compiler and actual Bits UI dependency closure plus the selected shadcn-svelte theme. Replacing them with the React shadcn recipe would not reproduce this library.",
  "inspira-ui": "Official examples are Vue SFCs under app/components/inspira/examples. The current preview compiler executes React JSX and cannot compile Vue templates or mount their lifecycle. Compile untouched SFCs with the matching @vue/compiler-sfc and Vue runtime, preserving scoped styles and Nuxt auto-import dependencies.",
  "reka-ui": "Official standalone CSS demos exist as Vue SFCs under docs/components/demo/{Component}/css/index.vue with sibling styles.css. A Vue SFC compilation and createApp/mount path is needed; rendering Radix React would be a different implementation.",
  "melt-ui": "Official components use Svelte runes/builders and Svelte templates. They require the matching Svelte compiler/client mount and demo dependency closure; React JSX cannot reproduce the original behavior.",
  "zard-ui": "The registry contains Angular components/directives and templates. Browser preview needs an Angular AOT build, dependency-injection/bootstrap context and stylesheet closure; the React renderer cannot execute Angular decorators/templates.",
  "spartan-ui": "Spartan Helm/Brain are Angular components with Angular CDK dependencies. Reproducing their demos requires Angular AOT compilation, providers and CDK overlay styles; substituting React primitives would be an approximation.",
  "corvu": "Corvu is SolidJS. Its JSX must be compiled with the Solid transform and mounted using solid-js/web, not the React transform. A separate pinned Solid runtime and unmodified official example closure are required.",
  "starwind-ui": "The official project offers Astro, React, Vue and Svelte adapters. React demo sources exist in apps/react-demo, but the catalog component docs do not choose an adapter; official runtime demo pages aggregate many components. Support should identify the selected genuine adapter and compile its runtime/styles, or use the Astro compiler for the documented Astro implementation.",
  "webcoreui": "Actual React, Svelte and Astro implementations exist. The React branch can be supported using src/components TSX plus its SCSS/style dependency closure and a verified documented composition. It must be labeled the React adapter; other framework variants are distinct builds.",
  "morphin": "Public MIT source exists with component-local aliases and registry metadata. Some catalog components have official index-demo.tsx files; Animated Expandable Card Stack has no matching source subtree at the inspected revision. Need per-item alias roots and complete theme/dependency metadata before marking each item available.",
  "viora-ui": "The catalog records the official website but no source repository. A versioned or content-hashed official registry source, redistribution license and complete demo closure have not been established; no generated replacement is acceptable.",
  "scrollx-ui": "The catalog records MIT with Commons Clause restrictions. Verify the actual component redistribution terms and source closure before bundling this library as a source preview collection.",
  "toggle-supply": "Actual examples are vanilla HTML/CSS/JS. A source/HTML demo build path can preserve them directly, but the current React-only entrypoint does not execute original HTML and scripts. Need pinned official snippet extraction and scoped cleanup, not JSX recreation.",
  "designpass": "Official catalog identifies a copy-in React library, but no source repository is recorded. A versioned or content-hashed official registry source, license and demo dependency closure have not been established.",
  "evil-buttons": "Official component modules are available under Apache-2.0, but most documented examples live in MDX or shared preview contexts rather than standalone demo modules. MorphStatusButton has a standalone exported demo in components/evil-buttons-demos.tsx; other entries need an exact official composition and global-style closure.",
  "svelte-bits": "The catalog records MIT plus Commons Clause. Source redistribution terms must be checked independently; technically this library requires the Svelte compiler and original components/CSS, not React wrappers.",
  "canvas-ui": "The catalog records MIT plus Commons Clause. Redistribution permission must be established before packaging a source preview collection; genuine canvas/shader runtimes also require canvas/WebGL capabilities and explicit asset/network failures.",
  "gradients-sh": "The catalog records the official website and free-component MIT terms, but no immutable source repository. Need the official registry payload/demo closure and preserved license before bundling; reproducing the gradient visually is not source authenticity."
};
