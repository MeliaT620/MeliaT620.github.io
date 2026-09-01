/* Mine English v57 — Reflection annotations use independent dot/line/text geometry. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';

  function refineCallouts(){
    const upper=document.querySelector('#reflection .callout-audio-v51 small');
    const overview=document.querySelector('#reflection .callout-overview-v51 small');
    const lower=document.querySelector('#reflection .callout-word-audio-v51 small');
    if(upper)upper.innerHTML='单击空白 · 朗读高亮<br>双击空白 · 朗读整句';
    if(overview)overview.innerHTML='单击单词<br>查看 Word Overview';
    if(lower)lower.innerHTML='单击空白 · 朗读单词';
  }

  function placeReflectionCallouts(){
    const stage=document.querySelector('#reflection .reflection-stage-wrap');
    const device=stage?.querySelector('.reflection-device');
    const progress=stage?.querySelector('.reflection-progress');
    const sentence=stage?.querySelector('.reflection-example');
    const divider=stage?.querySelector('.support-divider');
    const word=stage?.querySelector('.reflection-support .support-word');
    if(!stage||!device||!progress||!sentence||!divider||!word)return;

    const sr=stage.getBoundingClientRect();
    const dr=device.getBoundingClientRect();
    const pr=progress.getBoundingClientRect();
    const rr=sentence.getBoundingClientRect();
    const lr=divider.getBoundingClientRect();
    const wr=word.getBoundingClientRect();

    const resetShell=(el,targetY)=>{
      if(!el)return null;
      el.style.setProperty('left','0px','important');
      el.style.setProperty('right','auto','important');
      el.style.setProperty('top',`${Math.round(targetY-sr.top)}px`,'important');
      el.style.setProperty('width',`${Math.round(sr.width)}px`,'important');
      el.style.setProperty('height','0px','important');
      const dot=el.querySelector('.callout-dot');
      const line=el.querySelector('.callout-line');
      const text=el.querySelector('small');
      [dot,line,text].forEach(n=>{if(!n)return;n.style.setProperty('position','absolute','important');n.style.setProperty('top','0px','important');});
      return {dot,line,text};
    };

    const placeRight=(el,targetY)=>{
      const parts=resetShell(el,targetY); if(!parts)return;
      const dotSize=parts.dot?.offsetWidth||6;
      const dotX=(dr.right-sr.left)-14;
      const lineStart=dotX+dotSize+4;
      const textWidth=parts.text?.offsetWidth||78;
      const textLeft=Math.min(sr.width-textWidth-2,(dr.right-sr.left)+20);
      const lineWidth=Math.max(12,textLeft-lineStart-4);
      if(parts.dot){parts.dot.style.setProperty('left',`${Math.round(dotX)}px`,'important');parts.dot.style.setProperty('transform','translateY(-50%)','important');}
      if(parts.line){parts.line.style.setProperty('left',`${Math.round(lineStart)}px`,'important');parts.line.style.setProperty('width',`${Math.round(lineWidth)}px`,'important');parts.line.style.setProperty('transform','translateY(-50%)','important');}
      if(parts.text){parts.text.style.setProperty('left',`${Math.round(textLeft)}px`,'important');parts.text.style.setProperty('transform','translateY(-50%)','important');parts.text.style.setProperty('text-align','left','important');}
    };

    const placeOverview=(el,targetY)=>{
      const parts=resetShell(el,targetY); if(!parts)return;
      const dotSize=parts.dot?.offsetWidth||6;
      const dotX=(wr.left-sr.left)-12;
      const textWidth=parts.text?.offsetWidth||94;
      const textLeft=Math.max(2,(dr.left-sr.left)-textWidth-12);
      const lineLeft=textLeft+textWidth+5;
      const lineWidth=Math.max(10,dotX-lineLeft-5);
      if(parts.text){parts.text.style.setProperty('left',`${Math.round(textLeft)}px`,'important');parts.text.style.setProperty('transform','translateY(-50%)','important');parts.text.style.setProperty('text-align','right','important');}
      if(parts.line){parts.line.style.setProperty('left',`${Math.round(lineLeft)}px`,'important');parts.line.style.setProperty('width',`${Math.round(lineWidth)}px`,'important');parts.line.style.setProperty('transform','translateY(-50%)','important');}
      if(parts.dot){parts.dot.style.setProperty('left',`${Math.round(dotX)}px`,'important');parts.dot.style.setProperty('transform','translateY(-50%)','important');}
    };

    placeOverview(stage.querySelector('.callout-overview-v51'),wr.top+wr.height/2);
    placeRight(stage.querySelector('.callout-audio-v51'),pr.bottom+(rr.top-pr.bottom)*0.50);
    placeRight(stage.querySelector('.callout-word-audio-v51'),lr.bottom+(wr.top-lr.bottom)*0.50);
  }

  function liftFlow(card){if(!card)return;const flow=card.querySelector('.reward-flow');if(flow&&flow.parentElement!==card)card.appendChild(flow)}
  function refineRewards(){
    const completeMark=document.querySelector('.learning-reward-complete .coin-mark');
    if(completeMark){completeMark.classList.add('seed-icon');completeMark.innerHTML=sprout}
    const seed=document.querySelector('.reward-mode-mark.seed');if(seed){seed.classList.add('seed-icon');seed.innerHTML=sprout}
    const coinMark=document.querySelector('.reward-mode-mark.coin');if(coinMark){coinMark.classList.add('coin-icon');coinMark.innerHTML=coin}
    liftFlow(document.querySelector('.learning-reward-mode'));liftFlow(document.querySelector('.coin-mode'))
  }
  function runAll(){refineCallouts();refineRewards();document.getElementById('library')?.remove();requestAnimationFrame(placeReflectionCallouts)}
  function boot(){runAll();const t=setInterval(runAll,160);setTimeout(()=>clearInterval(t),4500);window.addEventListener('resize',()=>requestAnimationFrame(placeReflectionCallouts),{passive:true});window.addEventListener('orientationchange',()=>setTimeout(placeReflectionCallouts,250),{passive:true});if('ResizeObserver' in window){const stage=document.querySelector('#reflection .reflection-stage-wrap');if(stage)new ResizeObserver(()=>requestAnimationFrame(placeReflectionCallouts)).observe(stage)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();