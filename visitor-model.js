import * as THREE from 'three';
import {GLTFLoader} from './real-viewer/vendor/addons/loaders/GLTFLoader.js';
import {prepareScanSurface} from './scan-surface.js';

const loader = new GLTFLoader();
const sources = new Map();

function enableCornealReflection(mesh) {
  const geometry=mesh.geometry, split=geometry.userData.corneaIndexOffset;
  if (!Number.isInteger(split) || !geometry.index || split<=0 || split>=geometry.index.count) return;
  // The marked triangles form the original, fully eye-weighted ocular shells.
  // Coat that surface directly; a second transparent sphere would double its edge.
  const body=mesh.material;
  if(body.userData.fabricTint && body.roughnessMap) {
    const dye=new THREE.Vector3().fromArray(body.userData.fabricTint);
    body.onBeforeCompile=shader=>{
      shader.uniforms.fabricDye={value:dye};
      shader.fragmentShader='uniform vec3 fabricDye;\n'+shader.fragmentShader.replace('#include <map_fragment>',`
        #include <map_fragment>
        float fabricMask=texture2D(roughnessMap,vRoughnessMapUv).r;
        diffuseColor.rgb*=mix(vec3(1.),fabricDye,fabricMask);
      `);
    };
    body.customProgramCacheKey=()=>'renderpeople-fabric-v1';
  }
  const cornea=new THREE.MeshPhysicalMaterial({
    name:body.name+'_cornea',map:body.map,color:body.color,side:THREE.FrontSide,
    // The photographic eye already has a catchlight. A single curved
    // reflection responds to the room without adding a second varnish lobe.
    metalness:0,roughness:.25,ior:1.376,specularIntensity:.43
  });
  geometry.clearGroups();
  geometry.addGroup(0,split,0);
  geometry.addGroup(split,geometry.index.count-split,1);
  mesh.material=[body,cornea];
}

export function disposeVisitorObject(object) {
  const geometries=new Set(), materials=new Set(), textures=new Set(), skeletons=new Set();
  object.traverse(node => {
    if (node.geometry) geometries.add(node.geometry);
    if (node.skeleton) skeletons.add(node.skeleton);
    for (const material of [].concat(node.material || [])) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const skeleton of skeletons) skeleton.dispose();
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) {
    texture.dispose();
    texture.image?.close?.();
  }
  object.removeFromParent();
}

function prepare({scene}) {
  scene.rotation.y=Math.PI;
  scene.traverse(mesh=>{
    if (!mesh.isMesh) return;
    // A translucent hair layer sits on the solid scalp. Casting both creates a dark fringe on the forehead.
    mesh.castShadow=!mesh.material?.userData?.scalpCastsShadow;
    mesh.receiveShadow=true;
    enableCornealReflection(mesh);
    for (const m of [].concat(mesh.material)) {
      // Keep each original's colour, roughness and authored normal maps together.
      if (m.map) m.map.anisotropy=4;
    }
  });
  return scene;
}

function poseableCopy(source) {
  const figure=source.clone(true), copies=new Map(), skeletons=new Map(), scanReleases=[];
  function pair(original,copy) {
    copies.set(original,copy);
    original.children.forEach((child,i)=>pair(child,copy.children[i]));
  }
  pair(source,figure);
  for (const [original,copy] of copies) {
    if (!original.isSkinnedMesh) continue;
    let skeleton=skeletons.get(original.skeleton);
    if (!skeleton) {
      skeleton=new THREE.Skeleton(original.skeleton.bones.map(bone=>copies.get(bone)),original.skeleton.boneInverses);
      skeletons.set(original.skeleton,skeleton);
    }
    copy.bind(skeleton,original.bindMatrix);
    const releaseSurface=prepareScanSurface(copy);
    if (releaseSurface) scanReleases.push(releaseSurface);
  }
  return {figure, dispose(){
    figure.removeFromParent();
    for(const release of scanReleases) release();
    for(const skeleton of skeletons.values()) skeleton.dispose();
  }};
}

// Body surfaces and image data stay in GPU memory just once per appearance.
// Bone matrices, facial expressions and locomotion belong to each visitor.
export function fineVisitorDetail(renderer){
  return renderer.capabilities.maxTextureSize>=4096 && !navigator.connection?.saveData &&
    (navigator.deviceMemory??8)>=6 && matchMedia('(min-width: 760px) and (pointer: fine)').matches;
}

export async function acquireVisitorFigure(spec,detail=false) {
  const file=(detail&&spec.detailBody)||spec.body;
  let entry=sources.get(file);
  if (!entry) {
    entry={users:0,model:loader.loadAsync(file).then(prepare)};
    sources.set(file,entry);
  }
  entry.users++;
  let copy;
  try {
    copy=poseableCopy(await entry.model);
  } catch (error) {
    if (--entry.users===0) {
      sources.delete(file);
      entry.model.then(disposeVisitorObject,()=>{});
    }
    if(file!==spec.body)return acquireVisitorFigure(spec,false);
    throw error;
  }
  let released=false;
  return {file,figure:copy.figure, release(){
    if (released) return;
    released=true;
    copy.dispose();
    if (--entry.users===0) {
      sources.delete(file);
      entry.model.then(disposeVisitorObject);
    }
  }};
}
