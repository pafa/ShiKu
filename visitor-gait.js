import * as THREE from 'three';
import {VISITORS} from './visitor-roster.js';
import {acquireVisitorFigure} from './visitor-model.js';
import {visitorContact} from './visitor-contact.js';
import {makeWholeMotion} from './whole-motion.js';
import {scanPerformance} from './scan-surface.js';
export {VISITORS};

const FIGURES=new Map(VISITORS.map(spec=>[spec.id,spec]));
const fileFor=(spec,detail)=>(detail&&spec.detailBody)||spec.body;

export function makeVisitor(isCurrent=()=>true,invalidate=()=>{},initialId=VISITORS[0].id,groundHeightAt=()=>0,detail=false) {
  const root=new THREE.Group();root.name='Exhibition visitor';
  const contact=visitorContact(root,groundHeightAt),loaded=new Map(),pending=new Map();
  let active=null,requestedId=initialId,requestedFile='',changing=null,disposed=false,revision=0;
  let initialResult;
  const ready=new Promise(resolve=>{initialResult=resolve;});
  function finishInitial(ok){initialResult?.(ok);initialResult=null;}

  function reset(){active?.rig.reset();active?.surface?.reset();}
  function trim(){
    for(const [file,item] of loaded){
      if(item===active||file===requestedFile)continue;
      // Keep the affordable original ready while its close-up is on screen.
      // Once the person leaves close range, release the high-resolution lease.
      if(item.id===active?.id&&file===FIGURES.get(item.id).body)continue;
      if(file===FIGURES.get(item.id).body&&!detail&&loaded.size<=2)continue;
      loaded.delete(file);item.dispose();
    }
  }
  function loadFigure(spec,quality){
    const requested=fileFor(spec,quality);
    if(loaded.has(requested))return Promise.resolve(loaded.get(requested));
    if(pending.has(requested))return pending.get(requested);
    const task=acquireVisitorFigure(spec,quality).then(lease=>{
      if(disposed||!isCurrent()){lease.release();return null;}
      const file=lease.file;
      // A failed high-resolution transfer can return the existing base mesh.
      if(loaded.has(file)){lease.release();return loaded.get(file);}
      try{
        const figure=lease.figure,rig=makeWholeMotion(figure,{groundHeightAt,id:spec.id});
        const result={id:spec.id,file,figure,rig,surface:scanPerformance(figure),dispose:lease.release};
        loaded.set(file,result);return result;
      }catch(error){lease.release();throw error;}
    }).catch(error=>{console.warn('访客模型加载失败',error);return null;})
      .finally(()=>pending.delete(requested));
    pending.set(requested,task);return task;
  }
  function setAppearance(id){
    const spec=FIGURES.get(id);
    if(!spec||disposed)return Promise.resolve(false);
    const file=fileFor(spec,detail);
    if(changing&&requestedFile===file)return changing;
    const token=++revision;requestedId=id;requestedFile=file;
    if(active?.file===file){changing=null;trim();return Promise.resolve(true);}
    changing=loadFigure(spec,detail).then(next=>{
      if(!next||disposed||token!==revision||!isCurrent()){
        if(token===revision&&!active)finishInitial(false);
        if(!disposed)trim();
        return false;
      }
      if(active!==next){
        const prior=active,same=prior?.id===id,pose=same?prior.rig.captureState():null;
        root.add(next.figure);active=next;
        if(pose)next.rig.restoreState(pose);
        else reset();
        prior?.figure.removeFromParent();contact.bind(next.figure);contact.update();
      }
      finishInitial(true);trim();invalidate();return true;
    }).finally(()=>{if(revision===token)changing=null;});
    return changing;
  }
  function setDetail(value){
    const next=!!value;
    if(detail===next&&active?.id===requestedId&&!changing)return Promise.resolve(true);
    detail=next;return setAppearance(requestedId);
  }
  if(FIGURES.has(initialId))void setAppearance(initialId);
  else finishInitial(false);
  return {ready,root,reset,setAppearance,setDetail,getAppearance:()=>active?.id??null,
    isSettling:()=>root.visible&&!!active?.rig.isSettling(),
    setVisible(value){root.visible=!!value;if(root.visible)reset();invalidate();},
    update(motion={}){
      if(!active||!root.visible)return;
      active.rig.update(motion);active.surface?.update(motion);contact.update();
    },
    dispose(){
      if(disposed)return;
      disposed=true;revision++;finishInitial(false);contact.dispose();
      for(const item of loaded.values())item.dispose();
      loaded.clear();active=null;changing=null;root.removeFromParent();
    }
  };
}
