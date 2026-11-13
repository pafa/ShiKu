// The Met's 35.146 scan uses +Y up and +Z toward the viewer.
// Centre and scale the complete object as a unit; keep its relief depth.
import * as THREE from 'three';
import {GLTFLoader} from './real-viewer/vendor/addons/loaders/GLTFLoader.js';

export const reliefWidth=3.937;
export const reliefHeight=2.083;
export const reliefAsset=new URL('./assets/authentic/scans/met-procession.glb',import.meta.url).href;

export async function loadMetRelief(manager){
  const file=await new GLTFLoader(manager).loadAsync(reliefAsset);
  const original=file.scene;
  original.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().setFromObject(original,true),size=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.length())||size.x<=0||size.y<=0||size.z<=0)throw new Error('浮雕扫描没有有效边界');
  const center=bounds.getCenter(new THREE.Vector3());
  const scale=reliefWidth/size.x;
  const offset=new THREE.Group();
  offset.position.copy(center).multiplyScalar(-1);
  offset.add(original);
  const relief=new THREE.Group();
  relief.name='大都会艺术博物馆 · 35.146 原件扫描';
  relief.scale.setScalar(scale);
  relief.userData.capture=reliefAsset;
  relief.userData.rawOrigin=center.toArray();
  relief.add(offset);
  original.traverse(mesh=>{
    if(!mesh.isMesh)return;
    mesh.castShadow=false;mesh.receiveShadow=false;
    for(const material of [].concat(mesh.material)){
      if(material.map)material.map.anisotropy=6;
      if(material.normalMap)material.normalMap.anisotropy=6;
    }
  });
  return relief;
}
