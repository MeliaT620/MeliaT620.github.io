/* Mine English v71 — Reflection annotations + reward icons. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';
  function refineCallouts(){
    const upper=document.querySelector('#reflection .callout-audio-v51 small');
    const overview=document.querySelector('#reflection .callout-overview-v51 small');
    const lower=document.querySelector('#reflection .callout-word-audio-v51 small');
    if(upper)upper.innerHTML='单击空白<br>朗读高亮<br>双击空白<br>朗读整句';
    if(overview)overview.textContent='单击单词查看 Word Overview';
    if(lower)lower.innerHTML='单击空白<br>朗读单词';
  }
  function textRect(el){try{const range=document.createRange();range.selectNodeContents(el);const rect=range.getBoundingClientRect();if(rect&&rect.width>0)return rect}catch(e){}return el.getBoundingClientRect()}
  function placeReflectionCallouts(){
    const stage=document.querySelector('#reflection .reflection-stage-wrap'),device=stage?.querySelector('.reflection-device'),progress=stage?.querySelector('.reflection-progress'),sentence=stage?.querySelector('.reflection-example'),word=stage?.querySelector('.reflection-support .support-word'),support=stage?.querySelector('.reflection-support'),firstAction=stage?.querySelector('.reflection-actions .social-action');
    if(!stage||!device||!progress||!sentence||!word||!support)return;
    const sr=stage.getBoundingClientRect(),dr=device.getBoundingClientRect(),pr=progress.getBoundingClientRect(),rr=sentence.getBoundingClientRect(),wr=textRect(word),spr=support.getBoundingClientRect(),ar=firstAction?.getBoundingClientRect();
    const resetShell=(el,targetY)=>{if(!el)return null;el.style.setProperty('left','0px','important');el.style.setProperty('right','auto','important');el.style.setProperty('top',`${Math.round(targetY-sr.top)}px`,'important');el.style.setProperty('width',`${Math.round(sr.width)}px`,'important');el.style.setProperty('height','0px','important');const dot=el.querySelector('.callout-dot'),line=el.querySelector('.callout-line'),text=el.querySelector('small');[dot,line,text].forEach(n=>{if(n){n.style.setProperty('position','absolute','important');n.style.setProperty('top','0px','important')}});if(text)text.style.setProperty('line-height','1.42','important');return{dot,line,text}};
    const placeRight=(el,targetY)=>{const p=resetShell(el,targetY);if(!p)return;const ds=p.dot?.offsetWidth||6,dotLeft=(dr.right-sr.left)-38,dotCenter=dotLeft+ds/2,textLeft=(dr.right-sr.left)+10,textWidth=Math.max(44,Math.min(58,sr.width-textLeft-4)),lineLeft=dotCenter,lineWidth=Math.max(18,textLeft-lineLeft);if(p.dot){p.dot.style.setProperty('display','block','important');p.dot.style.setProperty('left',`${Math.round(dotLeft)}px`,'important');p.dot.style.setProperty('transform','translateY(-50%)','important')}if(p.line){p.line.style.setProperty('display','block','important');p.line.style.setProperty('left',`${Math.round(lineLeft)}px`,'important');p.line.style.setProperty('width',`${Math.round(lineWidth)}px`,'important');p.line.style.setProperty('transform','translateY(-50%)','important')}if(p.text){p.text.style.setProperty('display','block','important');p.text.style.setProperty('left',`${Math.round(textLeft)}px`,'important');p.text.style.setProperty('width',`${Math.round(textWidth)}px`,'important');p.text.style.setProperty('white-space','normal','important');p.text.style.setProperty('transform','translateY(-50%)','important');p.text.style.setProperty('text-align','left','important')}};
    const placeOverviewInside=(el,targetY)=>{const p=resetShell(el,targetY);if(!p)return;const ds=p.dot?.offsetWidth||6,dotCenter=(wr.right-sr.left)+5,dotLeft=dotCenter-ds/2,lineLeft=dotCenter,lineWidth=30,textLeft=lineLeft+lineWidth+3,phoneRight=(dr.right-sr.left)-18,textWidth=Math.max(120,phoneRight-textLeft);if(p.dot){p.dot.style.setProperty('display','block','important');p.dot.style.setProperty('left',`${Math.round(dotLeft)}px`,'important');p.dot.style.setProperty('transform','translateY(-50%)','important')}if(p.line){p.line.style.setProperty('display','block','important');p.line.style.setProperty('left',`${Math.round(lineLeft)}px`,'important');p.line.style.setProperty('width',`${lineWidth}px`,'important');p.line.style.setProperty('transform','translateY(-50%)','important')}if(p.text){p.text.style.setProperty('display','block','important');p.text.style.setProperty('left',`${Math.round(textLeft)}px`,'important');p.text.style.setProperty('width',`${Math.round(textWidth)}px`,'important');p.text.style.setProperty('white-space','nowrap','important');p.text.style.setProperty('transform','translateY(-50%)','important');p.text.style.setProperty('text-align','left','important')}};
    placeOverviewInside(stage.querySelector('.callout-overview-v51'),wr.top+wr.height/2);
    const upperY=pr.bottom+(rr.top-pr.bottom)*0.74,lowerTarget=ar?ar.top:(spr.bottom+150),lowerY=spr.bottom+(lowerTarget-spr.bottom)*0.42;
    placeRight(stage.querySelector('.callout-audio-v51'),upperY);placeRight(stage.querySelector('.callout-word-audio-v51'),lowerY);
  }
  function injectIcon(el,svg,extraClass){if(!el)return;el.classList.add(extraClass);if(!el.querySelector('svg'))el.innerHTML=svg}
  function refineRewards(){
    injectIcon(document.querySelector('.reward-growth-v71 .reward-item-mark-v71'),sprout,'seed-icon');
    injectIcon(document.querySelector('.reward-coins-v71 .reward-item-mark-v71'),coin,'coin-icon');
    injectIcon(document.querySelector('.learning-reward-complete .coin-mark'),sprout,'seed-icon');
    injectIcon(document.querySelector('.reward-mode-mark.seed'),sprout,'seed-icon');
    injectIcon(document.querySelector('.reward-mode-mark.coin'),coin,'coin-icon');
  }
  function runAll(){refineCallouts();refineRewards();document.getElementById('library')?.remove();requestAnimationFrame(placeReflectionCallouts)}
  function boot(){runAll();const t=setInterval(runAll,160);setTimeout(()=>clearInterval(t),4500);window.addEventListener('resize',()=>requestAnimationFrame(placeReflectionCallouts),{passive:true});window.addEventListener('orientationchange',()=>setTimeout(placeReflectionCallouts,250),{passive:true});if('ResizeObserver' in window){const stage=document.querySelector('#reflection .reflection-stage-wrap');if(stage)new ResizeObserver(()=>requestAnimationFrame(placeReflectionCallouts)).observe(stage)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();