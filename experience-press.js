import * as T from 'three';
import {mergeGeometries} from './real-viewer/vendor/addons/utils/BufferGeometryUtils.js';
export function buildCave(c,ctx){
  const g=new T.Group(),m=(color,props={})=>new T.MeshStandardMaterial({color,roughness:.83,...props});
  const ink=m('#343731'),oak=m('#805939',{map:ctx.textures.floorcolor}),walnut=m('#65432b',{map:ctx.textures.floorcolor}),jade=m('#35483f',{roughness:.96}),wall=m('#90816c',{map:ctx.textures.wallcolor}),gold=m('#a88958',{metalness:.50}),light=new T.MeshBasicMaterial({color:0xe4d3ac});
  const batches=new Map(),fixed=(geo,mat,x,y,z,spin=0)=>{geo.rotateX(spin);geo.translate(x,y,z);if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push(geo);};
  const box=(mat,x,y,z,w,h,d)=>fixed(new T.BoxGeometry(w,h,d),mat,x,y,z);
  const w=c.width/2,d=c.depth,h=c.height;
  box(walnut,0,-.07,-d/2,c.width,.14,d);box(wall,-w,h/2,-d/2,.17,h,d);box(wall,w,h/2,-d/2,.17,h,d);box(wall,0,h/2,-d,c.width,h,.21);box(ink,0,h,-d/2,c.width,.2,d);
  for(const k of [-1,1]){box(wall,k*(w+1.4)/2,h/2,0,w-1.4,h,.15);box(oak,k*1.42,1.72,0,.18,3.43,.22);}
  box(oak,0,3.37,0,3,.22,.24);
  for(let z=-.45;z>-d;z-=1.22){box(oak,0,h-.18,z,c.width,.26,.15);for(const s of [-1,1])box(walnut,s*(w-.08),h/2,z,.16,h,.15);}
  for(const s of [-1,0,1]){const x=s*2.12;
    box(light,x,2.32,-d+.14,1.91,1.67,.07);for(let i=-3;i<=3;i++)box(oak,x+i*.285,2.32,-d+.22,.038,1.71,.065);
    for(let i=-2;i<=2;i++)box(oak,x,2.32+i*.39,-d+.23,1.96,.046,.073);
    for(const a of [-1,1]){box(walnut,x+a*.98,2.32,-d+.24,.085,1.8,.11);box(walnut,x,2.32+a*.88,-d+.24,2.06,.085,.11);}
  }
  const z=-4.55;box(walnut,0,.87,z,4.12,.22,1.73);box(oak,0,.974,z,4.19,.055,1.78);box(jade,0,1.013,z,3.75,.035,1.54);
  for(const x of [-1.76,1.76])for(const zz of [z-.66,z+.66]){box(walnut,x,.43,zz,.17,.86,.17);box(gold,x,.105,zz,.18,.04,.18);}
  for(const s of [-1,1]){box(walnut,0,.66,z+s*.68,3.75,.18,.09);box(oak,0,.25,z+s*.66,3.59,.074,.07);}
  const starZ=-7.12,sw=3.05;
  box(walnut,0,.78,starZ,5.66,.21,.86);box(jade,0,.92,starZ,5.54,.07,.86);
  for(const x of [-2.55,2.55])for(const dz of [-.32,.32])box(oak,x,.39,starZ+dz,.13,.78,.13);
  // The paper lamp filters light through a paper screen; a moulding gives the
  // low window and worktops a visible edge at reading height.
  for(const k of [-1,1]){box(oak,k*(w-.11),.63,-d/2,.14,.09,d);box(walnut,k*(w-.11),.14,-d/2,.14,.25,d);}
  box(walnut,0,1.33,-d+.24,c.width,.12,.27);
  const linen=m('#9d9577'),dyed=m('#494d46');
  for(let j=0;j<4;j++){const mat=j%2?oak:dyed,len=.5+j*.042;
    box(mat,2.24+j*.026,.974+j*.059,starZ,len,.049,.39);box(linen,2.25+j*.026,.972+j*.059,starZ+.20,len-.05,.028,.011);}
  for (const side of [-1,1]){const at=side*2.58;
    fixed(new T.CylinderGeometry(.108,.17,.07,32),gold,at,1.003,starZ-.09);
    fixed(new T.CylinderGeometry(.040,.055,.38,24),walnut,at,1.21,starZ-.09);
    fixed(new T.CylinderGeometry(.14,.112,.25,24),light,at,1.46,starZ-.09);
    for(const y of [1.334,1.59])fixed(new T.CylinderGeometry(.144,.144,.017,24),gold,at,y,starZ-.09);}
  for(const [mat,pieces] of batches){const geo=mergeGeometries(pieces);for(const a of pieces)a.dispose();const mesh=new T.Mesh(geo,mat);mesh.receiveShadow=true;g.add(mesh);}
  const xEnd=1.27,paperW=2.54,paperD=1.43,y=1.095;
  const tex=ctx.loader.load(c.experience.cover,ctx.invalidate);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
  const mat=new T.MeshBasicMaterial({map:tex,color:0xfff6e8,side:T.DoubleSide,toneMapped:false});
  const n=96,geo=new T.PlaneGeometry(1,1,n,1),paper=new T.Mesh(geo,mat);g.add(paper);paper.frustumCulled=false;
  const rod=new T.Group();g.add(rod);
  function cyl(r,len,mat,zAt){const p=new T.Mesh(new T.CylinderGeometry(r,r,len,40),mat);p.rotation.x=Math.PI/2;p.position.z=zAt;rod.add(p);}
  const parchment=m('#bc9b61');cyl(.099,paperD+.035,parchment,0);for(const k of [-1,1]){cyl(.048,.16,oak,k*(paperD/2+.077));cyl(.063,.028,gold,k*(paperD/2+.14));}
  const starTex=ctx.loader.load('assets/experience/mogao/sky-scroll.webp',ctx.invalidate);starTex.colorSpace=T.SRGBColorSpace;starTex.anisotropy=8;
  const starPaper=new T.MeshBasicMaterial({map:starTex,color:0xfff3de,side:T.DoubleSide,toneMapped:false});
  const sg=new T.PlaneGeometry(sw,1.01,60,2),sp=sg.attributes.position,suv=sg.attributes.uv,sourceU=[];
  for(let k=0;k<sp.count;k++){const t=sp.getY(k);sourceU[k]=suv.getX(k);sp.setXYZ(k,sp.getX(k),1.22+t*.45+.055*Math.exp(-12*(1-Math.abs(2*sourceU[k]-1))),starZ-t*.78);}
  sg.computeVertexNormals();const sky=new T.Mesh(sg,starPaper);g.add(sky);
  for(const edge of [-1,1]){const ax=new T.Mesh(new T.CylinderGeometry(.088,.088,1.19,32),parchment);ax.rotation.x=Math.PI*.66;ax.position.set(edge*(sw/2+.025),1.32,starZ);g.add(ax);}
  g.userData.setExperience=(stage,val)=>{
    const starPos=stage>=3?val:.07,windowWidth=sw/1.01/(3298/440);
    for(let k=0;k<suv.count;k++)suv.setX(k,(1-starPos)*(1-windowWidth)+sourceU[k]*windowWidth);
    suv.needsUpdate=true;
    if(stage>=3)val=1;
    const f=.13+.87*Math.min(1,Math.max(0,stage<0?.75:val)),pos=geo.attributes.position,uv=geo.attributes.uv;
    const left=xEnd-paperW*f;rod.position.set(left-.014,y+.082,z);
    for(let j=0;j<2;j++)for(let i=0;i<=n;i++){const t=i/n,k=j*(n+1)+i,edge=Math.exp(-t*30);
      pos.setXYZ(k,left+t*paperW*f,y+.127*edge+.004*Math.sin(t*Math.PI*3),z+(j-.5)*paperD);uv.setXY(k,1-f+f*t,1-j);}
    pos.needsUpdate=uv.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();ctx.invalidate();
  };
  const deskLight=new T.PointLight(0xffe5bb,7,7,2);deskLight.position.set(-.8,3.0,-3.9);g.add(deskLight);g.userData.setExperience(-1,.75);return g;
}
