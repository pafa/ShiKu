"""Render the reviewed Mandarin guide locally. Write to a separate directory for a new edition."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
from mandarin_narration import narration_rows

ROOT = Path(__file__).resolve().parents[1]
MODEL_SHA = "bf30582eb1b012250a35b1a4a80e7dfbcf8485e7bb9de0d95efbbeef0e4ad86d"
EDITION = "cn-guide-2"
# This museum's single 佛 always means fó. The source dictionary defaults to fú.
# Multi-character readings are specified as well, using Melo's initial/final + tone layout.
LEXICON = {"佛":"f o 2 2","卢舍那":"l u sh e n a 2 2 4 4 4 4","佛首":"f o sh ou 2 2 3 3",
    "卧佛":"w o f o 4 4 2 2","大佛":"d a f o 4 4 2 2","坐佛":"z uo f o 4 4 2 2",
    "弥勒":"m i l e 2 2 4 4","舍那":"sh e n a 4 4 4 4","勘":"k an 1 1","幢幡":"ch uang f an 2 2 1 1"}
def sha(value): return hashlib.sha256(value).hexdigest()
def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--model',required=True,type=Path,help='MeloTTS zh_en FP32 ONNX, lexicon.txt, tokens.txt')
    ap.add_argument('--output',type=Path,default=ROOT/'assets/walk/voices')
    ap.add_argument('--only',action='append',help='Render only these stop IDs (separate output directory for trials).')
    ap.add_argument('--threads',type=int,default=3)
    args=ap.parse_args()
    import numpy as np
    import sherpa_onnx as so
    m=args.model.resolve(); output=args.output.resolve();output.mkdir(exist_ok=True,parents=True)
    if sha((m/'model.onnx').read_bytes()) != MODEL_SHA: raise ValueError('Unreviewed MeloTTS model')
    rows=narration_rows()
    if args.only:
        if output==(ROOT/'assets/walk/voices').resolve(): raise ValueError('Use separate --output for a partial render')
        rows=[r for r in rows if r['name'] in args.only]
        if len(rows)!=len(set(args.only)): raise ValueError('Unknown stop ID')
    index=output/'recordings.json'; existing=json.loads(index.read_text()) if index.exists() else {}; result={}
    # Changes to rendering, dictionary, model, pronunciation or spoken copy invalidate the old audio.
    recipe=sha(Path(__file__).read_bytes()+(m/'lexicon.txt').read_bytes()+(m/'tokens.txt').read_bytes()+MODEL_SHA.encode()+so.__version__.encode())
    with tempfile.TemporaryDirectory() as scratch:
        lex=Path(scratch)/'lexicon.txt'
        lines=(m/'lexicon.txt').read_text().splitlines()
        lex.write_text('\n'.join(l for l in lines if l.partition(' ')[0] not in LEXICON)+'\n'+'\n'.join(k+' '+v for k,v in LEXICON.items())+'\n')
        vocab={l.partition(' ')[0] for l in lines}|LEXICON.keys()
        synth=None
        for i,row in enumerate(rows,1):
            key=row['name']; target=output/(key+'.mp3'); old=existing.get(key,{})
            meta={'text':sha(row['text'].encode()),'transcript':row['standard'],'spoken':sha(row['spoken'].encode()),'recipe':recipe,'edition':EDITION}
            if target.exists() and all(old.get(k)==v for k,v in meta.items()) and sha(target.read_bytes())==old.get('audio'):
                result[key]=old;continue
            if synth is None:
                config=so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(vits=so.OfflineTtsVitsModelConfig(model=str(m/'model.onnx'),lexicon=str(lex),tokens=str(m/'tokens.txt'),noise_scale=.60,noise_scale_w=.75),num_threads=args.threads,provider='cpu'),silence_scale=.24)
                if not config.validate(): raise ValueError('Invalid model directory')
                synth=so.OfflineTts(config)
            absent={c for c in row['spoken'] if '\u3400'<=c<='\u9fff' and c not in vocab}
            if absent: raise ValueError(str((key,absent)))
            clip=synth.generate(row['spoken'],sid=0,speed=.97)
            samples=np.asarray(clip.samples,dtype='<f4'); sec=len(samples)/clip.sample_rate
            if not (3<sec<70) or not np.isfinite(samples).all() or samples.std()<.006: raise ValueError('Invalid audio: '+key)
            tmp=target.with_suffix('.working.mp3')
            subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y','-f','f32le','-ar',str(clip.sample_rate),'-ac','1','-i','pipe:0','-af','loudnorm=I=-18:TP=-1.8:LRA=10','-ar','44100','-map_metadata','-1','-codec:a','libmp3lame','-b:a','96k',str(tmp)],input=samples.tobytes(),check=True)
            tmp.replace(target);result[key]={**meta,'audio':sha(target.read_bytes()),'seconds':round(sec,2)}
            print(f'{i}/{len(rows)} {key}: {sec:.1f}s',flush=True)
        interim=index.with_suffix('.working.json');interim.write_text(json.dumps(result,sort_keys=True,indent=2,ensure_ascii=False)+'\n');interim.replace(index)
if __name__=='__main__': main()
