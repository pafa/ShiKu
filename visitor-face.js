import * as THREE from 'three';

const {clamp, smoothstep} = THREE.MathUtils;
let sequence = 0;

export function makeVisitorFace(model, id) {
  const head = model.getObjectByName('Head');
  const eyes = ['Left','Right'].map(side => {
    const eye = model.getObjectByName('InkEye'+side);
    const iris = model.getObjectByName('InkIris'+side);
    return eye && iris ? {eye, iris, height:eye.scale.y, rest:iris.position.clone()} : null;
  });
  if (!head || !eyes.every(Boolean)) return {reset(){}, update(){}};

  const target = new THREE.Vector3();
  let clock = 0, nextBlink, nextLook, driftX, driftY;
  let seed = (id.charCodeAt(0)*31 + ++sequence*719) >>> 0;
  function random() {
    seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
    return seed/4294967296;
  }
  function reset() {
    clock = 0; driftX = driftY = 0;
    nextBlink = 1.6 + random()*2.1; nextLook = .7 + random();
    for (const {eye,iris,height,rest} of eyes) {
      eye.scale.y = height;
      iris.position.copy(rest);
    }
  }
  function update(dt, attention) {
    dt = clamp(dt || 0, 0, .12);
    clock += dt;
    if (clock >= nextLook) {
      driftX = (random()-.5)*.0014;
      driftY = (random()-.5)*.0006;
      nextLook = clock + .8 + 1.9*random();
    }
    if (clock > nextBlink+.24) nextBlink = clock+2.5+2.8*random();
    const phase = clock-nextBlink;
    const shut = phase<.074 ? smoothstep(phase,0,.074) : 1-smoothstep(phase,.095,.24);
    const tracking = attention && [attention.x,attention.y,attention.z].every(Number.isFinite);
    if (tracking) head.worldToLocal(target.set(attention.x,attention.y,attention.z));
    const follow = 1-Math.exp(-19*dt);
    for (const {eye,iris,height,rest} of eyes) {
      let dx = driftX, dy = driftY;
      if (tracking && target.z>eye.position.z+.09) {
        const z = target.z-eye.position.z;
        dx += .009*clamp((target.x-eye.position.x)/z,-.63,.63);
        dy += .006*clamp((target.y-eye.position.y)/z,-.42,.42);
      }
      eye.scale.y = height*(1-.97*shut);
      iris.position.x += (rest.x+dx-iris.position.x)*follow;
      iris.position.y += (rest.y+dy-iris.position.y)*follow;
    }
  }
  reset();
  return {reset,update};
}
