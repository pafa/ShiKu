import * as THREE from 'three';

// A finite volume under one skylight. Each copy of the proxy integrates one
// interval along the viewing ray. Writing that interval's actual depth lets the
// normal depth buffer occlude it against visitors, signs and masonry.
export function skylightAir({halfWidth,spring,rise,angle,start,end}) {
  const top=spring+rise;
  const low=new THREE.Vector3(-halfWidth+.05,.06,start-4);
  const high=new THREE.Vector3(halfWidth-.05,top,end+1);
  const center=new THREE.Vector3().addVectors(low,high).multiplyScalar(.5);
  const box=new THREE.BoxGeometry(high.x-low.x,high.y-low.y,high.z-low.z);
  box.translate(center.x,center.y,center.z);
  const proxy=new THREE.InstancedBufferGeometry();
  proxy.setIndex(box.index);
  proxy.setAttribute('position',box.getAttribute('position'));
  const maxSamples=12;
  proxy.setAttribute('interval',new THREE.InstancedBufferAttribute(
    Float32Array.from({length:maxSamples},(_,i)=>i+.5),1));
  proxy.instanceCount=maxSamples;

  const uniforms={
    worldLow:{value:low},worldHigh:{value:high},sunSlope:{value:new THREE.Vector2()},
    roofEdge:{value:new THREE.Vector2(halfWidth*Math.cos(angle),top-spring-rise*Math.sin(angle))},
    roofSpan:{value:new THREE.Vector2(start,end-.30)},shadowView:{value:new THREE.Matrix4()},
    sunDepth:{value:null},shadowTexel:{value:new THREE.Vector2()},distanceFade:{value:1},
    sampleCount:{value:maxSamples}
  };
  const material=new THREE.ShaderMaterial({
    uniforms,transparent:true,depthWrite:false,side:THREE.BackSide,
    blending:THREE.AdditiveBlending,toneMapped:false,
    vertexShader:`
      attribute float interval;
      uniform float sampleCount;
      varying float fraction;
      varying vec3 exitPoint;
      void main(){
        fraction=interval/sampleCount;
        vec4 world=modelMatrix*vec4(position,1.0);
        exitPoint=world.xyz;
        gl_Position=projectionMatrix*viewMatrix*world;
      }`,
    fragmentShader:`
      #include <packing>
      uniform vec3 worldLow,worldHigh;
      uniform vec2 sunSlope,roofEdge,roofSpan,shadowTexel;
      uniform mat4 shadowView,projectionMatrix;
      uniform sampler2D sunDepth;
      uniform float distanceFade,sampleCount;
      varying float fraction;
      varying vec3 exitPoint;

      vec2 intersectBox(vec3 origin,vec3 direction,vec3 lo,vec3 hi){
        vec3 inv=mix(vec3(-1.0),vec3(1.0),step(vec3(0.0),direction))/max(abs(direction),vec3(0.00001));
        vec3 a=(lo-origin)*inv,b=(hi-origin)*inv;
        vec3 near=min(a,b),far=max(a,b);
        return vec2(max(max(near.x,near.y),near.z),min(min(far.x,far.y),far.z));
      }
      float sunAt(vec3 samplePos){
        vec4 shadow=shadowView*vec4(samplePos,1.0);
        vec3 uvz=shadow.xyz/shadow.w;
        if(any(lessThan(uvz,vec3(0.0)))||any(greaterThan(uvz,vec3(1.0))))return 0.0;
        vec2 cell=uvz.xy/shadowTexel-0.5,base=(floor(cell)+0.5)*shadowTexel;
        vec2 f=fract(cell);
        vec4 depths=vec4(
          unpackRGBAToDepth(texture2D(sunDepth,base)),
          unpackRGBAToDepth(texture2D(sunDepth,base+vec2(shadowTexel.x,0.0))),
          unpackRGBAToDepth(texture2D(sunDepth,base+vec2(0.0,shadowTexel.y))),
          unpackRGBAToDepth(texture2D(sunDepth,base+shadowTexel)));
        vec4 lit=step(vec4(uvz.z-0.00008),depths);
        return mix(mix(lit.x,lit.y,f.x),mix(lit.z,lit.w,f.x),f.y);
      }
      void main(){
        vec3 ray=normalize(exitPoint-cameraPosition);
        vec2 path=intersectBox(cameraPosition,ray,worldLow,worldHigh);
        // Project the curved roof's two actual stone edges onto its apex plane
        // along the current sun direction, then bound the illuminated column.
        vec3 origin=cameraPosition,direction=ray;
        origin.xz+=(worldHigh.y-origin.y)*sunSlope;
        direction.xz-=ray.y*sunSlope;
        vec2 shift=roofEdge.y*sunSlope;
        vec3 lo=vec3(-roofEdge.x+shift.x,worldLow.y,roofSpan.x);
        vec3 hi=vec3( roofEdge.x+shift.x,worldHigh.y,roofSpan.y+shift.y);
        vec2 column=intersectBox(origin,direction,lo,hi);
        float a=max(0.0,max(path.x,column.x)),b=min(path.y,column.y);
        if(a>=b)discard;
        float t=mix(a,b,fraction);
        vec3 p=cameraPosition+t*ray,q=origin+t*direction;
        vec2 edge=min(q.xz-lo.xz,hi.xz-q.xz);
        float aperture=smoothstep(0.0,0.30,min(edge.x,edge.y));
        float visible=sunAt(p);
        float forward=max(0.0,dot(ray,normalize(vec3(sunSlope.x,1.0,sunSlope.y))));
        float sigma=0.009*(0.76+1.10*forward*forward);
        float alpha=(1.0-exp(-sigma*(b-a)/sampleCount))*aperture*visible*distanceFade;
        vec4 clip=projectionMatrix*viewMatrix*vec4(p,1.0);
        gl_FragDepth=0.5+0.5*clip.z/clip.w;
        // Accumulating fractions of one display level in the default 8-bit
        // target otherwise quantizes weak shafts into tinted contour bands.
        float phase=fract(0.06711056*gl_FragCoord.x+0.00583715*gl_FragCoord.y);
        float rounding=fract(52.9829189*phase+fraction*7.0);
        vec3 energy=vec3(0.94,0.91,0.85)*alpha;
        gl_FragColor=vec4(floor(energy*255.0+rounding)/255.0,1.0);
      }`
  });
  const volume=new THREE.Mesh(proxy,material);
  volume.name='中庭采光带 · 空气散射';
  volume.raycast=()=>{};
  const sunDirection=new THREE.Vector3(),windowBox=new THREE.Box3(low,high);
  let sun=null;
  volume.onBeforeRender=(renderer,scene,camera)=>{
    sun??=scene.children.find(light=>light.isDirectionalLight&&light.castShadow);
    const distance=windowBox.distanceToPoint(camera.position);
    const active=sun?.shadow.map&&distance<25;
    const count=renderer.domElement.clientWidth<640?8:maxSamples;
    proxy.instanceCount=active?count:0;
    if(!active)return;
    uniforms.sampleCount.value=count;
    sunDirection.subVectors(sun.position,sun.target.position);
    if(sunDirection.y<=0){proxy.instanceCount=0;return;}
    uniforms.sunSlope.value.set(sunDirection.x/sunDirection.y,sunDirection.z/sunDirection.y);
    uniforms.shadowView.value=sun.shadow.matrix;
    uniforms.sunDepth.value=sun.shadow.map.texture;
    uniforms.shadowTexel.value.set(1/sun.shadow.mapSize.x,1/sun.shadow.mapSize.y);
    uniforms.distanceFade.value=1-THREE.MathUtils.smoothstep(distance,16,25);
  };
  return volume;
}
