import * as THREE from 'three';
import {motionLayout as layout} from './assets/visitors-whole/motions/cmu-layout.js';
import {opticalWalk} from './assets/visitors-whole/motions/optical-walk.js';
import {observedArms} from './assets/visitors-whole/motions/arm-walk.js';
import {makeVisitorFace} from './visitor-face.js';

const response=await fetch(new URL('./assets/visitors-whole/motions/cmu-poses.bin',import.meta.url));
if(!response.ok)throw Error('全身动作未能载入。');
const frames=new Int16Array(await response.arrayBuffer());
const channels=7+layout.joints.length*4;
const jointIndex=new Map(layout.joints.map((name,index)=>[name,index]));
const {clamp,lerp,smoothstep}=THREE.MathUtils;
const smooth=(a,b,k,dt)=>lerp(a,b,1-Math.exp(-k*dt));
const deltaAngle=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const v=()=>new THREE.Vector3(),q=()=>new THREE.Quaternion();
const up=new THREE.Vector3(0,1,0);
const clipNames=Object.keys(layout.clips);
// Stride relative to bone length, contribution of the quieter second walker,
// and the starting lead. The application still owns speed and direction.
const bearing={
  qing:[.96,.78,.51], heng:[.97,.62,.02]
};
function cyclicValue(table,phase){
  const t=phase*table.length,index=Math.floor(t);
  return lerp(table[index%table.length],table[(index+1)%table.length],t-index);
}
function opticalAxis(key,phase,slow){
  return lerp(cyclicValue(opticalWalk.walk[key],phase),cyclicValue(opticalWalk.slow[key],phase),slow);
}
function progressAtDistance(table,fraction){
  const f=clamp(fraction,0,1);
  let i=1;
  while(i<table.length-1 && table[i]<f)i++;
  return (i-1+(f-table[i-1])/Math.max(1e-6,table[i]-table[i-1]))/(table.length-1);
}

function sample(clip,time) {
  const spec=layout.clips[clip];
  const cyclic=spec.cycle||clip.startsWith('pivot');
  const t=cyclic?((time%1+1)%1)*spec.frames:clamp(time,0,1)*(spec.frames-1);
  const i=Math.floor(t),j=cyclic?(i+1)%spec.frames:Math.min(i+1,spec.frames-1);
  return {clip,a:(spec.offset+i)*channels,b:(spec.offset+j)*channels,f:t-i};
}
function value(s,channel){return lerp(frames[s.a+channel],frames[s.b+channel],s.f)/32767;}
function poseRotation(s,n,result,other){
  const c=7+n*4,a=s.a+c,b=s.b+c;
  result.set(frames[a],frames[a+1],frames[a+2],frames[a+3]).normalize();
  other.set(frames[b],frames[b+1],frames[b+2],frames[b+3]).normalize();
  return result.slerp(other,s.f);
}

// Sample contact points from the shoes worn by this person. Skin weights and
// garment proportions are left intact when retargeting the recording.
function shoeSamples(model,feet) {
  const regions=[new Map(),new Map()],outlines=[[],[]],vertex=v(),local=v(),inverse=model.matrixWorld.clone().invert();
  const footWorld=feet.map(foot=>foot.joint.matrixWorld.clone().invert());
  model.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    mesh.skeleton.update();
    const n=mesh.geometry.attributes.position.count;
    const {skinIndex,skinWeight}=mesh.geometry.attributes;
    const boneSide=mesh.skeleton.bones.map(b=>/^(Left|Right)(UpLeg|Leg|Foot|Toe)/.test(b.name)?(b.name.startsWith('Left')?1:-1):0);
    const indices=mesh.geometry.index?.array,referenced=indices?new Uint8Array(n):null;
    if(referenced)for(const index of indices)referenced[index]=1;
    for(let i=0;i<n;i++){
      if(referenced&&!referenced[i])continue;
      mesh.getVertexPosition(i,vertex).applyMatrix4(mesh.matrixWorld);
      local.copy(vertex).applyMatrix4(inverse);
      if(local.y>.28)continue;
      let sideWeight=0;
      for(let j=0;j<4;j++)sideWeight+=boneSide[skinIndex.getComponent(i,j)]*skinWeight.getComponent(i,j);
      // A scan may stand with the toe of its left shoe across the body's
      // centre. Attach that surface to the same foot that deforms it.
      const side=(Math.abs(sideWeight)>.1?sideWeight:local.x)>=0?0:1,foot=feet[side];
      if(local.y>Math.max(.18,foot.restPosition.y+.09))continue;
      // A close-up scan can carry tens of thousands of additional vertices.
      // For a horizontal tread, the lowest surface within each tiny footprint
      // cell can touch first. Keep that surface and the outer toe/heel at a riser.
      outlines[side].push({mesh,index:i,x:local.x,y:local.y,z:local.z});
      const key=Math.floor(local.z/.012)*100+Math.round(local.x/.012);
      const stored=regions[side].get(key);
      if(!stored||stored.y>local.y)regions[side].set(key,{y:local.y,p:vertex.clone().applyMatrix4(footWorld[side]),mesh,index:i});
    }
  });
  return regions.map((bins,i)=>{
    if(!bins.size){const sole=[{p:new THREE.Vector3(0,-.07,0)}];return {flat:sole,outline:sole};}
    const min=Math.min(...Array.from(bins.values(),b=>b.y));
    let outline=outlines[i];
    if(outline.length>1600){
      const cells=new Map();
      for(const p of outline){
        const key=Math.floor(p.x/.006)*10000+Math.floor(p.z/.006);
        const cell=cells.get(key);
        if(!cell)cells.set(key,[p,p,p]);
        else{
          if(p.y<cell[0].y)cell[0]=p;
          if(p.z<cell[1].z)cell[1]=p;
          if(p.z>cell[2].z)cell[2]=p;
        }
      }
      outline=[...new Set([...cells.values()].flat())];
    }
    const flat=Array.from(bins.values()).filter(b=>b.y<min+.055);
    for(const p of new Set([...outline,...flat])){
      const {mesh,index}=p;
      if(mesh.bindMode!=='attached'||mesh.morphTargetInfluences?.some(Boolean))continue;
      const {skinIndex,skinWeight,position}=mesh.geometry.attributes;
      vertex.fromBufferAttribute(position,index).applyMatrix4(mesh.bindMatrix);
      p.influences=[];
      for(let j=0;j<4;j++){
        const w=skinWeight.getComponent(index,j);
        if(!w)continue;
        const bone=skinIndex.getComponent(index,j);
        local.copy(vertex).applyMatrix4(mesh.skeleton.boneInverses[bone]).multiplyScalar(w);
        p.influences.push({m:mesh.skeleton.bones[bone].matrixWorld.elements,x:local.x,y:local.y,z:local.z,w});
      }
    }
    return {flat,outline};
  });
}

export function makeWholeMotion(model,{id='',groundHeightAt=()=>0}={}) {
  const face=makeVisitorFace(model,id);
  model.updateWorldMatrix(true,true);
  model.updateMatrixWorld(true); // Refresh attached skin bind inverses before assigning sole vertices to a side.
  const inverse=model.matrixWorld.clone().invert(),rectification=model.getWorldQuaternion(q()).invert();
  const restPoint=joint=>joint.getWorldPosition(v()).applyMatrix4(inverse);
  const relative=joint=>rectification.clone().multiply(joint.getWorldQuaternion(q()));
  const chain=[],nodes={};
  function relaxFingers(side){
    const digit=name=>model.getObjectByName(side+'Hand'+name);
    const index=digit('Index1'),pinky=digit('Pinky1'),middle=digit('Middle1');
    if(!index||!pinky||!middle)return;
    const down=restPoint(middle).sub(restPoint(middle.parent)).normalize();
    const across=restPoint(index).sub(restPoint(pinky));
    across.addScaledVector(down,-across.dot(down)).normalize();
    const spreadAxis=down.clone().cross(across).normalize();
    const knuckleAxis=across.clone().multiplyScalar(side==='Left'?-1:1);
    const curls=[];
    for(const [n,name] of ['Thumb','Index','Middle','Ring','Pinky'].entries()){
      const base=digit(name+'1'),second=digit(name+'2');
      if(!base||!second)continue;
      const ray=restPoint(second).sub(restPoint(base)).normalize();
      const spread=Math.atan2(ray.dot(across),ray.dot(down));
      const target=[.25,.055,0,-.055,-.095][n];
      const bringIn=clamp(target-spread,-.60,.60)*.94;
      curls.push([base,spreadAxis.clone().applyQuaternion(relative(base).invert()),bringIn]);
      for(let j=1;j<=3;j++){
        const bone=digit(name+j),next=digit(name+(j+1));
        if(!bone)continue;
        const incoming=restPoint(bone).sub(restPoint(bone.parent)).normalize();
        const segment=next&&restPoint(next).sub(restPoint(bone));
        // Some exporter end-sites are placed at the scene origin. Derive
        // the distal curl from its real knuckle instead of that phantom tip.
        const usable=segment&&segment.length()<.09&&segment.length()>.002;
        const outgoing=usable?segment.normalize():incoming;
        const present=Math.atan2(incoming.clone().cross(outgoing).dot(knuckleAxis),incoming.dot(outgoing));
        const desired=n===0?(j===1?.07:.115):(j===1?.23:j===2?.32:.15)+(n-1)*.051;
        const extra=clamp(desired-Math.max(0,present),0,desired);
        curls.push([bone,knuckleAxis.clone().applyQuaternion(relative(bone).invert()),extra]);
      }
    }
    for(const [bone,axis,extra] of curls)bone.quaternion.multiply(q().setFromAxisAngle(axis,extra));
  }
  function register(target,source,tip=null) {
    const joint=model.getObjectByName(target),end=tip&&model.getObjectByName(tip);
    if(!joint)return;
    const restRotation=relative(joint),restPosition=restPoint(joint);
    const targetAxis=end?restPoint(end).sub(restPosition).normalize():null;
    const index=jointIndex.get(source),correction={};
    for(const clip of clipNames){
      const axis=new THREE.Vector3().fromArray(layout.bind[clip][index]);
      const alignment=targetAxis&&axis.lengthSq()>.1?q().setFromUnitVectors(targetAxis,axis.normalize()):q();
      correction[clip]=alignment.multiply(restRotation);
    }
    // ASF limb coordinate systems are the performer's, not the author's.
    // Register neutral absolute orientations for the axial skeleton and soles.
    // Their recorded 3-axis changes survive without imposing a Vicon shrug,
    // downward neck tilt or toe pigeon from the source rest skeleton.
    const registered=target==='Hips'||target.startsWith('Spine')||target==='Head'||target==='Neck'||
      target.endsWith('Shoulder')||target.endsWith('Foot')||target.endsWith('ToeBase');
    if(registered){
      for(const clip of clipNames){
        const reference=q(),part=q(),tmp=q();let weight=0;
        const periods=layout.clips[clip].cycle?[0,.125,.25,.375,.5,.625,.75,.875]:
          clip.startsWith('stop')?[.96,.98,1]:clip.startsWith('start')?[0,.04,.08]:[0,.98];
        for(const t of periods){poseRotation(sample(clip,t),index,part,tmp);if(!weight)reference.copy(part);else reference.slerp(part,1/(weight+1));weight++;}
        correction[clip]=reference.invert().multiply(restRotation);
      }
    }
    // The captured stop ends with the performer's knees flexed and feet
    // close together. Register that neutral to the wearer's own standing
    // alignment; keep the recorded flexion and weight transfer into it.
    if(target.endsWith('UpLeg')||target==='LeftLeg'||target==='RightLeg'){
      // A capture stance can leave the feet splayed for camera visibility.
      // Start with the ankles beneath the hips and retain the individual's
      // measured fore/aft alignment and toe angle.
      const stanceAxis=targetAxis.clone();stanceAxis.x=clamp(stanceAxis.x,-.04,.04);
      const stanceRotation=q().setFromUnitVectors(targetAxis,stanceAxis.normalize()).multiply(restRotation);
      for(const name of ['stop','stopRight','start','startRight']){
        const neutral=q();poseRotation(sample(name,name.startsWith('stop')?1:0),index,neutral,q());
        correction[name].slerp(neutral.invert().multiply(stanceRotation),name.startsWith('stop')?.93:.84);
      }
    }
    const bone={joint,index,restPosition,restRotation,across:new THREE.Vector3(1,0,0).applyQuaternion(restRotation.clone().invert()),correction,hand:target.endsWith('Hand')};
    chain.push(bone);nodes[target]=bone;
  }
  register('Hips','root');register('Spine','lowerback');register('Spine1','upperback');register('Spine2','thorax');
  register('Neck','upperneck');register('Head','head');
  for(const side of ['Left','Right']){
    const s=side==='Left'?'l':'r';
    register(side+'Shoulder',s+'clavicle',side+'Arm');
    register(side+'Arm',s+'humerus',side+'ForeArm');
    register(side+'ForeArm',s+'radius',side+'Hand');
    const digit=['HandMiddle1','HandIndex1','HandIndex_01','HandIndex'].map(x=>side+x).find(x=>model.getObjectByName(x));
    register(side+'Hand',s+'hand',digit);
    register(side+'UpLeg',s+'femur',side+'Leg');
    register(side+'Leg',s+'tibia',side+'Foot');
    register(side+'Foot',s+'foot',side+'ToeBase');register(side+'ToeBase',s+'toes');
    relaxFingers(side);
  }
  const feet=[nodes.LeftFoot,nodes.RightFoot],soles=shoeSamples(model,feet);
  const legs=['Left','Right'].map((s,i)=>{
    const hip=nodes[s+'UpLeg'],knee=nodes[s+'Leg'],ankle=feet[i];
    return {hip:hip.joint,knee:knee.joint,ankle:ankle.joint,
      thigh:hip.restPosition.distanceTo(knee.restPosition),shin:knee.restPosition.distanceTo(ankle.restPosition),
      sole:soles[i],held:false,anchor:v(),release:v(),contactPoint:null,goal:v(),footQ:q(),
      shoeForward:new THREE.Vector3(0,0,1).applyQuaternion(ankle.restRotation.clone().invert()),soleYaw:0};
  });
  const footAxis=new THREE.Vector3(1,0,0);
  const legLength=legs[0].thigh+legs[0].shin,size=legLength/layout.dimensions.walk;
  const stanceWidth=clamp(feet[0].restPosition.x-feet[1].restPosition.x,.10,.21);
  const [strideScale,quietWalk,lead]=bearing[id]||[1,.45,0];
  const pelvis=nodes.Hips.joint,rest=nodes.Hips.restPosition.clone();
  const previous=v(),position=v(),forward=new THREE.Vector3(0,0,1),facing=v();
  const basis=q(),parentQ=q(),aQ=q(),bQ=q(),cQ=q(),inter=q();
  const rootMove=v(),point=v(),base=v(),offset=v(),tip=v();
  const a=v(),b=v(),c=v(),dir=v(),pole=v(),desired=v(),tmp=v(),tmp2=v();
  const rotation=q(),previousFrame=q(),localRotation=q();
  const restPose=sample('stop',1);
  const upper=[nodes.Spine2,nodes.Neck,nodes.Head].filter(Boolean).map(bone=>{
    const inv=bone.restRotation.clone().invert();
    return {joint:bone.joint,baseQ:q(),baseP:v(),up:up.clone().applyQuaternion(inv),
      right:new THREE.Vector3(1,0,0).applyQuaternion(inv)};
  });
  const chest=upper.find(b=>b.joint===nodes.Spine2?.joint),neck=upper.find(b=>b.joint===nodes.Neck?.joint),head=upper.find(b=>b.joint===nodes.Head?.joint);
  const eye=v(),look=v(),bodySpace=q(),gesture=q();
  const identity=Array.from(id).reduce((h,ch)=>(h*31+ch.charCodeAt(0))>>>0,7);
  const breathingPeriod=3.9+(identity%12)*.085;
  let breathingPhase=(identity%63)/10,gazeYaw=0,gazePitch=0,gazeResidual=0;
  let hipsAboveFloor=NaN,hipsVelocity=0;
  let priorYaw=0,phase=.60,pivotPhase=0,pivotDirection='pivotLeft',walkWeight=0,turnWeight=0;
  let lastSpeed=0,stopTime=1,stopBlend=1,stopTake='stop',stopping=false,valid=false;
  let entering=false,startDistance=0,startTake='start',starts=0,curveRate=0;

  function worldOrient(joint,target){
    joint.parent.getWorldQuaternion(parentQ);
    joint.quaternion.copy(parentQ.invert()).multiply(target).normalize();
    joint.updateWorldMatrix(false,false);
  }
  function projectedRotation(s,bone,out){
    return poseRotation(s,bone.index,out,inter).multiply(bone.correction[s.clip]);
  }
  function align(joint,child,target){
    joint.getWorldPosition(a);child.getWorldPosition(b);
    tmp.copy(b).sub(a).normalize();tmp2.copy(target).sub(a).normalize();
    rotation.setFromUnitVectors(tmp,tmp2);joint.getWorldQuaternion(previousFrame);
    worldOrient(joint,localRotation.copy(rotation).multiply(previousFrame));
  }
  // The scan only has a wrist joint for Yukihiro. Points 0/5/9/17 of
  // the registered hand landmarks are the wrist, index, middle and little
  // knuckles, respectively (scripts/visitor-tailoring/heng/hand-landmarks.json).
  const scanHands={
    Left:{index:[.40964,.84422,.01502],middle:[.41005,.83635,-.01031],pinky:[.39979,.84386,-.05356]},
    Right:{index:[-.42729,.84265,.03488],middle:[-.43283,.83488,.01051],pinky:[-.42950,.84143,-.03669]}
  };
  const frameX=v(),frameY=v(),frameZ=v(),frameMatrix=new THREE.Matrix4();
  function armFrame(direction,back,result){
    frameY.copy(direction).normalize();
    frameX.copy(back).addScaledVector(frameY,-frameY.dot(back)).normalize();
    frameZ.crossVectors(frameX,frameY);
    return result.setFromRotationMatrix(frameMatrix.makeBasis(frameX,frameY,frameZ));
  }
  function armBinding(side,sign){
    const arm=nodes[side+'Arm'],elbow=nodes[side+'ForeArm'],hand=nodes[side+'Hand'];
    function knuckle(name){
      const joint=model.getObjectByName(side+'Hand'+name+'1');
      if(id!=='heng'&&joint)return restPoint(joint);
      return v().fromArray(scanHands[side][name.toLowerCase()]);
    }
    const along=knuckle('Middle').sub(hand.restPosition).normalize();
    const radial=knuckle('Index').sub(knuckle('Pinky'));
    const dorsal=along.clone().cross(radial).normalize().multiplyScalar(-sign);
    const upper=elbow.restPosition.clone().sub(arm.restPosition).normalize();
    const lower=hand.restPosition.clone().sub(elbow.restPosition).normalize();
    // The photographed dorsal direction defines axial roll independently of
    // the capture rig's bone axes. Removing/restoring the bind frame rotates
    // the sleeve and the palm together while preserving their own proportions.
    const binding=(bone,direction)=>armFrame(direction,dorsal,q()).invert().multiply(bone.restRotation);
    return {shoulder:arm.joint,elbow:elbow.joint,hand:hand.joint,side:sign,
      upperBind:binding(arm,upper),lowerBind:binding(elbow,lower),handBind:binding(hand,along),
      wristPitch:Math.atan2(along.z,-along.y)-Math.atan2(lower.z,-lower.y),
      restElbow:(sign>0?14:16)*Math.PI/180};
  }
  const arms=[armBinding('Left',1),armBinding('Right',-1)];
  const shoulderPos=v(),elbowPos=v(),wristPos=v(),upperDir=v(),lowerDir=v(),armSide=v();
  const upperBack=v(),lowerBack=v(),handDir=v(),rollQ=q(),armGoal=v();
  function armDirection(pitch,outward){
    return armGoal.copy(up).multiplyScalar(-Math.cos(pitch)).addScaledVector(facing,Math.sin(pitch))
      .addScaledVector(armSide,outward).normalize();
  }
  function relaxArms(performanceWeight,slowFraction,levelWeight){
    // Reflectors follow the outside of the arm. Use their angular excursion
    // around the scan's own relaxed sleeve and their measured sagittal pitch.
    function measured(key,index){
      const other=1-index,oppositePhase=(phase+.5)%1;
      // The performer leads much farther with their left arm. Share part of
      // the opposite half-stride to keep this a quiet walk while preserving
      // each arm's own elbow and wrist timings.
      function take(clip){
        const recorded=observedArms[clip];
        return lerp(cyclicValue(recorded[index][key],phase),
          cyclicValue(recorded[other][key],oppositePhase),.32);
      }
      return lerp(take('walk'),take('slow'),slowFraction);
    }
    armSide.set(facing.z,0,-facing.x).normalize();
    for(const {shoulder,elbow,hand,side,restElbow,upperBind,lowerBind,handBind,wristPitch} of arms){
      shoulder.getWorldPosition(shoulderPos);elbow.getWorldPosition(elbowPos);hand.getWorldPosition(wristPos);
      upperDir.subVectors(elbowPos,shoulderPos).normalize();
      lowerDir.subVectors(wristPos,elbowPos).normalize();
      const upperPitch=Math.atan2(upperDir.dot(facing),-upperDir.y);
      const forePitch=Math.atan2(lowerDir.dot(facing),-lowerDir.y);
      const index=side>0?0:1;
      // Blend the captured arms with the original start, stop and turning
      // takes. Preserve the independent reversal of upper arm and forearm.
      const fromRest=lerp(-.055,upperPitch,performanceWeight);
      const fromElbow=lerp(restElbow,forePitch-upperPitch,performanceWeight*.8);
      const reach=lerp(.87,.74,quietWalk);
      const pitch=lerp(fromRest,lerp(-.055,measured('upper',index),reach),levelWeight);
      const lowerPitch=lerp(fromRest+fromElbow,lerp(restElbow-.055,measured('fore',index),reach),levelWeight);
      // Fitted to the actual hip and knuckle surfaces at passing, including
      // the inward reach of the fingers beside the trousers.
      const upperNeutral=id==='heng'?.173:.154;
      const foreNeutral=id==='heng'?.106:.09;
      const upperOut=side*Math.tan(upperNeutral+measured('upperSide',index)*levelWeight);
      const lowerOut=side*Math.tan(foreNeutral+measured('foreSide',index)*levelWeight);
      upperDir.copy(armDirection(pitch,upperOut));
      lowerDir.copy(armDirection(lowerPitch,lowerOut));
      // Flex at the elbow with the back of the sleeve on the outside.
      // Roll follows the recorded finger/wrist plane on each side. Both wrists
      // retain their radial (thumb) edge forward; rotation never accumulates
      // from the previous frame or from an unrelated ASF forearm twist.
      const wristMotion=opticalAxis(side>0?'leftWrist':'rightWrist',phase,slowFraction);
      const roll=.065+performanceWeight*clamp(wristMotion,-.24,.24);
      upperBack.copy(armSide).multiplyScalar(side).addScaledVector(facing,.04+roll*.25);
      lowerBack.copy(armSide).multiplyScalar(side).addScaledVector(facing,roll);
      worldOrient(shoulder,armFrame(upperDir,upperBack,rollQ).multiply(upperBind));
      worldOrient(elbow,armFrame(lowerDir,lowerBack,rollQ).multiply(lowerBind));
      // The relaxed wrist hangs a little below the swinging forearm. Keep
      // the model's measured sagittal bend instead of straightening the hand.
      handDir.copy(armDirection(lowerPitch+clamp(wristPitch,-.26,.14),lowerOut));
      worldOrient(hand,armFrame(handDir,lowerBack,rollQ).multiply(handBind));
    }
  }
  function solve(leg){
    leg.hip.getWorldPosition(a);leg.knee.getWorldPosition(b);leg.ankle.getWorldPosition(c);
    dir.copy(leg.goal).sub(a);
    const length=clamp(dir.length(),Math.abs(leg.thigh-leg.shin)+.00001,leg.thigh+leg.shin-.00001);
    dir.normalize();
    // Use the recorded knee plane before relocating the ankle. Taking the
    // pole from the new reach axis can flip an almost straight knee backwards.
    tmp.copy(c).sub(a).normalize();pole.copy(b).sub(a);pole.addScaledVector(tmp,-pole.dot(tmp));
    const bend=pole.length();
    if(bend>.0001)pole.multiplyScalar(1/bend);
    const reliable=smoothstep(bend,.008,.052)*smoothstep(pole.dot(facing),.08,.72);
    pole.lerp(facing,1-reliable*(1-.78*turnWeight));
    pole.addScaledVector(dir,-pole.dot(dir)).normalize();
    const upper=(leg.thigh**2-leg.shin**2+length**2)/(2*length);
    desired.copy(a).addScaledVector(dir,upper).addScaledVector(pole,Math.sqrt(Math.max(0,leg.thigh**2-upper**2)));
    align(leg.hip,leg.knee,desired);align(leg.knee,leg.ankle,leg.goal);worldOrient(leg.ankle,leg.footQ);
  }
  function measuredVertex(leg,sample){
    // Attached skin's mesh.matrixWorld cancels its bindMatrixInverse. The
    // inverse bind and weight are constant for each measured shoe vertex.
    // Only the recorded bone world matrices change between contact solves.
    if(sample.influences){
      point.set(0,0,0);
      for(const {m,x,y,z,w} of sample.influences){
        point.x+=m[0]*x+m[4]*y+m[8]*z+m[12]*w;
        point.y+=m[1]*x+m[5]*y+m[9]*z+m[13]*w;
        point.z+=m[2]*x+m[6]*y+m[10]*z+m[14]*w;
      }
      return point;
    }
    if(sample.mesh)return sample.mesh.getVertexPosition(sample.index,point).applyMatrix4(sample.mesh.matrixWorld);
    return point.copy(sample.p).applyMatrix4(leg.ankle.matrixWorld);
  }
  function soleFloor(leg,offsetX=0,offsetZ=0,strict=false){
    leg.ankle.updateWorldMatrix(true,false);
    const elements=leg.ankle.matrixWorld.elements,x=elements[12]+offsetX,z=elements[14]+offsetZ;
    const flat=groundHeightAt(x,z);
    // A shoe can extend over the riser while the heel still sits on the
    // lower tread. Here inspect the complete scanned shoe, not just a flat
    // support polygon. The only stepped floor in the gallery is rectilinear.
    const varX=Math.abs(groundHeightAt(x+.32,z)-groundHeightAt(x-.32,z))>.065;
    const varZ=Math.abs(groundHeightAt(x,z+.32)-groundHeightAt(x,z-.32))>.065;
    const stepped=varX||varZ,contour=stepped?leg.sole.outline:leg.sole.flat;
    let gap=Infinity,lowest=contour[0];
    const heights=stepped?new Map():null;
    for(const p of contour){
      measuredVertex(leg,p);
      let floor=flat;
      if(stepped&&strict){floor=groundHeightAt(point.x+offsetX,point.z+offsetZ);}
      else if(stepped){
        const value=varX?point.x+offsetX:point.z+offsetZ,cell=Math.floor(value*250);
        if(!heights.has(cell)){
          const a=cell/250-.004,b=(cell+1)/250+.004;
          heights.set(cell,varX?Math.max(groundHeightAt(a,z),groundHeightAt(b,z)):
            Math.max(groundHeightAt(x,a),groundHeightAt(x,b)));
        }
        floor=heights.get(cell);
      }
      const delta=point.y-floor;
      if(delta<gap){gap=delta;lowest=p;}
    }
    return {gap,lowest};
  }
  function movePelvis(y){
    pelvis.getWorldPosition(base);base.y+=y;
    pelvis.position.copy(pelvis.parent.worldToLocal(base));
    pelvis.updateWorldMatrix(false,true);
  }
  function draw(dt,speed,dyaw){
    const turnRate=Math.abs(dyaw)/Math.max(dt,.001);
    const isPivot=turnRate>.68&&speed<.57;
    const moving=speed>.015;
    const acceleration=dt>0?(speed-lastSpeed)/dt:0;
    if(moving&&lastSpeed<.035&&speed>=.035&&walkWeight<.20&&!entering){
      entering=true;stopping=false;startDistance=0;
      startTake=((lead>=.25&&lead<.75)!==!!(starts++%2))?'startRight':'start';
    }
    if(stopping&&(acceleration>.4||isPivot))stopping=false;
    if(entering&&!moving&&acceleration<=0&&startDistance<.025)entering=false;
    if(!stopping&&!isPivot&&((acceleration<-.65&&lastSpeed>.18&&speed<1.12)||(lastSpeed>.025&&!moving))){
      stopping=true;entering=false;stopBlend=0;
      // Match the remaining momentum to the end of the capture. Replaying the
      // performer's full last step after a tap made the stationary leg kick up.
      stopTime=lerp(.80,.70,smoothstep(lastSpeed,.22,1.05));
      // Align the trailing leg with the captured braking step.
      stopTake=phase<.5?'stopRight':'stop';
    }
    if(stopping){
      stopTime=Math.min(1,stopTime+dt*1.65/layout.clips.stop.duration);
      stopBlend=Math.min(1,stopBlend+dt*4.3);
    }
    if(isPivot)entering=false;
    const stepLength=clamp(.18+speed/(1.16*size),0,1);
    walkWeight=smooth(walkWeight,moving?stepLength:0,10,dt);
    if(!moving&&walkWeight<.001)walkWeight=0;
    curveRate=smooth(curveRate,dt>0?dyaw/dt:0,8,dt);
    const cornerSide=curveRate>=0?'Left':'Right';
    // Relative to travel, the original soft arcs turn ~30 degrees per stride,
    // the two corner takes ~90. Blend their actual limbs and pelvis as well.
    const curvature=Math.abs(curveRate)/Math.max(.58,speed);
    const arc=smoothstep(curvature,.08,.62)*(1-smoothstep(.57-speed,0,.4));
    const tight=smoothstep(curvature,.65,1.55);
    const slow=(1-smoothstep(speed/size,.68,1.23))*(1-arc);
    const level=Math.max(0,1-slow-arc);
    const components=[];
    function add(name,weight){if(weight>.001)components.push({name,weight});}
    add('walk',level*(1-quietWalk));add('amble',level*quietWalk);add('slow',slow);
    add('curve'+cornerSide,arc*(1-tight));add('corner'+cornerSide,arc*tight);
    const total=components.reduce((sum,c)=>sum+c.weight,0);
    for(const part of components)part.weight/=total;
    const stride=components.reduce((sum,c)=>sum+c.weight*layout.clips[c.name].distance*
      legLength/layout.dimensions[c.name],0)*strideScale;
    if(moving){
      const cycleRate=speed/(stride*Math.max(.32,walkWeight));
      phase=(phase+dt*Math.min(cycleRate,1.04+.05*clamp(curvature,0,2)))%1;
    }
    let startTime=0,startWeight=0;
    if(entering){
      startDistance+=dt*speed;
      const spec=layout.clips.start;
      startTime=progressAtDistance(spec.travel,startDistance/(spec.distance*size*strideScale));
      const sideOffset=startTake==='startRight'?.5:0;
      if(startTime<1){
        // Both measured takes reach their second heel strike at the last frame.
        const startPhase=(startTime-spec.firstHeel)/((1-spec.firstHeel)*2);
        phase=(1+sideOffset+startPhase+(lead-Math.round(lead*2)/2)*.6)%1;
        startWeight=smoothstep(startTime,0,.17)*(1-smoothstep(startTime,.63,1));
      }else entering=false;
    }
    if(isPivot){
      const next=dyaw>0?'pivotLeft':'pivotRight';
      if(next!==pivotDirection||turnWeight<.025)pivotPhase=0;
      pivotDirection=next;pivotPhase=(pivotPhase+Math.abs(dyaw)/layout.clips[next].angle)%1;
    }
    const pivotTarget=isPivot?clamp((turnRate-.25)/1.25,0,1)*(1-smoothstep(speed,.3,.57)):0;
    turnWeight=smooth(turnWeight,pivotTarget,12,dt);
    if(turnWeight<.001)turnWeight=0;
    const pivot=sample(pivotDirection,pivotPhase),start=sample(startTake,startTime);
    const stand=stopping?sample(stopTake,stopTime):restPose;
    const w=stopping?walkWeight*(1-stopBlend):walkWeight;
    for(const c of components)c.pose=sample(c.name,phase);
    model.getWorldQuaternion(basis);facing.copy(forward).applyQuaternion(basis);
    for(const bone of chain){
      if(bone.hand)continue; // The final wrist frame uses the photographed palm.
      projectedRotation(stand,bone,aQ);
      if(w>1e-5){
        let sum=0;
        for(const c of components){
          projectedRotation(c.pose,bone,cQ);
          if(!sum)bQ.copy(cQ);
          else bQ.slerp(cQ,c.weight/(sum+c.weight));
          sum+=c.weight;
        }
        aQ.slerp(bQ,w);
      }
      if(startWeight>0)aQ.slerp(projectedRotation(start,bone,cQ),startWeight);
      if(turnWeight>0)aQ.slerp(projectedRotation(pivot,bone,cQ),turnWeight);
      if(bone===nodes.Hips||bone===nodes.Spine2||bone===nodes.LeftShoulder||bone===nodes.RightShoulder){
        const axis=bone===nodes.Hips?'hips':'shoulders';
        tip.copy(bone.across).applyQuaternion(aQ);
        const currentYaw=Math.atan2(tip.z,tip.x);
        const amount=w*(1-startWeight)*(1-turnWeight)*(1-arc);
        // ASF shoulders are pivots under a clavicle. Match their absolute
        // rotation around the upright axis to the observed shoulder/hip line.
        const correction=(currentYaw-opticalAxis(axis,phase,slow))*amount;
        aQ.premultiply(rotation.setFromAxisAngle(up,correction));
      }
      if(bone===feet[0]||bone===feet[1]){
        const side=bone===feet[0]?0:1;
        const progress=(phase+side*.5)%1;
        const roll=opticalAxis('sole',progress,slow);
        aQ.slerp(bone.restRotation,Math.max(.28*startWeight,.54*turnWeight));
        tip.copy(legs[side].shoeForward).applyQuaternion(aQ);
        const recorded=Math.atan2(-tip.y,Math.hypot(tip.x,tip.z));
        // Heel and toe markers span a flexible foot. A rigid mesh rotates
        // about its ankle, so preserve the captured timing, with the residual
        // forefoot flexion carried by the toe joint during the push-off.
        const shoeRoll=roll>0?roll*.80:roll*.86;
        const correction=(shoeRoll-recorded)*w*(1-startWeight)*(1-turnWeight);
        aQ.premultiply(rotation.setFromAxisAngle(footAxis,correction));
      }
      aQ.premultiply(basis);
      worldOrient(bone.joint,aQ);
    }

    const mixChannel=k=>{
      const gait=components.reduce((sum,c)=>sum+c.weight*value(c.pose,k),0);
      return lerp(lerp(lerp(value(stand,k),gait,w),value(start,k),startWeight),value(pivot,k),turnWeight);
    };
    rootMove.set(mixChannel(0)*size,mixChannel(1)*size,mixChannel(2)*size);
    const activeStep=Math.max(w,startWeight);
    rootMove.y=lerp(rootMove.y,rootMove.y*.72+.004*size,activeStep);
    rootMove.add(rest);model.localToWorld(rootMove);
    pelvis.position.copy(pelvis.parent.worldToLocal(rootMove));model.updateMatrixWorld(true);
    const levels=legs.map(leg=>soleFloor(leg));
    const contact=legs.map((_,i)=>mixChannel(3+i));
    // Bring the support shoe to the measured ground. Preserve the difference
    // in height between the two shoes from the original performance.
    const min=Math.min(levels[0].gap,levels[1].gap);
    movePelvis(-min*(1-activeStep));
    // Keep the measured stair/pivot solve. On level ground let the loaded
    // leg carry the pelvis; the airborne leg must not pull the body down.
    const levelLoad=w*(1-startWeight)*(1-turnWeight)*(1-arc);
    const tread=groundHeightAt(position.x,position.z);
    const even=Math.abs(groundHeightAt(position.x,position.z+.48)-tread)<.012&&
      Math.abs(groundHeightAt(position.x,position.z-.48)-tread)<.012&&
      Math.abs(groundHeightAt(position.x+.48,position.z)-tread)<.012&&
      Math.abs(groundHeightAt(position.x-.48,position.z)-tread)<.012;
    const straight=even?levelLoad:0;
    let drop=0,load=0,supportDrop=0;
    for(const [i,leg] of legs.entries()){
      leg.ankle.getWorldQuaternion(leg.footQ);leg.ankle.getWorldPosition(leg.goal);
      const support=contact[i]>.48;
      leg.hip.getWorldPosition(a);leg.knee.getWorldPosition(b);leg.ankle.getWorldPosition(c);
      // Before floor registration these three joints still contain the
      // performer's flexion. Store the length implied by that knee bend.
      leg.recordedSpan2=a.distanceToSquared(c);
      tip.copy(leg.shoeForward).applyQuaternion(leg.footQ);
      const rawYaw=Math.atan2(tip.x,tip.z);
      if(support&&leg.held){
        // Allow a measured swivel at a pivot, but preserve a loaded shoe's
        // heading while the rest of the body takes the next step around it.
        const error=deltaAngle(rawYaw,leg.soleYaw);
        leg.soleYaw+=clamp(error,-dt*(.10+turnRate*.07),dt*(.10+turnRate*.07));
        const yawLimit=.48+.14*(1-turnWeight);
        const heldYaw=rawYaw+clamp(deltaAngle(leg.soleYaw,rawYaw),-yawLimit,yawLimit);
        const bodyYaw=Math.atan2(facing.x,facing.z);
        const limit=lerp(Math.PI,.52,turnWeight);
        const correcting=deltaAngle(bodyYaw+clamp(deltaAngle(heldYaw,bodyYaw),-limit,limit),rawYaw);
        leg.footQ.premultiply(rotation.setFromAxisAngle(up,correcting));
        worldOrient(leg.ankle,leg.footQ);leg.ankle.updateWorldMatrix(true,true);
      }else leg.soleYaw=rawYaw;
      if(entering&&startWeight>0){
        // The starting performer took a long first stride. Scale its reach to
        // the current input speed before anchoring a shoe for weight bearing.
        leg.hip.getWorldPosition(base);
        const reach=offset.subVectors(leg.goal,base).dot(facing);
        leg.goal.addScaledVector(facing,-reach*(1-smoothstep(speed,.22,1.25))*.56*startWeight);
      }
      if(support&&(leg.held||leg.approaching)&&leg.contactPoint){
        measuredVertex(leg,leg.contactPoint);
        offset.subVectors(leg.anchor,point);
        offset.x-=leg.goal.x-leg.ankle.matrixWorld.elements[12];
        offset.z-=leg.goal.z-leg.ankle.matrixWorld.elements[14];
        offset.y=0;
        // An unexpected wall/teleport can invalidate the captured reach.
        if(offset.length()>.24)offset.setLength(.24);
        leg.release.copy(offset);
      }else if(!support)leg.release.multiplyScalar(Math.exp(-dt*13));
      leg.goal.add(leg.release);
      const local=(phase+i*.5)%1;
      const anticipate=smoothstep(local,.82,.98)*straight;
      leg.approaching=!support&&anticipate>.6;
      if(!support&&anticipate>0){
        const rate=Math.min(speed/(stride*Math.max(.32,walkWeight)),1.04+.05*clamp(curvature,0,2));
        const length=speed/Math.max(.3,rate);
        const reach=offset.subVectors(leg.goal,position).dot(facing);
        const remaining=1-local;
        // A quadratic approach has zero world-space forward speed at strike:
        // root travel covers exactly the linear part as remaining -> 0.
        const desired=length*(.235+remaining-12*remaining**2);
        leg.goal.addScaledVector(facing,clamp(desired-reach,-.15,.15)*anticipate);
      }
      leg.held=support;
      const shifted=soleFloor(leg,leg.goal.x-leg.ankle.matrixWorld.elements[12],leg.goal.z-leg.ankle.matrixWorld.elements[14]);
      let clearance=Math.max(0,mixChannel(5+i)*size*(1-.24*activeStep));
      if(!support){
        // Optical toe/heel markers can skim the floor before the new sole has
        // finished its forward swing. Preserve clearance for the thicker shoe
        // until the captured heel strike, then transfer its weight to the floor.
        const duty=components.reduce((sum,c)=>sum+c.weight*layout.clips[c.name].duty[i],0);
        const swing=((phase+i*.5)%1-duty)/(1-duty);
        // A light foot that is carried around a pivot must leave the
        // tread before sweeping sideways into a new heading.
        if(turnWeight>.06)clearance=Math.max(clearance,.026*size*turnWeight*smoothstep(1-contact[i],.25,.9));
        if(swing>0&&w>.04)clearance=Math.max(clearance,.024*size*w*Math.sin(Math.PI*clamp(swing,0,1))**.55);

      }
      // Close the terminal swing on the heel strike of the same cycle.
      // A clearance blended from several takes can still be a few cm high
      // on their last sampled frame, although the new heel is about to load.
      const legPhase=local;
      clearance*=1-(1-smoothstep(1-legPhase,0,.12))*straight;
      leg.clearance=clearance;leg.goal.y+=clearance-shifted.gap;
      leg.hip.getWorldPosition(base);
      const reach=leg.thigh+leg.shin-.001,horiz=(leg.goal.x-base.x)**2+(leg.goal.z-base.z)**2;
      drop=Math.max(drop,(base.y-leg.goal.y-Math.sqrt(Math.max(.0001,reach**2-horiz)))*(support?1:1-straight));
      const phaseLoad=smoothstep(legPhase,0,.095)*(1-smoothstep(legPhase,.49,.595));
      if(support&&phaseLoad>0){
        supportDrop+=phaseLoad*(base.y-leg.goal.y-Math.sqrt(Math.max(.0001,leg.recordedSpan2-horiz)));
        load+=phaseLoad;
      }
    }
    // When steering changes halfway through a captured cross-step, the old
    // planted shoe may occupy the new swing trajectory. Give the swing leg
    // clearance near that shoe without widening the full stride or moving a
    // planted foot on an ordinary straight.
    const between=offset.subVectors(legs[0].goal,legs[1].goal);
    const apart=tip.set(facing.z,0,-facing.x).normalize();
    const overlap=(1-smoothstep(Math.abs(between.dot(facing)),.11,.30))*
      Math.max(0,stanceWidth*.70-between.dot(apart));
    if(overlap>.0001){
      const leftShare=clamp(.5+(contact[1]-contact[0])*.5,.04,.96);
      legs[0].goal.addScaledVector(apart,overlap*leftShare);
      legs[1].goal.addScaledVector(apart,-overlap*(1-leftShare));
    }
    const reachDrop=drop;
    if(load>0)drop=Math.max(drop,(supportDrop/load)*straight);
    const pelvisY=pelvis.getWorldPosition(a).y;
    const target=pelvisY-clamp(drop,0,.13)-position.y;
    if(!Number.isFinite(hipsAboveFloor)||straight<.001){hipsAboveFloor=target;hipsVelocity=0;}
    else{
      const rate=25;
      const delta=hipsAboveFloor-target,u=(hipsVelocity+rate*delta)*dt,z=Math.exp(-rate*dt);
      hipsAboveFloor=target+(delta+u)*z;
      hipsVelocity=(hipsVelocity-rate*u)*z;
    }
    const filtered=lerp(target,hipsAboveFloor,straight);
    movePelvis(Math.min(-Math.min(reachDrop,.13),filtered+position.y-pelvisY));
    for(const [i,leg] of legs.entries()){
      if(leg.held||straight<.001)continue;
      const swing=(phase+i*.5)%1;
      const weight=smoothstep(swing,.61,.70)*(1-smoothstep(swing,.89,.98))*straight;
      leg.hip.getWorldPosition(base);
      const horiz=(leg.goal.x-base.x)**2+(leg.goal.z-base.z)**2;
      const recordedY=base.y-Math.sqrt(Math.max(.001,leg.recordedSpan2-horiz));
      leg.goal.y+=clamp(recordedY-leg.goal.y,-Math.max(0,leg.clearance-.015),.035)*weight;
      const dz=leg.goal.z-base.z,dx=leg.goal.x-base.x,dh=leg.goal.y-base.y;
      const radius=leg.thigh+leg.shin-.002;
      const available=Math.sqrt(Math.max(.0001,radius*radius-dh*dh));
      const reach=Math.hypot(dx,dz);
      if(reach>available){leg.goal.x=base.x+dx*lerp(1,available/reach,straight);leg.goal.z=base.z+dz*lerp(1,available/reach,straight);}
    }
    for(const leg of legs){
      solve(leg);leg.hip.updateWorldMatrix(true,true);
      let floor=soleFloor(leg);
      for(let pass=0;pass<3&&floor.gap<-.00075;pass++){
        leg.ankle.getWorldPosition(leg.goal);
        leg.goal.y-=floor.gap-.0007;
        solve(leg);leg.hip.updateWorldMatrix(true,true);floor=soleFloor(leg);
      }
      leg.contactPoint=floor.lowest;
      leg.anchor.copy(measuredVertex(leg,leg.contactPoint));
    }
    // Final registration uses the actual, unpadded tread under both scanned
    // shoes. A conservative swing envelope near a stone edge must not leave
    // both shoes suspended after the trailing leg settles.
    const contactGap=Math.min(...legs.map(leg=>soleFloor(leg,0,0,true).gap));
    if(Math.abs(contactGap)>.00045)movePelvis(-contactGap);
    relaxArms(Math.max(w,startWeight,turnWeight*.55),slow,w*(1-startWeight)*(1-turnWeight)*(1-arc));
    model.updateWorldMatrix(false,true);
    lastSpeed=speed;
  }
  function measure(){model.getWorldPosition(position);model.getWorldQuaternion(basis);facing.copy(forward).applyQuaternion(basis);return Math.atan2(facing.x,facing.z);}
  function restoreUpper(){
    for(const part of upper){part.joint.quaternion.copy(part.baseQ);part.joint.position.copy(part.baseP);}
  }
  function rememberUpper(){
    for(const part of upper){part.baseQ.copy(part.joint.quaternion);part.baseP.copy(part.joint.position);}
  }
  function upperMotion(dt,attention){
    restoreUpper();
    let yaw=0,pitch=0;
    if(attention&&head&&Number.isFinite(attention.x)&&Number.isFinite(attention.y)&&Number.isFinite(attention.z)){
      head.joint.getWorldPosition(eye);eye.y+=.08*size;
      look.set(attention.x,attention.y,attention.z).sub(eye);
      look.applyQuaternion(model.getWorldQuaternion(bodySpace).invert());
      const horizontal=Math.hypot(look.x,look.z),angle=Math.atan2(look.x,look.z);
      const art=attention.kind==='art';
      if(horizontal>.18&&horizontal<(art?7.05:3.25)){
        const visibility=1-THREE.MathUtils.smoothstep(Math.abs(angle),1.15,1.58);
        const amount=(1-.44*walkWeight)*visibility;
        yaw=clamp(angle*(art?.70:.56),art?-.55:-.34,art?.55:.34)*amount;
        const elevation=Math.atan2(look.y,horizontal);
        pitch=clamp(-elevation*(art?.9:.6),art?-Math.PI/6:-.14,art?.27:.16)*amount;
      }
    }
    gazeYaw=smooth(gazeYaw,yaw,3.8,dt);gazePitch=smooth(gazePitch,pitch,3.5,dt);
    gazeResidual=Math.abs(yaw-gazeYaw)+Math.abs(pitch-gazePitch);
    breathingPhase=(breathingPhase+dt*2*Math.PI/breathingPeriod)%(2*Math.PI);
    const breath=Math.sin(breathingPhase)*(1-.85*walkWeight);
    if(chest){
      chest.joint.quaternion.multiply(gesture.setFromAxisAngle(chest.right,-.0046*breath));
      // Translation is along the parent's actual upright axis even on rigs
      // authored with a rotated chest coordinate system.
      chest.joint.parent.getWorldQuaternion(bodySpace);
      chest.joint.position.addScaledVector(look.copy(up).applyQuaternion(bodySpace.invert()),.0014*size*breath);
    }
    for(const part of [neck,head]){
      if(!part)continue;
      const share=neck&&head?(part===neck ? .39 : .61):1;
      part.joint.quaternion.multiply(gesture.setFromAxisAngle(part.up,gazeYaw*share))
        .multiply(gesture.setFromAxisAngle(part.right,gazePitch*share));
    }
  }
  function reset(){
    if(valid)restoreUpper();
    priorYaw=measure();previous.copy(position);phase=lead;pivotPhase=0;entering=false;starts=0;startDistance=curveRate=0;
    walkWeight=turnWeight=lastSpeed=0;stopping=false;stopTime=stopBlend=1;
    gazeYaw=gazePitch=gazeResidual=0;hipsAboveFloor=NaN;hipsVelocity=0;
    for(const leg of legs){leg.held=leg.approaching=false;leg.release.set(0,0,0);}
    valid=true;draw(0,0,0);rememberUpper();upperMotion(0,null);face.reset();
  }
  function update({dt=0,attention=null}={}){
    if(!valid){reset();return;}
    dt=clamp(dt,0,.25);const yaw=measure(),dyaw=deltaAngle(yaw,priorYaw);
    const dx=position.x-previous.x,dz=position.z-previous.z,distance=Math.hypot(dx,dz);
    if(distance>Math.max(.65,dt*3.5)||Math.abs(dyaw)>Math.max(.7,dt*6)){reset();return;}
    if(distance>=1e-7||Math.abs(dyaw)>=1e-7||Math.abs(position.y-previous.y)>=1e-7||locomotionSettling()){
      restoreUpper();draw(dt,dt>0?distance/dt:0,dyaw);rememberUpper();previous.copy(position);priorYaw=yaw;
    }
    upperMotion(dt,attention);
    head?.joint.updateWorldMatrix(true,true);
    face.update(dt,attention);
  }
  // Near/far meshes of one scan share joints and body coordinates. Contact
  // vertex indices differ, so transfer the performance and world anchors,
  // then measure the new shoe surface at this exact moment of the motion.
  function captureState(){
    return {phase,pivotPhase,pivotDirection,walkWeight,turnWeight,lastSpeed,stopTime,stopBlend,
      stopTake,stopping,entering,startDistance,startTake,starts,curveRate,breathingPhase,gazeYaw,gazePitch,hipsAboveFloor,hipsVelocity,
      feet:legs.map(leg=>({held:leg.held,approaching:leg.approaching,anchor:leg.anchor.clone(),release:leg.release.clone(),soleYaw:leg.soleYaw}))};
  }
  function restoreState(state){
    if(!state)return reset();
    restoreUpper();
    ({phase,pivotPhase,pivotDirection,walkWeight,turnWeight,lastSpeed,stopTime,stopBlend,
      stopTake,stopping,entering,startDistance,startTake,starts,curveRate,breathingPhase,gazeYaw,gazePitch,hipsAboveFloor,hipsVelocity}=state);
    priorYaw=measure();previous.copy(position);valid=true;
    for(let i=0;i<legs.length;i++){
      legs[i].held=legs[i].approaching=false;
      legs[i].release.copy(state.feet[i].release);
    }
    draw(0,lastSpeed,0);
    for(let i=0;i<legs.length;i++){
      const saved=state.feet[i],leg=legs[i];
      leg.approaching=saved.approaching;
      if((saved.held&&leg.held)||saved.approaching){leg.anchor.copy(saved.anchor);leg.soleYaw=saved.soleYaw;}
    }
    rememberUpper();upperMotion(0,null);
  }
  function locomotionSettling(){return walkWeight>.001||turnWeight>.001||(stopping&&stopTime<1);}
  function isSettling(){return locomotionSettling()||gazeResidual>.006;}
  reset();
  return {reset,update,isSettling,captureState,restoreState};
}
