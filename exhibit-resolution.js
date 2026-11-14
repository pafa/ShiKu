import * as THREE from 'three';
import {detailImages} from './assets/authentic/detail-images.js';

// Only the exhibition surface being studied holds a high-resolution texture.
// Walking on releases it and immediately restores the wall thumbnail.
export function nearbyOriginal(renderer, invalidate) {
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let active = null;
  async function load(job) {
    let localUrl;
    try {
      const response = await fetch(job.url, {signal: job.request.signal});
      if (!response.ok) return;
      localUrl = URL.createObjectURL(await response.blob());
      const image = new Image();
      image.src = localUrl;
      await image.decode();
      if (job !== active) return;
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
      job.texture = texture;
      job.surface.material.map = texture;
      invalidate();
    } catch {
      // The gallery photograph stays on display when a detail transfer fails.
    } finally {
      if (localUrl) URL.revokeObjectURL(localUrl);
    }
  }
  function focus(surface) {
    const url = surface && detailImages[surface.userData.originalPhoto];
    if (active && surface === active.surface) return;
    if (active) {
      clearTimeout(active.timer);
      active.request.abort();
      if (active.texture) {
        active.surface.material.map = active.preview;
        active.texture.dispose();
        invalidate();
      }
      active = null;
    }
    if (!url || !surface.material.map || navigator.connection?.saveData) return;
    const job = {surface, url, preview:surface.material.map, request:new AbortController()};
    active = job;
    job.timer = setTimeout(()=>load(job), 420);
  }
  return focus;
}
