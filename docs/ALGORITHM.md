# Constructive model and proof

## Fixed assumptions

Let a rectangular Boolean motif have H picks (rows) and W warp ends (columns), each between 1 and 32. Row 1 is top and column 1 is left. A true cell means the warp end rises at that pick. Every end is attached to exactly one shaft; the liftplan can independently raise any subset of shafts at each pick. There are no additional mechanical, physical, or treadle constraints.

For each column, form its complete top-to-bottom binary signature. Traverse columns left to right, assign the first new signature shaft 1, the next unseen signature shaft 2, and so on. Repeated signatures reuse the original ID. At pick r, raise exactly the groups whose signature has a 1 at r.

## Exact minimum within this model

Necessity: two ends attached to one shaft have the same raised/lowered state at every pick. Therefore, if two columns disagree at even one row, they cannot share a shaft. Choose one representative from every signature group. Every representative pair disagrees somewhere, so at least as many shafts as distinct signatures are necessary.

Sufficiency: assign each signature group its own shaft. At every row, raise that shaft exactly when its signature is true. Every member column has the same signature and is reconstructed cell for cell. Thus this many shafts suffice.

The lower bound and constructed upper bound coincide. This is not a heuristic. It is also **not** a minimum across multi-shaft threading, sinking-shed interpretations, treadle/tie-up systems, or general loom constraints. An all-false column still receives one shaft under the exactly-one-shaft assumption.

A witness is generated for every group pair: their representative warp columns, the first disagreeing row, and both values. A cap failure still returns the complete explanation and never changes the motif.

## Verification and complexity

Construction reads H×W cells. The explanatory pair witnesses take at most O(H×W²); with W ≤ 32 there are at most 496 pairs. Float analysis and reconstruction are bounded by the 32×32 dimensions. The displayed 3×3 repeat never exceeds 96×96 cells. There is no optimization search or unbounded solver.

Before an artifact is returned, the draft is freshly constructed from validated input and all cells are reconstructed. The WIF verifier reads actual ASCII bytes independently of signature grouping, checks required output sections/counts/IDs/palette, and reconstructs cells again. This narrow verifier is an export assurance mechanism, not an arbitrary WIF import API.

Browser work runs in a disposable module worker. Cancel, edits, imports, or a new compile terminate old work; an epoch prevents late messages from replacing current results. A 5-second watchdog is a fail-safe, not a promised runtime. No workers, files, or inputs are sent to a network endpoint.

## Float semantics

For a given thread path, a finite run is a maximal sequence of the same face-state inside one motif. A cyclic run can cross the last-to-first edge. If a value occurs at every position, repetition makes that value's run unbounded (`kind: "unbounded", length: null`). If it never occurs, its maximum is 0.

The implementation scans two copies of a nonconstant sequence, which includes every possible boundary-crossing run. The all-equal case is detected first; it cannot be represented by a finite run of twice the motif length.

Warp paths are vertical: true = front, false = back. Weft paths are horizontal: false = front, true = back. These are geometry labels relative to the chosen drawdown face, not physical measurements. A constant row or column indicates a thread never changing sides in the modeled repeated motif and warrants a no-interlacement warning. Other structural problems may exist even without this warning.
