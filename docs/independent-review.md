# Independent engineering review

Reviewed: 2026-10-03 (UTC)

## Scope and conclusion

The shaft-count claim is correct for the stated rising-shed, exactly-one-shaft-per-warp-end, direct-liftplan model. A shared shaft gives its ends identical states at every pick, so distinct column states require distinct shafts. Assigning one shaft to each distinct column state achieves that bound. This is not a minimum for general loom configurations, multi-shaft ends, unthreaded ends, tie-ups, or treadling.

The tests in `tests/independent-review.test.mjs` do not import the production reconstruction helper or WIF verifier. They provide independent checks:

- Enumerate 14,344 physical threading/liftplan combinations with one through three shafts and establish the exact minimum for all 512 binary 3×3 motifs
- Compare the compiler's minimum, every pairwise witness, and non-mutating cap failure against those results
- Parse emitted WIF bytes separately and reconstruct cells using integer shaft bits for all 512 motifs, including empty and full picks
- Check a 32-shaft matrix and an asymmetric 7×11 motif without transposing or reversing their rows or columns
- Compare 4,088 finite/cyclic Boolean-run cases against an independent start-at-each-position oracle, including zero-length and unbounded runs
- Check strict JSON types, dimension and UTF-8 budgets, title injection, invalid XML characters, safe error diagnostics, and preservation of input data
- Exercise the CLI's existing-directory and symlink refusal, invalid-import rejection, and no-output behavior when the shaft cap fails

All six review tests passed. The complete unit suite also passed with 30 tests at the final review checkpoint. A 32×32, 32-shaft SVG with an adversarial Unicode/XML title was separately parsed with Python's standard XML parser; it remained valid XML and contained no script element.

## Fixed findings

1. Titles originally allowed U+FFFE/U+FFFF, yielding invalid SVG XML. Validation now rejects those and isolated surrogate code points; valid supplementary characters remain allowed.
2. Emitted WIF originally omitted the Units keys required by PyWeaving 0.0.7. Both WARP and WEFT now include `Units=Centimeters`; no physical spacing or size is claimed.
3. Unknown JSON field names originally appeared unescaped in CLI errors. Quoting field names now prevents the reproduced ESC/BEL terminal-control injection.
4. The Save project handler originally overwrote a download-creation error with a success status. It now shows success only when download creation returns true. The browser regression is checked in; execution remains part of the browser release gate.

## External WIF compatibility boundary

Unmodified PyWeaving 0.0.7 was independently exercised against actual exported bytes. A normal plain-weave fixture reconstructed correctly after the Units fix. An empty pick did not: a WIF lift row with value `0` was interpreted as the final shaft, because that reader indexes shafts using `shaft_no - 1` without special-casing zero.

The checked-in optional interoperability harness separately records ordinary fixtures as `matched` and the empty-pick probe as `known-incompatibility-confirmed`. A successful run of that harness does not mean the empty-pick fixture round-trips correctly. Do not claim universal WIF compatibility, complete specification conformance, or visual orientation verification in receiving applications.

The compiler now emits `PYWEAVING_0_0_7_ZERO_LIFT` exactly when any pick raises no shafts; the UI displays a specific Japanese/English compatibility warning beside export.

The own-profile WIF verifier validates this producer's emitted subset; it is not a general-purpose WIF importer. The independent tests verify numeric row/column reconstruction, not the rendered orientation of third-party weaving software.

## Remaining release checks

Local Chromium launch is blocked by the execution environment with sandboxing preserved; zero browser scenarios ran locally. The browser tests, distributed build, artifact packaging, and CI must be run against the final release candidate. No browser execution or external display-orientation claim is made by this review alone. Preserve Chromium sandboxing when running browser checks.
