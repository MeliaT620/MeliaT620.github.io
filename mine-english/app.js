
(async()=>{
  const host=document.getElementById('contentHost');
  const parts=await Promise.all([1,2,3].map(i=>fetch(`content-${i}.html`).then(r=>r.text())));
  host.innerHTML=parts.join('\n');
  initPage();
})();

function initPage(){
  const progress=document.getElementById('scrollProgress');
  const toc=document.getElementById('tocPanel');
  const backdrop=document.getElementById('tocBackdrop');
  const btn=document.getElementById('tocBtn');
  const close=document.getElementById('tocClose');
  const links=[...document.querySelectorAll('.toc-links a')];
  const setToc=open=>{toc.classList.toggle('open',open);backdrop.classList.toggle('open',open);btn.setAttribute('aria-expanded',open?'true':'false')};
  btn?.addEventListener('click',()=>setToc(!toc.classList.contains('open')));close?.addEventListener('click',()=>setToc(false));backdrop?.addEventListener('click',()=>setToc(false));links.forEach(a=>a.addEventListener('click',()=>setToc(false)));
  const update=()=>{const h=document.documentElement,max=h.scrollHeight-h.clientHeight,p=max>0?h.scrollTop/max*100:0;progress.style.width=p+'%';progress.style.setProperty('--progress',p)};
  document.addEventListener('scroll',update,{passive:true});update();
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting) links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{threshold:.18,rootMargin:'-15% 0px -60% 0px'});document.querySelectorAll('section[id]').forEach(s=>so.observe(s));
  initJudgeScenes();initAccentToggles();initAudio();initWordPeek();
}

function initJudgeScenes(){
  document.querySelectorAll('.judge-scene').forEach(scene=>{
    let startX=null, dx=0;
    const resetGlow=()=>{scene.style.setProperty('--left-glow','0');scene.style.setProperty('--right-glow','0')};
    scene.addEventListener('pointerdown',e=>{if(e.target.closest('button,details,summary'))return;startX=e.clientX;dx=0;scene.setPointerCapture?.(e.pointerId)});
    scene.addEventListener('pointermove',e=>{
      if(startX===null)return;
      dx=Math.max(-110,Math.min(110,e.clientX-startX));
      const left=Math.max(0,-dx)/110,right=Math.max(0,dx)/110;
      scene.style.setProperty('--left-glow',left.toFixed(3));
      scene.style.setProperty('--right-glow',right.toFixed(3));
    });
    const finish=e=>{
      if(startX===null)return;
      const v=dx;startX=null;dx=0;
      if(Math.abs(v)>52){
        scene.classList.toggle('known',v<0);scene.classList.toggle('not-yet',v>0);
        scene.querySelectorAll('.answer-reveal').forEach(el=>el.classList.add('visible'));
      }
      resetGlow();
      try{scene.releasePointerCapture?.(e.pointerId)}catch(_){}
    };
    scene.addEventListener('pointerup',finish);scene.addEventListener('pointercancel',finish);resetGlow();
  });
}

function initAccentToggles(){
  document.querySelectorAll('.accent-toggle').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const ipa=btn.parentElement.querySelector('.ipa');
      const us=btn.dataset.us,uk=btn.dataset.uk;
      if(btn.textContent.trim()==='US'){btn.textContent='UK';ipa.textContent=uk}else{btn.textContent='US';ipa.textContent=us}
    });
  });
}

function initAudio(){
  document.querySelectorAll('.example-audio').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      btn.classList.add('playing');setTimeout(()=>btn.classList.remove('playing'),650);
      if(!('speechSynthesis' in window))return;
      window.speechSynthesis.cancel();
      const utter=new SpeechSynthesisUtterance(btn.dataset.full||btn.dataset.focus||'');
      const scene=btn.closest('.learning-scene');
      const accent=scene?.querySelector('.accent-toggle')?.textContent.trim()==='UK'?'en-GB':'en-US';
      utter.lang=accent;utter.rate=.92;window.speechSynthesis.speak(utter);
    });
  });
}

function initWordPeek(){
  let overlay=document.getElementById('globalWordPeek');
  if(!overlay){
    overlay=document.createElement('div');overlay.id='globalWordPeek';overlay.className='global-word-peek';
    overlay.innerHTML='<div class="peek-sheet"><button class="peek-x">×</button><small>WORD OVERVIEW</small><h4></h4><strong></strong><p></p></div>';
    document.body.appendChild(overlay);
  }
  const data={
    deliberate:{core:'核心感觉：不是随手发生，而是经过意识与考虑。',story:'第一次遇见一个新 Word，Mine 会先给你一张很短的地图。你不需要背一串词典释义；先抓住整体感觉，再去学具体 Usage。作为形容词和动词时，它的读音也不同，这种真正影响使用的信息会跟着当前例句出现。'}
  };
  document.querySelectorAll('[data-peek]').forEach(w=>w.addEventListener('click',e=>{e.stopPropagation();const d=data[w.dataset.peek]||data.deliberate;overlay.querySelector('h4').textContent=w.dataset.peek;overlay.querySelector('strong').textContent=d.core;overlay.querySelector('p').textContent=d.story;overlay.classList.add('open')}));
  overlay.querySelector('.peek-x').addEventListener('click',()=>overlay.classList.remove('open'));overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
}
