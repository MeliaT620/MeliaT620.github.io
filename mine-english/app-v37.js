/* Mine English v45 — interaction layer for the quiet demo system. */
(function(){
  const heart='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2 4.9 13.5C1.4 10.2 3.8 4.8 8.2 5.4c1.6.2 2.9 1.2 3.8 2.6.9-1.4 2.2-2.4 3.8-2.6 4.4-.6 6.8 4.8 3.3 8.1L12 20.2Z"/></svg>';
  const star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.8 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.6-5 2.6 1-5.6-4.1-4 5.6-.8L12 3.8Z"/></svg>';
  const share='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16.5 7.5M10.2 7.5h6.3v6.3"/></svg>';
  const comment='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.8h14v10.1H9l-4 3V5.8Z"/></svg>';

  function speak(text,lang='en-US',rate=.9){
    if(!text||!('speechSynthesis' in window))return;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      u.lang=lang;u.rate=rate;u.volume=1;
      speechSynthesis.speak(u);
    }catch(_){}
  }
  function locale(scope){return scope.querySelector('.accent-toggle')?.dataset.accent==='UK'?'en-GB':'en-US'}

  function installSpatialAudio(){
    document.querySelectorAll('.learning-scene.judge-scene,#reflection .reflection-screen').forEach(scope=>{
      if(scope.dataset.v37Audio==='1')return;
      scope.dataset.v37Audio='1';
      let sx=0,sy=0,moved=false,timer=null;
      scope.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,[data-peek]'))return;sx=e.clientX;sy=e.clientY;moved=false},true);
      scope.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>10)moved=true},true);
      const decide=(e,full)=>{
        if(e.target.closest('button,a,[data-peek]')||moved)return;
        const upper=scope.querySelector('.demo-upper');
        const lower=scope.querySelector('.demo-lower');
        const divider=scope.querySelector('.support-divider');
        if(!upper)return;
        let text,rate=.9;
        const answered=!scope.classList.contains('judge-scene')||!!scope.dataset.choice;
        if(!answered){
          text=full?(upper.dataset.fullAudio||upper.dataset.focusAudio):(upper.dataset.focusAudio||upper.dataset.fullAudio);
        }else{
          const boundary=divider?.getBoundingClientRect().top??Infinity;
          if(e.clientY>boundary&&lower){text=lower.dataset.wordAudio;rate=.84}
          else text=full?(upper.dataset.fullAudio||upper.dataset.focusAudio):(upper.dataset.focusAudio||upper.dataset.fullAudio);
        }
        if(text)speak(text,locale(scope),rate);
      };
      scope.addEventListener('click',e=>{
        if(e.target.closest('button,a,[data-peek]')||moved)return;
        clearTimeout(timer);timer=setTimeout(()=>decide(e,false),220);
      });
      scope.addEventListener('dblclick',e=>{
        if(e.target.closest('button,a,[data-peek]')||moved)return;
        e.preventDefault();clearTimeout(timer);decide(e,true);
      });
    });
  }

  function installAccent(){
    document.querySelectorAll('.accent-toggle').forEach(btn=>{
      if(btn.dataset.v37Accent==='1')return;
      btn.dataset.v37Accent='1';
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const next=btn.dataset.accent==='US'?'UK':'US';
        btn.dataset.accent=next;btn.textContent=next;
        const ipa=btn.closest('.support-grid')?.querySelector('.ipa');
        if(ipa)ipa.textContent=next==='US'?btn.dataset.us:btn.dataset.uk;
      });
    });
  }

  function prepareWordPeek(){
    const overlay=document.getElementById('globalWordPeek');
    if(!overlay||overlay.dataset.v37Peek==='1')return false;
    overlay.dataset.v37Peek='1';
    const sheet=overlay.querySelector('.peek-sheet');
    if(!sheet)return false;
    sheet.innerHTML=`
      <button class="peek-x" aria-label="关闭">×</button>
      <div class="peek-overview-head"><small>WORD OVERVIEW</small><span class="peek-concept">概念示意</span></div>
      <div class="peek-word">lead</div>
      <div class="peek-pron-summary">/led/ · /liːd/</div>
      <div class="peek-bridge">同一个拼写，会进入两个完全不同的 Usage 和读音。</div>
      <div class="peek-story">名词 lead “铅”读 /led/；动词 lead “带领”读 /liːd/。Mine 分开追踪它们的记忆状态，而不是把整个 Word 粗略地判成“会”或“不会”。</div>`;
    sheet.querySelector('.peek-x')?.addEventListener('click',()=>overlay.classList.remove('open'));
    return true;
  }

  function installSocial(){
    const screen=document.querySelector('#reflection .reflection-screen');
    const layer=document.getElementById('liveComments');
    if(!screen||!layer||screen.dataset.v37Social==='1')return false;
    screen.dataset.v37Social='1';
    const buttons={like:screen.querySelector('[data-social="like"]'),save:screen.querySelector('[data-social="save"]'),share:screen.querySelector('[data-social="share"]'),comment:screen.querySelector('[data-social="comment"]')};
    if(buttons.like)buttons.like.innerHTML=heart+'<small class="social-count">5</small>';
    if(buttons.save)buttons.save.innerHTML=star+'<small class="social-count">1</small>';
    if(buttons.share)buttons.share.innerHTML=share;
    if(buttons.comment)buttons.comment.innerHTML=comment+'<small>24</small>';
    const toast=document.getElementById('reflectionToast');let toastTimer;
    const showToast=t=>{if(!toast)return;toast.textContent=t;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1100)};
    screen.addEventListener('click',async e=>{
      const btn=e.target.closest('.social-action');if(!btn)return;
      e.preventDefault();e.stopImmediatePropagation();
      const type=btn.dataset.social;
      if(type==='like'||type==='save'){
        const active=!btn.classList.contains('active');btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',active?'true':'false');
        const count=btn.querySelector('.social-count');if(count)count.textContent=String(Number(btn.dataset.base||0)+(active?1:0));
      }else if(type==='comment'){
        const hidden=!layer.classList.contains('is-hidden');layer.classList.toggle('is-hidden',hidden);btn.classList.toggle('active',!hidden);btn.setAttribute('aria-pressed',hidden?'false':'true');
      }else if(type==='share'){
        try{if(navigator.share)await navigator.share({title:'Mine English',url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);showToast('链接已复制')}}catch(_){}
      }
    },true);
    const comments=[['原来 lead 两个读音完全不一样',32],['made of lead 整块记，更容易想起来',18],['先看句子，再看词义，这个顺序很舒服',27],['一个 Usage 一段记忆历史，很直观',41],['这种页面很安静，我会愿意多看一会儿',23]];
    let cursor=0;
    const spawn=()=>{
      if(layer.classList.contains('is-hidden'))return;
      const [text,base]=comments[cursor++%comments.length];
      const item=document.createElement('div');item.className='live-comment';
      item.innerHTML=`<div class="live-comment-body"><span class="live-comment-text"></span><button class="comment-like" type="button" aria-pressed="false">${heart}<span>${base}</span></button></div>`;
      item.querySelector('.live-comment-text').textContent=text;
      const like=item.querySelector('.comment-like');like.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const active=!like.classList.contains('active');like.classList.toggle('active',active);like.setAttribute('aria-pressed',active?'true':'false');like.querySelector('span').textContent=String(base+(active?1:0))});
      layer.appendChild(item);setTimeout(()=>item.remove(),7200);
    };
    spawn();setTimeout(spawn,1900);screen._v37Comments=setInterval(spawn,2250);return true;
  }

  function boot(){
    installSpatialAudio();installAccent();prepareWordPeek();installSocial();
    const t=setInterval(()=>{installSpatialAudio();installAccent();prepareWordPeek();installSocial()},100);
    setTimeout(()=>clearInterval(t),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  new MutationObserver(()=>{installSpatialAudio();installAccent();prepareWordPeek();installSocial()}).observe(document.documentElement,{childList:true,subtree:true});
})();