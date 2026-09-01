/* Mine English v80 — stable default social state for Reflection. */
(function(){
  function applyDefaultLike(){
    const screen=document.querySelector('#reflection .reflection-screen');
    if(!screen||screen.dataset.v37Social!=='1')return false;
    const like=screen.querySelector('.like-action');
    if(!like)return false;
    if(like.dataset.v80DefaultLike==='1')return true;

    like.dataset.v80DefaultLike='1';
    like.classList.add('active');
    like.setAttribute('aria-pressed','true');
    const count=like.querySelector('.social-count');
    const base=Number(like.dataset.base||0);
    if(count)count.textContent=String(base+1);
    return true;
  }

  function boot(){
    if(applyDefaultLike())return;
    const timer=setInterval(()=>{if(applyDefaultLike())clearInterval(timer)},100);
    setTimeout(()=>clearInterval(timer),6000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  new MutationObserver(applyDefaultLike).observe(document.documentElement,{childList:true,subtree:true});
})();
