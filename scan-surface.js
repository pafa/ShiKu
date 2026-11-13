import * as THREE from 'three';

// The source scan supplies both the surface classification and the two eye patches.
// Patches are sampled as a colour difference so their neutral value is exactly zero.
const atlases=new Map();
function acquireAtlas(url){
  let entry=atlases.get(url);
  if(!entry){
    const texture=new THREE.TextureLoader().load(url);
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
    entry={texture,users:0};atlases.set(url,entry);
  }
  entry.users++;
  return {texture:entry.texture,release(){if(--entry.users===0){entry.texture.dispose();atlases.delete(url);}}};
}

const expressions=new WeakMap();
const declarations=`
  varying vec4 scanSurfaceParts;
  varying vec3 scanRest;
  uniform sampler2D scanEyes;
  uniform vec3 scanEyeCenter[2];
  uniform vec3 scanEyeRight[2];
  uniform vec3 scanEyeUp[2];
  uniform vec3 scanEyeShape[2];
  uniform vec2 scanLook;

  vec2 eyeUv(vec2 p,int i){
    vec2 unit=clamp((p+vec2(1.6,.85))/vec2(3.2,1.9),vec2(.002),vec2(.998));
    return vec2((unit.x+float(i))*.5,(8.+160.*unit.y)/168.);
  }
  // These eyes are part of a static scan. Only shift the photographed gaze
  // inside the measured wet lid borders; leave actual eyelid pixels in place.
  float eyeSurface(inout vec3 baseColor){
    float cornea=0.;
    for(int i=0;i<2;i++){
      vec3 delta=scanRest-scanEyeCenter[i];
      float radius=scanEyeShape[i].x;
      if(dot(delta,delta)>radius*radius*2.4)continue;
      vec2 p=vec2(dot(delta,scanEyeRight[i]),dot(delta,scanEyeUp[i]))/radius;
      if(abs(p.x)>1.04||p.y<-.6||p.y>.85)continue;
      float depth=abs(dot(delta,cross(scanEyeRight[i],scanEyeUp[i])));
      float visible=1.-smoothstep(radius*.62,radius*.98,depth);
      vec2 photo=eyeUv(p,i);
      float upper=1.05-1.9*texture2D(scanEyes,vec2(photo.x,6./168.)).a;
      float lower=1.05-1.9*texture2D(scanEyes,vec2(photo.x,2./168.)).a;
      float width=1.-smoothstep(.83,1.02,abs(p.x));
      float aperture=smoothstep(lower+.025,lower+.095,p.y)*
        (1.-smoothstep(upper-.095,upper-.025,p.y))*width*visible;
      cornea=max(cornea,aperture);
      if(aperture>.001&&dot(scanLook,scanLook)>.000001){
        vec2 shifted=p-scanLook*width*.54;
        vec3 from=texture2D(scanEyes,photo).rgb;
        vec3 to=texture2D(scanEyes,eyeUv(shifted,i)).rgb;
        baseColor=max(vec3(.001),baseColor+(to-from)*aperture);
      }
    }
    return cornea;
  }`;

export function prepareScanSurface(mesh){
  const data=mesh.userData.scanSurface,attribute=mesh.geometry?.getAttribute('_visitorsurface');
  if(!data?.atlas||data.eyes?.length!==2||!attribute)return;
  const atlas=acquireAtlas(new URL(data.atlas,import.meta.url).href),original=mesh.material;
  const material=original.clone();mesh.material=material;
  const vectors=key=>data.eyes.map(eye=>new THREE.Vector3().fromArray(eye[key]));
  const state={gaze:new THREE.Vector2(),secondary:new THREE.Vector2()};
  expressions.set(mesh,state);
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,{
      scanEyes:{value:atlas.texture},scanEyeCenter:{value:vectors('center')},scanEyeRight:{value:vectors('right')},
      scanEyeUp:{value:vectors('up')},scanEyeShape:{value:data.eyes.map(e=>new THREE.Vector3(e.radius,e.top,e.bottom))},
      scanLook:{value:state.gaze},scanInertia:{value:state.secondary}
    });
    shader.vertexShader='attribute vec4 _visitorsurface; varying vec4 scanSurfaceParts; varying vec3 scanRest; uniform vec2 scanInertia;\n'+shader.vertexShader.replace('#include <begin_vertex>',`
      #include <begin_vertex>
      scanSurfaceParts=_visitorsurface;scanRest=position;
      transformed.xz+=scanInertia*_visitorsurface.w;
    `);
    shader.fragmentShader=declarations+'\n'+shader.fragmentShader.replace('#include <map_fragment>',`
      #include <map_fragment>
      float scanCornea=eyeSurface(diffuseColor.rgb);
    `).replace('#include <roughnessmap_fragment>',`
      #include <roughnessmap_fragment>
      float scanSkin=clamp(scanSurfaceParts.x,0.,1.);
      float scanHair=clamp(scanSurfaceParts.y,0.,1.);
      float scanCloth=clamp(scanSurfaceParts.z,0.,1.);
      // Use the registered eye spacing to locate the nose and forehead on
      // this particular face. The neck, jaw and arms keep their softer sheen.
      float facialSheen=0.;
      if(scanSkin>.06){
        vec3 facePoint=scanRest-(scanEyeCenter[0]+scanEyeCenter[1])*.5;
        float eyeSpacing=max(.03,distance(scanEyeCenter[0],scanEyeCenter[1]));
        vec2 faceUv=vec2(dot(facePoint,scanEyeRight[0]),dot(facePoint,scanEyeUp[0]))/eyeSpacing;
        float bridge=length((faceUv-vec2(0.,-.23))*vec2(5.8,2.7));
        float brow=length((faceUv-vec2(0.,.43))*vec2(1.8,3.8));
        float forward=dot(facePoint,cross(scanEyeRight[0],scanEyeUp[0]));
        facialSheen=(1.-smoothstep(.13,1.,min(bridge,brow)))*smoothstep(-.054,-.006,forward);
      }
      #ifdef USE_ROUGHNESSMAP
        // Recorded roughness retains the original fabric and skin variation.
        roughnessFactor=clamp(roughnessFactor-.045*facialSheen*scanSkin,.15,1.);
      #else
        roughnessFactor=mix(roughnessFactor,.88,scanCloth);
        roughnessFactor=mix(roughnessFactor,.47,scanHair);
        roughnessFactor=mix(roughnessFactor,.58-.105*facialSheen,scanSkin);
      #endif
      roughnessFactor=mix(roughnessFactor,.16,scanCornea);
    `).replace('#include <lights_fragment_end>',`
      #include <lights_fragment_end>
      float grazing=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.);
      vec3 roomLight=reflectedLight.indirectDiffuse+.20*reflectedLight.directDiffuse;
      reflectedLight.indirectDiffuse+=roomLight*vec3(.079,.034,.022)*scanSkin*(.32+grazing);
      reflectedLight.indirectSpecular+=roomLight*grazing*(.026*scanCloth+.036*scanHair);
    `);
  };
  material.customProgramCacheKey=()=>'registered-scan-surface-v3';
  return ()=>{expressions.delete(mesh);material.dispose();atlas.release();};
}

// One set of uniform values per skeleton allows people wearing the same look
// to glance at different objects without sharing gaze or hair motion.
export function scanPerformance(figure){
  const states=[];figure.traverse(mesh=>{const s=expressions.get(mesh);if(s)states.push(s);});
  const head=figure.getObjectByName('Head');
  if(!states.length||!head)return null;
  const forward=new THREE.Vector3(0,0,1),inverse=new THREE.Quaternion();
  const frame=new THREE.Quaternion(),rest=new THREE.Quaternion(),local=new THREE.Vector3(),origin=new THREE.Vector3();
  const chest=figure.getObjectByName('Spine2')||head,upperFacing=new THREE.Vector3();
  const lastPos=new THREE.Vector3(),velocity=new THREE.Vector3(),prevVel=new THREE.Vector3(),facing=new THREE.Vector3();
  const swing=new THREE.Vector2(),desired=new THREE.Vector2();
  head.getWorldQuaternion(frame);figure.getWorldQuaternion(rest);const headInverse=rest.clone().invert().multiply(frame).invert();
  let lastYaw=0,lastUpper=0,wasReady=false;
  function reset(){wasReady=false;swing.set(0,0);prevVel.set(0,0,0);for(const s of states){s.gaze.set(0,0);s.secondary.set(0,0);}}
  function update({dt=0,attention}={}){
    dt=Math.min(.12,Math.max(0,dt));if(!dt)return;
    figure.getWorldPosition(origin);figure.getWorldQuaternion(rest);facing.copy(forward).applyQuaternion(rest);
    const yaw=Math.atan2(facing.x,facing.z);
    chest.getWorldQuaternion(frame);
    upperFacing.copy(forward).applyQuaternion(frame);
    const upperYaw=Math.atan2(upperFacing.x,upperFacing.z);
    if(!wasReady){lastPos.copy(origin);lastYaw=yaw;lastUpper=upperYaw;wasReady=true;}
    velocity.copy(origin).sub(lastPos).multiplyScalar(1/dt);
    local.copy(velocity).sub(prevVel).applyQuaternion(inverse.copy(rest).invert());
    const bodyTurn=Math.atan2(Math.sin(yaw-lastYaw),Math.cos(yaw-lastYaw));
    const shoulderTurn=Math.atan2(Math.sin(upperYaw-lastUpper),Math.cos(upperYaw-lastUpper));
    const dyaw=(bodyTurn*.35+shoulderTurn*.65)/dt;lastUpper=upperYaw;
    desired.set(THREE.MathUtils.clamp(-dyaw*.005-local.x*.016,-.016,.016),
      THREE.MathUtils.clamp(-local.z*.022,-.014,.014));
    swing.lerp(desired,1-Math.exp(-dt*6.5));
    prevVel.copy(velocity);lastPos.copy(origin);lastYaw=yaw;
    let gx=0,gy=0;
    if(attention){
      head.getWorldPosition(origin);head.getWorldQuaternion(frame);frame.multiply(headInverse);
      local.set(attention.x,attention.y,attention.z).sub(origin).applyQuaternion(frame.invert());
      if(local.z>.14){
        gx=THREE.MathUtils.clamp(Math.atan2(local.x,local.z)*.36,-.23,.23);
        gy=THREE.MathUtils.clamp(Math.atan2(local.y-.065,Math.hypot(local.x,local.z))*.36,-.13,.16);
      }
    }
    for(const s of states){
      const k=1-Math.exp(-dt*16);s.gaze.x+=(gx-s.gaze.x)*k;s.gaze.y+=(gy-s.gaze.y)*k;
      s.secondary.copy(swing);
    }
  }
  return {reset,update};
}
