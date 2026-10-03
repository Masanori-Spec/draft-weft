# DraftWeft project schema, version 1

```json
{
  "schema": "draft-weft/v1",
  "title": "Plain weave",
  "shaftCap": 2,
  "motif": [[true, false], [false, true]]
}
```

Only these four fields are accepted; unknown keys are rejected. No coercion of strings/numbers into Booleans is performed. `shaftCap` is an integer from 1 to 32. `motif` is a dense rectangular array with 1–32 rows and 1–32 columns. The title is at most 80 Unicode code points, without control characters, line breaks, isolated surrogate code points, U+FFFE, or U+FFFF. Imports are at most 65,536 UTF-8 bytes. The title is metadata, never executable content or a filename.

All coordinates and IDs in reports are one-based; JavaScript arrays are zero-based. Project JSON has no saved compiler result. On reload, the motif is revalidated and must be compiled again. The output reports are evidence, not accepted project input.

- `requiredShafts`: exact count under the fixed model
- `groups`: shaft ID, top-to-bottom binary signature, and member warp columns
- `witnesses`: a differing row for every pair of representative columns
- `threading`: one shaft ID per warp column
- `liftplan`: sorted shaft IDs per row; an empty array means no raised shafts
- `checkedCells`: reconstructed cell count
- `floats.lines`: each warp/weft path and its front/back finite/cyclic maxima
- `warnings`: model limitation, orientation unverified, no-interlacement where relevant, and the known PyWeaving zero-lift incompatibility where relevant

Results and serialization are deterministic for the same input. There are no timestamps, random solver choices, contact data, automatic saving, or environment-dependent sorting. The fixed WIF header date identifies its format revision, not a fabrication or creation date.
