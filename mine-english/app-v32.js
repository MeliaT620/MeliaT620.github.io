/* Mine English v32 — tiny compatibility polish on top of the consolidated v31 controller. */
(function(){
  const speakerSvg='<svg class="audio-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M5.25 9.25h3.1l3.7-3.1v11.7l-3.7-3.1h-3.1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M15.1 9.15a4.2 4.2 0 0 1 0 5.7M17.65 6.9a7.4 7.4 0 0 1 0 10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function polishAudio(root=document){
    root.querySelectorAll?.('.example-audio,.word-audio').forEach(btn=>{
      if(!btn.querySelector('svg'))btn.innerHTML=speakerSvg;
    });
  }

  function installLearningPolish(){
    const reel=document.getElementById('learningReel');
    const label=document.getElementById('learningProgressText');
    if(!reel||!label)return false;

    const scenes=[...reel.querySelectorAll('.learning-scene')];
    if(!scenes.length)return false;

    const syncCurrent=()=>{
      const match=label.textContent.match(/(\d+)/);
      const idx=Math.max(0,Math.min(scenes.length-1,(Number(match?.[1]||1)-1)));
      scenes.forEach((scene,i)=>scene.classList.toggle('is-current',i===idx));
    };
    syncCurrent();
    new MutationObserver(syncCurrent).observe(label,{childList:true,characterData:true,subtree:true});

    /* Tapping a word peek is never the beginning of a swipe gesture. */
    reel.addEventListener('pointerdown',e=>{
      if(e.target.closest('[data-peek]'))e.stopPropagation();
    },true);
    return true;
  }

  function boot(){
    polishAudio();
    if(!installLearningPolish()){
      const timer=setInterval(()=>{
        polishAudio();
        if(installLearningPolish())clearInterval(timer);
      },80);
      setTimeout(()=>clearInterval(timer),5000);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(node=>{
    if(node.nodeType===1)polishAudio(node);
  }))).observe(document.documentElement,{childList:true,subtree:true});
})();