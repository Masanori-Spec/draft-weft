# DraftWeft

**From motif to mechanism.** A small, bilingual teaching tool that turns a binary weaving motif into numbered threading and a direct liftplan, while showing why its shaft count is minimal **inside one fixed model**.

二値の模様から、通し順と直接リフトプランへ。同じ動きの経糸をまとめ、最少綜絖数の根拠と全マスの一致を表示する学習用ツールです。

## Try it locally

Requires Node.js 22+ (and Python 3 for XML tests / packaging). No runtime packages, accounts, telemetry, backend, or user-input uploads.

```sh
npm run build
npm run serve
# Open http://127.0.0.1:4173
```

The static build is in `dist/`. Serve it over HTTP; do not open `index.html` using `file://`, because browser module workers need a supported origin. Japanese is the default language; English is available in the header.

1. Choose plain weave, 2/2 twill, or the repeat-boundary example
2. Edit cells with a click or Space; move with arrow keys, Home, and End
3. Set a shaft cap and compile
4. Inspect equal-column groups, a separating row for every group pair, the numbered draft, and front/back float runs
5. Save the project, or export verified WIF, print SVG, numbered TXT, and evidence JSON

Edits invalidate prior draft exports. Cancel stops the worker; late results cannot replace a newer edit. A 5-second budget stops unresponsive work. Nothing is saved automatically. Project JSON restores edits; this is not a general WIF importer.

## What the model means

- 1–32 warp columns × 1–32 weft rows; Boolean cells only
- Warp 1 is the left column; pick 1 is the top row
- `true` / dark means warp up, with a **rising shed**
- Every warp end belongs to **exactly one shaft**
- A pick directly lists the shafts raised, without treadles or tie-up
- Identical complete columns share a shaft; shaft IDs follow first column occurrence
- Different columns must use different shafts. The number of distinct columns is both a lower bound and an achieved count

If the cap is too small, DraftWeft explains the count and preserves the motif. It does not approximate, silently modify, or claim the motif is impossible on every kind of loom.

[Algorithm and proof](docs/ALGORITHM.md) · [Project schema](docs/SCHEMA.md)

## Floating runs are geometry

Finite runs end at the motif edge. Cyclic runs join opposite repeat edges: `true,true,false,true` has a finite maximum of 2 and a cyclic maximum of 3. A constant row/column has an **unbounded** run when repeated, not a run equal to the repeat size. Both thread directions and both faces are reported. Constant rows/columns receive a no-interlacement warning.

This is not a judgment of fabric quality, suitability, safety, yarn behavior, or real dimensions. The preview is schematic. Practical weaving requires informed review.

## Export boundaries

Every export reconstructs all motif cells. WIF output is then reparsed from actual exported text by a separate, narrow verifier. Tests also include an independent BigInt-based byte parser and exhaustive small-model enumeration.

The WIF profile is ASCII, CRLF, direct liftplan, rising shed, one shaft per end. It includes identity, CONTENTS, palette, warp/weft counts, threading, and liftplan. Non-ASCII title characters become `?` only in WIF; JSON, SVG, and TXT retain Unicode. Units are declared for reader compatibility without spacing, thickness, or physical size.

**Known interoperability limit:** unmodified PyWeaving 0.0.7 matches the plain, twill, and boundary fixtures, but misreads a zero-lift pick as the last shaft. DraftWeft keeps the intended empty pick, warns when present, and records the mismatch. Receiving-application display orientation has not been tested. There is no full WIF-conformance or universal-interoperability claim.

[WIF profile and compatibility](docs/WIF_PROFILE.md) · [Verification evidence](docs/VERIFICATION.md)

## CLI

```sh
node src/cli.mjs example twill > motif.json
node src/cli.mjs check motif.json
node src/cli.mjs export motif.json new-output-directory
```

The output directory must not exist. Export never overwrites an existing directory or file. Exit codes: `0` success, `2` shaft-cap failure, `1` input or I/O error. `check` returns a full JSON explanation even when the cap fails. Inputs are never modified. An I/O failure can leave a partially written new output directory; inspect it before retrying with another new directory.

## Verification

```sh
npm ci --ignore-scripts
npm run check
# Optional external parser test, in a disposable Python environment:
python -m pip install --no-deps pyweaving==0.0.7 six==1.17.0
npm run test:interop
# In a supported Chromium environment, with sandbox enabled:
npx playwright install --with-deps chromium
npm run serve
npm run test:browser
# Deterministic source ZIP + SHA-256 manifest:
npm run package
```

Local aggregate: 31 passing tests, including six independently authored review tests. Local Chromium launch is blocked by this workspace's socket/security restrictions; **no UI scenarios ran locally**, and no sandbox bypass was used. Hosted GitHub Actions is approval-pending and is not included in this publication. No hosted Node-matrix, timezone-matrix, or browser CI run is claimed.

## Positioning and scope

Browser weaving editors and inverse drawdown workflows already exist. Bower offers WIF, direct drawdown editing/feasibility, and optimization; WeavePoint has established draft workflows. DraftWeft's proposed value is a narrow, transparent teaching workflow with constructive explanations and explicit edge cases. Demand is unvalidated. There is no novelty, patentability, “first,” or unique no-install claim.

[Product rationale and sources](docs/PRODUCT.md) · [Security](SECURITY.md) · [Dependency notices](THIRD_PARTY_NOTICES.md)

No treadles, tie-up solving, sinking shed, image import, yarn physics, size planning, arbitrary WIF import, or loom/hardware control. No license has been selected for this project; do not infer an open-source grant from availability of the source.
