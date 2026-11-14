import * as THREE from 'three';
import {HDRLoader} from './real-viewer/vendor/addons/loaders/HDRLoader.js';

// A matte studio sweep for the casting room. A small tonal change across the
// sweep gives the head depth without placing a bright window behind the hair.
function studioSweep(){
  const w=128,h=64,canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const light=9*Math.cos(2*Math.PI*x/w-.8)+24*(1-y/(h-1));
    const i=(y*w+x)*4;
    pixels.data.set([158+light,155+light,147+light,255],i);
  }
  ctx.putImageData(pixels,0,0);
  const texture=new THREE.CanvasTexture(canvas);
  texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}

export function portraitLight(scene,renderer){
  scene.add(new THREE.HemisphereLight(0xf1f4f5,0xc6bfb7,.85));
  const key=new THREE.DirectionalLight(0xfff8ee,1.24);
  key.position.set(-2.6,2.9,-3.9);key.target.position.set(0,1.45,0);scene.add(key,key.target);
  if(renderer){
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const size=renderer.domElement.clientWidth>500?2048:1024;
    key.castShadow=true;key.shadow.mapSize.set(size,size);
    Object.assign(key.shadow.camera,{left:-1.45,right:1.45,top:1.45,bottom:-1.45,near:.7,far:8.6});
    key.shadow.bias=-.00013;key.shadow.normalBias=.0035;key.shadow.radius=3.2;
  }
  // A broad return at face height keeps light in the eye sockets.
  // This is a fixed bounce from the gallery, not a light attached to the camera.
  const bounce=new THREE.DirectionalLight(0xf3f2ee,.60);bounce.position.set(2.7,1.65,-4.8);
  bounce.target.position.set(0,1.4,0);scene.add(bounce,bounce.target);
  const edge=new THREE.DirectionalLight(0xf3f4f2,.30);edge.position.set(2.5,2.5,2.2);scene.add(edge);
  scene.environmentRotation.y=-1.1;scene.environmentIntensity=.22;
  let disposed=false;
  // The booth uses a neutral copy of the room light with the window peaks
  // capped. Dark hair no longer mirrors the bright green exterior.
  const environment=new HDRLoader().load('assets/visitors-natural/studio-day.hdr',texture=>{
    if(disposed){texture.dispose();return;}
    texture.mapping=THREE.EquirectangularReflectionMapping;scene.environment=texture;
  });
  const background=studioSweep();scene.background=background;scene.backgroundIntensity=1;
  function release(){disposed=true;scene.environment=scene.background=null;environment.dispose();background.dispose();key.shadow.dispose();}
  release.focus=framing=>{scene.backgroundIntensity=framing==='full'?.92:1;};
  release.follow=(x,z)=>{key.position.set(x-2.6,2.9,z-3.9);key.target.position.set(x,1.45,z);bounce.position.set(x+2.7,1.65,z-4.8);bounce.target.position.set(x,1.4,z);};
  return release;
}

export function portraitFloor(scene,renderer){
  const loader=new THREE.TextureLoader(),maps=[];
  function surface(channel){
    const t=loader.load('assets/museum/materials/floor-'+channel+'.webp');
    t.colorSpace=channel==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);
    t.anisotropy=Math.min(6,renderer.capabilities.getMaxAnisotropy());maps.push(t);return t;
  }
  const mat=new THREE.MeshStandardMaterial({color:0xb1a79a,map:surface('color'),roughnessMap:surface('rough'),
    roughness:.92,normalMap:surface('normal'),normalScale:new THREE.Vector2(.18,.18),transparent:true,depthWrite:false});
  mat.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 floorLocation;\n'+shader.vertexShader.replace('#include <project_vertex>',`
      floorLocation=(modelMatrix*vec4(transformed,1.)).xz;
      #include <project_vertex>`);
    shader.fragmentShader='varying vec2 floorLocation;\n'+shader.fragmentShader.replace('#include <alphamap_fragment>',`
      #include <alphamap_fragment>
      vec2 edge=vec2(floorLocation.x*.79,(floorLocation.y+2.1)*.53);
      diffuseColor.a*=.74*(1.-smoothstep(1.5,4.8,length(edge)));`);
  };
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20).rotateX(-Math.PI/2),mat);
  floor.receiveShadow=true;floor.position.set(0,-.014,-2.1);floor.renderOrder=-2;scene.add(floor);
  return ()=>{floor.removeFromParent();floor.geometry.dispose();mat.dispose();for(const t of maps)t.dispose();};
}
