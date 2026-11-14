"""Freeze a clean public export into a new or empty directory (Python 3.9+ and Node).
A matching previous freeze can be verified again. The operation runs locally.
"""
import argparse
import gzip
import hashlib
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile


def file_sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate', type=Path)
    parser.add_argument('out', type=Path)
    args = parser.parse_args()
    src, out = args.candidate.resolve(), args.out.resolve()
    if args.candidate.is_symlink() or args.out.is_symlink():
        parser.error('Use ordinary directories for the candidate and output')
    if out.is_relative_to(src) or src.is_relative_to(out):
        parser.error('The candidate and output must be separate directories')
    if (src / '.git').exists() or not all(
        (src / name).is_file() for name in ('LICENSE', 'server/museum.mjs', 'docs/ASSETS.md', 'SHA256SUMS')
    ):
        parser.error('Expected a public export with SHA256SUMS and no .git')

    names = ('ShiKu.tar.gz', 'FILES.sha256')
    if out.exists():
        if not out.is_dir():
            parser.error('Output must be a directory')
        if any(out.iterdir()) and not all((out / name).is_file() and not (out / name).is_symlink() for name in names):
            parser.error('Use a new or empty output directory, or a completed freeze to verify')

    checksums = (src / 'SHA256SUMS').read_bytes()
    validator = Path(__file__).resolve().with_name('check-public-release.mjs')
    subprocess.run(['node', str(validator), '--dir', str(src), '--files-only'], check=True)
    if (src / 'SHA256SUMS').read_bytes() != checksums:
        parser.error('SHA256SUMS changed during verification')
    expected = {}
    for line in checksums.decode('utf-8').splitlines():
        digest, path = line.split('  ', 1)
        expected[path] = digest
    expected['SHA256SUMS'] = hashlib.sha256(checksums).hexdigest()

    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=out.parent) as wd:
        staged = Path(wd) / 'freeze'
        staged.mkdir()
        with (staged / names[0]).open('wb') as raw, \
                gzip.GzipFile(filename='', fileobj=raw, mode='wb', mtime=0, compresslevel=6) as zipped, \
                tarfile.open(fileobj=zipped, mode='w|', format=tarfile.GNU_FORMAT) as tar, \
                (staged / names[1]).open('w', encoding='utf-8', newline='\n') as index:
            for rel in sorted(expected, key=lambda path: path.encode('utf-8')):
                path = src / rel
                if not path.is_relative_to(src) or path.resolve() != path or not path.is_file():
                    parser.error('Candidate path changed during freeze: ' + rel)
                data = path.read_bytes()
                digest = hashlib.sha256(data).hexdigest()
                if digest != expected[rel]:
                    parser.error('Candidate changed during freeze: ' + rel)
                index.write(digest + '  ' + rel + '\n')
                entry = tarfile.TarInfo('ShiKu/' + rel)
                entry.size = len(data)
                entry.mtime = 0
                entry.mode = 0o755 if path.name.endswith(('.command', '.sh')) or path.stat().st_mode & 0o111 else 0o644
                tar.addfile(entry, io.BytesIO(data))

        hashes = {name: file_sha256(staged / name) for name in names}
        if out.is_dir() and any(out.iterdir()):
            for name, digest in hashes.items():
                previous = out / name
                if previous.is_symlink() or not previous.is_file() or file_sha256(previous) != digest:
                    parser.error('Existing freeze differs: ' + name)
        else:
            os.rename(staged, out)
    for name, digest in hashes.items():
        print(digest + '  ' + name)


if __name__ == '__main__':
    main()
