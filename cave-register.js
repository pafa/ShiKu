// The survey register is authoritative. A museum exhibit can belong to several
// numbered caves; a catalogue number at a collecting institution is independent.
import {catalog} from './collection-extension.js';
const parents = new Map(Object.entries({
  'maijishan-28-30-painted-walls':[28,30],
  'longmen-rubbing-niujue':[1443], 'longmen-rubbing-shiping':[1443],
  'longmen-rubbing-sun':[1443], 'longmen-rubbing-yang':[1443], 'longmen-rubbing-ma':[1443],
  'longmen-rubbing-wei':[1443], 'longmen-fengxian-timber':[1280],
  'longmen-kanjing-timber':[2194], 'longmen-met-35146':[140], 'longmen-nelson-4038':[140],
  'yungang-shanghai-celestial':[17], 'yungang-1907-photograph':[20],
  'mogao-bl-or8210-p2':[17], 'mogao-bl-star-atlas':[17], 'mogao-bm-guide':[17]
}));
export function buildCaveRegister(works) {
  const rows = catalog.map(record => ({...record,related:[]}));
  const numbered = new Map();
  for (const row of rows) {
    const number = /^第(\d+)窟$/.exec(row.number)?.[1];
    if (number) numbered.set(row.siteId+'-'+number,row);
  }
  for (const work of works) {
    const baseNumber = /^[a-z]+-(\d+)(?:-|$)/.exec(work.id)?.[1];
    const locations = parents.get(work.id) ?? (work.findspotCave ? [work.findspotCave] : baseNumber ? [baseNumber] : []);
    for (const number of locations) numbered.get(work.siteId+'-'+number)?.related.push(work);
  }
  return rows;
}
