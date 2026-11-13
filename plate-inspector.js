import {detailImages} from './assets/authentic/detail-images.js';

const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));

// Positions in this viewer are fractions of the complete, uncropped photograph.
// The wall photograph and its larger edition share that coordinate system.
export function inspectPlate(host, photo, hotspots = [], choose = () => {}) {
  const events = new AbortController();
  const options = {signal: events.signal};
  const layer = document.createElement('div');
  layer.className = 'sd-layer';
  let image = new Image();
  image.alt = photo.caption;
  image.draggable = false;
  layer.append(image);
  host.append(layer);

  const pins = hotspots.map((point, index) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'sd-pin';
    pin.textContent = String(index + 1);
    pin.setAttribute('aria-label', point.title);
    pin.style.left = point.x * 100 + '%';
    pin.style.top = point.y * 100 + '%';
    pin.onclick = () => choose(index);
    layer.append(pin);
    return pin;
  });

  const navigator = document.createElement('button');
  navigator.type = 'button';
  navigator.className = 'plate-navigator';
  navigator.setAttribute('aria-label', '全图定位，点选图像位置或用方向键平移');
  const overview = new Image();
  overview.alt = '';
  overview.draggable = false;
  overview.src = photo.src;
  const windowBox = document.createElement('span');
  navigator.append(overview, windowBox);
  navigator.hidden = true;
  host.append(navigator);

  let sourceWidth = 0, sourceHeight = 0, zoomLevel = 1;
  let centerX = .5, centerY = .5, box, fullImage, wantsNative = false;
  const largeSource = photo.detailSrc || detailImages[photo.src];
  let drag, pinch, lastTap;
  const fingers = new Map();

  function render() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!sourceWidth || w < 17 || h < 17) return;
    const fit = Math.min((w - 16) / sourceWidth, (h - 16) / sourceHeight);
    if (wantsNative) zoomLevel = Math.max(1, 1 / (fit * (window.devicePixelRatio || 1)));
    const width = sourceWidth * fit * zoomLevel, height = sourceHeight * fit * zoomLevel;
    const offset = (center, extent, space) => extent < space ? (space - extent) / 2 : clamp(space / 2 - center * extent, space - extent, 0);
    const left = offset(centerX, width, w), top = offset(centerY, height, h);
    centerX = (w / 2 - left) / width;
    centerY = (h / 2 - top) / height;
    box = {width, height, left, top, fit, w, h};
    Object.assign(layer.style, {width: width+'px', height: height+'px', left: left+'px', top: top+'px'});
    host.dataset.zoom = zoomLevel.toFixed(2);
    navigator.hidden = width <= w && height <= h;
    if (!navigator.hidden) {
      // Keep even a very long scroll selectable on a phone.
      const ratio = sourceWidth / sourceHeight;
      navigator.style.width = Math.min(116, 70 * ratio)+'px';
      navigator.style.height = Math.min(70, 116 / ratio)+'px';
      Object.assign(windowBox.style, {
        left: clamp(-left / width)*100+'%', top: clamp(-top / height)*100+'%',
        width: Math.min(1, w / width)*100+'%', height: Math.min(1, h / height)*100+'%'
      });
    }
  }

  function loadLarge() {
    if (!largeSource || fullImage) return;
    fullImage = new Image();
    fullImage.onload = () => {
      if (events.signal.aborted) return;
      fullImage.alt = photo.caption;
      fullImage.draggable = false;
      image.onload = null;
      image.replaceWith(fullImage);
      image = fullImage;
      sourceWidth = image.naturalWidth;
      sourceHeight = image.naturalHeight;
      render();
    };
    fullImage.onerror = () => { fullImage = null; };
    fullImage.src = largeSource;
  }

  function setZoom(level, anchor) {
    if (!box) return;
    wantsNative = false;
    const max = Math.max(5, 2 / box.fit);
    const next = clamp(level, 1, max);
    if (anchor) {
      const fraction = next / zoomLevel;
      centerX = (anchor.x - box.left + (box.w/2 - anchor.x) / fraction) / box.width;
      centerY = (anchor.y - box.top + (box.h/2 - anchor.y) / fraction) / box.height;
    }
    zoomLevel = next;
    if (next === 1) centerX = centerY = .5;
    else loadLarge();
    render();
  }
  function zoom(factor) { setZoom(zoomLevel * factor); }
  function local(x, y) {
    const bounds = host.getBoundingClientRect();
    return {x: x - bounds.left, y: y - bounds.top};
  }
  function zoomAt(e) {
    setZoom(zoomLevel === 1 ? 2.5 : 1, local(e.clientX, e.clientY));
  }
  function pointOnMap(e) {
    const r = navigator.getBoundingClientRect();
    centerX = clamp((e.clientX-r.left) / r.width);
    centerY = clamp((e.clientY-r.top) / r.height);
    render();
  }
  navigator.addEventListener('pointerdown', e => {
    navigator.setPointerCapture(e.pointerId);
    pointOnMap(e);
  }, options);
  navigator.addEventListener('pointermove', e => {
    if (navigator.hasPointerCapture(e.pointerId)) pointOnMap(e);
  }, options);
  function span() {
    const [a, b] = fingers.values();
    return {distance: Math.max(1, Math.hypot(a.x-b.x,a.y-b.y)), mid: {x:(a.x+b.x)/2,y:(a.y+b.y)/2}};
  }
  host.addEventListener('pointerdown', e => {
    if (!box || e.target.closest('button')) return;
    host.setPointerCapture(e.pointerId);
    fingers.set(e.pointerId, local(e.clientX,e.clientY));
    if (fingers.size === 2) {
      const {distance,mid} = span();
      pinch = {distance, level:zoomLevel, u:(mid.x-box.left)/box.width, v:(mid.y-box.top)/box.height};
      drag = lastTap = null;
    } else if (fingers.size === 1) drag = {x:e.clientX, y:e.clientY, cx:centerX, cy:centerY, tap:true};
  },options);
  host.addEventListener('pointermove', e => {
    if (!fingers.has(e.pointerId)) return;
    fingers.set(e.pointerId, local(e.clientX,e.clientY));
    if (pinch && fingers.size === 2) {
      const {distance,mid} = span();
      setZoom(pinch.level * distance / pinch.distance);
      centerX = pinch.u + (box.w/2-mid.x)/box.width;
      centerY = pinch.v + (box.h/2-mid.y)/box.height;
      render();
    } else if (drag) {
      centerX = drag.cx - (e.clientX-drag.x)/box.width;
      centerY = drag.cy - (e.clientY-drag.y)/box.height;
      render();
    }
  },options);
  function release(e) {
    if (!fingers.delete(e.pointerId)) return;
    if (drag?.tap && e.type === 'pointerup' && e.pointerType === 'touch' && Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6) {
      const t = performance.now();
      if (lastTap && t-lastTap.t < 340 && Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<22) {
        zoomAt(e); lastTap = null;
      } else lastTap = {t,x:e.clientX,y:e.clientY};
    }
    drag = pinch = null;
    if (fingers.size === 1) {
      const [p] = fingers.values(), r = host.getBoundingClientRect();
      drag = {x:p.x+r.left,y:p.y+r.top,cx:centerX,cy:centerY,tap:false};
    }
  }
  for (const type of ['pointerup','pointercancel','lostpointercapture']) host.addEventListener(type,release,options);
  host.addEventListener('dblclick', e => {if (!e.target.closest('button')) zoomAt(e);},options);
  host.addEventListener('wheel', e => {
    e.preventDefault();
    setZoom(zoomLevel * (e.deltaY < 0 ? 1.18 : 1/1.18),local(e.clientX,e.clientY));
  },{passive:false,...options});
  host.addEventListener('keydown', e => {
    if (!box) return;
    if (['+','=','-'].includes(e.key)) zoom(e.key === '-' ? .8 : 1.25);
    else if (e.key === 'Home') setZoom(1);
    else if (zoomLevel > 1 && e.key.startsWith('Arrow')) {
      if (e.key === 'ArrowLeft') centerX -= box.w*.20/box.width;
      if (e.key === 'ArrowRight') centerX += box.w*.20/box.width;
      if (e.key === 'ArrowUp') centerY -= box.h*.20/box.height;
      if (e.key === 'ArrowDown') centerY += box.h*.20/box.height;
      render();
    } else return;
    e.preventDefault(); e.stopPropagation();
  },options);
  const resize = new ResizeObserver(render);
  resize.observe(host);
  image.onload = () => { sourceWidth = image.naturalWidth; sourceHeight = image.naturalHeight; render(); };
  image.src = photo.src;
  return {
    zoom, reset(){setZoom(1);},
    native(){wantsNative = true;loadLarge();render();},
    focus(i){
      const p=hotspots[i];if(!p)return;
      zoomLevel = 2; wantsNative=false; centerX=p.x; centerY=p.y; loadLarge();render();
      pins.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));
    },
    destroy(){
      events.abort(); resize.disconnect(); image.onload=null;
      if (fullImage) fullImage.onload=fullImage.onerror=null;
      layer.remove(); navigator.remove(); delete host.dataset.zoom;
    }
  };
}
