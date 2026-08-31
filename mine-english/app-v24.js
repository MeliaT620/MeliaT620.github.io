/* v24 — do not allow the learner to advance before judging the current Review card. */
(function(){
  const install=()=>{
    const reel=document.getElementById('learningReel');
    if(!reel)return false;
    if(reel.dataset.gateReady==='1')return true;
    reel.dataset.gateReady='1';

    const scenes=[...reel.querySelectorAll('.learning-scene')];
    if(!scenes.length)return true;

    const pageIndex=()=>{
      const h=Math.max(reel.clientHeight,1);
      return Math.max(0,Math.min(scenes.length-1,Math.round(reel.scrollTop/h)));
    };
    const currentScene=()=>scenes[pageIndex()];
    const isLocked=scene=>!!scene?.classList.contains('judge-scene')&&!scene.dataset.choice;
    const pageTop=index=>index*Math.max(reel.clientHeight,1);

    const syncLock=()=>{
      reel.classList.toggle('is-answer-locked',isLocked(currentScene()));
    };

    let startX=0,startY=0,startTop=0;
    reel.addEventListener('touchstart',e=>{
      const t=e.touches[0];if(!t)return;
      startX=t.clientX;startY=t.clientY;startTop=reel.scrollTop;
      syncLock();
    },{passive:true,capture:true});

    reel.addEventListener('touchmove',e=>{
      const scene=currentScene();
      if(!isLocked(scene))return;
      const t=e.touches[0];if(!t)return;
      const dx=t.clientX-startX,dy=t.clientY-startY;
      // Finger moving upward means attempting to advance to the next card.
      if(dy< -4 && Math.abs(dy)>Math.abs(dx)+4){
        if(e.cancelable)e.preventDefault();
        reel.scrollTop=startTop;
      }
    },{passive:false,capture:true});

    reel.addEventListener('wheel',e=>{
      if(isLocked(currentScene())&&e.deltaY>0){
        e.preventDefault();
      }
    },{passive:false,capture:true});

    reel.addEventListener('keydown',e=>{
      if(!isLocked(currentScene()))return;
      if(['ArrowDown','PageDown',' ','End'].includes(e.key))e.preventDefault();
    },true);

    let correcting=false;
    reel.addEventListener('scroll',()=>{
      if(correcting)return;
      const idx=pageIndex();
      const scene=scenes[idx];
      if(isLocked(scene)){
        const top=pageTop(idx);
        // If momentum or browser elastic scrolling slips through, snap the unanswered card back into place.
        if(reel.scrollTop>top+3){
          correcting=true;
          reel.scrollTop=top;
          requestAnimationFrame(()=>{correcting=false});
        }
      }
      syncLock();
    },{passive:true});

    // The original judge handler writes data-choice on submit. Observe that mutation so the gate opens immediately.
    const mo=new MutationObserver(syncLock);
    scenes.filter(s=>s.classList.contains('judge-scene')).forEach(s=>mo.observe(s,{attributes:true,attributeFilter:['data-choice']}));
    window.addEventListener('resize',syncLock,{passive:true});
    syncLock();
    return true;
  };

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);
    setTimeout(()=>clearInterval(timer),5000);
  }
})();
