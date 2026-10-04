# Third-party materials and dependencies

No runtime dependency, artwork, font, or third-party weaving draft is bundled. All example motifs are synthetic, conventional small structures for tests and teaching; no ownership or novelty of plain weave or twill is claimed.

Development dependency: Microsoft Playwright / @playwright/test 1.56.0, Apache-2.0, downloaded through npm. Its upstream source and license are available at https://github.com/microsoft/playwright. It is not included in the static build or source ZIP's node_modules.

The lockfile also records Playwright’s optional macOS-only `fsevents` 2.3.2 dependency (MIT); it is not installed on the Linux verification runner or bundled in the source ZIP.

Optional interoperability dependency: PyWeaving 0.0.7 by Scott Torborg, MIT, https://github.com/storborg/pyweaving; `six` 1.17.0, MIT. These are unmodified external test dependencies, not runtime code, and are not bundled in the source ZIP. Their licenses remain applicable when installed separately.

Bower, WeavePoint, and PRONOM are cited sources, not endorsements or dependencies. No third-party specification, manual, or code was copied into the application. References and brief summaries are in docs/PRODUCT.md and docs/WIF_PROFILE.md.

No license has been selected for DraftWeft itself. This notice does not grant a project license.
