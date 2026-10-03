# Product rationale and prior-art boundary

## Proposed problem

A learner can draw a small binary motif but may not understand why some warp ends can share a shaft, why a cap fails, or why a float changes when a motif repeats. DraftWeft makes each of those steps inspectable using a deliberately limited model.

The hypothesis is educational value in a short workshop or self-study exercise: an editable motif, deterministic equivalence classes, a separating-row explanation, verified draft export, and finite-versus-cyclic run counts in one place. This is an unvalidated product hypothesis. No interviews, paid demand, sales, or user adoption are claimed.

## Existing products

[Bower](https://asunder.co/app/bower) already runs in a browser and supports WIF, direct drawdown editing with feasibility/decomposition, and shaft/treadle optimization. “Browser-based,” “no installation,” and “inverse drawdown” are not defensible uniqueness claims. Its advertised price/plan wording was not used to position this project.

[WeavePoint 8](https://www.weavepoint.com/wpoman/WeavePoint%208%20Manual.pdf) documents established liftplan and WIF workflows. [PyWeaving](https://github.com/storborg/pyweaving) provides parser/rendering tooling and lists draft simplification/generation among its goals. Broad claims that motif compilation or shaft reduction is new would be inappropriate.

Sources checked on 2026-10-03. Bower's annotated WIF article contains both format discussion and vendor-specific notes; those are not conflated. The original 1997 text was not successfully retrieved during initial research. [PRONOM](https://www.nationalarchives.gov.uk/PRONOM/fmt/2072) helps identify the format, not certify output.

## Deliberate differentiation hypothesis

- Teach one constructive theorem instead of presenting an opaque optimization result
- Display why each shaft group differs from every other group
- Preserve an impossible-under-cap motif and explain the model-bound failure
- Make repeated-edge float semantics explicit, especially unbounded constant paths
- Keep export evidence inspectable and compatibility failures visible
- Provide a small bilingual UI and a deterministic CLI suitable for a portfolio review

These are design choices, not proof of exclusivity or market demand. The work does not assess patentability, and no patent candidate is intentionally disclosed. Further validation could use synthetic class exercises and voluntary feedback only after separate authorization for outreach.

## Out of scope

Treadle/tie-up or general loom optimization, sinking shed, multi-shaft threading, image extraction, arbitrary WIF import, yarn physics, sett, dimensions, fabric quality/safety, and loom control. The tool has no hardware interfaces and should not be marketed as production-ready weaving advice.
