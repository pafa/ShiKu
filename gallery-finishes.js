// Local gallery fittings and indirect illumination. All coordinates are metres.
// The wall shader uses the same frame centres as wallStations(), so photography
// and text keep their own colour while a narrow contact shadow falls behind them.
import * as THREE from 'three';
import {wallStations} from './building-plan.js';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';

const finishes = [
  // wall metal, lamp reflector, sky tint, top of the side wall, architectural light source
  ['#504f48','#b3a995','#d5e1f1',4.52,0],
  ['#665d51','#baaa8b','#dce8df',4.65,1],
  ['#644337','#ae8b62','#d7e4e9',4.52,2],
  ['#565d5e','#aaab92','#d6e3e5',4.82,1],
  ['#59483c','#a58a60','#e0e2e7',4.55,2],
  ['#615344','#b7a071','#e2e7ed',4.80,1],
  ['#4e5a4e','#abb098','#d9e4dd',4.26,2],
  ['#544638','#a68a69','#dbe3dc',4.71,2],
  ['#4c5558','#a5afb0','#d8e8f2',4.40,0]
];

const wallLighting = `
  vec3 pos = pavilionSurface;
  vec3 nrm = normalize(pavilionNormal);
  float distanceSide = exhibitRoom.w - abs(pos.z);
  float distanceEnd = exhibitRoom.z - abs(pos.x);
  float wall = (1.0-smoothstep(.04,.33,abs(distanceSide)))*smoothstep(.80,.98,abs(nrm.z));
  float endWall = (1.0-smoothstep(.04,.32,abs(distanceEnd)))*smoothstep(.80,.98,abs(nrm.x));
  float floorMask = (1.0-smoothstep(.08,.19,abs(pos.y)))*smoothstep(.85,.985,nrm.y);
  float along = pos.x + exhibitRoom.z - 1.125;
  float count = pos.z > 0.0 ? exhibitFrames.y : exhibitFrames.x;
  float pitch = max(.01,(2.0*exhibitRoom.z-2.25)/max(1.0,count));
  float offset = mod(along,pitch)-.5*pitch;
  float sideLimits = smoothstep(-.03,.30,along)*smoothstep(-.03,.30,2.0*exhibitRoom.z-2.25-along);
  wall *= sideLimits;
  float frameWidth = min(3.85,pitch-.42);
  float frameHeight = count>6.0 ? 1.64 : 2.06;
  vec2 frameDistance = abs(vec2(offset-.025,pos.y-1.85)) - vec2(.5*frameWidth+.13,.5*frameHeight+.12);
  float frameHalo = 1.0-smoothstep(.0,.19,length(max(frameDistance,0.0)));
  float fixtureY = exhibitFrames.z;
  float down = max(0.0,fixtureY-pos.y);
  float washWidth = .27+.38*down;
  float beam = exp(-offset*offset/(washWidth*washWidth)) * smoothstep(-.04,.45,down) * exp(-.32*down);
  float foot = exp(-4.2*max(pos.y,0.0));
  float head = exp(-4.0*abs(pos.y-exhibitFrames.w));
  float floorEdge = exp(-3.0*max(0.0,min(distanceSide,distanceEnd)));
  // Each building receives the contribution of its clerestory, roof lantern,
  // or courtyard entrance. The bands are clipped to the glazing and mullions.
  float daylight = 0.0;
  if (lightProfile.x < .5) {
    float beamZ = exhibitRoom.w*.62-1.65;
    float ribbon = 1.0-smoothstep(.35,2.40,abs(abs(pos.z+.045*pos.x)-beamZ));
    float mullion = smoothstep(.03,.37,abs(mod(pos.x+pos.z*.28,3.10)-1.55));
    daylight = ribbon*mullion;
  } else if (lightProfile.x < 1.5) {
    vec2 locus = (pos.xz-vec2(-.6,1.5))/vec2(max(2.1,exhibitRoom.z*.37),max(1.9,exhibitRoom.w*.31));
    daylight = 1.0-smoothstep(.52,1.22,max(abs(locus.x+.14*locus.y),abs(locus.y)));
  } else {
    float endLight = 1.0-smoothstep(1.4,9.4,distanceEnd);
    daylight = endLight*(1.0-smoothstep(1.0,3.6,abs(pos.z-.12*distanceEnd)));
  }
  float neutralLuma = dot(outgoingLight,vec3(.2126,.7152,.0722));
  float neutral = floorMask*.28+(wall+endWall)*.16;
  outgoingLight = mix(outgoingLight,vec3(neutralLuma),min(.4,neutral));
  outgoingLight *= 1.0-wall*(.07+.44*frameHalo+.19*foot+.08*head)-endWall*(.06+.21*foot)-floorMask*(.055+.26*floorEdge);
  // Coursed honed blocks in the Wei and Sui stone halls. Their running bond,
  // narrow recessed joints, and arrises are reconstructed in surface space.
  float panel = clamp(wall+endWall,0.0,1.0)*surfaceStyle.x;
  if(panel > .004) {
    float tangential = abs(nrm.x)>abs(nrm.z)?pos.z:pos.x;
    float courseY=pos.y/surfaceStyle.y;
    float row=floor(courseY), shift=.5*mod(row,2.0);
    vec2 laid=vec2(tangential/surfaceStyle.z+shift,courseY);
    vec2 cell=abs(fract(laid+.5)-.5)*vec2(surfaceStyle.z,surfaceStyle.y);
    vec2 aa=clamp(fwidth(laid)*vec2(surfaceStyle.z,surfaceStyle.y),.001,.045);
    float vertical=1.0-smoothstep(.003,.007+aa.x,cell.x);
    float bed=1.0-smoothstep(.003,.007+aa.y,cell.y);
    float joint=max(vertical,bed);
    float arris=(1.0-smoothstep(.012,.026+aa.y,cell.y))*(1.0-bed);
    float blockColor=fract(sin(dot(floor(laid),vec2(17.19,71.32)))*137.76)-.50;
    outgoingLight*=1.0+panel*(.095*blockColor-.43*joint+.105*arris);
  }
  float upper=clamp((pos.y-1.9)/max(.1,exhibitFrames.w-1.9),0.0,1.0);
  float ceiling=smoothstep(.12,.8,-nrm.y)*smoothstep(3.4,4.7,pos.y);
  float ceilingLight=1.0-smoothstep(.26,1.03,max(abs(pos.x)/exhibitRoom.z,abs(pos.z)/exhibitRoom.w));
  float corner=max(wall*exp(-1.35*max(0.0,distanceEnd)),endWall*exp(-1.35*max(0.0,distanceSide)));
  outgoingLight*=1.0-.17*corner-.10*ceiling*(1.0-ceilingLight);
  outgoingLight+=diffuseColor.rgb*lightProfile.yzw*(ceiling*(.047+.115*ceilingLight)+(wall+endWall)*.047*(1.0-upper));
  outgoingLight += diffuseColor.rgb*(wall*(vec3(.52,.37,.20)*beam+vec3(.030,.035,.041)*(1.0-foot))
      + floorMask*(lightProfile.yzw*(.10+.59*daylight)) + endWall*lightProfile.yzw*.095);
`;

function shadeStructure(structure,plan,season,count,textures) {
  const sky=new THREE.Color(season[2]);
  const params={
    exhibitRoom:{value:new THREE.Vector4(plan.centerX,plan.centerZ,plan.halfWidth,plan.halfDepth)},
    exhibitFrames:{value:new THREE.Vector4(Math.ceil(count/2),Math.floor(count/2),season[3]-.44,season[3])},
    lightProfile:{value:new THREE.Vector4(season[4],sky.r,sky.g,sky.b)},
    surfaceStyle:{value:new THREE.Vector4([1,0,0,.72,0,0,0,0,.34][plan.index],plan.index===8?1.26:.79,plan.index===8?2.4:1.85,0)}
  };
  const seen=new Set();
  for(const child of structure.children){
    const material=child.material;
    if(!child.isMesh||!material?.isMeshStandardMaterial||!material.vertexColors||seen.has(material))continue;
    seen.add(material);
    // The same licensed scanned stone supplies fine aggregate for limewashed
    // plaster, at lower contrast than the dressed masonry beside it.
    const plaster=!material.map&&material.normalMap&&material.normalScale.x<.10&&textures?.wallcolor;
    if(plaster){
      material.map=textures.wallcolor;
      material.normalScale.set(.12,.12);
    }
    const previous=material.onBeforeCompile, previousKey=material.customProgramCacheKey();
    material.onBeforeCompile=function(shader,renderer){
      previous.call(this,shader,renderer);
      if(plaster)shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
        'vec3 grain=texture2D(map,vMapUv).rgb;float v=dot(grain,vec3(.2126,.7152,.0722));diffuseColor.rgb*=.78+.62*v;');
      Object.assign(shader.uniforms,params);
      const declarations='uniform vec4 exhibitRoom; varying vec3 pavilionSurface; varying vec3 pavilionNormal;\n';
      shader.vertexShader=declarations+shader.vertexShader.replace('#include <project_vertex>',`
        vec3 pavilionWorld = (modelMatrix * vec4(transformed,1.0)).xyz;
        pavilionSurface = pavilionWorld-vec3(exhibitRoom.x,0.0,exhibitRoom.y);
        pavilionNormal = mat3(modelMatrix)*objectNormal;
        #include <project_vertex>`);
      // A honed walkway reflects more grazing daylight through the middle of
      // a bay. Preserve discontinuities and roughness variation in the scanned stone.
      if(material.roughnessMap && textures && material.roughnessMap===textures.floorrough){
        shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`
          #include <roughnessmap_fragment>
          float walkingSurface=smoothstep(.87,.99,normalize(pavilionNormal).y)*
            (1.0-smoothstep(.05,.22,abs(pavilionSurface.y)));
          float traffic=(1.0-smoothstep(.7,3.4,abs(pavilionSurface.z)))*
            smoothstep(.55,2.9,exhibitRoom.z-abs(pavilionSurface.x));
          roughnessFactor=clamp(roughnessFactor-walkingSurface*(.035+.12*traffic),.34,1.0);`);
      }
      shader.fragmentShader=declarations+'uniform vec4 exhibitFrames; uniform vec4 lightProfile; uniform vec4 surfaceStyle;\n'+shader.fragmentShader.replace('#include <opaque_fragment>',wallLighting+'\n#include <opaque_fragment>');
    };
    material.customProgramCacheKey=()=>previousKey+'|pavilion-architectural-light-3|'+(plaster?'lime':'surface');
    material.needsUpdate=true;
  }
}

const ceramic=new THREE.MeshStandardMaterial({color:'#343633',roughness:.66,metalness:.22});
const diffuser=new THREE.MeshBasicMaterial({color:'#f7e8ce',toneMapped:false});
const metalByHall=new Map();
function metalPair(index,season){
  if(!metalByHall.has(index))metalByHall.set(index,[
    new THREE.MeshStandardMaterial({color:season[0],roughness:.50,metalness:.47}),
    new THREE.MeshStandardMaterial({color:season[1],roughness:.36,metalness:.57})
  ]);
  return metalByHall.get(index);
}

export function applyGalleryFinishes(plan,structure,stationCount,textures) {
  if(structure.userData.hasGalleryFinishes)return;
  structure.userData.hasGalleryFinishes=true;
  const season=finishes[plan.index];
  shadeStructure(structure,plan,season,stationCount,textures);
  const fittings=new THREE.Group();fittings.name='实体投光器、收边与墙脚';
  const [metal,trim]=metalPair(plan.index,season),pieces=new Map(),W=plan.halfWidth,D=plan.halfDepth;
  const top=season[3]-.44;
  function add(material,geometry,x,y,z,rotation){
    if(rotation)geometry.applyMatrix4(rotation);
    geometry.translate(x,y,z);
    if(!pieces.has(material))pieces.set(material,[]);
    pieces.get(material).push(geometry);
  }
  function box(m,x,y,z,w,h,d){add(m,new THREE.BoxGeometry(w,h,d),x,y,z);}
  function barrel(m,from,to,rad,topRad=rad) {
    const direction=to.clone().sub(from),mid=from.clone().lerp(to,.5);
    const turn=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
    add(m,new THREE.CylinderGeometry(topRad,rad,direction.length(),12),mid.x,mid.y,mid.z,new THREE.Matrix4().makeRotationFromQuaternion(turn));
  }
  for(const sign of [-1,1]){
    const wallZ=sign*D;
    // Continuous recessed wall track, anchor plates, and a chamfered metal toe.
    box(metal,0,top+.105,wallZ-sign*.058,2*W-.44,.072,.092);
    box(trim,0,top+.143,wallZ-sign*.082,2*W-.45,.013,.023);
    box(metal,0,.063,wallZ-sign*.072,2*W-.05,.126,.034);
    box(trim,0,.132,wallZ-sign*.082,2*W-.06,.012,.018);
    for(let x=-W+.48;x<W-.32;x+=2.1){
      box(ceramic,x,top+.105,wallZ-sign*.010,.11,.125,.039);
    }
  }
  for(const st of wallStations(plan,stationCount)){
    const sign=st.inwardZ,z=-sign*D,x=st.localX;
    box(metal,x,top+.103,z+sign*.21,.048,.045,.37);
    box(trim,x,top+.070,z+sign*.377,.111,.064,.076);
    const pivot=new THREE.Vector3(x,top+.055,z+sign*.385);
    const tip=new THREE.Vector3(x,top-.095,z+sign*.305);
    barrel(ceramic,pivot,tip,.080,.089);
    const lip=tip.clone().lerp(pivot,-.12);
    barrel(trim,tip,lip,.091,.092);
    barrel(diffuser,lip,lip.clone().lerp(tip,-.20),.066,.066);
  }
  // Northern Wei's ashlar bay uses a recessed and jointed plinth below the scan wall.
  // All fittings remain against the wall, outside the walkable envelope.
  if(plan.index===0){
    const x=-plan.doorSide*W,face=x+plan.doorSide*.035;
    for(const s of [-1,1]){
      const z=s*(D*.79),span=D*.31;
      box(metal,x+plan.doorSide*.17,2.40,s*4.48,.20,4.78,.075);
      box(trim,x+plan.doorSide*.278,2.40,s*4.456,.018,4.64,.013);
      box(metal,face,.32,z,.058,.55,span);
      box(trim,face+plan.doorSide*.036,.62,z,.025,.025,span+.04);
      for(let i=-1;i<=1;i++)box(ceramic,face+plan.doorSide*.035,.32,z+i*span*.29,.018,.47,.014);
    }
  }
  for(const [material,batch] of pieces){
    const geometry=mergeGeometries(batch);
    batch.forEach(piece=>piece.dispose());
    const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=material!==diffuser;
    fittings.add(mesh);
  }
  structure.add(fittings);
}
