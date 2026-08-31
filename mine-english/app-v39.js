/* Mine English v39 — copy and tiny DOM refinements. */
(function(){
  function refineCallouts(){
    const upper=document.querySelector('.reflection-callout.callout-upper small');
    const lower=document.querySelector('.reflection-callout.callout-lower small');
    if(upper)upper.innerHTML='单击朗读高亮<br>双击朗读整句';
    if(lower)lower.textContent='单击朗读单词';
  }
  function boot(){
    refineCallouts();
    const t=setInterval(refineCallouts,100);
    setTimeout(()=>clearInterval(t),5000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
