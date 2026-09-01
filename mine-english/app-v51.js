/* Mine English v73 — single Learning page with left/right judgment gestures. */
(function(){
  function initSingleLearning(){
    const viewport=document.getElementById('learningSingleViewport');
    const device=document.getElementById('learningSingleDevice');
    const card=document.getElementById('learningSingleCard');
    if(!viewport||!device||!card)return false;
    if(viewport.dataset.gestureReady==='1')return true;
    viewport.dataset.gestureReady='1';

    let active=false,startX=0,startY=0,dx=0,horizontal=false,settleTimer=0;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const clearState=()=>{
      device.classList.remove('swiping-known','swiping-notyet','judged-known','judged-notyet');
      device.style.setProperty('--left-glow','0');
      device.style.setProperty('--right-glow','0');
      card.style.transform='translate3d(0,0,0) rotate(0deg)';
      card.style.transition='transform .22s cubic-bezier(.22,.8,.25,1)';
    };
    const renderDrag=x=>{
      const width=Math.max(viewport.clientWidth,1);
      const ratio=clamp(Math.abs(x)/(width*.34),0,1);
      const visual=clamp(x,-width*.18,width*.18);
      card.style.transition='none';
      card.style.transform=`translate3d(${visual*.34}px,0,0) rotate(${visual*.012}deg)`;
      if(x<0){
        device.classList.add('swiping-known');
        device.classList.remove('swiping-notyet');
        device.style.setProperty('--left-glow',String(.12+ratio*.66));
        device.style.setProperty('--right-glow','0');
      }else if(x>0){
        device.classList.add('swiping-notyet');
        device.classList.remove('swiping-known');
        device.style.setProperty('--right-glow',String(.12+ratio*.66));
        device.style.setProperty('--left-glow','0');
      }
    };
    const finish=()=>{
      if(!active)return;
      active=false;
      const threshold=Math.max(48,viewport.clientWidth*.15);
      const judged=Math.abs(dx)>=threshold;
      const known=dx<0;
      card.style.transition='transform .22s cubic-bezier(.22,.8,.25,1)';
      card.style.transform='translate3d(0,0,0) rotate(0deg)';
      device.classList.remove('swiping-known','swiping-notyet');
      if(judged){
        device.classList.add(known?'judged-known':'judged-notyet');
        device.style.setProperty(known?'--left-glow':'--right-glow','.42');
        device.style.setProperty(known?'--right-glow':'--left-glow','0');
        clearTimeout(settleTimer);
        settleTimer=setTimeout(clearState,650);
      }else clearState();
    };

    viewport.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a'))return;
      active=true;horizontal=false;dx=0;startX=e.clientX;startY=e.clientY;
      clearTimeout(settleTimer);
      device.classList.remove('judged-known','judged-notyet');
      try{viewport.setPointerCapture(e.pointerId)}catch(_){}
    });
    viewport.addEventListener('pointermove',e=>{
      if(!active)return;
      const x=e.clientX-startX,y=e.clientY-startY;dx=x;
      if(!horizontal){
        if(Math.abs(x)<8)return;
        if(Math.abs(x)>Math.abs(y)*1.2)horizontal=true;else return;
      }
      if(e.cancelable)e.preventDefault();
      renderDrag(x);
    },{passive:false});
    viewport.addEventListener('pointerup',e=>{finish();try{viewport.releasePointerCapture(e.pointerId)}catch(_){}});
    viewport.addEventListener('pointercancel',finish);
    viewport.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();
      dx=e.key==='ArrowLeft'?-viewport.clientWidth*.2:viewport.clientWidth*.2;
      active=true;renderDrag(dx);setTimeout(finish,90);
    });
    return true;
  }
  function boot(){if(initSingleLearning())return;const t=setInterval(()=>{if(initSingleLearning())clearInterval(t)},120);setTimeout(()=>clearInterval(t),6000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();