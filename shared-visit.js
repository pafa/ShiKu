import {createPresence} from './presence-client.js';
import {resolveVisitorId} from './visitor-roster.js';

const listeners=new Set();
export const visit={profile:null,snapshot:{selfId:null,visitors:[]},status:'offline'};
function publish(){for(const fn of listeners)fn(visit);}
export const presence=createPresence({
  onSnapshot(snapshot){visit.snapshot=snapshot;publish();},
  onStatus(status){visit.status=status;publish();}
});
export function observeVisit(fn){listeners.add(fn);fn(visit);return ()=>listeners.delete(fn);}
export async function enterVisit(profile,options){
  await presence.join(profile,undefined,options);
  visit.profile={...profile,avatarId:resolveVisitorId(profile.avatarId)};
  publish();
}
export function selfRecord(){
  return visit.snapshot.visitors.find(p=>p.id===visit.snapshot.selfId);
}
