/* Mine English v76 — one Learning page; v22-distance glow with smooth answer reconsideration. */
(function(){
  function initLearningV76(){
    const screen=document.getElementById('learningScreenV74');
    const device=document.getElementById('learningDeviceV74');
    if(!screen||!device)return false;
    if(screen.dataset.v76Ready==='1')return true;
    screen.dataset.v76Ready='1';

    const threshold=42;
    let active=false,startX=0,startY=0,lastX=0,mode='pending';

    const setVars=(side,{opacity=0,width=2.2,spread=7,spread2=12}={})=>{
      screen.style.setProperty(`--${side}-glow`,Number(opacity).toFixed(3));
      screen.style.setProperty(`--${side}-width`,Number(width).toFixed(1)+'px');
      screen.style.setProperty(`--${side}-spread`,Number(spread).toFixed(1)+'px');
      screen.style.setProperty(`--${side}-spread2`,Number(spread2).toFixed(1)+'px');
    };

    const resetTransient=()=>{
      screen.classList.remove('reconsidering');
      device.classList.remove('swiping-known','swiping-notyet');
      setVars('left');
      setVars('right');
    };

    const transientFor=(progress,isPersistent=false)=>{
      if(isPersistent){
        return {
          opacity:.72+.28*progress,
          width:4+.4*progress,
          spread:18+14*progress,
          spread2:34+20*progress
        };
      }
      return {
        opacity:progress,
        width:2.2+2.2*progress,
        spread:7+25*progress,
        spread2:(7+25*progress)*1.7
      };
    };

    const fadingOld=(progress)=>({
      opacity:Math.max(0,.72*(1-progress)),
      width:Math.max(2.2,4-1.8*progress),
      spread:Math.max(7,18-11*progress),
      spread2:Math.max(12,34-22*progress)
    });

    const setGlow=dx=>{
      if(!dx)return;
      const mag=Math.min(Math.abs(dx)/95,1);
      const eased=Math.pow(mag,.72);
      const current=screen.dataset.choice||'';
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
      screen.classList.remove('known','not-yet','reconsidering');
      screen.classList.add(choice==='known'?'known':'not-yet');
      screen.dataset.choice=choice;
      device.classList.remove('swiping-known','swiping-notyet','judged-known','judged-notyet');
      device.classList.add(choice==='known'?'judged-known':'judged-notyet');
      resetTransient();
    };

    const start=(x,y)=>{
      active=true;
      mode='pending';
      startX=lastX=x;
      startY=y;
      /* Keep the persistent answered glow visible until a real horizontal drag starts. */
    };

    const move=(x,y,e)=>{
      if(!active)return;
      lastX=x;
      const dx=x-startX,dy=y-startY;
      if(mode==='pending'){
        if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
        if(Math.abs(dx)>Math.abs(dy)+6)mode='horizontal';
        else if(Math.abs(dy)>Math.abs(dx)+6){mode='vertical';return;}
        else return;
      }
      if(mode!=='horizontal')return;
      if(e?.cancelable)e.preventDefault();
      setGlow(dx);
    };

    const end=()=>{
      if(!active)return;
      const dx=lastX-startX;
      const finalMode=mode;
      active=false;
      mode='pending';
      if(finalMode==='horizontal'&&dx<=-threshold)reveal('known');
      else if(finalMode==='horizontal'&&dx>=threshold)reveal('not-yet');
      else resetTransient();
    };

    screen.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a,[data-peek]'))return;
      start(e.clientX,e.clientY);
      try{screen.setPointerCapture(e.pointerId)}catch(_){}
    });
    screen.addEventListener('pointermove',e=>move(e.clientX,e.clientY,e),{passive:false});
    screen.addEventListener('pointerup',e=>{end();try{screen.releasePointerCapture(e.pointerId)}catch(_){}});
    screen.addEventListener('pointercancel',end);

    let wheelDx=0,wheelTimer=null;
    screen.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
      e.preventDefault();
      wheelDx+=e.deltaX;
      setGlow(-wheelDx);
      clearTimeout(wheelTimer);
      wheelTimer=setTimeout(()=>{
        if(wheelDx>threshold)reveal('known');
        else if(wheelDx<-threshold)reveal('not-yet');
        else resetTransient();
        wheelDx=0;
      },120);
    },{passive:false});

    screen.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){
        e.preventDefault();
        setGlow(-60);
        setTimeout(()=>reveal('known'),90);
      }else if(e.key==='ArrowRight'){
        e.preventDefault();
        setGlow(60);
        setTimeout(()=>reveal('not-yet'),90);
      }
    });

    resetTransient();
    return true;
  }

  function boot(){
    if(initLearningV76())return;
    const timer=setInterval(()=>{if(initLearningV76())clearInterval(timer)},120);
    setTimeout(()=>clearInterval(timer),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();