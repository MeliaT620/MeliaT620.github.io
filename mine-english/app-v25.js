/* v25 — stricter left/right intent so vertical swipes never become accidental judgments. */
(function(){
  const install=()=>{
    const reel=document.getElementById('learningReel');
    if(!reel)return false;
    const scenes=[...reel.querySelectorAll('.judge-scene')];
    if(!scenes.length)return false;

    scenes.forEach(scene=>{
      if(scene.dataset.strictJudge==='1')return;
      scene.dataset.strictJudge='1';

      const state={active:false,mode:'idle',startX:0,startY:0,lastX:0,lastY:0};
      const submitThreshold=78;
      const intentX=28;
      const horizontalRatio=1.8;

      const resetTransient=()=>{
        scene.classList.remove('reconsidering');
        scene.style.removeProperty('--left-glow');
        scene.style.removeProperty('--right-glow');
        scene.style.removeProperty('--left-spread');
        scene.style.removeProperty('--right-spread');
        scene.style.removeProperty('--left-width');
        scene.style.removeProperty('--right-width');
      };

      const setGlow=dx=>{
        const mag=Math.min(Math.abs(dx)/125,1);
        const eased=Math.pow(mag,.78);
        if(dx<0){
          scene.style.setProperty('--left-glow',eased.toFixed(3));
          scene.style.setProperty('--right-glow','0');
          scene.style.setProperty('--left-spread',(6+eased*24).toFixed(1)+'px');
          scene.style.setProperty('--left-width',(2+eased*2.1).toFixed(1)+'px');
        }else if(dx>0){
          scene.style.setProperty('--right-glow',eased.toFixed(3));
          scene.style.setProperty('--left-glow','0');
          scene.style.setProperty('--right-spread',(6+eased*24).toFixed(1)+'px');
          scene.style.setProperty('--right-width',(2+eased*2.1).toFixed(1)+'px');
        }
      };

      const reveal=choice=>{
        scene.classList.remove('known','not-yet','reconsidering');
        scene.classList.add(choice==='known'?'known':'not-yet');
        scene.dataset.choice=choice;
        scene.querySelectorAll('.answer-reveal').forEach(el=>el.classList.add('visible'));
        scene.querySelectorAll('.blank-target').forEach(el=>el.classList.add('revealed'));
        scene.querySelectorAll('.reveal-only-audio').forEach(el=>el.classList.add('visible'));
        resetTransient();
      };

      const start=(x,y)=>{
        state.active=true;
        state.mode='pending';
        state.startX=state.lastX=x;
        state.startY=state.lastY=y;
      };

      const move=(x,y,e)=>{
        if(!state.active)return;
        state.lastX=x;state.lastY=y;
        const dx=x-state.startX,dy=y-state.startY;
        const ax=Math.abs(dx),ay=Math.abs(dy);

        if(state.mode==='pending'){
          // A vertical intention wins early. Slight diagonal drift must never become a judgment.
          if(ay>=12 && ay>ax*1.15){
            state.mode='vertical';
            resetTransient();
            return;
          }
          // Only enter judge mode after a clearly horizontal, deliberate push.
          if(ax>=intentX && ax>ay*horizontalRatio+8){
            state.mode='horizontal';
            scene.classList.add('reconsidering');
            scene.style.setProperty('--left-glow','0');
            scene.style.setProperty('--right-glow','0');
          }else return;
        }

        if(state.mode==='horizontal'){
          if(e?.cancelable)e.preventDefault();
          setGlow(dx);
        }
      };

      const end=()=>{
        if(!state.active)return;
        const dx=state.lastX-state.startX;
        const mode=state.mode;
        state.active=false;state.mode='idle';
        if(mode==='horizontal' && Math.abs(dx)>=submitThreshold){
          reveal(dx<0?'known':'not-yet');
        }else resetTransient();
      };

      // Capture-phase handlers supersede the older, more permissive judge listeners.
      scene.addEventListener('pointerdown',e=>{
        if(e.target.closest('button,a'))return;
        e.stopImmediatePropagation();
        start(e.clientX,e.clientY);
        try{scene.setPointerCapture(e.pointerId)}catch(_){}
      },true);
      scene.addEventListener('pointermove',e=>{
        if(!state.active)return;
        e.stopImmediatePropagation();
        move(e.clientX,e.clientY,e);
      },true);
      scene.addEventListener('pointerup',e=>{
        if(!state.active)return;
        e.stopImmediatePropagation();
        end();
        try{scene.releasePointerCapture(e.pointerId)}catch(_){}
      },true);
      scene.addEventListener('pointercancel',e=>{
        if(!state.active)return;
        e.stopImmediatePropagation();
        end();
      },true);

      // Stop the legacy touch fallback on modern iOS; Pointer Events handle the gesture above.
      if('PointerEvent' in window){
        ['touchstart','touchmove','touchend','touchcancel'].forEach(type=>{
          scene.addEventListener(type,e=>e.stopImmediatePropagation(),{capture:true,passive:type!=='touchmove'});
        });
      }else{
        scene.addEventListener('touchstart',e=>{
          if(e.target.closest('button,a'))return;
          e.stopImmediatePropagation();
          const t=e.touches[0];if(t)start(t.clientX,t.clientY);
        },{capture:true,passive:true});
        scene.addEventListener('touchmove',e=>{
          if(!state.active)return;
          e.stopImmediatePropagation();
          const t=e.touches[0];if(t)move(t.clientX,t.clientY,e);
        },{capture:true,passive:false});
        scene.addEventListener('touchend',e=>{
          if(!state.active)return;
          e.stopImmediatePropagation();end();
        },{capture:true,passive:true});
      }

      // Trackpad: only a strongly horizontal gesture can judge, and it needs more travel than before.
      let wheelDx=0,wheelTimer=null;
      scene.addEventListener('wheel',e=>{
        const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);
        if(ax<8 || ax<=ay*1.8)return;
        e.stopImmediatePropagation();
        e.preventDefault();
        scene.classList.add('reconsidering');
        wheelDx+=e.deltaX;
        setGlow(-wheelDx);
        clearTimeout(wheelTimer);
        wheelTimer=setTimeout(()=>{
          if(Math.abs(wheelDx)>=88)reveal(wheelDx>0?'known':'not-yet');
          else resetTransient();
          wheelDx=0;
        },150);
      },{capture:true,passive:false});
    });
    return true;
  };

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},40);
    setTimeout(()=>clearInterval(timer),5000);
  }
})();
