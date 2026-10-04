# Verification record

Local candidate initially verified on 2026-10-03; clean installation and the 32-test aggregate were repeated on 2026-10-04. These checks establish a small educational model, not physical suitability or universal file compatibility.

## Passed locally

- `npm run check`: syntax check, 32 Node test cases, static build, and all 10 built local module references
- Exhaustive independent assignment search for every 3×4 Boolean motif (4,096)
- Independently authored physical-model enumeration for every 3×3 motif (512), including exact minimum and WIF-byte reconstruction
- Separately authored BigInt WIF parser on all 512 motifs, 32-shaft limits, and asymmetric orientation probes
- 256 additional 2×4 WIF export/readback cases
- Exhaustive cyclic run oracle through length 10, plus independent finite/cyclic oracle through length 9
- Plain weave, 2/2 twill, duplicate columns, cap failure/preservation, constants, max dimensions, deterministic output, injection, malformed JSON, metadata, ID and palette checks
- CLI success, distinct exit codes, cap failure creates no output, no-clobber and symlink-output refusal
- Worker cancellation, newer-work replacement, stale-result rejection, timeout, and startup/processing failure tests
- Unmodified PyWeaving 0.0.7: three fixtures match all cells; an empty-pick probe confirms a **known mismatch**, recorded separately rather than called a pass
- Generated twill print SVG parsed and rendered with Inkscape; the PNG was visually inspected for labels, numbering, draft, liftplan, repeat, and caveats

The six independently authored review tests and their report are retained in `tests/independent-review.test.mjs` and `docs/independent-review.md`.

The synthetic 32×32 benchmark in `docs/evidence/benchmark.json` is a local measurement only. The browser's 5-second budget remains a fail-safe, not an inferred performance guarantee.

## Local browser limit

Sandbox-enabled Chromium failed before a page could open: the environment denied its process-singleton socket, with read-only configuration-path warnings. Zero browser scenarios ran. No security bypass or `--no-sandbox` option was used. `docs/evidence/local-browser.json` retains a concise blocker record.

The authored browser suite covers Japanese/English UI, skip link, keyboard motif editing, downloads and WIF reconstruction, cap-failure preservation, cyclic/unbounded warnings, malicious JSON/title input, oversized and stale file reads, injected download errors, resize/undo, cancel/stale work, max-size mobile overflow, request privacy, and budget expiry. All 12 scenarios passed on the hosted run recorded below; this does not change the local launch limitation.

Cross-application display orientation, commercial weaving-app import, actual looms, weaving samples, usability with real learners, and product demand are unverified.

## Hosted results recorded on 2026-10-04

[Run 37168488595](https://github.com/Masanori-Spec/draft-weft/actions/runs/37168488595) passed for functional commit `13bdd570e870155594fce0daa42ec54cb31c4a0c`:

- Node 22/24 × UTC/Asia-Tokyo: four passing jobs, each with 32 tests, build, and reference checks
- PyWeaving 0.0.7: three ordinary fixtures matched; the known empty-pick mismatch was confirmed separately
- Chromium with sandbox enabled: all 12 scenarios passed, with no page exceptions or external runtime requests in the observed workflow
- Desktop English/Japanese, Japanese mobile, and maximum-grid mobile captures were visually inspected; see [visual review](VISUAL_REVIEW.md)

Artifacts were downloaded and their ZIP SHA-256 digests matched GitHub's metadata. Scenario data and captures are retained under `docs/evidence/hosted-browser/`; identifiers and digests are in `docs/evidence/hosted-ci.json`. This evidence is tied to the stated functional commit. Documentation-only evidence commits are checked separately through Actions.

Two defects discovered during hosted validation were repaired before this passing run: incomplete optional-dependency lockfile metadata blocked clean installation, and browser-native timers rejected a WorkSession receiver before worker dispatch. The latter has a source-level regression test. Screenshot inspection also led to clipped hiding of the unfocused skip link, retaining keyboard access without an overlay in full-page captures.

## CI configuration

`.github/workflows/check.yml` defines Node 22/24 × UTC/Asia-Tokyo checks, an external-parser evidence job, and a sandbox-enabled Chromium job. Jobs have read-only contents permission, checkout credentials are not persisted, and each job has a time limit.

The browser job uses Ubuntu 22.04 as a temporary compatibility baseline; its runner retires on 2027-04-17 and must be migrated before then with a successful sandbox run. The browser test is `tests/browser/browser-test.mjs`; desktop and mobile screenshots and scenario results are retained as workflow artifacts. Check [Actions](https://github.com/Masanori-Spec/draft-weft/actions) for the exact commit under review. The definition alone does not establish that any hosted scenario passed.

## Packaging

`npm run package` rebuilds and checks the static output, then creates a deterministic source ZIP and SHA-256 file manifest in the adjacent `draft-weft-output` directory. The archive is tested and every manifest hash is checked. Node modules, browser installation, and runtime artifacts are excluded; curated evidence is included. No license or public deployment is selected by packaging.
