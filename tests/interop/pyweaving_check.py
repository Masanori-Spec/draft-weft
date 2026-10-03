"""External-parser smoke check, not a full WIF interoperability claim.
Install optional test dependencies: python -m pip install pyweaving==0.0.7
Or set PYTHONPATH to the unmodified 0.0.7 source directory plus installed six.
"""
import json
from pathlib import Path
import subprocess
import tempfile
from pyweaving import __version__
from pyweaving.wif import WIFReader

if __version__ != '0.0.7':
    raise RuntimeError('This compatibility record is pinned to PyWeaving 0.0.7')
results = []
with tempfile.TemporaryDirectory(prefix='draft-weft-interop-') as directory:
    for kind in ['plain', 'twill', 'boundary', 'empty-pick']:
        raw = subprocess.check_output(['node', 'src/cli.mjs', 'example', kind if kind != 'empty-pick' else 'plain'], text=True)
        project = json.loads(raw)
        if kind == 'empty-pick':
            project['motif'] = [[False, False], [True, False]]
            project['title'] = 'Empty pick compatibility probe'
        source = Path(directory) / f'{kind}.json'
        source.write_text(json.dumps(project), encoding='utf-8')
        target = Path(directory) / kind
        subprocess.run(['node', 'src/cli.mjs', 'export', str(source), str(target)], check=True, stdout=subprocess.DEVNULL)
        draft = WIFReader(str(target / 'draft-weft.wif')).read()
        # Use the parsed shaft objects directly; do not call DraftWeft's parser.
        actual = [[warp.shaft in pick.shafts for warp in draft.warp] for pick in draft.weft]
        expected = project['motif']
        match = actual == expected
        if kind == 'empty-pick':
            assert not match, 'Known limitation changed: investigate and update the compatibility record.'
            assert actual[0] == [False, True], actual
            results.append({'fixture': kind, 'status': 'known-incompatibility-confirmed', 'reason': 'PyWeaving 0.0.7 interprets LIFTPLAN 0 as the last shaft', 'expected': expected, 'parsed': actual})
        else:
            assert match, (kind, expected, actual)
            assert len(draft.warp) == len(expected[0]) and len(draft.weft) == len(expected)
            assert draft.rising_shed and not draft.treadles
            results.append({'fixture': kind, 'status': 'matched', 'cells': len(expected) * len(expected[0])})
output = {'parser': 'PyWeaving', 'version': __version__, 'unmodifiedParser': True, 'displayOrientationTested': False, 'fullConformanceClaim': False, 'results': results}
Path('tests/interop/artifacts').mkdir(exist_ok=True)
Path('tests/interop/artifacts/results.json').write_text(json.dumps(output, indent=2) + '\n', encoding='utf-8')
print(json.dumps(output, indent=2))
