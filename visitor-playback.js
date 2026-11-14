// A companion's rig reads the distance covered *this frame*. Easing toward
// each incoming packet made a constant-speed visitor accelerate and brake
// eight times per second. Play actual travelled segments in order instead.
const delay=155; // ms; local clients normally publish once per 120 ms.
const angle=(to,from)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
const sample=(p,t)=>({x:p.x,z:p.z,heading:p.heading,t});

export function peerWalk(first,now){
  let points=[sample(first,now)];
  return {
    reset(p,time){points=[sample(p,time)];},
    push(p,time){
      const previous=points.at(-1);
      if(p.x===previous.x&&p.z===previous.z&&p.heading===previous.heading)return;
      // On a fresh start after silence, only the last short interval was
      // spent moving. Earlier than that, remain at the last confirmed pose.
      if(time-previous.t>320)points.push(sample(previous,time-120));
      if(time-previous.t<1&&points.length>1)points.pop();
      points.push(sample(p,time));
      if(points.length>12)points.splice(0,points.length-12);
    },
    read(out,time){
      const t=time-delay;
      while(points.length>2&&points[1].t<=t)points.shift();
      const a=points[0],b=points[1]||a;
      const f=Math.max(0,Math.min(1,(t-a.t)/Math.max(1,b.t-a.t)));
      out.x=a.x+(b.x-a.x)*f;out.z=a.z+(b.z-a.z)*f;
      out.heading=a.heading+angle(b.heading,a.heading)*f;
      return out;
    }
  };
}
