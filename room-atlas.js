import {court,plans,wallStations} from './building-plan.js';
import {wings,caveDoorWidth,toWorld} from './cave-plan.js';
import {halls} from './dynasty-exhibition.js';
import {project,projectBox,worldBox,courtBox,hallBox,locationName,markerColor,goodPoint,trailPath,svgNode} from './atlas-geometry.js';

const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const element=(tag,cls,text)=>{
  const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;
};
function control(label,icon,action,cls='') {
  const button=element('button',cls,icon);button.type='button';button.setAttribute('aria-label',label);
  button.title=label;button.addEventListener('click',action);return button;
}
function legend(label,cls) {
  const item=element('span',cls,label);item.prepend(element('i'));return item;
}

export function createRoomAtlas({onOpen=()=>{},onClose=()=>{},onStructure}={}) {
  const dialog=element('dialog','room-atlas');dialog.id='room-atlas';dialog.setAttribute('aria-labelledby','atlas-title');
  const head=element('header','ra-head'), title=element('h2','','全馆访客地图');title.id='atlas-title';
  const close=control('关闭访客地图','×',()=>dialog.close(),'ra-close');
  head.append(title);
  let openStructureAfterClose=false;
  if(onStructure){
    head.append(control('打开原展馆结构图','展馆结构',()=>{openStructureAfterClose=true;dialog.close();},'ra-structure'));
  }
  head.append(close);
  const layout=element('div','ra-layout'), sheet=element('section','ra-chart');
  const stage=element('div','ra-stage');stage.tabIndex=0;stage.setAttribute('aria-label','室内平面图，可用方向键移动，加减键缩放');
  const svg=svgNode('svg',{role:'img','aria-label':'九座展馆、崖廊和窟室的平面图，标有在馆访客当前位置'});
  const architecture=svgNode('g'), paths=svgNode('g'), labels=svgNode('g'), markers=svgNode('g');
  svg.append(architecture,paths,labels,markers);stage.append(svg);
  const compass=element('div','ra-compass');compass.setAttribute('aria-hidden','true');compass.append(element('span','','北'),element('i'));
  const scaleBar=element('span','ra-scale'), toolbar=element('div','ra-tools');
  const fit=control('显示全馆','全馆',()=>{follow=null;framed=null;resetView();},'ra-overview');
  const zoomOut=control('缩小地图','−',()=>zoomAt(.72)), zoomIn=control('放大地图','＋',()=>zoomAt(1.4));
  const locate=control('定位自己','◎',()=>focusPerson(snapshot.selfId),'ra-center');
  toolbar.append(fit,zoomOut,zoomIn,locate);stage.append(compass,scaleBar,toolbar);
  const legendBar=element('div','ra-legend');legendBar.append(legend('男士形象','ra-male'),legend('女士形象','ra-female'),legend('自己','ra-self'));
  const showLabel=element('label','ra-trail-toggle'), show=document.createElement('input');show.type='checkbox';show.checked=true;
  showLabel.append(show,document.createTextNode('行动轨迹'));legendBar.append(showLabel);
  sheet.append(stage,legendBar);
  const side=element('aside','ra-side'),sideHead=element('div','ra-list-head'),listTitle=element('h3','','在馆访客'),count=element('span','ra-count');
  sideHead.append(listTitle,count);
  const statusLine=element('p','ra-connection');statusLine.setAttribute('role','status');statusLine.hidden=true;
  const list=element('div','ra-people');list.setAttribute('role','group');list.setAttribute('aria-label','选择访客以跟随其位置');
  const readout=element('div','ra-readout');readout.hidden=true;
  side.append(sideHead,statusLine,list,readout);layout.append(sheet,side);dialog.append(head,layout);document.body.append(dialog);
  let status='online',snapshot={selfId:null,visitors:[]},latest=null,follow=null,framed=null,returnFocus=null;
  let width=0,height=0,vertical=false,scale=1,fitScale=1,cx=0,cy=0,base=[];
  const controllers=new Map(), visibleMarkers=new Map(),pointers=new Map();
  let press=null,dragged=false;
  const xy=(x,z)=>project(x,z,vertical),viewXY=(x,z)=>{const [u,v]=xy(x,z);return [width/2+(u-cx)*scale,height/2+(v-cy)*scale];};
  const current=v=>v.id===snapshot.selfId&&goodPoint(latest)?{...v,x:latest.x,z:latest.z,heading:latest.heading??v.heading}:v;

  function rect(box,cls,container) {
    const shape=svgNode('rect',{...projectBox(box,vertical),class:cls});container.append(shape);return shape;
  }
  function door(x0,z0,x1,z1,width,mount) {
    const a=xy(x0,z0),b=xy(x1,z1);mount.append(svgNode('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'ra-door','stroke-width':width}));
  }
  function drawBuilding() {
    architecture.replaceChildren();base=[];
    rect(courtBox,'ra-court',architecture);
    for(const wing of wings) {
      const plan=wing.plan, hall=halls[plan.index], hallBounds=hallBox(plan);
      const shape=rect(hallBounds,'ra-hall',architecture);
      shape.dataset.room=hall.id;shape.style.fill=plan.color;
      base.push({box:hallBounds,name:hall.name,kind:'hall',shape});
      // Mark each actual wall display by its measured span.
      for(const station of wallStations(plan,hall.scenes.length)){
        const [x,y]=xy(station.x-station.width/2,station.z),[x2,y2]=xy(station.x+station.width/2,station.z);
        architecture.append(svgNode('path',{d:'M'+x+' '+y+'L'+x2+' '+y2,class:'ra-exhibit'}));
      }
      rect(wing.terrace,'ra-terrace',architecture);
      door(plan.side*court.halfWidth,plan.centerZ-court.doorHalfWidth,plan.side*court.halfWidth,plan.centerZ+court.doorHalfWidth,.85,architecture);
      for(const gate of wing.gates)door(wing.outer,gate.z-gate.width/2,wing.outer,gate.z+gate.width/2,.85,architecture);
      for(const c of wing.caves) {
        const shape=rect(c.floorBox,'ra-cave',architecture);shape.dataset.cave=c.id;
        const title=c.id==='mogao-bl-or8210-p2'?'藏经洞书房':c.work.siteName+' '+c.work.number;
        const short=c.id==='mogao-bl-or8210-p2'?'书房':c.work.number;
        const room={box:c.floorBox,name:title,short,kind:'cave',shape,c};
        base.push(room);
        for (const obstacle of c.obstacles) {
          const a=toWorld(c,obstacle.x0,0,obstacle.z0),b=toWorld(c,obstacle.x1,0,obstacle.z1);
          rect({x0:a.x,x1:b.x,z0:a.z,z1:b.z},'ra-fitting',architecture);
        }
        const gap=caveDoorWidth(c)/2;door(c.mouth.x,c.mouth.z-gap,c.mouth.x,c.mouth.z+gap,.8,architecture);
      }
    }
    architecture.prepend(svgNode('title',{},'展厅与窟室'));
  }

  function boundedCentre() {
    const b=projectBox(worldBox,vertical),padding=14/scale;
    cx=clamp(cx,b.x-padding,b.x+b.width+padding);cy=clamp(cy,b.y-padding,b.y+b.height+padding);
  }
  function resetView() {
    const b=projectBox(worldBox,vertical);
    const sideSpace=vertical?22:52, topSpace=vertical?18:23, bottomSpace=vertical?60:47;
    fitScale=Math.max(.04,Math.min((width-sideSpace)/b.width,(height-topSpace-bottomSpace)/b.height));scale=fitScale;
    cx=b.x+b.width/2;cy=b.y+b.height/2+(bottomSpace-topSpace)/(2*scale);drawView();
  }
  function zoomAt(factor,sx=width/2,sy=height/2) {
    const old=scale;
    scale=clamp(scale*factor,fitScale,Math.max(fitScale*12,10));
    cx+=(sx-width/2)*(1/old-1/scale);cy+=(sy-height/2)*(1/old-1/scale);
    if(scale===fitScale){follow=null;framed=null;resetView();return;}
    boundedCentre();drawView();
  }
  function focusPerson(id) {
    const person=snapshot.visitors.find(row=>row.id===id);
    if(!person)return;
    follow=id;framed=null;const p=current(person);[cx,cy]=xy(p.x,p.z);
    scale=clamp(Math.max(scale,Math.min(width/48,height/35)),fitScale,Math.max(10,fitScale*12));drawView();
  }
  function frameRoom(item) {
    framed=item;follow=null;
    const b=projectBox(item.box,vertical);
    cx=b.x+b.width/2;cy=b.y+b.height/2;
    scale=clamp(Math.min(width/(b.width+14),height/(b.height+14)),fitScale,Math.max(10,fitScale*12));drawView();
  }

  function drawView() {
    if(!dialog.open||!width||!height)return;
    architecture.setAttribute('transform','translate('+width/2+','+height/2+') scale('+scale+') translate('+(-cx)+','+(-cy)+')');
    const roomInk=[],p=latest;
    for(const item of base) {
      const b=item.box,midX=(b.x0+b.x1)/2,midZ=(b.z0+b.z1)/2,[x,y]=viewXY(midX,midZ);
      const own=p&&p.x>=b.x0&&p.x<=b.x1&&p.z>=b.z0&&p.z<=b.z1;
      item.shape.classList.toggle('ra-current',!!own);
      if(x<0||x>width||y<0||y>height)continue;
      const size=projectBox(b,vertical), roomWidth=size.width*scale;
      const label=item.kind==='hall'?item.name:item.short;
      const font=item.kind==='hall'?clamp(roomWidth/label.length*.91,8.1,14):clamp(roomWidth/label.length*.9,8.2,12);
      if(item.kind==='cave' && (scale<fitScale*1.65 || roomWidth<label.length*font+2 || size.height*scale<13))continue;
      if(item.kind==='hall'&&roomWidth<label.length*font*.82)continue;
      roomInk.push(svgNode('text',{x,y:y+font*.34,'font-size':font,class:'ra-building-name '+item.kind},label));
    }
    labels.replaceChildren(...roomInk);
    const bar=[.5,1,2,5,10,20,50,100].filter(m=>m*scale<72).at(-1)||.5;
    scaleBar.style.width=(bar*scale)+'px';scaleBar.textContent=bar+' m';
    zoomOut.disabled=scale<=fitScale+.001;zoomIn.disabled=scale>=Math.max(10,fitScale*12)-.001;
    drawPeople();
  }

  function drawPeople() {
    if(!dialog.open||!width)return;
    if(follow) {
      const target=snapshot.visitors.find(v=>v.id===follow);
      if(target) {
        const p=current(target),[u,v]=xy(p.x,p.z);
        if(Math.abs(cx-u)+Math.abs(cy-v)>.02){cx=u;cy=v;drawView();return;}
      } else follow=null;
    }
    const live=new Set(snapshot.visitors.map(v=>v.id));
    for(const [id,marker] of visibleMarkers)if(!live.has(id)){
      marker.group.remove();marker.path.remove();visibleMarkers.delete(id);
    }
    for(const [id,row] of controllers) if(!live.has(id)){row.button.remove();controllers.delete(id);}
    for(const raw of snapshot.visitors) {
      const v=current(raw),self=v.id===snapshot.selfId,selected=v.id===follow,color=markerColor(v.avatarId);
      if(!goodPoint(v))continue;
      let painted=visibleMarkers.get(v.id);
      if(!painted){
        const path=svgNode('path',{class:'ra-trail'}),group=svgNode('g',{class:'ra-dot'});
        const hit=svgNode('circle',{r:13,fill:'transparent'}),ring=svgNode('circle',{class:'ra-ring',r:8.2}),circle=svgNode('circle',{r:4.8}),name=svgNode('title');
        const arrow=svgNode('path',{d:'M 6 -2.6 L 12 0 L 6 2.6 Z',class:'ra-facing'});
        const tag=svgNode('g',{class:'ra-tag','aria-hidden':'true'}),field=svgNode('rect',{rx:3,height:22,y:-35}),tagName=svgNode('text',{y:-20,'text-anchor':'middle'});
        tag.append(field,tagName);group.dataset.person=v.id;group.append(hit,arrow,ring,circle,name,tag);markers.append(group);paths.append(path);
        painted={group,ring,circle,path,name,arrow,tag,field,tagName};visibleMarkers.set(v.id,painted);
      }
      const [x,y]=viewXY(v.x,v.z);painted.group.setAttribute('transform','translate('+x+' '+y+')');
      painted.group.dataset.avatar=v.avatarId;painted.circle.setAttribute('fill',color);painted.name.textContent=v.name+' · '+locationName(v);
      painted.ring.style.display=self?'':'none';
      if(Number.isFinite(v.heading)){
        const [u,w]=xy(-Math.sin(v.heading),-Math.cos(v.heading));
        painted.arrow.setAttribute('transform','rotate('+Math.atan2(w,u)*180/Math.PI+')');
        painted.arrow.setAttribute('fill',color);
      }
      painted.arrow.style.display=scale>=fitScale*1.6&&Number.isFinite(v.heading)?'':'none';
      painted.group.classList.toggle('ra-focused',selected);
      if(painted.tagName.textContent!==v.name||!painted.tagWidth){
        painted.tagName.textContent=v.name;
        painted.tagWidth=painted.tagName.getComputedTextLength()+16;
        painted.field.setAttribute('width',painted.tagWidth);painted.field.setAttribute('x',-painted.tagWidth/2);
      }
      painted.path.setAttribute('stroke',color);painted.path.setAttribute('d',show.checked?trailPath(v.trail,viewXY):'');
      painted.path.classList.toggle('selected',selected);
      let row=controllers.get(v.id);
      if(!row) {
        const button=control('定位访客','',()=>focusPerson(v.id),'ra-person');
        const dot=element('i','ra-person-dot'),body=element('span','ra-person-body'),name=element('b'),place=element('small');
        const chevron=element('span','ra-person-arrow','›');chevron.setAttribute('aria-hidden','true');
        body.append(name,place);button.append(dot,body,chevron);list.append(button);row={button,dot,name,place};controllers.set(v.id,row);
      }
      row.dot.style.background=color;row.name.textContent=v.name+(self?'（我）':'');
      row.place.textContent=locationName(v);row.button.dataset.person=v.id;
      row.button.setAttribute('aria-label','定位'+v.name+'，'+row.place.textContent);
      row.button.setAttribute('aria-pressed',String(selected));
    }
    if(visibleMarkers.has(follow))markers.append(visibleMarkers.get(follow).group);
    locate.disabled=!snapshot.visitors.some(v=>v.id===snapshot.selfId);
    const connected=status==='online';
    listTitle.textContent=connected?'在馆访客':'访客位置';
    count.textContent=connected?snapshot.visitors.length+' 人':'';
    statusLine.hidden=connected;
    const statusLabel=status==='reconnecting'?'正在重连 · 上次位置':status==='offline'?'连接已断开 · 上次位置':'正在连接展馆…';
    if(!connected&&statusLine.textContent!==statusLabel)statusLine.textContent=statusLabel;
    const target=snapshot.visitors.find(v=>v.id===follow);
    readout.hidden=!target&&!framed;
    if(target||framed)readout.textContent=target?'正在跟随 '+target.name:framed.name;
  }
  function resize() {
    if(!dialog.open)return;
    const rect=stage.getBoundingClientRect(), nextVertical=rect.width<rect.height*1.17;
    const changed=width!==rect.width||height!==rect.height||vertical!==nextVertical;
    width=rect.width;height=rect.height;vertical=nextVertical;
    if(!changed||width<1||height<1)return;
    stage.classList.toggle('ra-vertical',vertical);
    svg.setAttribute('viewBox','0 0 '+width+' '+height);
    drawBuilding();resetView();
  }
  const observer=new ResizeObserver(resize);observer.observe(stage);
  const pos=e=>{const b=stage.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top];};
  stage.addEventListener('wheel',e=>{if(e.target.closest('.ra-tools'))return;e.preventDefault();zoomAt(Math.exp(clamp(-e.deltaY*.002,-.7,.7)),...pos(e));},{passive:false});
  stage.addEventListener('pointerdown',e=>{
    if(e.target.closest('.ra-tools')||e.button!==0)return;
    stage.focus({preventScroll:true});pointers.set(e.pointerId,pos(e));
    if(pointers.size===1){press={xy:pos(e),target:e.target};dragged=false;}else dragged=true;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove',e=>{
    const last=pointers.get(e.pointerId);if(!last)return;
    const point=pos(e),other=[...pointers].find(([id])=>id!==e.pointerId)?.[1];
    if(!dragged&&press&&Math.hypot(point[0]-press.xy[0],point[1]-press.xy[1])<4)return;
    dragged=true;follow=null;framed=null;pointers.set(e.pointerId,point);
    const weight=other ? .5 : 1;
    cx-=(point[0]-last[0])*weight/scale;cy-=(point[1]-last[1])*weight/scale;boundedCentre();
    if(other){
      const a=Math.hypot(last[0]-other[0],last[1]-other[1]),b=Math.hypot(point[0]-other[0],point[1]-other[1]);
      if(a>1&&b>1){zoomAt(b/a,(other[0]+point[0])/2,(other[1]+point[1])/2);return;}
    }
    drawView();
  });
  function releasePointer(e) {
    if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
    if(e.type==='pointerup'&&!dragged&&press){
      const id=press.target.closest('[data-person]')?.dataset.person;
      if(id)focusPerson(id);else{const room=base.find(r=>r.shape===press.target);if(room)frameRoom(room);}
    }
    if(!pointers.size)press=null;
  }
  stage.addEventListener('pointerup',releasePointer);stage.addEventListener('pointercancel',releasePointer);
  stage.addEventListener('keydown',e=>{
    if(e.target!==stage)return;
    const moves={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
    if(e.key==='+'||e.key==='=')zoomAt(1.4);
    else if(e.key==='-')zoomAt(.72);
    else if(e.key==='0'||e.key==='Home'){follow=null;framed=null;resetView();}
    else if(moves[e.key]){follow=null;framed=null;cx+=moves[e.key][0]*width*.14/scale;cy+=moves[e.key][1]*height*.14/scale;boundedCentre();drawView();}
    else return;e.preventDefault();e.stopPropagation();
  });
  show.addEventListener('change',drawPeople);
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{
    pointers.clear();onClose();
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    if(openStructureAfterClose){openStructureAfterClose=false;onStructure();}
  });
  return {
    open(){
      if(dialog.open)return true;returnFocus=document.activeElement;
      follow=null;framed=null;width=0;dialog.showModal();onOpen();resize();close.focus({preventScroll:true});return true;
    },
    setPresence(s){snapshot=s||{selfId:null,visitors:[]};drawPeople();},
    setStatus(value){if(value===status)return;status=value;drawPeople();},
    position(p){latest=p;if(dialog.open&&snapshot.selfId)drawPeople();},
    destroy(){if(dialog.open)dialog.close();observer.disconnect();dialog.remove();}
  };
}
