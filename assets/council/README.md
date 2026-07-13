# Council production asset sources

This directory contains accepted source assets for the Council Chamber UI.
Source assets are not automatically runtime assets. UI3 owns optimization,
delivery, responsive behavior, and visual acceptance.

## `council-ornate-frame-source-v1.png`

- status: accepted UI3 source candidate; not integrated into runtime
- source: user-corrected in Adobe Photoshop from the generated ornate frame
- received: 2026-07-13
- dimensions: 1672 × 941
- pixel format: 32-bit ARGB PNG
- SHA-256: `E827A19448B89693E1CB499A69993F40D01B0A6E4F07CC40BFEE3DB6496A4C8C`
- transparency checks:
  - outer pixel `(1,1)` alpha: `0`
  - center pixel `(836,470)` alpha: `0`
  - interior pixel `(200,200)` alpha: `0`
  - frame pixel `(55,55)` alpha: `255`

The transparent pixels retain irrelevant RGB color data from the removed
checkerboard. Runtime rendering must use alpha compositing and must not flatten
the asset against white.

## Accepted shield sources

The ten user-named and user-cut shield images received on 2026-07-13 are
accepted as UI3 source assets. The visible magenta edge fringe is an explicitly
accepted part of these source images and is not an intake blocker.

| User asset | Repository source asset | Role | Dimensions | SHA-256 |
| --- | --- | --- | --- | --- |
| `Energy.png` | `council-lane-energy-source-v1.png` | Energy lane | 307 x 319 | `EE8D40FEE59DCE1701361DABCA2FEB0EA7A92714C5EB4B487697F2674EE685B5` |
| `Territory.png` | `council-lane-territory-source-v1.png` | Territory lane | 307 x 318 | `9C049B41E9BB98E2A0608676F3F9E20353F7FE6CD7CF801F66AE618F0DEC4C0A` |
| `Larva-Engine.png` | `council-lane-engine-source-v1.png` | Larva / Engine lane | 308 x 319 | `C6A96831D3228FAD7FBE64EA585D884CB3049C7BE20EA91ECA371CDDD60A2B3B` |
| `Meat Chain.png` | `council-lane-meat-source-v1.png` | Meat Chain lane | 307 x 318 | `5E2865806C39E8FBFCA3CB06B2121F4A454B482BED5A94EE583A42B4F6A2E30F` |
| `Brood Architect.png` | `council-advisor-brood-architect-source-v1.png` | Expansion and long-term advisor | 311 x 318 | `49AF3A171DA7116070128BED30F7269F75E9492556BE4D95DDBBA8960A014EDC` |
| `Twin Oracle.png` | `council-advisor-twin-oracle-source-v1.png` | Thresholds and upgrades advisor | 307 x 317 | `87DD86A8DCE7EB86868AD75518DEE3A9FB433E236EAF1B3FE7E3F68A56A7FC36` |
| `General Mandible.png` | `council-advisor-general-mandible-source-v1.png` | Territory and army advisor | 306 x 317 | `FE60407134BDA59C1494EA4415929F77885D840BBAB47E049C071BB378835B95` |
| `Flesh Smith.png` | `council-advisor-flesh-smith-source-v1.png` | Meat Chain advisor | 309 x 317 | `22D7F31DA81CC6332E2C6975D41F9C2488B308133AC363506A17BD175B8BC562` |
| `Larva Steward.png` | `council-advisor-larva-steward-source-v1.png` | Larvae and Engine advisor | 308 x 317 | `39D23250FC5355FD4949A4BBDC7CEF80ACA351606ACFAFE4EDDC01B78A6DAD91` |
| `Beetle Magus.png` | `council-advisor-beetle-magus-source-v1.png` | Energy and abilities advisor | 308 x 315 | `948486623A17887DCF1F01BBD3EA131E3FB477E83400776073F88FEE322F20F5` |

All ten sources are 32-bit ARGB PNGs with transparent exterior pixels. Preserve
them unchanged and derive any resized or encoded runtime variants separately.

## UI3 rules

- preserve this source file unchanged
- preserve all accepted shield source files unchanged
- derive optimized runtime variants instead of overwriting it
- test the frame over both the chamber scene and a flat diagnostic background
- verify edge halos at 100%, 125%, and 150% zoom
- select the Tampermonkey delivery method before runtime integration
