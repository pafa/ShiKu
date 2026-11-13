"""Produce a deterministic review archive of a verified, clean ShiKu candidate.
A local release operation only. Does not use Git, modify the source, or contact a host.
"""
import argparse
import gzip
import hashlib
from pathlib import Path
import tarfile
import io
import os
import tempfile

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate', type=Path); parser.add_argument('out',type=Path)
    args=parser.parse_args()
    src,out=args.candidate.resolve(),args.out.resolve()
    if not ((src/'LICENSE').is_file() and (src/'server'/'museum.mjs').is_file() and (src/'docs'/'ASSETS.md').is_file()):
        parser.error('Expected a clean public export')
    if (src/'.git').exists() or out.is_relative_to(src):parser.error('Use an export without .git and an output directory outside it')
    denied={'.git','.DS_Store','node_modules','.wrangler','__pycache__','review','release-output','.env','.dev.vars'}
    files=[]
    for p in sorted(src.rglob('*'),key=lambda p:p.relative_to(src).as_posix().encode('utf-8')):
        rel=p.relative_to(src)
        if set(rel.parts)&denied or p.is_symlink() or p.name.startswith(('.env.', '.dev.vars.')): parser.error('Unexpected path: '+str(rel))
        if p.is_file():files.append(p)
        elif not p.is_dir():parser.error('Special file: '+str(rel))
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(dir=out) as wd:
        scratch=Path(wd);archive=scratch/'ShiKu.tar.gz'; manifest=scratch/'FILES.sha256'
        with archive.open('wb') as raw,gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0,compresslevel=6) as zipped,tarfile.open(fileobj=zipped,mode='w|',format=tarfile.GNU_FORMAT) as tar,manifest.open('w',encoding='utf-8',newline='\n') as index:
            for p in files:
                data=p.read_bytes();rel=p.relative_to(src).as_posix()
                index.write(hashlib.sha256(data).hexdigest()+'  '+rel+'\n')
                entry=tarfile.TarInfo('ShiKu/'+rel);entry.size=len(data);entry.mtime=0
                entry.mode=0o755 if p.name.endswith(('.command','.sh')) or p.stat().st_mode&0o111 else 0o644
                tar.addfile(entry,io.BytesIO(data))
        for p in [archive,manifest]:
            dest=out/p.name
            if dest.exists() and hashlib.file_digest(dest.open('rb'),'sha256').digest()!=hashlib.file_digest(p.open('rb'),'sha256').digest():
                parser.error('Refusing to overwrite a different receipt: '+dest.name)
        for p in (archive,manifest):os.replace(p,out/p.name)
    for name in ['ShiKu.tar.gz','FILES.sha256']:
        with (out/name).open('rb') as f:print(hashlib.file_digest(f,'sha256').hexdigest()+'  '+name)
if __name__=='__main__':main()
