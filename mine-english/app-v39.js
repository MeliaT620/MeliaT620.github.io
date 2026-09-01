/* Mine English v59 — final Reflection annotation placement pass. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';

  function refineCallouts(){
    const upper=document.querySelector('#reflection .callout-audio-v51 small');
    const overview=document.querySelector('#reflection .callout-overview-v51 small');
    const lower=document.querySelector('#reflection .callout-word-audio-v51 small');
    if(upper)upper.innerHTML='单击空白<br>朗读高亮<br>双击空白<br>朗读整句';
    if(overview)overview.innerHTML='单击单词<br>查看 Word<br>Overview';
    if(lower)lower.innerHTML='单击空白<br>朗读单词';
  }

  function placeReflectionCallouts(){
    const stage=document.querySelector('#reflection .reflection-stage-wrap');
    const device=stage?.querySelector('.reflection-device');
    const progress=stage?.querySelector('.reflection-progress');
    const sentence=stage?.querySelector('.reflection-example');
    const divider=stage?.querySelector('.support-divider');
    const word=stage?.querySelector('.reflection-support .support-word');
    const support=stage?.querySelector('.reflection-support');
    const firstAction=stage?.querySelector('.reflection-actions .social-action');
    if(!stage||!device||!progress||!sentence||!divider||!word||!support)return;

    const sr=stage.getBoundingClientRect();
    const dr=device.getBoundingClientRect();
    const pr=progress.getBoundingClientRect();
    const rr=sentence.getBoundingClientRect();
    const wr=word.getBoundingClientRect();
    const spr=support.getBoundingClientRect();
    const ar=firstAction?.getBoundingClientRect();

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
      if(text){text.style.setProperty('white-space','normal','important');text.style.setProperty('line-height','1.42','important');}
      return {dot,line,text};
    };

    const placeRight=(el,targetY)=>{
      const parts=resetShell(el,targetY); if(!parts)return;
      const dotSize=parts.dot?.offsetWidth||6;
      const dotX=(dr.right-sr.left)-38;
      const lineStart=dotX+dotSize+4;
      const textLeft=(dr.right-sr.left)+10;
      const textWidth=Math.max(44,Math.min(58,sr.width-textLeft-4));
      const lineWidth=Math.max(18,textLeft-lineStart-5);
      if(parts.dot){parts.dot.style.setProperty('display','block','important');parts.dot.style.setProperty('left',`${Math.round(dotX)}px`,'important');parts.dot.style.setProperty('transform','translateY(-50%)','important');}
      if(parts.line){parts.line.style.setProperty('display','block','important');parts.line.style.setProperty('left',`${Math.round(lineStart)}px`,'important');parts.line.style.setProperty('width',`${Math.round(lineWidth)}px`,'important');parts.line.style.setProperty('transform','translateY(-50%)','important');}
      if(parts.text){parts.text.style.setProperty('display','block','important');parts.text.style.setProperty('left',`${Math.round(textLeft)}px`,'important');parts.text.style.setProperty('width',`${Math.round(textWidth)}px`,'important');parts.text.style.setProperty('transform','translateY(-50%)','important');parts.text.style.setProperty('text-align','left','important');}
    };

    const placeOverviewInside=(el,targetY)=>{
      const parts=resetShell(el,targetY); if(!parts)return;
      // Overview is a lightweight inline annotation immediately after "lead".
      if(parts.dot)parts.dot.style.setProperty('display','none','important');
      if(parts.line)parts.line.style.setProperty('display','none','important');
      if(parts.text){
        const textLeft=(wr.right-sr.left)+12;
        const maxRight=(dr.right-sr.left)-20;
        const textWidth=Math.max(58,Math.min(76,maxRight-textLeft));
        parts.text.style.setProperty('display','block','important');
        parts.text.style.setProperty('left',`${Math.round(textLeft)}px`,'important');
        parts.text.style.setProperty('width',`${Math.round(textWidth)}px`,'important');
        parts.text.style.setProperty('transform','translateY(-50%)','important');
        parts.text.style.setProperty('text-align','left','important');
      }
    };

    placeOverviewInside(stage.querySelector('.callout-overview-v51'),wr.top+wr.height/2);

    // Move the upper audio hint slightly lower within the progress-to-sentence blank zone.
    const upperY=pr.bottom+(rr.top-pr.bottom)*0.74;

    // Move the word-audio hint substantially lower into the large blank area below support.
    const lowerTarget=ar ? ar.top : (spr.bottom+150);
    const lowerY=spr.bottom+(lowerTarget-spr.bottom)*0.42;

    placeRight(stage.querySelector('.callout-audio-v51'),upperY);
    placeRight(stage.querySelector('.callout-word-audio-v51'),lowerY);
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