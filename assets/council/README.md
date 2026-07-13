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

## UI3 rules

- preserve this source file unchanged
- derive optimized runtime variants instead of overwriting it
- test the frame over both the chamber scene and a flat diagnostic background
- verify edge halos at 100%, 125%, and 150% zoom
- select the Tampermonkey delivery method before runtime integration
