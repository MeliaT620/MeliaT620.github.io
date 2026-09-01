/* Mine English v54 — Reflection geometry follows the compact content flow. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';
  function refineCallouts(){const upper=document.querySelector('#reflection .callout-audio-v51 small'),overview=document.querySelector('#reflection .callout-overview-v51 small'),lower=document.querySelector('#reflection .callout-word-audio-v51 small');if(upper)upper.innerHTML='单击空白 · 朗读高亮<br>双击空白 · 朗读整句';if(overview)overview.innerHTML='单击单词<br>查看 Word Overview';if(lower)lower.innerHTML='单击空白 · 朗读单词';}
  function placeReflectionCallouts(){
    const stage=document.querySelector('#reflection .reflection-stage-wrap'),device=stage?.querySelector('.reflection-device'),progress=stage?.querySelector('.reflection-progress'),sentence=stage?.querySelector('.reflection-example'),divider=stage?.querySelector('.support-divider'),word=stage?.querySelector('.reflection-support .support-word'),support=stage?.querySelector('.reflection-support');if(!stage||!device||!progress||!sentence||!divider||!word||!support)return;
    const sr=stage.getBoundingClientRect(),dr=device.getBoundingClientRect(),pr=progress.getBoundingClientRect(),rr=sentence.getBoundingClientRect(),lr=divider.getBoundingClientRect(),wr=word.getBoundingClientRect(),spr=support.getBoundingClientRect();
    const layout=(el,side,targetY)=>{if(!el)return;el.style.removeProperty('right');el.style.setProperty('top',`${Math.round(targetY-sr.top-el.offsetHeight/2)}px`,'important');const gap=6;if(side==='left'){el.style.setProperty('left',`${Math.max(0,Math.round(dr.left-sr.left-el.offsetWidth-gap))}px`,'important')}else{let x=dr.right-sr.left+gap;const max=sr.width-el.offsetWidth;if(x>max)x=Math.max(dr.right-sr.left+2,max);el.style.setProperty('left',`${Math.round(x)}px`,'important')}};
    // Overview is the only left annotation and lands on the standalone lead.
    layout(stage.querySelector('.callout-overview-v51'),'left',wr.top+wr.height/2);
    // Audio annotations point to genuine blank zones, not text.
    layout(stage.querySelector('.callout-audio-v51'),'right',pr.bottom+(rr.top-pr.bottom)*0.50);
    const lowerBlankStart=lr.bottom, lowerBlankEnd=wr.top;
    layout(stage.querySelector('.callout-word-audio-v51'),'right',lowerBlankStart+(lowerBlankEnd-lowerBlankStart)*0.50);
  }
  function liftFlow(card){if(!card)return;const flow=card.querySelector('.reward-flow');if(flow&&flow.parentElement!==card)card.appendChild(flow)}
  function refineRewards(){const completeMark=document.querySelector('.learning-reward-complete .coin-mark');if(completeMark){completeMark.classList.add('seed-icon');completeMark.innerHTML=sprout}const seed=document.querySelector('.reward-mode-mark.seed');if(seed){seed.classList.add('seed-icon');seed.innerHTML=sprout}const coinMark=document.querySelector('.reward-mode-mark.coin');if(coinMark){coinMark.classList.add('coin-icon');coinMark.innerHTML=coin}liftFlow(document.querySelector('.learning-reward-mode'));liftFlow(document.querySelector('.coin-mode'))}
  function runAll(){refineCallouts();refineRewards();document.getElementById('library')?.remove();requestAnimationFrame(placeReflectionCallouts)}
  function boot(){runAll();const t=setInterval(runAll,160);setTimeout(()=>clearInterval(t),4500);window.addEventListener('resize',()=>requestAnimationFrame(placeReflectionCallouts),{passive:true});window.addEventListener('orientationchange',()=>setTimeout(placeReflectionCallouts,250),{passive:true});if('ResizeObserver' in window){const stage=document.querySelector('#reflection .reflection-stage-wrap');if(stage)new ResizeObserver(()=>requestAnimationFrame(placeReflectionCallouts)).observe(stage)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();