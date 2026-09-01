/* Mine English v81 — three-page Learning reel with one-page lock, spatial audio and real Review timing. */
(function(){
  function initLearningV81(){
    const screen=document.getElementById('learningScreenV74');
    const device=document.getElementById('learningDeviceV74');
    const track=document.getElementById('learningTrackV77');
    const progress=document.getElementById('learningProgressV77');
    if(!screen||!device||!track)return false;
    if(screen.dataset.v81Ready==='1')return true;
    screen.dataset.v81Ready='1';

    const pages=[...track.querySelectorAll('.learning-page-v77')];
    if(!pages.length)return false;
    const learningPages=pages.filter(p=>p.dataset.complete!=='true');

    const horizontalThreshold=42;
    const directionStart=12;
    const directionRatio=1.32;
    let pageIndex=0;
    let active=false,startX=0,startY=0,lastX=0,lastY=0,mode='pending';
    let settleTimer=0;
    let transitionLocked=false;
    let suppressAudioUntil=0;
    let audioTimer=0;

    /* Real Review session timing: first interaction on page 1 -> first arrival at Review Complete. */
    let sessionStartedAt=0;
    let sessionEndedAt=0;
    const statUsage=document.getElementById('reviewUsageCountV81');
    const statStable=document.getElementById('reviewStableCountV81');
    const statWords=document.getElementById('reviewWordCountV81');
    const statDuration=document.getElementById('reviewDurationV81');

    const currentPage=()=>pages[pageIndex];
    const pageChoice=()=>currentPage()?.dataset.choice||'';
    const isComplete=()=>currentPage()?.dataset.complete==='true';
    const screenHeight=()=>Math.max(screen.clientHeight,1);
    const baseY=()=>-pageIndex*screenHeight();

    const ensureSessionStarted=()=>{
      if(!sessionStartedAt&&pageIndex===0)sessionStartedAt=performance.now();
    };
    const formatDuration=ms=>{
      let total=Math.max(0,Math.round(ms/1000));
      const h=Math.floor(total/3600);total%=3600;
      const m=Math.floor(total/60),s=total%60;
      if(h>0)return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      return `${m}:${String(s).padStart(2,'0')}`;
    };
    const updateCompleteStats=()=>{
      const stable=learningPages.filter(p=>p.dataset.choice==='known').length;
      if(statUsage)statUsage.textContent=String(learningPages.length);
      if(statStable)statStable.textContent=String(stable);
      if(statWords)statWords.textContent='1';
      const end=sessionEndedAt||performance.now();
      const start=sessionStartedAt||end;
      if(statDuration)statDuration.textContent=formatDuration(end-start);
    };
    const finishSession=()=>{
      if(!sessionStartedAt)sessionStartedAt=performance.now();
      if(!sessionEndedAt)sessionEndedAt=performance.now();
      updateCompleteStats();
    };

    const setTrack=(y,animate=false)=>{
      track.classList.toggle('is-settling',animate);
      track.style.transform=`translate3d(0,${y}px,0)`;
    };
    const updateProgress=()=>{
      if(progress)progress.style.width=(((pageIndex+1)/pages.length)*100).toFixed(1)+'%';
    };
    const setVars=(side,{opacity=0,width=2.2,spread=7,spread2=12}={})=>{
      screen.style.setProperty(`--${side}-glow`,Number(opacity).toFixed(3));
      screen.style.setProperty(`--${side}-width`,Number(width).toFixed(1)+'px');
      screen.style.setProperty(`--${side}-spread`,Number(spread).toFixed(1)+'px');
      screen.style.setProperty(`--${side}-spread2`,Number(spread2).toFixed(1)+'px');
    };
    const clearGlowVars=()=>{setVars('left');setVars('right')};

    const syncPersistent=()=>{
      const choice=pageChoice();
      screen.classList.remove('known','not-yet','reconsidering');
      device.classList.remove('swiping-known','swiping-notyet','judged-known','judged-notyet');
      clearGlowVars();
      if(choice==='known'){
        screen.classList.add('known');device.classList.add('judged-known');
      }else if(choice==='not-yet'){
        screen.classList.add('not-yet');device.classList.add('judged-notyet');
      }
    };
    const resetHorizontal=()=>{
      screen.classList.remove('reconsidering');
      device.classList.remove('swiping-known','swiping-notyet');
      clearGlowVars();syncPersistent();
    };
    const transientFor=(p,isPersistent=false)=>{
      if(isPersistent)return {opacity:.72+.28*p,width:4+.4*p,spread:18+14*p,spread2:34+20*p};
      const spread=7+25*p;
      return {opacity:p,width:2.2+2.2*p,spread,spread2:spread*1.7};
    };
    const fadingOld=p=>({
      opacity:Math.max(0,.72*(1-p)),width:Math.max(2.2,4-1.8*p),spread:Math.max(7,18-11*p),spread2:Math.max(12,34-22*p)
    });
    const setGlow=dx=>{
      if(!dx||isComplete())return;
      const mag=Math.min(Math.abs(dx)/95,1),eased=Math.pow(mag,.72);
      const current=pageChoice();
      const toward=dx<0?'known':'not-yet';
      const targetSide=toward==='known'?'left':'right';
      const otherSide=targetSide==='left'?'right':'left';
      const same=current===toward,changing=!!current&&!same;
      screen.classList.add('reconsidering');
      device.classList.toggle('swiping-known',toward==='known');
      device.classList.toggle('swiping-notyet',toward==='not-yet');
      setVars(targetSide,transientFor(eased,same));
      if(changing)setVars(otherSide,fadingOld(eased));else setVars(otherSide);
    };
    const reveal=choice=>{
      if(isComplete())return;
      const page=currentPage();if(!page)return;
      page.dataset.choice=choice;
      page.classList.toggle('known',choice==='known');
      page.classList.toggle('not-yet',choice==='not-yet');
      syncPersistent();
      updateCompleteStats();
    };

    const canMoveForward=()=>pageIndex<pages.length-1&&!!pageChoice();
    const canMoveBackward=()=>pageIndex>0;

    /* One-page contract: while a reel is settling, no second settle can be scheduled. */
    const settleTo=target=>{
      if(transitionLocked)return false;
      target=Math.max(0,Math.min(pages.length-1,target));
      transitionLocked=true;
      clearTimeout(settleTimer);
      screen.classList.remove('vertical-dragging','reconsidering');
      screen.classList.add('vertical-settling');
      device.classList.remove('swiping-known','swiping-notyet');
      clearGlowVars();
      suppressAudioUntil=Date.now()+420;
      pageIndex=target;
      updateProgress();
      setTrack(baseY(),true);
      settleTimer=setTimeout(()=>{
        track.classList.remove('is-settling');
        screen.classList.remove('vertical-settling');
        transitionLocked=false;
        syncPersistent();
        if(isComplete())finishSession();
      },320);
      return true;
    };

    const drawVertical=dy=>{
      if(transitionLocked)return;
      screen.classList.add('vertical-dragging');
      screen.classList.remove('reconsidering');
      device.classList.remove('swiping-known','swiping-notyet');
      clearGlowVars();
      const goingForward=dy<0,goingBackward=dy>0;
      let allowed=dy;
      if(goingForward&&!canMoveForward())allowed=0;
      else if(goingBackward&&!canMoveBackward())allowed=dy*.10;
      else if(goingForward&&pageIndex>=pages.length-1)allowed=dy*.10;
      setTrack(baseY()+allowed,false);
    };

    const start=(x,y)=>{
      if(transitionLocked)return false;
      ensureSessionStarted();
      active=true;mode='pending';startX=lastX=x;startY=lastY=y;
      track.classList.remove('is-settling');clearTimeout(settleTimer);
      return true;
    };
    const move=(x,y,e)=>{
      if(!active||transitionLocked)return;
      lastX=x;lastY=y;
      const dx=x-startX,dy=y-startY,ax=Math.abs(dx),ay=Math.abs(dy);
      if(mode==='pending'){
        if(ax<directionStart&&ay<directionStart)return;
        if(ax>=directionStart&&ax>ay*directionRatio)mode=isComplete()?'blocked':'horizontal';
        else if(ay>=directionStart&&ay>ax*directionRatio)mode='vertical';
        else return;
      }
      if(e?.cancelable)e.preventDefault();
      if(mode==='horizontal')setGlow(dx);else if(mode==='vertical')drawVertical(dy);
    };
    const end=()=>{
      if(!active)return;
      const dx=lastX-startX,dy=lastY-startY,finalMode=mode;
      active=false;mode='pending';
      if(finalMode!=='pending'||Math.hypot(dx,dy)>10)suppressAudioUntil=Date.now()+360;
      if(finalMode==='horizontal'){
        if(dx<=-horizontalThreshold)reveal('known');
        else if(dx>=horizontalThreshold)reveal('not-yet');
        else resetHorizontal();
        return;
      }
      if(finalMode==='vertical'){
        const threshold=Math.max(72,screenHeight()*.15);
        if(dy<=-threshold&&canMoveForward())settleTo(pageIndex+1);
        else if(dy>=threshold&&canMoveBackward())settleTo(pageIndex-1);
        else settleTo(pageIndex);
        return;
      }
      syncPersistent();
    };

    /* ---------- Learning spatial audio ---------- */
    const speak=(text,lang='en-US',rate=.9)=>{
      if(!text||!('speechSynthesis' in window))return;
      try{
        window.speechSynthesis.cancel();
        const utter=new SpeechSynthesisUtterance(text);
        utter.lang=lang;utter.rate=rate;utter.volume=1;
        window.speechSynthesis.speak(utter);
      }catch(_){}
    };
    const localeFor=page=>page?.querySelector('.accent-toggle')?.dataset.accent==='UK'?'en-GB':'en-US';
    const playSpatialAudio=(e,full=false)=>{
      if(Date.now()<suppressAudioUntil||isComplete())return;
      if(e.target.closest('button,a,[data-peek]'))return;
      const page=currentPage();if(!page)return;
      const upper=page.querySelector('.learning-upper-v74');
      const lower=page.querySelector('.demo-lower');
      const divider=page.querySelector('.support-divider');
      if(!upper)return;
      const answered=!!page.dataset.choice;
      if(!answered){
        if(page.dataset.preanswerAudio==='none')return;
        const text=upper.dataset.fullAudio||upper.dataset.focusAudio;
        if(text)speak(text,localeFor(page),.9);
        return;
      }
      const boundary=divider?.getBoundingClientRect().top??Infinity;
      if(e.clientY>boundary&&lower){
        const word=lower.dataset.wordAudio;if(word)speak(word,localeFor(page),.84);return;
      }
      const text=full?(upper.dataset.fullAudio||upper.dataset.focusAudio):(upper.dataset.focusAudio||upper.dataset.fullAudio);
      if(text)speak(text,localeFor(page),.9);
    };
    screen.addEventListener('click',e=>{
      if(Date.now()<suppressAudioUntil||e.target.closest('button,a,[data-peek]'))return;
      clearTimeout(audioTimer);audioTimer=setTimeout(()=>playSpatialAudio(e,false),220);
    });
    screen.addEventListener('dblclick',e=>{
      if(Date.now()<suppressAudioUntil||e.target.closest('button,a,[data-peek]'))return;
      e.preventDefault();clearTimeout(audioTimer);playSpatialAudio(e,true);
    });

    screen.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a,[data-peek]'))return;
      if(!start(e.clientX,e.clientY))return;
      try{screen.setPointerCapture(e.pointerId)}catch(_){}
    });
    screen.addEventListener('pointermove',e=>move(e.clientX,e.clientY,e),{passive:false});
    screen.addEventListener('pointerup',e=>{end();try{screen.releasePointerCapture(e.pointerId)}catch(_){}});
    screen.addEventListener('pointercancel',end);

    /* Trackpad/mouse wheel: one physical burst may advance AT MOST one page. */
    let wheelX=0,wheelY=0,wheelMode='pending',wheelTimer=0;
    let wheelPageCommitted=false,wheelReleaseTimer=0;
    const releaseWheelLockLater=(delay=420)=>{
      clearTimeout(wheelReleaseTimer);
      wheelReleaseTimer=setTimeout(()=>{wheelPageCommitted=false},delay);
    };
    const finishWheel=()=>{
      suppressAudioUntil=Date.now()+340;
      if(wheelMode==='horizontal'){
        if(wheelX>horizontalThreshold)reveal('known');
        else if(wheelX<-horizontalThreshold)reveal('not-yet');
        else resetHorizontal();
      }else if(wheelMode==='vertical'){
        const threshold=Math.max(58,screenHeight()*.11);
        let target=pageIndex;
        if(wheelY>threshold&&canMoveForward())target=pageIndex+1;
        else if(wheelY<-threshold&&canMoveBackward())target=pageIndex-1;
        wheelPageCommitted=true;
        releaseWheelLockLater(500);
        settleTo(target);
      }else syncPersistent();
      wheelX=wheelY=0;wheelMode='pending';
    };

    screen.addEventListener('wheel',e=>{
      ensureSessionStarted();
      if(wheelPageCommitted||transitionLocked){
        e.preventDefault();
        releaseWheelLockLater(260);
        return;
      }
      const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);
      if(wheelMode==='pending'){
        if(ax>ay*1.25)wheelMode=isComplete()?'blocked':'horizontal';
        else if(ay>ax*1.25)wheelMode='vertical';
        else return;
      }
      e.preventDefault();suppressAudioUntil=Date.now()+320;
      if(wheelMode==='horizontal'){
        wheelX+=e.deltaX;setGlow(-wheelX);
      }else if(wheelMode==='vertical'){
        wheelY+=e.deltaY;drawVertical(-wheelY);
      }
      clearTimeout(wheelTimer);wheelTimer=setTimeout(finishWheel,130);
    },{passive:false});

    screen.addEventListener('keydown',e=>{
      ensureSessionStarted();
      if(transitionLocked)return;
      if(e.key==='ArrowLeft'&&!isComplete()){
        e.preventDefault();setGlow(-60);setTimeout(()=>reveal('known'),90);
      }else if(e.key==='ArrowRight'&&!isComplete()){
        e.preventDefault();setGlow(60);setTimeout(()=>reveal('not-yet'),90);
      }else if(e.key==='ArrowUp'){
        e.preventDefault();if(canMoveForward())settleTo(pageIndex+1);else settleTo(pageIndex);
      }else if(e.key==='ArrowDown'){
        e.preventDefault();if(canMoveBackward())settleTo(pageIndex-1);else settleTo(pageIndex);
      }
    });

    window.addEventListener('resize',()=>{if(!transitionLocked)setTrack(baseY(),false)},{passive:true});
    updateProgress();updateCompleteStats();setTrack(0,false);syncPersistent();
    return true;
  }

  function boot(){
    if(initLearningV81())return;
    const timer=setInterval(()=>{if(initLearningV81())clearInterval(timer)},120);
    setTimeout(()=>clearInterval(timer),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
