(async()=>{
  const host=document.getElementById('contentHost');
  if(!host)return;
  try{
    const parts=await Promise.all([1,2,3].map(async i=>{
      const r=await fetch(`content-${i}.html?v=31`,{cache:'no-store'});
      if(!r.ok)throw new Error(`content-${i}: ${r.status}`);
      return r.text();
    }));
    host.innerHTML=parts.join('\n');
    initPage();
  }catch(err){
    console.error('Mine English failed to load',err);
    host.innerHTML='<div class="wrap" style="padding:80px 20px;text-align:center">页面加载失败，请刷新后重试。</div>';
  }
})();

function initPage(){
  initNavigation();
  initLearningReel();
  initAccentToggles();
  initAudio();
  initWordPeek();
  initReflection();
}

function initNavigation(){
  const progress=document.getElementById('scrollProgress');
  const toc=document.getElementById('tocPanel');
  const backdrop=document.getElementById('tocBackdrop');
  const btn=document.getElementById('tocBtn');
  const close=document.getElementById('tocClose');
  const links=[...document.querySelectorAll('.toc-links a')];
  const setToc=open=>{
    toc?.classList.toggle('open',open);
    backdrop?.classList.toggle('open',open);
    btn?.setAttribute('aria-expanded',open?'true':'false');
  };
  btn?.addEventListener('click',()=>setToc(!toc?.classList.contains('open')));
  close?.addEventListener('click',()=>setToc(false));
  backdrop?.addEventListener('click',()=>setToc(false));
  links.forEach(a=>a.addEventListener('click',()=>setToc(false)));

  const updateProgress=()=>{
    if(!progress)return;
    const h=document.documentElement;
    const max=h.scrollHeight-h.clientHeight;
    const p=max>0?h.scrollTop/max*100:0;
    progress.style.width=p+'%';
  };
  document.addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;
      links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
    }),{threshold:.18,rootMargin:'-15% 0px -60% 0px'});
    document.querySelectorAll('section[id]').forEach(s=>io.observe(s));
  }
}

function initLearningReel(){
  const reel=document.getElementById('learningReel');
  const track=document.getElementById('learningTrack');
  const fill=document.getElementById('learningProgressFill');
  const label=document.getElementById('learningProgressText');
  if(!reel||!track)return;

  const scenes=[...track.querySelectorAll('.learning-scene')];
  let index=0;
  let trackY=0;
  let settling=false;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const height=()=>Math.max(reel.clientHeight,1);
  const baseY=i=>-i*height();
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const isJudge=s=>!!s?.classList.contains('judge-scene');
  const isAnswered=s=>!isJudge(s)||!!s.dataset.choice;

  function setProgress(pageFloat=index){
    if(!fill||!label)return;
    const p=clamp((pageFloat+1)/scenes.length,1/scenes.length,1)*100;
    fill.style.width=p.toFixed(1)+'%';
    label.textContent=`${index+1} / ${scenes.length}`;
  }

  function setTrack(y,{animate=false}={}){
    trackY=y;
    track.classList.toggle('is-settling',animate&&!reduced);
    track.style.transform=`translate3d(0,${y}px,0)`;
    const pageFloat=clamp(-y/height(),0,scenes.length-1);
    setProgress(pageFloat);
  }

  function settle(next=index){
    next=clamp(next,0,scenes.length-1);
    index=next;
    settling=true;
    setTrack(baseY(index),{animate:true});
    if(label)label.textContent=`${index+1} / ${scenes.length}`;
    window.setTimeout(()=>{
      settling=false;
      track.classList.remove('is-settling');
      setTrack(baseY(index));
    },reduced?0:300);
  }

  function resetGlow(scene){
    if(!scene)return;
    scene.classList.remove('reconsidering');
    scene.style.setProperty('--left-glow','0');
    scene.style.setProperty('--right-glow','0');
    scene.style.setProperty('--left-spread','8px');
    scene.style.setProperty('--right-spread','8px');
  }

  function setGlow(scene,dx){
    if(!scene)return;
    const amount=clamp((Math.abs(dx)-18)/115,0,1);
    const eased=Math.pow(amount,.78);
    scene.classList.add('reconsidering');
    if(dx<0){
      scene.style.setProperty('--left-glow',eased.toFixed(3));
      scene.style.setProperty('--right-glow','0');
      scene.style.setProperty('--left-spread',(7+26*eased).toFixed(1)+'px');
    }else{
      scene.style.setProperty('--right-glow',eased.toFixed(3));
      scene.style.setProperty('--left-glow','0');
      scene.style.setProperty('--right-spread',(7+26*eased).toFixed(1)+'px');
    }
  }

  function choose(scene,choice){
    if(!scene||!isJudge(scene))return;
    scene.dataset.choice=choice;
    scene.classList.remove('known','not-yet','reconsidering');
    scene.classList.add(choice==='known'?'known':'not-yet');
    scene.querySelectorAll('.blank-target').forEach(el=>el.classList.add('revealed'));
    resetGlow(scene);
    scene.classList.add(choice==='known'?'known':'not-yet');
  }

  const gesture={active:false,mode:'idle',pointerId:null,startX:0,startY:0,lastX:0,lastY:0,startTime:0};
  const axisStart=12;
  const horizontalRatio=1.58;
  const verticalRatio=1.24;
  const judgeThreshold=82;

  reel.addEventListener('pointerdown',e=>{
    if(settling||e.target.closest('button,a'))return;
    gesture.active=true;
    gesture.mode='pending';
    gesture.pointerId=e.pointerId;
    gesture.startX=gesture.lastX=e.clientX;
    gesture.startY=gesture.lastY=e.clientY;
    gesture.startTime=performance.now();
    try{reel.setPointerCapture(e.pointerId)}catch(_){}
  });

  reel.addEventListener('pointermove',e=>{
    if(!gesture.active||e.pointerId!==gesture.pointerId)return;
    gesture.lastX=e.clientX;
    gesture.lastY=e.clientY;
    const dx=e.clientX-gesture.startX;
    const dy=e.clientY-gesture.startY;
    const ax=Math.abs(dx),ay=Math.abs(dy);

    if(gesture.mode==='pending'){
      if(ay>=axisStart&&ay>ax*verticalRatio+3){
        gesture.mode='vertical';
        resetGlow(scenes[index]);
      }else if(ax>=18&&ax>ay*horizontalRatio+6&&isJudge(scenes[index])){
        gesture.mode='horizontal';
      }else return;
    }

    if(gesture.mode==='horizontal'){
      if(e.cancelable)e.preventDefault();
      setGlow(scenes[index],dx);
      return;
    }

    if(gesture.mode==='vertical'){
      if(e.cancelable)e.preventDefault();
      const h=height();
      let visualDy=dy;
      if((dy>0&&index===0)||(dy<0&&index===scenes.length-1))visualDy=dy*.18;
      if(dy<0&&!isAnswered(scenes[index]))visualDy=Math.max(dy*.16,-42);
      const minY=baseY(Math.min(index+1,scenes.length-1));
      const maxY=baseY(Math.max(index-1,0));
      let y=baseY(index)+visualDy;
      y=clamp(y,minY-42,maxY+42);
      setTrack(y);
    }
  },{passive:false});

  function endPointer(e){
    if(!gesture.active||e.pointerId!==gesture.pointerId)return;
    const dx=gesture.lastX-gesture.startX;
    const dy=gesture.lastY-gesture.startY;
    const duration=Math.max(performance.now()-gesture.startTime,1);
    const velocityY=dy/duration;
    const mode=gesture.mode;
    gesture.active=false;
    gesture.mode='idle';
    try{reel.releasePointerCapture(e.pointerId)}catch(_){}

    if(mode==='horizontal'){
      const scene=scenes[index];
      if(Math.abs(dx)>=judgeThreshold&&Math.abs(dx)>Math.abs(dy)*horizontalRatio){
        choose(scene,dx<0?'known':'not-yet');
      }else resetGlow(scene);
      settle(index);
      return;
    }

    if(mode==='vertical'){
      const h=height();
      const farEnough=Math.abs(dy)>=h*.22;
      const fastEnough=Math.abs(velocityY)>.68&&Math.abs(dy)>48;
      if(dy<0){
        if(isAnswered(scenes[index])&&index<scenes.length-1&&(farEnough||fastEnough))settle(index+1);
        else settle(index);
      }else if(dy>0){
        if(index>0&&(farEnough||fastEnough))settle(index-1);
        else settle(index);
      }else settle(index);
      return;
    }
    settle(index);
  }
  reel.addEventListener('pointerup',endPointer);
  reel.addEventListener('pointercancel',endPointer);

  let wheelY=0,wheelX=0,wheelTimer=null,wheelMode='idle',wheelCooling=false;
  const finishWheel=()=>{
    const scene=scenes[index];
    if(wheelMode==='horizontal'){
      if(isJudge(scene)&&Math.abs(wheelX)>=105)choose(scene,wheelX>0?'known':'not-yet');
      else resetGlow(scene);
      settle(index);
    }else if(wheelMode==='vertical'){
      const h=height();
      if(wheelY>h*.2&&isAnswered(scene)&&index<scenes.length-1)settle(index+1);
      else if(wheelY< -h*.2&&index>0)settle(index-1);
      else settle(index);
    }
    wheelY=wheelX=0;wheelMode='idle';
    wheelCooling=true;
    setTimeout(()=>wheelCooling=false,240);
  };

  reel.addEventListener('wheel',e=>{
    if(settling||wheelCooling)return;
    const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);
    if(ax<3&&ay<3)return;

    if(wheelMode==='idle'){
      if(ax>ay*1.55&&isJudge(scenes[index]))wheelMode='horizontal';
      else if(ay>ax*1.2)wheelMode='vertical';
      else return;
    }
    e.preventDefault();

    if(wheelMode==='horizontal'){
      wheelX+=e.deltaX;
      setGlow(scenes[index],-wheelX);
    }else{
      wheelY+=e.deltaY;
      const h=height();
      let preview=wheelY;
      if(wheelY>0&&!isAnswered(scenes[index]))preview=Math.min(wheelY*.15,42);
      if((wheelY<0&&index===0)||(wheelY>0&&index===scenes.length-1))preview=wheelY*.18;
      preview=clamp(preview,-h*.55,h*.55);
      setTrack(baseY(index)-preview);
    }
    clearTimeout(wheelTimer);
    wheelTimer=setTimeout(finishWheel,130);
  },{passive:false});

  reel.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '){
      e.preventDefault();
      if(isAnswered(scenes[index])&&index<scenes.length-1)settle(index+1);
    }else if(e.key==='ArrowUp'||e.key==='PageUp'){
      e.preventDefault();
      if(index>0)settle(index-1);
    }else if(e.key==='ArrowLeft'&&isJudge(scenes[index])){
      e.preventDefault();choose(scenes[index],'known');
    }else if(e.key==='ArrowRight'&&isJudge(scenes[index])){
      e.preventDefault();choose(scenes[index],'not-yet');
    }
  });

  window.addEventListener('resize',()=>{
    track.classList.remove('is-settling');
    setTrack(baseY(index));
  },{passive:true});

  setTrack(0);
}

function initAccentToggles(){
  const renderIpa=(raw,diff)=>{
    if(!raw||!diff)return raw||'';
    const i=raw.lastIndexOf(diff);
    if(i<0)return raw;
    return raw.slice(0,i)+'<span class="ipa-diff">'+diff+'</span>'+raw.slice(i+diff.length);
  };
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.accent-switch button');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const sw=btn.closest('.accent-switch');
    const ipa=sw.closest('.pron-line')?.querySelector('.ipa');
    sw.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
    const raw=btn.dataset.accent==='UK'?sw.dataset.uk:sw.dataset.us;
    if(ipa)ipa.innerHTML=renderIpa(raw,sw.dataset.diff||'');
  });
}

function initAudio(){
  const speak=(text,lang='en-US',rate=.92)=>{
    if(!text||!('speechSynthesis' in window))return;
    try{
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang=lang;u.rate=rate;u.volume=1;
      window.speechSynthesis.speak(u);
    }catch(_){}
  };
  const scopeFor=el=>el.closest('.learning-scene,.reflection-screen,.peek-sheet')||document;
  const langFor=el=>scopeFor(el).querySelector('.accent-switch button.active')?.dataset.accent==='UK'?'en-GB':'en-US';

  document.addEventListener('click',e=>{
    const btn=e.target.closest('.word-audio');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    speak(btn.dataset.pronounce||'lead',langFor(btn),.84);
  });

  const timers=new WeakMap();
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.example-audio');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const old=timers.get(btn);if(old)clearTimeout(old);
    timers.set(btn,setTimeout(()=>{
      speak(btn.dataset.audioFocus||btn.dataset.focus||btn.dataset.full||'',langFor(btn),.9);
      timers.delete(btn);
    },220));
  });
  document.addEventListener('dblclick',e=>{
    const btn=e.target.closest('.example-audio');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const old=timers.get(btn);if(old)clearTimeout(old);
    timers.delete(btn);
    speak(btn.dataset.audioFull||btn.dataset.full||btn.dataset.focus||'',langFor(btn),.92);
  });
}

function initWordPeek(){
  let overlay=document.getElementById('globalWordPeek');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='globalWordPeek';
    overlay.className='global-word-peek';
    overlay.innerHTML=`<div class="peek-sheet">
      <button class="peek-x" aria-label="关闭">×</button>
      <small>WORD OVERVIEW</small>
      <div class="peek-example">The pipe is <mark>made of <span class="core-word">lead</span></mark>.</div>
      <div class="peek-translation">这根管子是铅制的。</div>
      <div class="peek-word">lead</div>
      <div class="pron-line"><span class="ipa">/led/ · /liːd/</span><button class="word-audio" data-pronounce="led" aria-label="播放 lead 名词读音">🔊</button></div>
      <div class="peek-bridge">同一个拼写，会进入两个完全不同的 Usage 和读音。</div>
      <div class="peek-story">名词 lead “铅”读 /led/；动词 lead “带领”读 /liːd/。Mine 分开追踪它们的记忆状态，而不是把整个 Word 粗略地判成“会”或“不会”。</div>
    </div>`;
    document.body.appendChild(overlay);
  }
  document.addEventListener('click',e=>{
    const target=e.target.closest('[data-peek]');
    if(!target)return;
    e.preventDefault();e.stopPropagation();
    overlay.classList.add('open');
  });
  overlay.querySelector('.peek-x')?.addEventListener('click',()=>overlay.classList.remove('open'));
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
}

function initReflection(){
  const screen=document.querySelector('.reflection-screen');
  if(!screen)return;
  const layer=document.getElementById('danmakuLayer');
  const bubble=document.getElementById('danmakuBubble');
  const toast=document.getElementById('reflectionToast');
  const comments=[
    ['原来这个 lead 和“带领”的读音完全不一样','♡ 32'],
    ['made of lead 整块记，比单背词义自然多了','♡ 18']
  ];
  let commentIndex=0;
  let commentTimer=null;
  let toastTimer=null;

  const showToast=msg=>{
    if(!toast)return;
    toast.textContent=msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),1200);
  };

  const showComment=()=>{
    if(!layer||!bubble||layer.classList.contains('is-hidden'))return;
    const [text,likes]=comments[commentIndex%comments.length];
    commentIndex++;
    bubble.innerHTML=`${text} <b>${likes}</b>`;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
  };
  const scheduleComments=()=>{
    clearInterval(commentTimer);
    showComment();
    commentTimer=setInterval(showComment,6200);
  };
  setTimeout(scheduleComments,800);

  screen.querySelectorAll('.social-action').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      const type=btn.dataset.social;
      if(type==='like'||type==='save'){
        const active=!btn.classList.contains('active');
        btn.classList.toggle('active',active);
        btn.setAttribute('aria-pressed',active?'true':'false');
        const icon=btn.querySelector('span');
        if(icon)icon.textContent=type==='like'?(active?'♥':'♡'):(active?'★':'☆');
        const count=btn.querySelector('.social-count');
        if(count)count.textContent=String(Number(btn.dataset.base||0)+(active?1:0));
      }else if(type==='comment'){
        const hide=!layer?.classList.contains('is-hidden');
        layer?.classList.toggle('is-hidden',hide);
        btn.classList.toggle('active',!hide);
        btn.setAttribute('aria-pressed',hide?'false':'true');
        if(!hide)scheduleComments();
      }else if(type==='share'){
        try{
          if(navigator.share)await navigator.share({title:'Mine English',url:location.href});
          else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);showToast('链接已复制');}
          else showToast('Share');
        }catch(_){}
      }
    });
  });
}
