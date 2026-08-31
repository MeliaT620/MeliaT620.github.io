/* Mine English v35 — visual-layer interactions for the v32 UI system.
   The core learning gesture controller remains in app.js. */
(function(){
  const speakerSvg='<svg class="audio-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M5.25 9.25h3.1l3.7-3.1v11.7l-3.7-3.1h-3.1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M15.1 9.15a4.2 4.2 0 0 1 0 5.7M17.65 6.9a7.4 7.4 0 0 1 0 10.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const heartSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.4 4.7 13.5C1.1 10.1 3.7 4.4 8.2 5.2c1.6.3 2.8 1.3 3.8 2.7 1-1.4 2.2-2.4 3.8-2.7 4.5-.8 7.1 4.9 3.5 8.3L12 20.4Z"/></svg>';

  function polishAudio(root=document){
    root.querySelectorAll?.('.example-audio,.word-audio').forEach(btn=>{
      if(!btn.querySelector('svg'))btn.innerHTML=speakerSvg;
    });
  }

  function installAccentSurface(root=document){
    root.querySelectorAll?.('.accent-switch').forEach(sw=>{
      if(sw.dataset.surfaceReady==='1')return;
      sw.dataset.surfaceReady='1';
      sw.addEventListener('click',e=>{
        if(e.target.closest('button'))return;
        const buttons=[...sw.querySelectorAll('button')];
        if(buttons.length<2)return;
        e.preventDefault();
        e.stopPropagation();
        const current=buttons.findIndex(b=>b.classList.contains('active'));
        buttons[(current+1)%buttons.length].click();
      });
    });
  }

  function installReflection(){
    const screen=document.querySelector('.reflection-screen');
    const layer=document.getElementById('liveComments');
    if(!screen||!layer)return false;
    if(screen.dataset.v35Ready==='1')return true;
    screen.dataset.v35Ready='1';

    const toast=document.getElementById('reflectionToast');
    let toastTimer=null;
    const showToast=msg=>{
      if(!toast)return;
      toast.textContent=msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer=setTimeout(()=>toast.classList.remove('show'),1200);
    };

    /* Capture social actions before the legacy bubble listeners in app.js.
       This keeps SVG icons intact and gives v35 sole ownership of the rail. */
    screen.addEventListener('click',async e=>{
      const btn=e.target.closest('.social-action');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();

      const type=btn.dataset.social;
      if(type==='like'||type==='save'){
        const active=!btn.classList.contains('active');
        btn.classList.toggle('active',active);
        btn.setAttribute('aria-pressed',active?'true':'false');
        const count=btn.querySelector('.social-count');
        if(count)count.textContent=String(Number(btn.dataset.base||0)+(active?1:0));
        return;
      }
      if(type==='comment'){
        const hidden=!layer.classList.contains('is-hidden');
        layer.classList.toggle('is-hidden',hidden);
        btn.classList.toggle('active',!hidden);
        btn.setAttribute('aria-pressed',hidden?'false':'true');
        return;
      }
      if(type==='share'){
        try{
          if(navigator.share){
            await navigator.share({title:'Mine English',url:location.href});
          }else if(navigator.clipboard){
            await navigator.clipboard.writeText(location.href);
            showToast('链接已复制');
          }else{
            showToast('Share');
          }
        }catch(_){}
      }
    },true);

    const comments=[
      {text:'原来这个 lead 和“带领”的读音完全不一样',likes:32},
      {text:'made of lead 整块记，比单背词义自然多了',likes:18},
      {text:'这种先理解句子、再看词义的顺序很舒服',likes:27},
      {text:'一个 Usage 一个记忆状态，这个思路很直观',likes:41}
    ];
    let cursor=0;

    const spawn=()=>{
      if(layer.classList.contains('is-hidden'))return;
      const data=comments[cursor%comments.length];
      cursor++;

      const item=document.createElement('div');
      item.className='live-comment';
      item.innerHTML=`<div class="live-comment-body"><span class="live-comment-text"></span><button class="comment-like" type="button" aria-pressed="false">${heartSvg}<span>${data.likes}</span></button></div>`;
      item.querySelector('.live-comment-text').textContent=data.text;

      const like=item.querySelector('.comment-like');
      like.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        const active=!like.classList.contains('active');
        like.classList.toggle('active',active);
        like.setAttribute('aria-pressed',active?'true':'false');
        like.querySelector('span').textContent=String(data.likes+(active?1:0));
      });

      layer.appendChild(item);
      item.addEventListener('animationend',()=>item.remove(),{once:true});
      setTimeout(()=>{ if(item.isConnected)item.remove(); },9000);
    };

    spawn();
    setTimeout(spawn,1800);
    screen._mineCommentTimer=setInterval(spawn,2850);
    return true;
  }

  function boot(){
    polishAudio();
    installAccentSurface();
    if(!installReflection()){
      const timer=setInterval(()=>{
        polishAudio();
        installAccentSurface();
        if(installReflection())clearInterval(timer);
      },70);
      setTimeout(()=>clearInterval(timer),6000);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  new MutationObserver(mutations=>{
    for(const mutation of mutations){
      for(const node of mutation.addedNodes){
        if(node.nodeType!==1)continue;
        polishAudio(node);
        installAccentSurface(node);
      }
    }
  }).observe(document.documentElement,{childList:true,subtree:true});
})();