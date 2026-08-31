/* v24 — do not allow the learner to advance before judging the current Review card. */
(function(){
  const install=()=>{
    const reel=document.getElementById('learningReel');
    if(!reel)return false;
    if(reel.dataset.gateReady==='1')return true;
    reel.dataset.gateReady='1';

    const scenes=[...reel.querySelectorAll('.learning-scene')];
    if(!scenes.length)return true;

    const pageHeight=()=>Math.max(reel.clientHeight,1);
    const pageTop=index=>index*pageHeight();
    const pageIndex=()=>Math.max(0,Math.min(scenes.length-1,Math.round(reel.scrollTop/pageHeight())));
    const isUnansweredJudge=scene=>!!scene?.classList.contains('judge-scene')&&!scene.dataset.choice;

    /* Only pages up to this index may be reached. Each unanswered judge card closes the gate to everything after it. */
    const maxAccessibleIndex=()=>{
      let max=0;
      for(let i=0;i<scenes.length-1;i++){
        const scene=scenes[i];
        if(isUnansweredJudge(scene))break;
        max=i+1;
      }
      return max;
    };

    const currentScene=()=>scenes[pageIndex()];
    const syncLock=()=>{
      const idx=pageIndex();
      const max=maxAccessibleIndex();
      reel.classList.toggle('is-answer-locked',idx>=max&&isUnansweredJudge(currentScene()));
    };

    let startX=0,startY=0,startTop=0,startIndex=0;
    reel.addEventListener('touchstart',e=>{
      const t=e.touches[0];if(!t)return;
      startX=t.clientX;startY=t.clientY;startTop=reel.scrollTop;startIndex=pageIndex();
      syncLock();
    },{passive:true,capture:true});

    reel.addEventListener('touchmove',e=>{
      const t=e.touches[0];if(!t)return;
      const dx=t.clientX-startX,dy=t.clientY-startY;
      const max=maxAccessibleIndex();
      // Finger moving upward means attempting to advance. Block it when the current accessible card is still unanswered.
      if(startIndex>=max && isUnansweredJudge(scenes[startIndex]) && dy< -4 && Math.abs(dy)>Math.abs(dx)+4){
        if(e.cancelable)e.preventDefault();
        reel.scrollTop=startTop;
      }
    },{passive:false,capture:true});

    reel.addEventListener('wheel',e=>{
      const idx=pageIndex(),max=maxAccessibleIndex();
      if(idx>=max&&isUnansweredJudge(scenes[idx])&&e.deltaY>0)e.preventDefault();
    },{passive:false,capture:true});

    reel.addEventListener('keydown',e=>{
      const idx=pageIndex(),max=maxAccessibleIndex();
      if(idx>=max&&isUnansweredJudge(scenes[idx])&&['ArrowDown','PageDown',' ','End'].includes(e.key))e.preventDefault();
    },true);

    let correcting=false;
    reel.addEventListener('scroll',()=>{
      if(correcting)return;
      const max=maxAccessibleIndex();
      const maxTop=pageTop(max);
      // Momentum, elastic scrolling, or scripted scrolling may not cross the first unanswered card.
      if(reel.scrollTop>maxTop+3){
        correcting=true;
        reel.scrollTop=maxTop;
        requestAnimationFrame(()=>{correcting=false;syncLock()});
        return;
      }
      syncLock();
    },{passive:true});

    // The original judge handler writes data-choice on submit. Open the next gate immediately when that happens.
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
