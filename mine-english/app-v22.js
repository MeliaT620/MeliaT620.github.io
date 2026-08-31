(async()=>{
  const host=document.getElementById('contentHost');
  const parts=await Promise.all([1,2,3].map(i=>fetch(`content-${i}.html?v=22`).then(r=>r.text())));
  host.innerHTML=parts.join('\n');
  initPage();
})();


function initPage(){
  const progress=document.getElementById('scrollProgress');
  const toc=document.getElementById('tocPanel');
  const backdrop=document.getElementById('tocBackdrop');
  const btn=document.getElementById('tocBtn');
  const close=document.getElementById('tocClose');
  const links=[...document.querySelectorAll('.toc-links a')];
  const setToc=open=>{toc.classList.toggle('open',open);backdrop.classList.toggle('open',open);btn.setAttribute('aria-expanded',open?'true':'false')};
  btn?.addEventListener('click',()=>setToc(!toc.classList.contains('open')));close?.addEventListener('click',()=>setToc(false));backdrop?.addEventListener('click',()=>setToc(false));links.forEach(a=>a.addEventListener('click',()=>setToc(false)));
  const update=()=>{const h=document.documentElement,max=h.scrollHeight-h.clientHeight,p=max>0?h.scrollTop/max*100:0;progress.style.width=p+'%';progress.style.setProperty('--progress',p)};
  document.addEventListener('scroll',update,{passive:true});update();
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting) links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{threshold:.18,rootMargin:'-15% 0px -60% 0px'});document.querySelectorAll('section[id]').forEach(s=>so.observe(s));
  initWordPeek();initJudgeScenes();initAccentToggles();initAudio();initReelAudio();initLearningProgress();initReflectionActions();
}

function initJudgeScenes(){
  document.querySelectorAll('.judge-scene').forEach(scene=>{
    const threshold=42;
    let active=false;
    let startX=0,startY=0,lastX=0;

    const resetTransient=()=>{
      scene.style.removeProperty('--left-glow');
      scene.style.removeProperty('--right-glow');
      scene.style.removeProperty('--left-spread');
      scene.style.removeProperty('--right-spread');
      scene.style.removeProperty('--left-width');
      scene.style.removeProperty('--right-width');
    };

    const setGlow=(dx)=>{
      const mag=Math.min(Math.abs(dx)/95,1);
      const eased=Math.pow(mag,.72);
      if(dx<0){
        scene.style.setProperty('--left-glow',eased.toFixed(3));
        scene.style.setProperty('--right-glow','0');
        scene.style.setProperty('--left-spread',(7+eased*25).toFixed(1)+'px');
        scene.style.setProperty('--left-width',(2.2+eased*2.2).toFixed(1)+'px');
      }else if(dx>0){
        scene.style.setProperty('--right-glow',eased.toFixed(3));
        scene.style.setProperty('--left-glow','0');
        scene.style.setProperty('--right-spread',(7+eased*25).toFixed(1)+'px');
        scene.style.setProperty('--right-width',(2.2+eased*2.2).toFixed(1)+'px');
      }
    };

    const reveal=(choice)=>{
      scene.classList.remove('known','not-yet','reconsidering');
      scene.classList.add(choice==='known'?'known':'not-yet');
      scene.dataset.choice=choice;
      scene.querySelectorAll('.answer-reveal').forEach(el=>el.classList.add('visible'));
      scene.querySelectorAll('.blank-target').forEach(el=>el.classList.add('revealed'));
      scene.querySelectorAll('.reveal-only-audio').forEach(el=>el.classList.add('visible'));
      resetTransient();
    };

    const onStart=(x,y)=>{
      active=true;startX=lastX=x;startY=y;
      scene.classList.add('reconsidering');
      scene.style.setProperty('--left-glow','0');
      scene.style.setProperty('--right-glow','0');
    };

    const onMove=(x,y,e)=>{
      if(!active)return;
      lastX=x;
      const dx=x-startX,dy=y-startY;
      if(Math.abs(dx)>Math.abs(dy)+6){
        if(e?.cancelable)e.preventDefault();
        setGlow(dx);
      }
    };

    const onEnd=()=>{
      if(!active)return;
      const dx=lastX-startX;
      active=false;
      if(dx<=-threshold) reveal('known');
      else if(dx>=threshold) reveal('not-yet');
      else{
        scene.classList.remove('reconsidering');
        resetTransient();
      }
    };

    scene.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a'))return;
      onStart(e.clientX,e.clientY);
      try{scene.setPointerCapture(e.pointerId)}catch(_){}
    });
    scene.addEventListener('pointermove',e=>onMove(e.clientX,e.clientY,e));
    scene.addEventListener('pointerup',e=>{
      onEnd();
      try{scene.releasePointerCapture(e.pointerId)}catch(_){}
    });
    scene.addEventListener('pointercancel',onEnd);

    scene.addEventListener('touchstart',e=>{
      if(e.target.closest('button,a'))return;
      const t=e.touches[0];if(!t)return;
      onStart(t.clientX,t.clientY);
    },{passive:true});
    scene.addEventListener('touchmove',e=>{
      const t=e.touches[0];if(!t)return;
      onMove(t.clientX,t.clientY,e);
    },{passive:false});
    scene.addEventListener('touchend',onEnd,{passive:true});

    let wheelDx=0,wheelTimer=null;
    scene.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
      e.preventDefault();
      scene.classList.add('reconsidering');
      wheelDx+=e.deltaX;
      // Positive deltaX corresponds to a leftward content gesture: show the left/green glow.
      setGlow(-wheelDx);
      clearTimeout(wheelTimer);
      wheelTimer=setTimeout(()=>{
        if(wheelDx>threshold) reveal('known');
        else if(wheelDx<-threshold) reveal('not-yet');
        else{
          scene.classList.remove('reconsidering');
          resetTransient();
        }
        wheelDx=0;
      },120);
    },{passive:false});
  });
}

function initAccentToggles(){
  const renderIpa=(raw,diff)=>{
    if(!raw)return '';
    if(!diff)return raw;
    const i=raw.lastIndexOf(diff);
    if(i<0)return raw;
    return raw.slice(0,i)+'<span class="ipa-diff">'+diff+'</span>'+raw.slice(i+diff.length);
  };

  document.addEventListener('click',e=>{
    const btn=e.target.closest('.accent-switch button');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const sw=btn.closest('.accent-switch');
    const line=sw.closest('.pron-line');
    const ipa=line?.querySelector('.ipa');
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
      const utter=new SpeechSynthesisUtterance(text);
      utter.lang=lang;utter.rate=rate;utter.volume=1;
      window.speechSynthesis.speak(utter);
    }catch(_){}
  };

  const getScope=(el)=>el.closest('.learning-scene,.peek-sheet,.reflection-screen')||document;
  const getAccent=(el)=>{
    const scope=getScope(el);
    return scope.querySelector('.accent-switch button.active')?.dataset.accent==='UK'?'UK':'US';
  };
  const langFor=(el)=>getAccent(el)==='UK'?'en-GB':'en-US';

  document.addEventListener('click',e=>{
    const wordBtn=e.target.closest('.word-audio');
    if(!wordBtn)return;
    e.preventDefault();e.stopPropagation();
    wordBtn.classList.add('playing');
    setTimeout(()=>wordBtn.classList.remove('playing'),500);
    // Hidden spelling is pronunciation-only. It makes the two lexical readings unmistakable
    // while the visible target remains exactly the word "lead".
    speak(wordBtn.dataset.wordAudio||'lead',langFor(wordBtn),.84);
  });

  const timers=new WeakMap();
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.example-audio');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const old=timers.get(btn);if(old)clearTimeout(old);
    const timer=setTimeout(()=>{
      btn.classList.add('playing');setTimeout(()=>btn.classList.remove('playing'),420);
      speak(btn.dataset.audioFocus||btn.dataset.focus||btn.dataset.full||'',langFor(btn),.9);
      timers.delete(btn);
    },230);
    timers.set(btn,timer);
  });

  document.addEventListener('dblclick',e=>{
    const btn=e.target.closest('.example-audio');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();
    const old=timers.get(btn);if(old)clearTimeout(old);
    timers.delete(btn);
    btn.classList.add('playing');setTimeout(()=>btn.classList.remove('playing'),500);
    speak(btn.dataset.audioFull||btn.dataset.full||btn.dataset.focus||'',langFor(btn),.92);
  });
}

function initWordPeek(){
  let overlay=document.getElementById('globalWordPeek');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='globalWordPeek';
    overlay.className='global-word-peek';
    overlay.innerHTML=`<div class="peek-sheet example-first-peek">
      <button class="peek-x" aria-label="关闭">×</button>
      <small>WORD OVERVIEW</small>
      <div class="peek-example">
        The pipe is <mark>made of <span class="core-word">lead</span></mark>.
        <button class="example-audio peek-example-audio"
                data-full="The pipe is made of lead."
                data-focus="made of lead"
                data-audio-full="The pipe is made of led."
                data-audio-focus="made of led"
                title="单击重听高亮 · 双击播放整句"
                aria-label="播放例句"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.8 5.5 6.7 8.9H4.5v6.2h2.2l4.1 3.4v-13Z"/><path d="M14.8 9.3a3.8 3.8 0 0 1 0 5.4"/><path d="M17.4 7a7.1 7.1 0 0 1 0 10"/></svg></button>
      </div>
      <div class="peek-translation">这根管子是铅制的。</div>
      <div class="word-divider peek-divider"></div>
      <div class="peek-word">lead</div>
      <div class="pron-line peek-pron">
        <span class="accent-switch" data-us="/led/" data-uk="/led/" data-diff="e">
          <button class="active" data-accent="US">US</button><button data-accent="UK">UK</button>
        </span>
        <span class="ipa">/l<span class="ipa-diff">e</span>d/</span>
        <button class="word-audio" data-word-audio="led" aria-label="播放 lead 名词读音"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.8 5.5 6.7 8.9H4.5v6.2h2.2l4.1 3.4v-13Z"/><path d="M14.8 9.3a3.8 3.8 0 0 1 0 5.4"/><path d="M17.4 7a7.1 7.1 0 0 1 0 10"/></svg></button>
      </div>
      <div class="micro-divider"></div>
      <div class="usage-meaning peek-usage">
        <span class="usage-pos">n. U</span>
        <div class="usage-explain"><div class="usage-zh">铅</div><div class="usage-en">a soft, heavy metal</div></div>
      </div>
      <div class="semantic-bridge peek-bridge">这里是金属“铅”，不是“带领”。</div>
      <div class="overview-story peek-story">同一个拼写会进入完全不同的 Usage：名词 lead 读 /led/；动词 lead 表示“带领”时读 /liːd/。</div>
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


function initReelAudio(){
  if(!('speechSynthesis' in window))return;
  const played=new WeakSet();
  const speakFocus=(scene)=>{
    if(played.has(scene))return;
    // Express must remain pure recall before the user reveals it.
    if(scene.dataset.stage==='review-express'&&!scene.dataset.choice)return;
    const btn=scene.querySelector('.example-audio:not(.reveal-only-audio)');
    const focus=btn?.dataset.audioFocus||btn?.dataset.focus;
    if(!focus)return;
    played.add(scene);
    const accent=scene.querySelector('.accent-switch button.active')?.dataset.accent==='UK'?'en-GB':'en-US';
    window.speechSynthesis.cancel();
    const utter=new SpeechSynthesisUtterance(focus);
    utter.lang=accent;utter.rate=.9;
    setTimeout(()=>window.speechSynthesis.speak(utter),260);
  };
  const reel=document.getElementById('learningReel');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.72)speakFocus(e.target)});
  },{threshold:[.72,.86],root:reel||null});
  document.querySelectorAll('.learning-scene').forEach(scene=>io.observe(scene));
}

function initLearningProgress(){
  const reel=document.getElementById('learningReel');
  const fill=document.getElementById('learningProgressFill');
  const label=document.getElementById('learningProgressText');
  if(!reel||!fill||!label)return;
  const scenes=[...reel.querySelectorAll('.learning-scene')];
  const update=()=>{
    const total=Math.max(scenes.length,1);
    const page=Math.min(total,Math.max(1,Math.round(reel.scrollTop/Math.max(reel.clientHeight,1))+1));
    let p=Math.min(100,Math.max(100/total,((reel.scrollTop+reel.clientHeight)/Math.max(reel.scrollHeight,1))*100));
    if(page===total)p=100;
    fill.style.width=p.toFixed(1)+'%';
    label.textContent=page+' / '+total;
  };
  reel.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
}

function initReflectionActions(){
  const screen=document.querySelector('.reflection-screen');
  if(!screen)return;
  const toast=screen.querySelector('.reflection-toast');
  const danmaku=screen.querySelector('.danmaku-layer');
  let toastTimer=null;
  const showToast=(msg)=>{
    if(!toast)return;
    toast.textContent=msg;toast.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1200);
  };
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
        const base=Number(btn.dataset.base||0);
        if(count)count.textContent=String(base+(active?1:0));
      }else if(type==='comment'){
        const hidden=!danmaku?.classList.contains('is-hidden');
        danmaku?.classList.toggle('is-hidden',hidden);
        btn.classList.toggle('active',!hidden);
        btn.setAttribute('aria-pressed',hidden?'false':'true');
      }else if(type==='share'){
        try{
          if(navigator.share){
            await navigator.share({title:'Mine English',url:location.href});
          }else if(navigator.clipboard){
            await navigator.clipboard.writeText(location.href);
            showToast('链接已复制');
          }else showToast('Share');
        }catch(_){}
      }
    });
  });
}
