import {VISITORS} from './visitor-roster.js';
import {makeWalker,MAX_FRAME_SECONDS} from './walking.js';

let openDialog;
function stylesheet(){
  if(document.querySelector('link[data-guest-studio]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href=new URL('./guest-studio.css',import.meta.url).href;
  link.dataset.guestStudio='';document.head.append(link);
}

export async function openGuestStudio({avatarId,onChoose,trigger,startWalking=false}={}) {
  if(openDialog?.open){openDialog.focus();return openDialog;}
  stylesheet();
  const dialog=document.createElement('dialog');
  dialog.id='guest-studio';dialog.setAttribute('aria-labelledby','guest-studio-title');
  dialog.innerHTML=`<div class="gs-layout">
    <header class="gs-head"><div><small>石窟 / 入馆留名</small><h2 id="guest-studio-title">近看人物</h2></div><button class="gs-close" type="button" aria-label="关闭人物预览">×</button></header>
    <div class="gs-body">
      <div class="gs-view" tabindex="0" aria-label="人物三维预览，可拖动或按左右方向键旋转人物">
        <div class="gs-surface"></div><img class="gs-photo" alt="">
        <aside class="gs-reference" id="gs-reference" aria-label="人物采集参照" hidden>
          <button type="button" aria-label="收起采集参照">×</button>
          <figure><img alt=""><figcaption></figcaption></figure>
          <nav aria-label="参照图链接"><a class="gs-enlarge" target="_blank" rel="noopener noreferrer">放大参照图 ↗</a><a class="gs-origin" target="_blank" rel="noopener noreferrer">采集出处 ↗</a></nav>
        </aside>
        <div class="gs-modes" role="group" aria-label="取景"><button type="button" value="face" aria-pressed="false">面部</button><button type="button" value="portrait" aria-pressed="true">半身</button><button type="button" value="full" aria-pressed="false">全身</button><button type="button" value="feet" aria-pressed="false">脚步</button><button type="button" class="gs-walk" aria-pressed="false">试走几步</button></div>
        <div class="gs-rotate" role="group" aria-label="旋转人物"><button type="button" aria-label="向左旋转人物">↶</button><span>拖动旋转</span><button type="button" aria-label="向右旋转人物">↷</button></div>
      </div>
      <section class="gs-details" aria-label="形象选择">
        <div class="gs-caption"><span class="gs-gender"></span><h3 class="gs-name"></h3><p class="gs-description"></p></div>
        <div class="gs-pair" role="group" aria-label="切换形象"></div>
        <button class="gs-reference-toggle" type="button" aria-controls="gs-reference" aria-expanded="false" hidden>查看采集参照</button>
        <p class="gs-status" role="status"></p>
        <button class="gs-choose" type="button">选用此形象 <span aria-hidden="true">→</span></button>
      </section>
    </div></div>`;
  const $=selector=>dialog.querySelector(selector),stage=$('.gs-view'),surface=$('.gs-surface');
  const photo=$('.gs-photo'),status=$('.gs-status');
  const modes=[...dialog.querySelectorAll('.gs-modes button[value]')],walkButton=$('.gs-walk');
  const controls=[...dialog.querySelectorAll('.gs-rotate button')];
  const reference=$('.gs-reference'),refToggle=$('.gs-reference-toggle');
  function setReference(open){
    const ref=chosen.reference;
    open=!!(open&&ref);reference.hidden=!open;
    refToggle.setAttribute('aria-expanded',String(open));
    refToggle.textContent=open?'收起采集参照':'查看采集参照';
    if(open){
      const img=reference.querySelector('img');
      img.src=ref.image;img.alt=ref.caption;reference.querySelector('figcaption').textContent=ref.caption;
      reference.querySelector('.gs-enlarge').href=ref.image;
      reference.querySelector('.gs-origin').href=ref.url;
    }
  }
  refToggle.onclick=()=>setReference(reference.hidden);
  const closeReference=()=>{setReference(false);refToggle.focus();};
  reference.querySelector('button').onclick=closeReference;
  // A second native close request is not necessarily cancelable, especially
  // after the user has inspected both people without reopening the dialog.
  dialog.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!reference.hidden){e.preventDefault();e.stopPropagation();closeReference();}
  });
  dialog.addEventListener('cancel',e=>{if(!reference.hidden&&e.cancelable){e.preventDefault();closeReference();}});
  const opener=trigger||document.activeElement;
  let index=Math.max(0,VISITORS.findIndex(v=>v.id===avatarId)),framing='portrait';
  let chosen=VISITORS[index],disposed=false,actor,renderer,scene,camera,T,frame,observer,releaseLighting,releaseFloor;
  let desktopDetail=false,faceDetail=false;
  const wantsDetail=()=>framing==='face'?faceDetail:(framing==='portrait'||framing==='feet')&&desktopDetail;
  const subtractMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let yaw=.22,pointer=null,token=0,ready=false,hasRenderer=false,elapsed=0;
  let measureVisitor,frameVisitor,person,lastTime=0;
  const walker=makeWalker({snap:point=>({...point}),route:(_,to)=>[to],slide:(p,x,z)=>({x:p.x+x,z:p.z+z})});
  let walking=false,walkTime=0,cameraZ=0,cameraX=0;
  function resetWalk(){
    walking=false;walkTime=0;cameraZ=cameraX=0;walker.reset(0,0,0);
    walkButton.textContent='试走几步';walkButton.setAttribute('aria-pressed','false');
    if(actor){actor.root.position.set(0,0,0);actor.root.rotation.y=0;actor.reset();releaseLighting?.follow(0,0);}
  }
  function walkPreview(){
    if(!ready)return;
    if(walking){resetWalk();drawCamera();return;}
    const feet=framing==='feet';resetWalk();setFraming(feet?'feet':'full');yaw=feet?1.40:1.08;walking=true;
    walkButton.textContent='结束试走';walkButton.setAttribute('aria-pressed','true');drawCamera();
  }
  walkButton.onclick=walkPreview;
  const disarm=()=>{for(const b of [...modes,...controls,walkButton])b.disabled=!ready;};
  function describe(){
    chosen=VISITORS[index];
    setReference(false);refToggle.hidden=!chosen.reference;
    $('.gs-name').textContent=chosen.label;
    $('.gs-gender').textContent=chosen.profile;
    $('.gs-description').textContent=chosen.description;
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.value===chosen.id));
    photo.src=chosen.portrait;photo.alt=chosen.label+'肖像';
  }
  function drawCamera(){
    if(!ready||!camera||!renderer)return;
    const width=stage.clientWidth,height=stage.clientHeight;
    if(width<1||height<1)return;
    releaseLighting?.focus(framing);
    frameVisitor(camera,person,framing,yaw,cameraX,cameraZ);
  }
  function resize(){
    if(!stage.clientWidth||!stage.clientHeight||!renderer)return;
    renderer.setSize(stage.clientWidth,stage.clientHeight,false);
    camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();drawCamera();
  }
  function walkingAngle(time){const t=Math.max(0,Math.min(1,(time-2.2)/2.2));return .43*t*t*(3-2*t);}
  function advanceWalk(dt){
    walkTime+=dt;
    const curve=walkingAngle(walkTime);
    // Give two complete strides at the same pace before rounding the bend.
    // The gallery walker supplies its own acceleration and braking.
    const motion=walker.step(dt,walkTime<4.65?{x:Math.sin(curve),z:-Math.cos(curve)}:null,.88);
    const p=walker.state;actor.root.position.set(p.x,0,p.z);actor.root.rotation.y=p.heading;
    const art=walkTime>2.9?{x:p.x+1.35,y:person.eyeY+.04,z:p.z-2.4,kind:'art'}:null;
    actor.update({...motion,attention:art});
  }
  const syncClock=()=>{lastTime=performance.now();};
  document.addEventListener('visibilitychange',syncClock);
  function draw(time){
    if(disposed||!hasRenderer)return;
    frame=requestAnimationFrame(draw);
    if(!ready||document.hidden)return;
    // Follow the screen's refresh during a walk; a 32 ms gate made a 72 Hz
    // panel show only every third frame, which reads as uneven footfall.
    if(!walking&&time-lastTime<30)return;
    const dt=Math.min(MAX_FRAME_SECONDS,Math.max(0,(time-lastTime)/1000));lastTime=time;elapsed+=dt;
    if(walking){
      // Integrate missed display intervals in short steps so that contact
      // transfers still occur between two visible frames on a busy device.
      const steps=Math.max(1,Math.ceil(dt*30));
      for(let step=0;step<steps;step++)advanceWalk(dt/steps);
      const p=walker.state;
      releaseLighting.follow(p.x,p.z);
      const follow=1-Math.exp(-dt*(framing==='feet'?12:2.8));cameraZ+=(p.z-cameraZ)*follow;cameraX+=(p.x-cameraX)*follow;drawCamera();
      if(walkTime>5.9&&!walker.moving()&&!actor.isSettling()){
        walking=false;walkButton.textContent='再走一次';walkButton.setAttribute('aria-pressed','false');
      }
    }else{
      const p=actor.root.position;
      // Remain a visitor looking into the room. An orbit moves the observer,
      // never the exhibit the person is looking at.
      const cycle=elapsed%12;
      const glance=subtractMotion||cycle<5||cycle>9?0:Math.sin((cycle-5)*Math.PI/4)**2;
      const angle=.035+glance*.21;
      actor.update({dt,attention:{x:p.x+Math.sin(angle)*2.4,y:person.eyeY+.025*glance,z:p.z-Math.cos(angle)*2.4,kind:'visitor'}});
    }
    renderer.render(scene,camera);
  }
  function fallback(){
    ready=false;stage.dataset.mode='photo';disarm();
    status.textContent='当前显示人物肖像。';
  }
  async function display(){
    const revision=++token;resetWalk();ready=false;yaw=index===0?-.14:.15;elapsed=0;
    stage.dataset.mode='loading';describe();disarm();status.textContent='正在载入人物…';
    if(!actor){if(hasRenderer===false&&stage.dataset.failed)fallback();return;}
    try{
      // Make the walkable body visible first. The near scan can then arrive
      // without blocking this portrait, or restarting an ongoing movement.
      void actor.setDetail(false);
      if(!await actor.setAppearance(chosen.id))throw Error('model');
      if(disposed||revision!==token)return;
      actor.reset();actor.update({dt:1/60});scene.updateMatrixWorld(true);
      person=measureVisitor(actor.root);
      ready=true;disarm();drawCamera();renderer.render(scene,camera);
      stage.dataset.mode='model';status.textContent='';lastTime=performance.now();
      if(startWalking&&chosen.id===avatarId){
        startWalking=false;
        if(subtractMotion)setFraming('full');else walkPreview();
      }else void actor.setDetail(wantsDetail());
    }catch{if(!disposed&&revision===token)fallback();}
  }
  function turn(delta){if(!ready)return;yaw+=delta;drawCamera();}
  function setFraming(mode){
    if(!ready)return;if(mode!=='full'&&mode!=='feet'&&walking)resetWalk();framing=mode;
    void actor.setDetail(wantsDetail());
    for(const b of modes)b.setAttribute('aria-pressed',String(b.value===framing));
    drawCamera();
  }
  const buttons=VISITORS.map((visitor,i)=>{
    const b=document.createElement('button');b.type='button';b.value=visitor.id;
    b.textContent=(visitor.gender==='female'?'女访客':'男访客')+' · '+visitor.label;
    b.onclick=()=>{if(index!==i){startWalking=false;index=i;void display();}};
    $('.gs-pair').append(b);return b;
  });
  for(const b of modes)b.onclick=()=>setFraming(b.value);
  controls[0].onclick=()=>turn(-Math.PI/4);controls[1].onclick=()=>turn(Math.PI/4);
  stage.onkeydown=e=>{
    if(e.target!==stage)return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn(e.key==='ArrowRight'?.22:-.22);}
  };
  stage.onpointerdown=e=>{
    if(e.target.closest('button,a,.gs-reference')||!ready||e.button!==0)return;
    pointer={id:e.pointerId,x:e.clientX};stage.setPointerCapture(e.pointerId);
    stage.focus({preventScroll:true});stage.classList.add('gs-dragging');
  };
  stage.onpointermove=e=>{
    if(pointer?.id!==e.pointerId)return;
    turn((pointer.x-e.clientX)*.009);pointer.x=e.clientX;
  };
  stage.onlostpointercapture=stage.onpointercancel=stage.onpointerup=()=>{pointer=null;stage.classList.remove('gs-dragging');};
  $('.gs-close').onclick=()=>dialog.close();
  $('.gs-choose').onclick=()=>{dialog.close();onChoose?.(chosen.id);};
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{
    document.removeEventListener('visibilitychange',syncClock);
    disposed=true;++token;cancelAnimationFrame(frame);observer?.disconnect();actor?.dispose();
    releaseFloor?.();releaseLighting?.();
    if(renderer){renderer.dispose();renderer.forceContextLoss();}
    dialog.remove();if(openDialog===dialog)openDialog=null;
    if(opener?.isConnected)opener.focus({preventScroll:true});
  },{once:true});
  document.body.append(dialog);openDialog=dialog;dialog.showModal();$('.gs-close').focus();
  void display();
  async function start(){
    try{
      const [three,{makeVisitor},{portraitLight,portraitFloor},{fineVisitorDetail},framer]=await Promise.all([import('three'),import('./visitor-gait.js'),import('./portrait-light.js'),import('./visitor-model.js'),import('./portrait-camera.js')]);
      if(disposed)return;T=three;
      ({measureVisitor,frameVisitor}=framer);
      renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor(0,0);
      renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
      surface.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
      renderer.domElement.addEventListener('webglcontextlost',()=>{
        if(disposed)return;hasRenderer=false;stage.dataset.failed='true';cancelAnimationFrame(frame);
        actor?.dispose();actor=null;fallback();
      },{once:true});
      scene=new T.Scene();camera=new T.PerspectiveCamera(28,1,.05,15);
      releaseLighting=portraitLight(scene,renderer);releaseFloor=portraitFloor(scene,renderer);
      desktopDetail=fineVisitorDetail(renderer);
      faceDetail=renderer.capabilities.maxTextureSize>=4096&&(navigator.deviceMemory??6)>=4&&!navigator.connection?.saveData;
      actor=makeVisitor(()=>!disposed,()=>{},chosen.id,()=>0,false);
      scene.add(actor.root);hasRenderer=true;resize();
      observer=new ResizeObserver(resize);observer.observe(stage);
      await display();
      if(!disposed&&hasRenderer)frame=requestAnimationFrame(draw);
    }catch{if(!disposed){hasRenderer=false;stage.dataset.failed='true';fallback();}}
  }
  void start();
  return dialog;
}
