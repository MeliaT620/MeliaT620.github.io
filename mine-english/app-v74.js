/* Mine English v75 — single Learning page with v22 judgment behavior. */
(function(){
  function initLearningV75(){
    const screen=document.getElementById('learningScreenV74');
    const device=document.getElementById('learningDeviceV74');
    if(!screen||!device)return false;
    if(screen.dataset.v75Ready==='1')return true;
    screen.dataset.v75Ready='1';

    const threshold=42;
    let active=false,startX=0,startY=0,lastX=0,mode='pending';

    const resetTransient=()=>{
      screen.classList.remove('reconsidering');
      device.classList.remove('swiping-known','swiping-notyet');
      screen.style.setProperty('--left-glow','0');
      screen.style.setProperty('--right-glow','0');
      screen.style.setProperty('--left-spread','7px');
      screen.style.setProperty('--right-spread','7px');
      screen.style.setProperty('--left-spread2','12px');
      screen.style.setProperty('--right-spread2','12px');
      screen.style.setProperty('--left-width','2.2px');
      screen.style.setProperty('--right-width','2.2px');
    };

    const setGlow=dx=>{
      const mag=Math.min(Math.abs(dx)/95,1);
      const eased=Math.pow(mag,.72);
      const spread=7+eased*25;
      const width=2.2+eased*2.2;
      const spread2=spread*1.7;
      screen.classList.add('reconsidering');
      if(dx<0){
        device.classList.add('swiping-known');
        device.classList.remove('swiping-notyet');
        screen.style.setProperty('--left-glow',eased.toFixed(3));
        screen.style.setProperty('--right-glow','0');
        screen.style.setProperty('--left-spread',spread.toFixed(1)+'px');
        screen.style.setProperty('--left-spread2',spread2.toFixed(1)+'px');
        screen.style.setProperty('--left-width',width.toFixed(1)+'px');
      }else if(dx>0){
        device.classList.add('swiping-notyet');
        device.classList.remove('swiping-known');
        screen.style.setProperty('--right-glow',eased.toFixed(3));
        screen.style.setProperty('--left-glow','0');
        screen.style.setProperty('--right-spread',spread.toFixed(1)+'px');
        screen.style.setProperty('--right-spread2',spread2.toFixed(1)+'px');
        screen.style.setProperty('--right-width',width.toFixed(1)+'px');
      }
    };

    const reveal=choice=>{
      screen.classList.remove('known','not-yet','reconsidering');
      screen.classList.add(choice==='known'?'known':'not-yet');
      screen.dataset.choice=choice;
      device.classList.remove('swiping-known','swiping-notyet','judged-known','judged-notyet');
      device.classList.add(choice==='known'?'judged-known':'judged-notyet');
      resetTransient();
      /* resetTransient removes only transient classes/variables; answered class + data-choice remain. */
    };

    const start=(x,y)=>{
      active=true;mode='pending';startX=lastX=x;startY=y;
      screen.classList.add('reconsidering');
      screen.style.setProperty('--left-glow','0');
      screen.style.setProperty('--right-glow','0');
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
      active=false;mode='pending';
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
      screen.classList.add('reconsidering');
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
      if(e.key==='ArrowLeft'){e.preventDefault();setGlow(-60);setTimeout(()=>reveal('known'),90)}
      else if(e.key==='ArrowRight'){e.preventDefault();setGlow(60);setTimeout(()=>reveal('not-yet'),90)}
    });

    resetTransient();
    return true;
  }

  function boot(){
    if(initLearningV75())return;
    const timer=setInterval(()=>{if(initLearningV75())clearInterval(timer)},120);
    setTimeout(()=>clearInterval(timer),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();