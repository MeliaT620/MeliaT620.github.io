/* v30 — stable recall slots + reel-style drag that follows the finger and snaps on release. */
(function(){
  const install=()=>{
    const reel=document.getElementById('learningReel');
    if(!reel)return false;
    if(reel.dataset.v30Ready==='1')return true;

    const scenes=[...reel.querySelectorAll('.learning-scene')];
    if(!scenes.length)return false;
    reel.dataset.v30Ready='1';

    /* ----- Recall prompts: occupy the future answer area instead of shifting the question. ----- */
    document.querySelectorAll('.judge-question,.express-question').forEach(el=>el.remove());

    const understand=scenes.find(s=>s.dataset.stage==='review-understand');
    if(understand&&!understand.querySelector('.recall-slot')){
      const example=understand.querySelector('.review-example-first');
      const source=understand.querySelector('.answer-zh');
      if(example&&source){
        const slot=document.createElement('div');
        slot.className='recall-slot understand-recall-slot';
        slot.innerHTML='<div class="recall-prompt"><strong>这句话是什么意思？</strong><span>先在心里说出它的中文意思。</span></div><div class="recall-answer"></div>';
        slot.querySelector('.recall-answer').textContent=source.textContent.trim();
        source.classList.add('slot-source-hidden');
        example.insertAdjacentElement('afterend',slot);
      }
    }

    const express=scenes.find(s=>s.dataset.stage==='review-express');
    if(express&&!express.querySelector('.recall-slot')){
      const example=express.querySelector('.express-example');
      if(example){
        const slot=document.createElement('div');
        slot.className='recall-slot express-recall-slot';
        slot.innerHTML='<div class="recall-prompt"><strong>这句话用英语怎么说？</strong><span>先在心里补全这句自然英文。</span></div>';
        example.insertAdjacentElement('afterend',slot);
      }
    }

    /* ----- One reel controller. Drag follows the finger; release either commits or springs back. ----- */
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const pageTop=i=>scenes[clamp(i,0,scenes.length-1)].offsetTop;
    const nearestIndex=()=>{
      const y=reel.scrollTop;
      let best=0,bestDist=Infinity;
      scenes.forEach((scene,i)=>{
        const d=Math.abs(scene.offsetTop-y);
        if(d<bestDist){best=i;bestDist=d;}
      });
      return best;
    };
    const isUnanswered=scene=>!!scene?.classList.contains('judge-scene')&&!scene.dataset.choice;

    let animFrame=0;
    const cancelAnimation=()=>{if(animFrame){cancelAnimationFrame(animFrame);animFrame=0;}};
    const animateTo=(target,duration=220)=>{
      cancelAnimation();
      const from=reel.scrollTop;
      const delta=target-from;
      if(Math.abs(delta)<.8){reel.scrollTop=target;return;}
      const start=performance.now();
      const ease=t=>1-Math.pow(1-t,3);
      const tick=now=>{
        const p=Math.min(1,(now-start)/duration);
        reel.scrollTop=from+delta*ease(p);
        if(p<1)animFrame=requestAnimationFrame(tick);
        else{animFrame=0;reel.scrollTop=target;}
      };
      animFrame=requestAnimationFrame(tick);
    };

    const gesture={
      active:false,id:null,mode:'pending',startX:0,startY:0,lastX:0,lastY:0,
      startTop:0,startIndex:0,lastTime:0,lastMoveY:0,velocityY:0
    };
    const intentDistance=12;
    const axisRatio=1.28;
    const commitRatio=.27;
    const minFlickTravel=54;
    const flickVelocity=.52; // px/ms

    reel.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a'))return;
      cancelAnimation();
      gesture.active=true;
      gesture.id=e.pointerId;
      gesture.mode='pending';
      gesture.startX=gesture.lastX=e.clientX;
      gesture.startY=gesture.lastY=e.clientY;
      gesture.startIndex=nearestIndex();
      gesture.startTop=pageTop(gesture.startIndex);
      gesture.lastTime=performance.now();
      gesture.lastMoveY=e.clientY;
      gesture.velocityY=0;
      /* Start from a clean page edge if a previous interrupted animation left a few pixels. */
      if(Math.abs(reel.scrollTop-gesture.startTop)<6)reel.scrollTop=gesture.startTop;
      try{reel.setPointerCapture(e.pointerId)}catch(_){}
    },true);

    reel.addEventListener('pointermove',e=>{
      if(!gesture.active||e.pointerId!==gesture.id)return;
      gesture.lastX=e.clientX;gesture.lastY=e.clientY;
      const dx=e.clientX-gesture.startX,dy=e.clientY-gesture.startY;
      const ax=Math.abs(dx),ay=Math.abs(dy);

      if(gesture.mode==='pending'){
        if(ay>=intentDistance&&ay>ax*axisRatio+3)gesture.mode='vertical';
        else if(ax>=18&&ax>ay*axisRatio+4)gesture.mode='horizontal';
        else return;
      }
      if(gesture.mode!=='vertical')return; // horizontal remains owned by app-v25

      if(e.cancelable)e.preventDefault();
      const now=performance.now();
      const dt=Math.max(1,now-gesture.lastTime);
      gesture.velocityY=(e.clientY-gesture.lastMoveY)/dt;
      gesture.lastTime=now;
      gesture.lastMoveY=e.clientY;

      const currentScene=scenes[gesture.startIndex];
      const tryingNext=dy<0;
      let desired=gesture.startTop-dy;

      if(tryingNext&&isUnanswered(currentScene)){
        /* Unanswered cards may flex a little, but never expose the next lesson. */
        desired=gesture.startTop+Math.min((-dy)*.10,13);
      }else{
        const minTop=pageTop(Math.max(0,gesture.startIndex-1));
        const maxTop=pageTop(Math.min(scenes.length-1,gesture.startIndex+1));
        desired=clamp(desired,minTop,maxTop);
        if(gesture.startIndex===0&&dy>0)desired=gesture.startTop;
        if(gesture.startIndex===scenes.length-1&&dy<0)desired=gesture.startTop;
      }
      reel.scrollTop=desired;
    },true);

    const finishPointer=e=>{
      if(!gesture.active||e.pointerId!==gesture.id)return;
      const mode=gesture.mode;
      const dy=gesture.lastY-gesture.startY;
      const startIndex=gesture.startIndex;
      const startTop=gesture.startTop;
      const velocityY=gesture.velocityY;
      gesture.active=false;gesture.id=null;gesture.mode='pending';
      try{reel.releasePointerCapture(e.pointerId)}catch(_){}

      if(mode!=='vertical')return;
      const h=Math.max(1,reel.clientHeight);
      const delta=reel.scrollTop-startTop;
      const direction=delta>0?1:delta<0?-1:0;
      const enoughDistance=Math.abs(delta)>=h*commitRatio;
      const enoughFlick=Math.abs(dy)>=minFlickTravel&&Math.abs(velocityY)>=flickVelocity;

      let target=startIndex;
      if(direction>0){
        if(!isUnanswered(scenes[startIndex])&&(enoughDistance||enoughFlick))target=Math.min(scenes.length-1,startIndex+1);
      }else if(direction<0&&(enoughDistance||enoughFlick)){
        target=Math.max(0,startIndex-1);
      }
      animateTo(pageTop(target),target===startIndex?190:225);
    };
    reel.addEventListener('pointerup',finishPointer,true);
    reel.addEventListener('pointercancel',finishPointer,true);

    /* Trackpad: scroll follows the gesture continuously, then settles to one page. */
    const wheel={active:false,startIndex:0,startTop:0,timer:null,total:0};
    const finishWheel=()=>{
      if(!wheel.active)return;
      wheel.active=false;
      const h=Math.max(1,reel.clientHeight);
      const delta=reel.scrollTop-wheel.startTop;
      const direction=delta>0?1:delta<0?-1:0;
      let target=wheel.startIndex;
      if(direction>0&&!isUnanswered(scenes[wheel.startIndex])&&Math.abs(delta)>=h*.20){
        target=Math.min(scenes.length-1,wheel.startIndex+1);
      }else if(direction<0&&Math.abs(delta)>=h*.20){
        target=Math.max(0,wheel.startIndex-1);
      }
      animateTo(pageTop(target),target===wheel.startIndex?170:215);
      wheel.total=0;
    };

    reel.addEventListener('wheel',e=>{
      const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);
      if(ay<4||ay<=ax*1.22)return; // horizontal wheel remains available for judgment
      e.preventDefault();
      cancelAnimation();
      if(!wheel.active){
        wheel.active=true;
        wheel.startIndex=nearestIndex();
        wheel.startTop=pageTop(wheel.startIndex);
        wheel.total=0;
      }
      wheel.total+=e.deltaY;
      const scene=scenes[wheel.startIndex];
      let desired=reel.scrollTop+e.deltaY*.72;
      if(e.deltaY>0&&isUnanswered(scene)){
        const flex=Math.min(Math.max(0,reel.scrollTop-wheel.startTop)+e.deltaY*.08,13);
        desired=wheel.startTop+flex;
      }else{
        desired=clamp(desired,pageTop(Math.max(0,wheel.startIndex-1)),pageTop(Math.min(scenes.length-1,wheel.startIndex+1)));
      }
      reel.scrollTop=desired;
      clearTimeout(wheel.timer);
      wheel.timer=setTimeout(finishWheel,125);
    },{capture:true,passive:false});

    reel.addEventListener('keydown',e=>{
      const i=nearestIndex();
      if(['ArrowDown','PageDown',' '].includes(e.key)){
        e.preventDefault();
        if(!isUnanswered(scenes[i]))animateTo(pageTop(Math.min(scenes.length-1,i+1)),220);
        else animateTo(pageTop(i),170);
      }else if(['ArrowUp','PageUp'].includes(e.key)){
        e.preventDefault();animateTo(pageTop(Math.max(0,i-1)),220);
      }
    },true);

    window.addEventListener('resize',()=>animateTo(pageTop(nearestIndex()),0),{passive:true});
    return true;
  };

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},40);
    setTimeout(()=>clearInterval(timer),5000);
  }
})();
