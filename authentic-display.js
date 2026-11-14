// Convert archival catalogue records to material that is cleared for display.
// Coordinates from one photograph must never be carried over to a replacement.
import {evidenceFor} from './object-evidence.js';

import {exhibitVisual,visualLabel} from './exhibit-visual.js';
export const mediaLabel = visualLabel;

export function displayCredit(image) {
  return {
    author: image.credit,
    source: image.source,
    license: image.license,
    licenseUrl: image.licenseUrl || image.source,
    modified: image.caption
  };
}

const presented = new WeakMap();
export function workForDisplay(raw) {
  if (presented.has(raw)) return presented.get(raw);
  const evidence = evidenceFor(raw);
  const photo = evidence.images[0];
  const work = {
    ...raw,
    photo, evidence, visual:exhibitVisual(raw,evidence), image: photo?.src, credit: photo ? displayCredit(photo) : null,
    alt: photo?.caption, imageNote: photo?.caption, studyPlate: null, studyPlateNote: null, studyPlateAlt: null, diagram: null,
    hotspots: photo?.originalFrame && (photo.coordinateSource || photo.src) === raw.image ? raw.hotspots || [] : []
  };
  presented.set(raw, work);
  presented.set(work, work);
  return work;
}
