import * as T from 'three';

// The garden photograph belongs to the museum courtyard. Give the outdoor
// cliff mouths their own distant horizon, well beyond the navigable outcrop.
export function caveHorizon(scene){
  const palettes={
    yungang:['#94b0bd','#dcd9ca','#a69e85','#8e846e'],
    longmen:['#98b4bd','#dfddd0','#889483','#758575'],
    mogao:['#8aa8bc','#eee1c9','#c4a883','#a58b6d'],
    maijishan:['#96adb6','#d4d8c9','#819184','#657b6a']
  };
  const skies=new Map(),mat=new T.MeshBasicMaterial({side:T.BackSide,transparent:true,depthWrite:false,fog:false,toneMapped:false});
  const shell=new T.Mesh(new T.SphereGeometry(119,48,24),mat);
  shell.renderOrder=-10000;shell.visible=false;scene.add(shell);
  function paint(site){
    if(skies.has(site))return skies.get(site);
    const [blue,mist,far,near]=palettes[site],canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=512;
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    const sky=ctx.createLinearGradient(0,0,0,h*.57);
    sky.addColorStop(0,blue);sky.addColorStop(.57,blue);sky.addColorStop(1,mist);
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    for(const [i,color] of [far,near].entries()){
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,h);
      for(let x=0;x<=w;x++){
        const t=x/w*2*Math.PI;
        const ridge=7*Math.sin(3*t+i)+3*Math.sin(7*t-i)+2.7*Math.sin(13*t+.6*i)+1.1*Math.sin(34*t+i);
        ctx.lineTo(x,h*(.497+i*.028)+ridge*(site==='maijishan'?1.6:.85));
      }
      ctx.lineTo(w,h);ctx.closePath();ctx.fill();
    }
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
    skies.set(site,map);return map;
  }
  return function update(point,wing,c){
    const outward=wing?(point.x-wing.outer)*wing.plan.side:-50;
    const amount=T.MathUtils.smoothstep(outward,-4.6,2.8);
    shell.visible=amount>.002;if(!shell.visible)return;
    const site=(c||wing.caves[0]).work.siteId,map=paint(site);
    if(mat.map!==map){mat.map=map;mat.needsUpdate=true;}
    mat.opacity=amount;shell.position.set(point.x,1.6,point.z);
  };
}
