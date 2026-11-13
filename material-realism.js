// Photography, acquisition scale and licensing are listed in assets/museum/materials/SOURCES.md.
import {hasDisplayMedia} from './public-media.js';
import * as THREE from 'three';
import { HDRLoader } from './real-viewer/vendor/addons/loaders/HDRLoader.js';

const basePath = 'assets/museum/materials/';

export function loadSurfaces(loader, manager, scene, renderer) {
  const textures = {};
  const anisotropy = Math.min(6, renderer.capabilities.getMaxAnisotropy());
  for (const kind of ['wall', 'floor']) {
    for (const channel of ['color', 'normal', 'rough']) {
      const texture = loader.load(basePath + kind + '-' + channel + '.webp');
      texture.colorSpace = channel === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = anisotropy;
      textures[kind + channel] = texture;
    }
  }
  if (hasDisplayMedia('assets/museum/tree.webp')) {
    textures.tree = loader.load('assets/museum/tree.webp');
    textures.tree.colorSpace = THREE.SRGBColorSpace;
  }
  // A real indoor light probe gives bronze and worn stone soft window reflections.
  // Placing it exclusively in scene.environment keeps the virtual garden visible.
  textures.environment = new HDRLoader(manager).load(basePath + 'chapel-day.hdr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  });
  scene.environmentRotation.y = -1.1;
  scene.environmentIntensity = .16;
  return textures;
}

export function makeStone(tint, textures, kind, isTrim = false) {
  const color = new THREE.Color(tint).lerp(new THREE.Color(0xffffff), isTrim ? .88 : .75);
  const intensity = kind === 'floor' ? .6 : (isTrim ? .42 : .72);
  return new THREE.MeshStandardMaterial({
    color,
    map: textures[kind + 'color'],
    normalMap: textures[kind + 'normal'],
    normalScale: new THREE.Vector2(intensity, intensity),
    roughnessMap: textures[kind + 'rough'],
    roughness: kind === 'floor' ? .74 : .88,
    metalness: 0,
    vertexColors: true,
  });
}

// A low-frequency indirect-shadow mask for the actual wall and plinth footprints.
// The high-frequency pores, paving edges and surface normals remain photographic.
export function applyFloorOcclusion(room, material, halfWidth, front, back, benches, plinth) {
  const size = 18;
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((2 * halfWidth + 2) * size);
  canvas.height = Math.ceil((front - back + 2) * size);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const minX = -halfWidth - 1, maxZ = front + 1;
  const px = x => (x - minX) * size;
  const py = z => (maxZ - z) * size;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function imprint(x, z, width, depth, strength, radius) {
    ctx.fillStyle = 'rgb(32,32,32)';
    ctx.globalAlpha = strength;
    ctx.filter = 'blur(' + radius * size + 'px)';
    ctx.fillRect(px(x - width / 2), py(z + depth / 2), width * size, depth * size);
  }
  for (const sign of [-1, 1]) {
    imprint(sign * (halfWidth + .22), (front + back) / 2, .85, front - back + 2, .7, .45);
  }
  for (const bench of benches) {
    imprint(bench.x, bench.z, bench.halfX * 2, bench.halfZ * 2, .74, .24);
    for (const offset of [-.58, .58]) imprint(bench.x, bench.z + offset, .55, .34, .8, .085);
  }
  if (plinth) imprint(plinth.x, plinth.z, plinth.halfX * 2 + .18, plinth.halfZ * 2 + .18, .8, .22);
  imprint(0, back, 2 * halfWidth, .7, .68, .32);
  const shadow = new THREE.CanvasTexture(canvas);
  shadow.channel = 1;
  room.traverse(mesh => {
    if (mesh.material !== material) return;
    const pos = mesh.geometry.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i*2] = px(pos.getX(i)) / canvas.width;
      uv[i*2+1] = 1 - py(pos.getZ(i)) / canvas.height;
    }
    mesh.geometry.setAttribute('uv1', new THREE.BufferAttribute(uv, 2));
  });
  material.aoMap = shadow;
  material.aoMapIntensity = .85;
}
