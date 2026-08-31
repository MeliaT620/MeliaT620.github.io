/* v29 — symmetric Express prompt + deliberate one-page vertical navigation. */
(function(){
  const install=()=>{
    const reel=document.getElementById('learningReel');
    if(!reel)return false;
    if(reel.dataset.deliberatePaging==='1')return true;

    const scenes=[...reel.querySelectorAll('.learning-scene')];
    if(!scenes.length)return false;
    reel.dataset.deliberatePaging='1';

    /* Add the Chinese -> English thinking prompt. */
    const express=scenes.find(s=>s.dataset.stage==='review-express');
    const cue=express?.querySelector('.express-cue');
    if(express&&cue&&!express.querySelector('.express-question')){
      const q=document.createElement('div');
      q.className='express-question';
      q.innerHTML='<strong>这句话用英语怎么说？</strong><span>先在心里补全这句自然英文。</span>';
      cue.insertAdjacentElement('beforebegin',q);
    }

    const sceneTop=scene=>{
      const rr=reel.getBoundingClientRect();
      const sr=scene.getBoundingClientRect();
      return reel.scrollTop+(sr.top-rr.top);
    };
    const nearestIndex=()=>{
      const top=reel.scrollTop;
      let best=0,bestDist=Infinity;
      scenes.forEach((scene,i)=>{
        const d=Math.abs(sceneTop(scene)-top);
        if(d<bestDist){best=i;bestDist=d;}
      });
      return best;
    };
    const isUnanswered=scene=>!!scene?.classList.contains('judge-scene')&&!scene.dataset.choice;
    const targetTop=i=>sceneTop(scenes[Math.max(0,Math.min(scenes.length-1,i))]);

    let moving=false;
    const goTo=index=>{
      if(moving)return;
      const next=Math.max(0,Math.min(scenes.length-1,index));
      const current=nearestIndex();
      if(next===current){
        reel.scrollTo({top:targetTop(current),behavior:'smooth'});
        return;
      }
      moving=true;
      reel.classList.add('is-page-moving');
      reel.scrollTo({top:targetTop(next),behavior:'smooth'});
      setTimeout(()=>{
        moving=false;
        reel.classList.remove('is-page-moving');
      },420);
    };

    const tryStep=direction=>{
      const current=nearestIndex();
      if(direction>0){
        if(isUnanswered(scenes[current])){
          goTo(current);
          return false;
        }
        if(current<scenes.length-1)goTo(current+1);
      }else if(direction<0 && current>0){
        goTo(current-1);
      }
      return true;
    };

    /* Touch / pen / mouse drag: lock the axis, then require a real travel distance. */
    const gesture={active:false,mode:'idle',id:null,startX:0,startY:0,lastX:0,lastY:0};
    const verticalIntent=18;
    const verticalTravel=92;
    const verticalRatio=1.45;
    const horizontalRatio=1.45;

    reel.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a'))return;
      if(moving)return;
      gesture.active=true;
      gesture.mode='pending';
      gesture.id=e.pointerId;
      gesture.startX=gesture.lastX=e.clientX;
      gesture.startY=gesture.lastY=e.clientY;
    },true);

    reel.addEventListener('pointermove',e=>{
      if(!gesture.active||e.pointerId!==gesture.id)return;
      gesture.lastX=e.clientX;gesture.lastY=e.clientY;
      const dx=e.clientX-gesture.startX,dy=e.clientY-gesture.startY;
      const ax=Math.abs(dx),ay=Math.abs(dy);

      if(gesture.mode==='pending'){
        if(ay>=verticalIntent && ay>ax*verticalRatio+5){
          gesture.mode='vertical';
        }else if(ax>=22 && ax>ay*horizontalRatio+5){
          gesture.mode='horizontal';
        }else return;
      }

      if(gesture.mode==='vertical'){
        if(e.cancelable)e.preventDefault();
        e.stopPropagation();
      }
      /* Horizontal mode intentionally falls through to app-v25's judge gesture. */
    },true);

    const finishPointer=e=>{
      if(!gesture.active||e.pointerId!==gesture.id)return;
      const dx=gesture.lastX-gesture.startX;
      const dy=gesture.lastY-gesture.startY;
      const mode=gesture.mode;
      gesture.active=false;gesture.mode='idle';gesture.id=null;

      if(mode==='vertical'){
        const ax=Math.abs(dx),ay=Math.abs(dy);
        if(ay>=verticalTravel && ay>ax*verticalRatio){
          /* Finger up => next card; finger down => previous card. */
          tryStep(dy<0?1:-1);
        }else{
          goTo(nearestIndex());
        }
      }
    };
    reel.addEventListener('pointerup',finishPointer,true);
    reel.addEventListener('pointercancel',finishPointer,true);

    /* Trackpad / wheel: accumulate deliberate vertical travel, then move exactly one page. */
    let wheelY=0,wheelTimer=null,wheelCooldown=false;
    reel.addEventListener('wheel',e=>{
      const ax=Math.abs(e.deltaX),ay=Math.abs(e.deltaY);
      if(ay<6 || ay<=ax*1.35)return; // horizontal trackpad gestures still belong to judging

      e.preventDefault();
      e.stopPropagation();
      if(wheelCooldown)return;

      wheelY+=e.deltaY;
      clearTimeout(wheelTimer);
      wheelTimer=setTimeout(()=>{wheelY=0;},190);

      if(Math.abs(wheelY)>=165){
        const direction=wheelY>0?1:-1;
        wheelY=0;
        wheelCooldown=true;
        tryStep(direction);
        setTimeout(()=>{wheelCooldown=false;},520);
      }
    },{capture:true,passive:false});

    /* Keyboard keeps the same one-page semantics and gate. */
    reel.addEventListener('keydown',e=>{
      if(['ArrowDown','PageDown',' '].includes(e.key)){
        e.preventDefault();tryStep(1);
      }else if(['ArrowUp','PageUp'].includes(e.key)){
        e.preventDefault();tryStep(-1);
      }
    },true);

    /* Always settle to a full card after resize. */
    window.addEventListener('resize',()=>goTo(nearestIndex()),{passive:true});
    return true;
  };

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},40);
    setTimeout(()=>clearInterval(timer),5000);
  }
})();
