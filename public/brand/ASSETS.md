# Production brand assets

The original Col mark is reconstructed as two rounded brackets with a central opening. The SVG is the source of truth; assets contain no generated textures or raster speckles.

- `col-mark.svg`: white vector, used by the site's shared sidebar/mobile header and footer. Existing light-theme styling inverts it to black.
- `col-mark-black.svg`: black vector for light backgrounds.
- `col-mark-white.png`, `col-mark-black.png`: 1024 × 1024 transparent exports.
- `public/icon.svg`: white mark on black for scalable browser tabs.
- `public/favicon.ico`: 16, 32, and 48 px entries for browser compatibility.
- `public/apple-icon.png`: 180 × 180 opaque home-screen icon with generous inset.
- `col-readme-icon.png`: 256 × 256 rounded black tile with the white mark, used by `README.md`. Code hosts such as git.cafe ignore `<picture>` color-scheme sources, so the README needs one image that reads on light and dark pages.

Run `node scripts/generate-brand-assets.mjs` to rebuild exports from the white SVG. The root route (`app/routes/__root.tsx`) links the three icons. The live Col lettering retains the site's rounded font and accessible link labels.
