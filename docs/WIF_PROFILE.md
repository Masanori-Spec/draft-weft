# WIF output profile and compatibility

This is a tested **small export profile**, not a full implementation of WIF or a general importer. The original 1997 specification was unavailable during the initial research attempt; the annotated Bower reference was used, with its vendor notes treated separately. Full normative conformance is not claimed.

## Emitted structure

DraftWeft emits ASCII with CRLF line endings. The header names WIF 1.1, its revision date, DraftWeft contributors, and the source program/version. CONTENTS lists every emitted non-header section. A two-entry RGB palette has the range 0–255; warp and weft defaults refer to its entries.

The weaving block declares shaft count, rising shed, and `Treadles=0`. Threading contains one shaft for every end. Liftplan contains the raised shafts at every pick, or `0` for an empty pick. No TIEUP or TREADLING section is emitted. Warp/weft counts are explicit. `Units=Centimeters` is present for reader compatibility, but there is no spacing, thickness, sett, or physical-size data. This does not assign a physical scale.

Title line breaks/control characters are rejected before serialization. WIF titles replace non-ASCII characters with `?`. Other artifacts preserve validated Unicode. SVG uses XML escaping and wraps long titles.

The annotated source distinguishes purported format requirements from Bower's implementation notes; notably it describes a positive treadle count in the catalog while documenting zero in its liftplan profile. DraftWeft follows that small zero-treadle profile and does not turn vendor behavior into a universal standard claim.

## Actual checks

1. Freshly reconstruct every input cell from the generated threading/liftplan
2. Serialize WIF
3. Parse its actual text using a separate narrow reader, validate identities, section declarations, counts, palette, and shaft ranges
4. Reconstruct every cell again and compare with the original
5. In tests, use a separately authored BigInt-based parser and enumerated small-model oracle
6. Optionally feed unchanged WIF bytes to unmodified PyWeaving 0.0.7

[PyWeaving](https://github.com/storborg/pyweaving) is an external parser by Scott Torborg. Three fixtures (plain, twill, boundary) match all cells. An empty-pick probe does **not** match: its reader converts shaft number 0 into Python index -1, producing the last shaft. The harness records the mismatch and expects it to remain visible. It does not patch the parser or rewrite the motif to make the check pass.

The UI gives a specific warning when an empty liftplan pick is present. This documented incompatibility means the export cannot be assumed to work correctly in all readers. Structural parsing is not display-orientation testing: no commercial application's viewing conventions or physical loom behavior have been validated.

## Sources

- [Bower's annotated WIF reference](https://asunder.co/app/bower/articles/wif-file-specification), checked 2026-10-03. Vendor notes are implementation-specific
- [WeavePoint 8 manual, PDF page 24](https://www.weavepoint.com/wpoman/WeavePoint%208%20Manual.pdf): import/export depends on the chosen liftplan or tie-up workflow
- [PRONOM fmt/2072](https://www.nationalarchives.gov.uk/PRONOM/fmt/2072): identifies WIF 1.1 as a structured text interchange format; this is a registry record, not a validation certificate

No third-party app was contacted with user data. Fixtures are synthetic and created for this project.
