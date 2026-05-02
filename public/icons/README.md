# BI Website PWA Icons

Block 1.35 declares these icons in the manifest and index.html. The
files themselves need to be designed and dropped here. PNGs designed
at each target size produce sharper home-screen icons than rasterizing
the SVG.

Required files:

| File | Size | Purpose |
|---|---|---|
| `icon-180.png` | 180×180 | iOS home screen (`apple-touch-icon`) |
| `icon-192.png` | 192×192 | Android home screen, generic browser icon |
| `icon-192-maskable.png` | 192×192 | Android adaptive icon (safe area inside ~80% circle) |
| `icon-512.png` | 512×512 | Android splash screen, app store listings |
| `icon-512-maskable.png` | 512×512 | Android adaptive icon at high DPI |

Until these PNGs exist, browsers will fall back to /icon.svg or a
screenshot. Once a designer drops them in this folder with these exact
filenames, no code change is needed.

For the maskable variants, the brand mark should fit inside the inner
80% (the "safe zone") because Android crops the outer 20% to fit
adaptive icon shapes. Tool: https://maskable.app/editor
