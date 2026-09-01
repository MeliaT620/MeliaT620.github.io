/* Mine English v53 — Reflection rhythm + geometry-based blank-zone callouts. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';

  function refineCallouts(){
    const upper=document.querySelector('#reflection .callout-audio-v51 small');
    const overview=document.querySelector('#reflection .callout-overview-v51 small');
    const lower=document.querySelector('#reflection .callout-word-audio-v51 small');
    if(upper)upper.innerHTML='单击空白 · 朗读高亮<br>双击空白 · 朗读整句';
    if(overview)overview.innerHTML='单击单词<br>查看 Word Overview';
    if(lower)lower.innerHTML='单击空白<br>朗读单词';
  }

  function placeReflectionCallouts(){
    const stage=document.querySelector('#reflection .reflection-stage-wrap');
    const device=stage?.querySelector('.reflection-device');
    const progress=stage?.querySelector('.reflection-progress');
    const sentence=stage?.querySelector('.reflection-example');
    const divider=stage?.querySelector('.support-divider');
    const supportWord=stage?.querySelector('.reflection-support .support-word');
    const support=stage?.querySelector('.reflection-support');
    if(!stage||!device||!progress||!sentence||!divider||!supportWord||!support)return;

    const sr=stage.getBoundingClientRect();
    const dr=device.getBoundingClientRect();
    const pr=progress.getBoundingClientRect();
    const sentenceR=sentence.getBoundingClientRect();
    const dividerR=divider.getBoundingClientRect();
    const wordR=supportWord.getBoundingClientRect();
    const supportR=support.getBoundingClientRect();

    const layout=(el,{side,targetY,gap=7})=>{
      if(!el)return;
      el.style.removeProperty('right');
      el.style.removeProperty('margin-top');
      el.style.setProperty('top',`${Math.round(targetY-sr.top-el.offsetHeight/2)}px`,'important');
      if(side==='left'){
        const x=(dr.left-sr.left)-el.offsetWidth-gap;
        el.style.setProperty('left',`${Math.max(0,Math.round(x))}px`,'important');
      }else{
        const available=sr.right-dr.right;
        let x=(dr.right-sr.left)+gap;
        if(el.offsetWidth+gap>available)x=Math.max(dr.right-sr.left+3,sr.width-el.offsetWidth-2);
        el.style.setProperty('left',`${Math.round(x)}px`,'important');
      }
    };

    // Left: point directly to the standalone lead below the divider.
    layout(stage.querySelector('.callout-overview-v51'),{
      side:'left',targetY:wordR.top+wordR.height/2,gap:7
    });

    // Right upper: point to the intentionally blank interaction zone above the sentence.
    const upperBlankY=pr.bottom + Math.max(12,(sentenceR.top-pr.bottom)*0.48);
    layout(stage.querySelector('.callout-audio-v51'),{
      side:'right',targetY:upperBlankY,gap:7
    });

    // Right lower: point to blank space below the divider / beside the word-support block.
    const lowerBlankY=dividerR.bottom + Math.max(14,(wordR.top-dividerR.bottom)*0.52);
    layout(stage.querySelector('.callout-word-audio-v51'),{
      side:'right',targetY:lowerBlankY,gap:7
    });
  }

  function liftFlow(card){if(!card)return;const flow=card.querySelector('.reward-flow');if(flow&&flow.parentElement!==card)card.appendChild(flow);}
  function refineRewards(){
    const completeMark=document.querySelector('.learning-reward-complete .coin-mark');
    if(completeMark){completeMark.classList.add('seed-icon');completeMark.innerHTML=sprout;}
    const seed=document.querySelector('.reward-mode-mark.seed');if(seed){seed.classList.add('seed-icon');seed.innerHTML=sprout;}
    const coinMark=document.querySelector('.reward-mode-mark.coin');if(coinMark){coinMark.classList.add('coin-icon');coinMark.innerHTML=coin;}
    liftFlow(document.querySelector('.learning-reward-mode'));liftFlow(document.querySelector('.coin-mode'));
  }
  function removeLibrary(){document.getElementById('library')?.remove();}
  function runAll(){refineCallouts();refineRewards();removeLibrary();requestAnimationFrame(placeReflectionCallouts);}
  function boot(){
    runAll();
    const t=setInterval(runAll,160);setTimeout(()=>clearInterval(t),4500);
    window.addEventListener('resize',()=>requestAnimationFrame(placeReflectionCallouts),{passive:true});
    window.addEventListener('orientationchange',()=>setTimeout(placeReflectionCallouts,250),{passive:true});
    if('ResizeObserver' in window){const stage=document.querySelector('#reflection .reflection-stage-wrap');if(stage)new ResizeObserver(()=>requestAnimationFrame(placeReflectionCallouts)).observe(stage);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();