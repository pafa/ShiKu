import * as THREE from 'three';
import {HDRLoader} from './real-viewer/vendor/addons/loaders/HDRLoader.js';

// A warm matte backdrop. Frame the light falloff on the screen so a long
// portrait lens still sees the gradation across the paper.
function studioSweep(){
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  const light=ctx.createRadialGradient(82,81,5,82,81,252);
  light.addColorStop(0,'#dad1c2');
  light.addColorStop(.56,'#bcb4a6');
  light.addColorStop(1,'#928d83');
  ctx.fillStyle=light;ctx.fillRect(0,0,canvas.width,canvas.height);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  return texture;
}

export function portraitLight(scene,renderer){
  scene.add(new THREE.HemisphereLight(0xf1f4f5,0xc6bfb7,.68));
  const key=new THREE.DirectionalLight(0xfff6eb,1.52);
  key.position.set(-3.2,3.6,-3.9);key.target.position.set(0,1.45,0);scene.add(key,key.target);
  if(renderer){
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const size=renderer.domElement.clientWidth>500?2048:1024;
    key.castShadow=true;key.shadow.mapSize.set(size,size);
    Object.assign(key.shadow.camera,{left:-1.45,right:1.45,top:1.45,bottom:-1.45,near:.7,far:8.6});
    key.shadow.bias=-.00013;key.shadow.normalBias=.0035;key.shadow.radius=3.2;
  }
  // A broad return at face height keeps light in the eye sockets.
  // This is a fixed bounce from the gallery, not a light attached to the camera.
  const bounce=new THREE.DirectionalLight(0xedf1f4,.46);bounce.position.set(2.7,1.65,-4.8);
  bounce.target.position.set(0,1.4,0);scene.add(bounce,bounce.target);
  const edge=new THREE.DirectionalLight(0xfff1dd,.60);edge.position.set(2.5,2.5,2.2);scene.add(edge,edge.target);
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
  release.follow=(x,z)=>{
    key.position.set(x-3.2,3.6,z-3.9);key.target.position.set(x,1.45,z);
    bounce.position.set(x+2.7,1.65,z-4.8);bounce.target.position.set(x,1.4,z);
    edge.position.set(x+2.5,2.5,z+2.2);edge.target.position.set(x,0,z);
  };
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
