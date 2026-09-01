/* Mine English v79 — three-page Learning reel with direction lock, spatial audio and Review Complete. */
(function(){
  function initLearningV79(){
    const screen=document.getElementById('learningScreenV74');
    const device=document.getElementById('learningDeviceV74');
    const track=document.getElementById('learningTrackV77');
    const progress=document.getElementById('learningProgressV77');
    if(!screen||!device||!track)return false;
    if(screen.dataset.v79Ready==='1')return true;
    screen.dataset.v79Ready='1';

    const pages=[...track.querySelectorAll('.learning-page-v77')];
    if(!pages.length)return false;

    const horizontalThreshold=42;
    const directionStart=12;
    const directionRatio=1.32;
    let pageIndex=0;
    let active=false,startX=0,startY=0,lastX=0,lastY=0,mode='pending';
    let settleTimer=0;
    let suppressAudioUntil=0;
    let audioTimer=0;

    const currentPage=()=>pages[pageIndex];
    const pageChoice=()=>currentPage()?.dataset.choice||'';
    const isComplete=()=>currentPage()?.dataset.complete==='true';
    const screenHeight=()=>Math.max(screen.clientHeight,1);
    const baseY=()=>-pageIndex*screenHeight();

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
        screen.classList.add('known');
        device.classList.add('judged-known');
      }else if(choice==='not-yet'){
        screen.classList.add('not-yet');
        device.classList.add('judged-notyet');
      }
    };

    const resetHorizontal=()=>{
      screen.classList.remove('reconsidering');
      device.classList.remove('swiping-known','swiping-notyet');
      clearGlowVars();
      syncPersistent();
    };

    const transientFor=(progressValue,isPersistent=false)=>{
      if(isPersistent){
        return {opacity:.72+.28*progressValue,width:4+.4*progressValue,spread:18+14*progressValue,spread2:34+20*progressValue};
      }
      const spread=7+25*progressValue;
      return {opacity:progressValue,width:2.2+2.2*progressValue,spread,spread2:spread*1.7};
    };

    const fadingOld=progressValue=>({
      opacity:Math.max(0,.72*(1-progressValue)),
      width:Math.max(2.2,4-1.8*progressValue),
      spread:Math.max(7,18-11*progressValue),
      spread2:Math.max(12,34-22*progressValue)
    });

    const setGlow=dx=>{
      if(!dx||isComplete())return;
      const mag=Math.min(Math.abs(dx)/95,1);
      const eased=Math.pow(mag,.72);
      const current=pageChoice();
      const toward=dx<0?'known':'not-yet';
      const targetSide=toward==='known'?'left':'right';
      const otherSide=targetSide==='left'?'right':'left';
      const same=current===toward;
      const changing=!!current&&!same;

      screen.classList.add('reconsidering');
      device.classList.toggle('swiping-known',toward==='known');
      device.classList.toggle('swiping-notyet',toward==='not-yet');
      setVars(targetSide,transientFor(eased,same));
      if(changing)setVars(otherSide,fadingOld(eased));
      else setVars(otherSide);
    };

    const reveal=choice=>{
      if(isComplete())return;
      const page=currentPage();
      if(!page)return;
      page.dataset.choice=choice;
      page.classList.toggle('known',choice==='known');
      page.classList.toggle('not-yet',choice==='not-yet');
      syncPersistent();
    };

    const canMoveForward=()=>pageIndex<pages.length-1&&!!pageChoice();
    const canMoveBackward=()=>pageIndex>0;

    const settleTo=(target)=>{
      target=Math.max(0,Math.min(pages.length-1,target));
      clearTimeout(settleTimer);
      screen.classList.remove('vertical-dragging','reconsidering');
      screen.classList.add('vertical-settling');
      device.classList.remove('swiping-known','swiping-notyet');
      clearGlowVars();
      suppressAudioUntil=Date.now()+380;
      pageIndex=target;
      updateProgress();
      setTrack(baseY(),true);
      settleTimer=setTimeout(()=>{
        track.classList.remove('is-settling');
        screen.classList.remove('vertical-settling');
        syncPersistent();
      },310);
    };

    const drawVertical=dy=>{
      screen.classList.add('vertical-dragging');
      screen.classList.remove('reconsidering');
      device.classList.remove('swiping-known','swiping-notyet');
      clearGlowVars();

      const goingForward=dy<0;
      const goingBackward=dy>0;
      let allowed=dy;

      /* No answer, no next page: never expose the next learning state underneath. */
      if(goingForward&&!canMoveForward())allowed=0;
      else if(goingBackward&&!canMoveBackward())allowed=dy*.10;
      else if(goingForward&&pageIndex>=pages.length-1)allowed=dy*.10;

      setTrack(baseY()+allowed,false);
    };

    const start=(x,y)=>{
      active=true;
      mode='pending';
      startX=lastX=x;
      startY=lastY=y;
      track.classList.remove('is-settling');
      clearTimeout(settleTimer);
    };

    const move=(x,y,e)=>{
      if(!active)return;
      lastX=x;lastY=y;
      const dx=x-startX,dy=y-startY;
      const ax=Math.abs(dx),ay=Math.abs(dy);

      if(mode==='pending'){
        if(ax<directionStart&&ay<directionStart)return;
        if(ax>=directionStart&&ax>ay*directionRatio)mode=isComplete()?'blocked':'horizontal';
        else if(ay>=directionStart&&ay>ax*directionRatio)mode='vertical';
        else return;
      }

      if(e?.cancelable)e.preventDefault();
      if(mode==='horizontal')setGlow(dx);
      else if(mode==='vertical')drawVertical(dy);
    };

    const end=()=>{
      if(!active)return;
      const dx=lastX-startX,dy=lastY-startY;
      const finalMode=mode;
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
      const page=currentPage();
      if(!page)return;
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
        const word=lower.dataset.wordAudio;
        if(word)speak(word,localeFor(page),.84);
        return;
      }

      const text=full?(upper.dataset.fullAudio||upper.dataset.focusAudio):(upper.dataset.focusAudio||upper.dataset.fullAudio);
      if(text)speak(text,localeFor(page),.9);
    };

    screen.addEventListener('click',e=>{
      if(Date.now()<suppressAudioUntil||e.target.closest('button,a,[data-peek]'))return;
      clearTimeout(audioTimer);
      audioTimer=setTimeout(()=>playSpatialAudio(e,false),220);
    });
    screen.addEventListener('dblclick',e=>{
      if(Date.now()<suppressAudioUntil||e.target.closest('button,a,[data-peek]'))return;
      e.preventDefault();
      clearTimeout(audioTimer);
      playSpatialAudio(e,true);
    });

    screen.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a,[data-peek]'))return;
      start(e.clientX,e.clientY);
      try{screen.setPointerCapture(e.pointerId)}catch(_){}
    });
    screen.addEventListener('pointermove',e=>move(e.clientX,e.clientY,e),{passive:false});
    screen.addEventListener('pointerup',e=>{end();try{screen.releasePointerCapture(e.pointerId)}catch(_){}});
    screen.addEventListener('pointercancel',end);

    /* Trackpads use the same direction lock and thresholds. */
    let wheelX=0,wheelY=0,wheelMode='pending',wheelTimer=0;
    const finishWheel=()=>{
      suppressAudioUntil=Date.now()+320;
      if(wheelMode==='horizontal'){
        if(wheelX>horizontalThreshold)reveal('known');
        else if(wheelX<-horizontalThreshold)reveal('not-yet');
        else resetHorizontal();
      }else if(wheelMode==='vertical'){
        const threshold=Math.max(58,screenHeight()*.11);
        if(wheelY>threshold&&canMoveForward())settleTo(pageIndex+1);
        else if(wheelY<-threshold&&canMoveBackward())settleTo(pageIndex-1);
        else settleTo(pageIndex);
      }else{
        syncPersistent();
      }
      wheelX=wheelY=0;wheelMode='pending';
    };

    screen.addEventListener('wheel',e=>{
      const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);
      if(wheelMode==='pending'){
        if(ax>ay*1.25)wheelMode=isComplete()?'blocked':'horizontal';
        else if(ay>ax*1.25)wheelMode='vertical';
        else return;
      }
      e.preventDefault();
      suppressAudioUntil=Date.now()+320;
      if(wheelMode==='horizontal'){
        wheelX+=e.deltaX;
        setGlow(-wheelX);
      }else if(wheelMode==='vertical'){
        wheelY+=e.deltaY;
        drawVertical(-wheelY);
      }
      clearTimeout(wheelTimer);
      wheelTimer=setTimeout(finishWheel,125);
    },{passive:false});

    screen.addEventListener('keydown',e=>{
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

    window.addEventListener('resize',()=>setTrack(baseY(),false),{passive:true});
    updateProgress();
    setTrack(0,false);
    syncPersistent();
    return true;
  }

  function boot(){
    if(initLearningV79())return;
    const timer=setInterval(()=>{if(initLearningV79())clearInterval(timer)},120);
    setTimeout(()=>clearInterval(timer),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();