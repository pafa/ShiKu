// Project the moving shoe onto the local floor, including individual stair treads.
import * as THREE from 'three';

export function visitorContact(root,groundHeight) {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(32,32,0,32,32,32);
  for(const [radius,alpha] of [[0,1],[.35,.83],[.7,.25],[1,0]])g.addColorStop(radius,'rgba(255,255,255,'+alpha+')');
  ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const texture=new THREE.CanvasTexture(canvas);
  const geometry=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
  const group=new THREE.Group();group.name='落脚阴影';
  const stamps=[];
  function stamp(){
    const material=new THREE.MeshBasicMaterial({map:texture,color:0x261f1d,transparent:true,depthWrite:false,
      polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false});
    const item=new THREE.Mesh(geometry,material);group.add(item);stamps.push(item);return item;
  }
  const ambient=stamp(),left=stamp(),right=stamp();
  const heel=new THREE.Vector3(),toe=new THREE.Vector3(),mid=new THREE.Vector3(),inverse=new THREE.Matrix4();
  let feet=[];
  function bind(figure){
    root.add(group);
    feet=['Left','Right'].map((side,i)=>({ankle:figure.getObjectByName(side+'Foot'),
      toe:figure.getObjectByName(side+'ToeBase'),stamp:i===0?left:right}));
  }
  const axes=[[1,0],[-1,0],[0,1],[0,-1]];
  function place(mesh,x,z,alpha,width,length,yaw,y) {
    // Keep the entire mark on one supporting tread. At a riser its area and
    // opacity tend continuously to zero on both sides of the height change.
    const radius=Math.hypot(width,length)*.5;
    let clearance=radius;
    for(const [dx,dz] of axes){
      if(Math.abs(groundHeight(x+dx*clearance,z+dz*clearance)-y)<.065)continue;
      let inside=0,outside=clearance;
      for(let i=0;i<8;i++){
        const d=(inside+outside)*.5;
        if(Math.abs(groundHeight(x+dx*d,z+dz*d)-y)<.065)inside=d;
        else outside=d;
      }
      clearance=inside;
    }
    const scale=clearance/radius;
    width*=scale;length*=scale;
    alpha*=THREE.MathUtils.smoothstep(clearance,.008,Math.min(radius*.42,.12));
    mesh.visible=alpha>.01;
    if(!mesh.visible)return;
    mesh.position.set(x,y+.007,z).applyMatrix4(inverse);
    mesh.rotation.y=yaw-root.rotation.y;
    mesh.scale.set(width,1,length);
    mesh.material.opacity=alpha;
  }
  function update(){
    if(!feet.length)return;
    root.updateWorldMatrix(true,false);inverse.copy(root.matrixWorld).invert();
    root.getWorldPosition(mid);
    const ground=groundHeight(mid.x,mid.z);
    place(ambient,mid.x,mid.z,.20,.82,.65,root.rotation.y,ground-.003);
    for(const f of feet){
      if(!f.ankle||!f.toe){f.stamp.visible=false;continue;}
      f.ankle.getWorldPosition(heel);f.toe.getWorldPosition(toe);
      mid.lerpVectors(heel,toe,.55);
      const y=groundHeight(mid.x,mid.z),lift=Math.max(0,Math.min(toe.y-y-.027,heel.y-y-.071));
      const near=1-THREE.MathUtils.smoothstep(lift,.008,.15);
      const crossing=Math.abs(groundHeight(heel.x,heel.z)-groundHeight(toe.x,toe.z))>.065;
      // A stair edge clips the long footprint. Anchor the shorter mark on the supporting tread.
      if(crossing){const p=heel.y-groundHeight(heel.x,heel.z)-.071<toe.y-groundHeight(toe.x,toe.z)-.027?heel:toe;mid.copy(p);}
      place(f.stamp,mid.x,mid.z,.08+.53*near,.18+.14*(1-near),crossing?.17:.35+.08*(1-near),
        Math.atan2(toe.x-heel.x,toe.z-heel.z),groundHeight(mid.x,mid.z));
    }
  }
  function dispose(){
    group.removeFromParent();for(const item of stamps)item.material.dispose();geometry.dispose();texture.dispose();
  }
  return {bind,update,dispose};
}
