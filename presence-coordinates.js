// The shared room persists the v0.1.0 coordinate system, including through a
// Worker rollback. Keep every original row and bay at its old relative offset.
// The extra length between rows maps continuously into the old connection.
const original=[0,-70.575,-154.525,-238.725,-280.225];
const current=[0,-130.325,-227.825,-325.575,-380.625];
const north=[37.5,43.45,61.05,22.15,31.3];
const south=[30.92,30.275,37.7,20.35,16.55];
const wire=[],local=[];
for(let row=original.length-1;row>=0;row--){
  wire.push(original[row]-north[row],original[row]+south[row]);
  local.push(current[row]-north[row],current[row]+south[row]);
}
function translate(z,from,to){
  if(z<=from[0])return z+to[0]-from[0];
  for(let i=1;i<from.length;i++){
    if(z<=from[i])return to[i-1]+(z-from[i-1])*(to[i]-to[i-1])/(from[i]-from[i-1]);
  }
  return z+to.at(-1)-from.at(-1);
}
export function museumPoint(point){
  return {...point,z:translate(point.z,wire,local)};
}
export function roomPoint(point){
  return {...point,z:translate(point.z,local,wire)};
}
