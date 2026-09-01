/* Mine English v84 — stable Reflection default-like + Learning pre-answer audio contract. */
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

  function installLearningPreAnswerAudio(){
    const screen=document.getElementById('learningScreenV74');
    if(!screen)return false;
    if(screen.dataset.v84PreanswerAudio==='1')return true;
    screen.dataset.v84PreanswerAudio='1';

    let timer=0;
    const speak=(text,lang='en-US',rate=.9)=>{
      if(!text||!('speechSynthesis' in window))return;
      try{
        window.speechSynthesis.cancel();
        const utter=new SpeechSynthesisUtterance(text);
        utter.lang=lang;
        utter.rate=rate;
        utter.volume=1;
        window.speechSynthesis.speak(utter);
      }catch(_){}
    };

    const unresolvedFirstPage=(e)=>{
      if(e.target.closest('button,a,[data-peek]'))return null;
      const page=e.target.closest('.learning-page-v77');
      if(!page||page.dataset.page!=='0'||page.dataset.choice)return null;
      return page;
    };

    /* Before answering Page 01, mirror Reflection:
       single click = highlighted phrase; double click = full sentence. */
    screen.addEventListener('click',e=>{
      const page=unresolvedFirstPage(e);
      if(!page)return;
      e.stopImmediatePropagation();
      clearTimeout(timer);
      const upper=page.querySelector('.learning-upper-v74');
      if(!upper)return;
      timer=setTimeout(()=>speak(upper.dataset.focusAudio||upper.dataset.fullAudio,'en-US',.9),220);
    },true);

    screen.addEventListener('dblclick',e=>{
      const page=unresolvedFirstPage(e);
      if(!page)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      clearTimeout(timer);
      const upper=page.querySelector('.learning-upper-v74');
      if(!upper)return;
      speak(upper.dataset.fullAudio||upper.dataset.focusAudio,'en-US',.9);
    },true);

    return true;
  }

  function boot(){
    const readyLike=applyDefaultLike();
    const readyAudio=installLearningPreAnswerAudio();
    if(readyLike&&readyAudio)return;
    const timer=setInterval(()=>{
      if(applyDefaultLike()&&installLearningPreAnswerAudio())clearInterval(timer);
    },100);
    setTimeout(()=>clearInterval(timer),6000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  new MutationObserver(()=>{
    applyDefaultLike();
    installLearningPreAnswerAudio();
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
