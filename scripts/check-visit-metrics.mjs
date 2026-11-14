// Summarize one completed log window locally. No account, network calls or log uploads.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {visitMetric} from '../server/visit-metric.mjs';

const stages=['submitted','queued','admitted','ready','failed','timeout','cancelled','artwork','audio_played'];
const versionId=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function option(value,fallback,valid,label) {
  const number=value===undefined?fallback:Number(value);
  if(value===''||!valid(number))throw Error('Invalid '+label);
  return number;
}

function readEvents(text,collect) {
  function visit(value) {
    if(typeof value==='string') {
      if(!value.trim().startsWith('{'))return;
      let parsed;
      try{parsed=JSON.parse(value);}catch{return;}
      visit(parsed);
      return;
    }
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(visit);return;}
    if(value.kind==='visit_metric'){collect(value);return;}
    // Each row uses a single transport: structured source, console logs, or API envelope.
    const payload=value.Logs??value.logs??value.events??value.result??value.Message??value.source??value.message;
    if(payload!==undefined)visit(payload);
  }
  let document;
  try{document=JSON.parse(text);}catch{}
  if(document!==undefined){visit(document);return;}
  for(const [i,line] of text.split(/\r?\n/).entries()) {
    if(!line.trim())continue;
    let row;
    try{row=JSON.parse(line);}catch{throw Error('Invalid JSONL at line '+(i+1));}
    visit(row);
  }
}

export function buildReport(text,config={}) {
  const minimum=option(config.minimum,30,x=>Number.isSafeInteger(x)&&x>=1,'minimum sample');
  const validRate=x=>Number.isFinite(x)&&x>=0&&x<=1;
  const minReady=option(config.minReady,.90,validRate,'minimum ready rate');
  const maxTimeout=option(config.maxTimeout,.05,validRate,'maximum timeout rate');
  const groups=new Map();
  readEvents(text,value=>{
    const {version,event,device,entry}=value;
    if(typeof version!=='string'||!(version==='local'||versionId.test(version))||
       !visitMetric({event,device,entry,elapsedMs:0}))throw Error('Malformed visit_metric record.');
    if(!stages.includes(event))return;
    const key=[version,entry,device].join('/');
    let row=groups.get(key);
    if(!row){
      row={version,entry,device,explicitTimeout:true,...Object.fromEntries(stages.map(stage=>[stage,0]))};
      groups.set(key,row);
    }
    if(value.schema!==2)row.explicitTimeout=false;
    row[event]++;
  });
  const rows=[...groups.values()].sort((a,b)=>a.version.localeCompare(b.version)||a.entry.localeCompare(b.entry)||a.device.localeCompare(b.device));
  for(const row of rows) {
    const outcomes=row.ready+row.failed+row.timeout+row.cancelled;
    row.unresolvedBalance=row.submitted-outcomes;
    const hasDenominator=row.submitted>0&&outcomes<=row.submitted;
    row.readyRate=hasDenominator?row.ready/row.submitted:null;
    row.timeoutRate=hasDenominator&&row.explicitTimeout?row.timeout/row.submitted:null;
    if(row.unresolvedBalance<0)row.status='INCONCLUSIVE';
    else if(row.submitted<minimum)row.status='INSUFFICIENT';
    else if(row.readyRate<minReady||(row.timeoutRate!==null&&row.timeoutRate>maxTimeout))row.status='ALERT';
    else row.status=row.explicitTimeout?'OK':'PARTIAL';
  }
  let status='INSUFFICIENT';
  if(rows.some(r=>r.status==='ALERT'))status='ALERT';
  else if(rows.length&&rows.every(r=>r.status==='OK'))status='OK';
  else if(rows.some(r=>r.status!=='INSUFFICIENT'))status='PARTIAL';
  return {status,thresholds:{minimum,minReady,maxTimeout},groups:rows};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  try {
    const [file,...extra]=process.argv.slice(2);
    if(!file||extra.length)throw Error('Usage: node scripts/check-visit-metrics.mjs completed-window.json[l]');
    const report=buildReport(await readFile(file,'utf8'),{
      minimum:process.env.SHIKU_MIN_SAMPLE,minReady:process.env.SHIKU_MIN_READY_RATE,maxTimeout:process.env.SHIKU_MAX_TIMEOUT_RATE});
    console.log(JSON.stringify(report,null,2));
    process.exitCode=report.status==='ALERT'?1:report.status==='OK'?0:3;
  }catch(error){console.error(error.message);process.exitCode=2;}
}
