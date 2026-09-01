/* Mine English v74 — one Learning page; horizontal judgment only. */
(function(){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function initLearningV74(){
    const screen=document.getElementById('learningScreenV74');
    const device=document.getElementById('learningDeviceV74');
    const card=document.getElementById('learningCardV74');
    if(!screen||!device||!card)return false;
    if(screen.dataset.v74Ready==='1')return true;
    screen.dataset.v74Ready='1';

    let active=false,startX=0,startY=0,lastX=0,mode='pending',timer=0;

    function resetVisual(){
      device.classList.remove('swiping-known','swiping-notyet','judged-known','judged-notyet');
      screen.style.setProperty('--left-glow','0');
      screen.style.setProperty('--right-glow','0');
      screen.style.setProperty('--left-width','2.2px');
      screen.style.setProperty('--right-width','2.2px');
      screen.style.setProperty('--left-spread','8px');
      screen.style.setProperty('--right-spread','8px');
      card.style.transition='transform .2s cubic-bezier(.22,.8,.25,1)';
      card.style.transform='translate3d(0,0,0)';
    }

    function draw(dx){
      const width=Math.max(screen.clientWidth,1);
      const mag=clamp(Math.abs(dx)/(width*.30),0,1);
      const eased=Math.pow(mag,.72);
      const shift=clamp(dx*.055,-7,7);
      card.style.transition='none';
      card.style.transform=`translate3d(${shift}px,0,0)`;

      if(dx<0){
        device.classList.add('swiping-known');
        device.classList.remove('swiping-notyet');
        screen.style.setProperty('--left-glow',eased.toFixed(3));
        screen.style.setProperty('--right-glow','0');
        screen.style.setProperty('--left-width',(2.2+2.4*eased).toFixed(1)+'px');
        screen.style.setProperty('--left-spread',(7+25*eased).toFixed(1)+'px');
      }else if(dx>0){
        device.classList.add('swiping-notyet');
        device.classList.remove('swiping-known');
        screen.style.setProperty('--right-glow',eased.toFixed(3));
        screen.style.setProperty('--left-glow','0');
        screen.style.setProperty('--right-width',(2.2+2.4*eased).toFixed(1)+'px');
        screen.style.setProperty('--right-spread',(7+25*eased).toFixed(1)+'px');
      }
    }

    function settle(dx){
      const threshold=Math.max(54,screen.clientWidth*.18);
      const judged=Math.abs(dx)>=threshold;
      const known=dx<0;
      card.style.transition='transform .2s cubic-bezier(.22,.8,.25,1)';
      card.style.transform='translate3d(0,0,0)';
      device.classList.remove('swiping-known','swiping-notyet');
      clearTimeout(timer);

      if(!judged){resetVisual();return;}

      device.classList.add(known?'judged-known':'judged-notyet');
      screen.style.setProperty(known?'--left-glow':'--right-glow','.52');
      screen.style.setProperty(known?'--right-glow':'--left-glow','0');
      screen.style.setProperty(known?'--left-width':'--right-width','3.4px');
      screen.style.setProperty(known?'--left-spread':'--right-spread','22px');
      timer=setTimeout(resetVisual,560);
    }

    screen.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a'))return;
      active=true;mode='pending';startX=lastX=e.clientX;startY=e.clientY;
      clearTimeout(timer);
      device.classList.remove('judged-known','judged-notyet');
      try{screen.setPointerCapture(e.pointerId)}catch(_){}
    });

    screen.addEventListener('pointermove',e=>{
      if(!active)return;
      lastX=e.clientX;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      const ax=Math.abs(dx),ay=Math.abs(dy);
      if(mode==='pending'){
        if(ax<10&&ay<10)return;
        if(ax>ay*1.35+4)mode='horizontal';
        else if(ay>ax*1.15+3){mode='vertical';return;}
        else return;
      }
      if(mode!=='horizontal')return;
      if(e.cancelable)e.preventDefault();
      draw(dx);
    },{passive:false});

    function end(e){
      if(!active)return;
      const dx=lastX-startX;
      const currentMode=mode;
      active=false;mode='pending';
      if(currentMode==='horizontal')settle(dx);else resetVisual();
      try{if(e?.pointerId!=null)screen.releasePointerCapture(e.pointerId)}catch(_){}
    }
    screen.addEventListener('pointerup',end);
    screen.addEventListener('pointercancel',end);

    let wheelX=0,wheelTimer=0;
    screen.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)*1.35)return;
      e.preventDefault();
      wheelX+=e.deltaX;
      draw(-wheelX);
      clearTimeout(wheelTimer);
      wheelTimer=setTimeout(()=>{settle(-wheelX);wheelX=0},120);
    },{passive:false});

    screen.addEventListener('keydown',e=>{
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();
      const dx=e.key==='ArrowLeft'?-screen.clientWidth*.24:screen.clientWidth*.24;
      draw(dx);setTimeout(()=>settle(dx),90);
    });
    resetVisual();
    return true;
  }

  function boot(){
    if(initLearningV74())return;
    const t=setInterval(()=>{if(initLearningV74())clearInterval(t)},120);
    setTimeout(()=>clearInterval(t),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();