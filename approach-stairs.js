// Treads in the exhibition's Fengxian approach, in metres from the entrance.
// Both the visible stone and the visitor's shoes use these same surfaces.
const flights = [{start:3,base:0,landingEnd:10.3},{start:10.3,base:1.44,landingEnd:39}];
const run=4.8;
export const approachTreads = [[0,flights[0].start,0]];
for (const {start,base,landingEnd} of flights) {
  for (let i=0;i<12;i++) {
    approachTreads.push([start+i*.4,start+(i+1)*.4,base+(i+1)*.12]);
  }
  approachTreads.push([start+run,landingEnd,base+1.44]);
}

export function treadHeight(depth) {
  for (const [,end,height] of approachTreads) if (depth<end) return height;
  return approachTreads.at(-1)[2];
}

// Allow a short braking distance before the first riser in either direction.
export function stairSpeedLimit(depth) {
  const onFlight=flights.some(({start})=>depth>=start-.35&&depth<=start+run+.35);
  return onFlight ? .72 : Infinity;
}
