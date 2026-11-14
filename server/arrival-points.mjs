// Curated positions on the central aisle just inside each pavilion. Coordinates
// are in metres on the shared museum plan. check-walking verifies each row and
// its open route through the gallery door when the exhibition layout changes.
const doorwayRows = [0, -70.575, -154.525, -238.725, -280.225];
export const galleryArrivals = [];
for (let hall = 0; hall < 9; hall++) {
  const side = hall % 2 ? 1 : -1;
  const centre = doorwayRows[Math.floor(hall / 2)];
  for (const x of [6.5, 9.5, 12.5]) {
    for (const offset of [-1.45, 1.45]) {
      galleryArrivals.push({x: side * x, z: centre + offset, heading: -side * Math.PI / 2});
    }
  }
}

export function chooseGalleryArrival(visitors) {
  const occupied = Array.from(visitors);
  const free = galleryArrivals.filter(point =>
    occupied.every(other => Math.hypot(other.x - point.x, other.z - point.z) >= 1.25));
  // There are 54 points at least 2.9 m apart. A seated visitor can exclude
  // at most one, and at most 49 people are inside when a place is allocated.
  if (!free.length) throw Error('没有可用的入馆位置');
  return free[Math.floor(Math.random() * free.length)];
}
