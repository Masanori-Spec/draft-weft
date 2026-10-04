# Visual review

Inspected actual Chromium captures from [run 37168488595](https://github.com/Masanori-Spec/draft-weft/actions/runs/37168488595), functional commit `13bdd570e870155594fce0daa42ec54cb31c4a0c`, on 2026-10-04.

- Desktop, 1440 pixels wide, English and Japanese: motif controls, four-shaft explanation, numbered threading/liftplan, repeat preview, float results, downloads, and scope notes are legible and do not overlap
- Mobile, 390 pixels wide: panels stack vertically, controls wrap within their cards, and explanatory text remains within the page
- Maximum 32×32 motif: the grid scrolls within its container, with no document-level horizontal overflow; no-interlacement and WIF-compatibility warnings remain visible
- The unfocused skip link is clipped and no longer appears over the motif or repeat preview in captures; keyboard focus and activation remain covered by the browser scenario

Captures are complete test-state screenshots, not polished mockups. The mobile import panel retains synthetic invalid JSON from the preceding safety scenario; the currently compiled motif is the selected example. No personal input or customer data was used.

The browser suite also checks both languages, keyboard editing, cap-failure preservation, actual WIF download readback, stale file reads, cancellation, time budgets, invalid inputs, download errors, and absence of observed external runtime requests. This is not a full accessibility audit or a guarantee for all browsers/devices. Cross-application weaving display orientation and real loom use remain unverified.

[Desktop English](evidence/hosted-browser/desktop.png) · [Desktop Japanese](evidence/hosted-browser/desktop-ja.png) · [Mobile](evidence/hosted-browser/mobile.png) · [Maximum grid](evidence/hosted-browser/mobile-max.png)
