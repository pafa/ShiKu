import * as T from 'three';

// Static sculpture meshes retain neighbouring triangles in index order. Use
// their local bounds to avoid testing an entire scanned cliff for every label.
const trees=new WeakMap(),leafSize=128;
const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),hit=new T.Vector3();
const inverse=new T.Matrix4(),local=new T.Ray(),end=new T.Vector3();
function boundsTree(geometry){
  if(trees.has(geometry))return trees.get(geometry);
  const positions=geometry.attributes.position,idx=geometry.index;
  const last=idx?.count??positions.count,leaves=[];
  for(let start=0;start<last;start+=3*leafSize){
    const stop=Math.min(start+3*leafSize,last),box=new T.Box3();
    for(let i=start;i<stop;i++)box.expandByPoint(a.fromBufferAttribute(positions,idx?idx.getX(i):i));
    leaves.push({box,start,stop});
  }
  let level=leaves;
  while(level.length>1){
    const next=[];
    for(let i=0;i<level.length;i+=2){
      const left=level[i],right=level[i+1];
      next.push(right?{box:left.box.clone().union(right.box),left,right}:left);
    }
    level=next;
  }
  trees.set(geometry,level[0]);return level[0];
}
function opaque(m){return m&&m.visible&&(!m.transparent||m.opacity>.65);}
function stopsRay(mesh,ray){
  const g=mesh.geometry,m=mesh.material,pos=g.attributes.position,idx=g.index;
  if(!pos||!m||(!Array.isArray(m)&&!opaque(m)))return false;
  if(mesh.isInstancedMesh||mesh.isSkinnedMesh||Array.isArray(m)||g.morphAttributes.position||
    (idx?.count??pos.count)<18000||g.drawRange.start!==0||Number.isFinite(g.drawRange.count)){
    const hits=[];mesh.raycast(ray,hits);
    return hits.some(h=>opaque(Array.isArray(m)?m[h.face?.materialIndex||0]:m));
  }
  inverse.copy(mesh.matrixWorld).invert();
  local.copy(ray.ray).applyMatrix4(inverse);
  if(!g.boundingBox)g.computeBoundingBox();
  if(!local.intersectsBox(g.boundingBox))return false;
  // Non-uniform scale changes the ray's local unit length. Transform a point
  // on the world ray to obtain its local near/far without a world-matrix copy per hit.
  ray.ray.at(ray.far,end).applyMatrix4(inverse);
  const far2=end.distanceToSquared(local.origin),near2=far2*(ray.near/ray.far)**2;
  const side=m.side;
  function inspect(node){
    if(!local.intersectsBox(node.box))return false;
    if(node.left)return inspect(node.left)||inspect(node.right);
    for(let i=node.start;i<node.stop;i+=3){
      a.fromBufferAttribute(pos,idx?idx.getX(i):i);
      b.fromBufferAttribute(pos,idx?idx.getX(i+1):i+1);
      c.fromBufferAttribute(pos,idx?idx.getX(i+2):i+2);
      const point=side===T.BackSide?local.intersectTriangle(c,b,a,true,hit):local.intersectTriangle(a,b,c,side!==T.DoubleSide,hit);
      if(point){const d=hit.distanceToSquared(local.origin);if(d>=near2&&d<=far2)return true;}
    }
    return false;
  }
  return inspect(boundsTree(g));
}
export function occluded(group,ray){
  if(!group.visible)return false;
  if(group.isMesh&&stopsRay(group,ray))return true;
  return group.children.some(child=>occluded(child,ray));
}
