import {Vector3} from 'three';

// Measure the standing, posed skin once. A head joint describes a pivot near
// the base of the skull, and changes position with each artist's skeleton.
export function measureVisitor(root){
  root.updateWorldMatrix(true,true);
  const point=new Vector3(),head=new Vector3(0,1.5,0);
  root.getObjectByName('Head')?.getWorldPosition(head);
  let crown=-Infinity,sole=Infinity;
  root.traverse(mesh=>{
    if(!mesh.isSkinnedMesh)return;
    const position=mesh.geometry.getAttribute('position');
    const stride=Math.max(1,Math.floor(position.count/6000));
    for(let i=0;i<position.count;i+=stride){
      mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);
      crown=Math.max(crown,point.y);sole=Math.min(sole,point.y);
    }
  });
  if(!Number.isFinite(crown)||crown-sole<.9){crown=head.y+.2;sole=0;}
  const height=crown-sole,eyeY=crown-.068*height;
  return {height,crown,sole,eyeY,x:head.x,z:head.z};
}

export function frameVisitor(camera,person,mode,yaw,x=0,z=0){
  const {height,crown,sole,eyeY}=person;
  const full=mode==='full',face=mode==='face',aspect=Math.max(.3,camera.aspect);
  if(mode==='feet'){
    // The whole stride has to fit across a narrow phone, including the
    // leading toe and the trailing heel. Follow at shin height, not eye level.
    const span=Math.max(height*.44,height*.76/aspect);
    const lens=25,d=span/(2*Math.tan(lens*Math.PI/360));
    camera.position.set(x+d*Math.sin(yaw),sole+height*.29,z-d*Math.cos(yaw));
    if(camera.fov!==lens){camera.fov=lens;camera.updateProjectionMatrix();}
    camera.lookAt(x,sole+height*.17,z);camera.updateMatrixWorld();return;
  }
  const span=Math.max(height*(full?1.22:face?.295:.49),(full?.76:face?.33:.53)/aspect);
  const center=full?sole+height*.51:crown-span*(face?.365:.375);
  const lens=full?30:face?18:22;
  const distance=span/(2*Math.tan(lens*Math.PI/360));
  const cx=x+(full?0:person.x),cz=z+(full?0:person.z);
  // Frame the chest by tilting a level-height camera. Lowering the camera
  // to the crop centre would make viewers look up the subject's nostrils.
  camera.position.set(cx+distance*Math.sin(yaw),full?sole+height*.75:eyeY+.008,cz-distance*Math.cos(yaw));
  if(camera.fov!==lens){camera.fov=lens;camera.updateProjectionMatrix();}
  camera.lookAt(cx,center,cz);camera.updateMatrixWorld();
}
