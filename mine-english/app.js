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
  btn.addEventListener('click',()=>setToc(!toc.classList.contains('open')));close.addEventListener('click',()=>setToc(false));backdrop.addEventListener('click',()=>setToc(false));links.forEach(a=>a.addEventListener('click',()=>setToc(false)));
  const update=()=>{const h=document.documentElement,max=h.scrollHeight-h.clientHeight;progress.style.width=(max>0?h.scrollTop/max*100:0)+'%'};document.addEventListener('scroll',update,{passive:true});update();
  const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'});document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
  const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting) links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{threshold:.2,rootMargin:'-15% 0px -60% 0px'});document.querySelectorAll('section[id]').forEach(s=>so.observe(s));
  initLearningDemo();
}

function initLearningDemo(){
  const phone=document.getElementById('learningPhone'); if(!phone) return;
  const card=document.getElementById('learningCard'), stage=document.getElementById('stageName'), row=document.getElementById('decisionRow'), next=document.getElementById('downNext'), dots=document.getElementById('demoDots');
  const peek=document.getElementById('wordPeek'), peekClose=document.getElementById('peekClose'), fb=document.getElementById('feedbackBtn'), pop=document.getElementById('feedbackPop');
  const states={}; let idx=0, startX=null, dragX=0;
  const slides=[
    {stage:'Review · Understand',judge:true,word:'issue',grammar:'VT',html:`<div class="learn-wordline"><button class="learn-word" data-peek="issue">issue</button><span class="grammar-tag">VT</span></div><div class="learn-prompt">The embassy <mark>issued her a visa</mark>.<small>先只看英文：你理解这里的 issue 吗？</small></div><div class="answer-reveal"><div class="answer-main">签发；发放</div><div class="answer-definition">to officially provide or give something, especially a document</div><div class="answer-phrase">大使馆给她签发了一张签证。</div></div>`},
    {stage:'Review · Express',judge:true,word:'issue',grammar:'VT',html:`<div class="learn-wordline"><button class="learn-word" data-peek="issue">issue</button><span class="grammar-tag">VT</span></div><div class="learn-prompt">大使馆给她签发了一张签证。<small>The embassy <span class="cloze">issued her a visa</span>.</small></div><div class="answer-reveal"><div class="answer-main">issued her a visa</div><div class="answer-definition">不是只想起 issued，而是把真正自然的表达整块找回来。</div></div>`},
    {stage:'Grow · Word Overview',judge:false,word:'refrain',grammar:'',html:`<div class="learn-wordline"><span class="learn-word">refrain</span></div><div class="learn-prompt"><div class="overview-core">核心感觉：把自己收住，不去做某件事。</div><div class="overview-story">第一次遇见一个新 Word，先看一张很短的地图。这里不是堆词义，而是让不同 Usage 有一个可以连接起来的整体感觉。</div><div class="overview-map"><span>克制 / 忍住</span><span>refrain from ...</span><span>之后再进入具体 Usage</span></div></div>`},
    {stage:'Grow',judge:false,word:'refrain',grammar:'VI',html:`<div class="learn-wordline"><button class="learn-word" data-peek="refrain">refrain</button><span class="grammar-tag">VI</span></div><div class="learn-prompt">She <mark>refrained from answering the question</mark>.<small>她忍住了，没有回答这个问题。</small></div><div class="answer-reveal visible"><div class="answer-main">克制；忍住不做</div><div class="answer-definition">to stop yourself from doing something</div><div class="answer-phrase">◖))　refrained from answering the question</div></div>`},
    {stage:'Coach · Pro',judge:true,word:'issue',grammar:'VT',html:`<div class="learn-wordline"><button class="learn-word" data-peek="issue">issue</button><span class="grammar-tag">VT</span></div><div class="learn-prompt">政府部门给他签发了一张许可证。<small>The agency <span class="cloze">issued him a permit</span>.</small></div><div class="answer-reveal"><div class="answer-main">issued him a permit</div><div class="answer-definition">换一个没见过的真实语境，确认这个 Usage 能不能迁移。</div><div class="coach-note"><span class="coach-pro">Coach · Pro</span> 不增加一个“AI 功能中心”。它只是像私人教练一样，在真正需要的时候进入同一条学习流。</div></div>`}
  ];
  dots.innerHTML=slides.map((_,i)=>`<i class="${i===0?'active':''}"></i>`).join('');
  function render(){
    const s=slides[idx]; stage.textContent=s.stage; card.innerHTML=s.html; row.classList.toggle('hidden',!s.judge); phone.classList.remove('state-known','state-unknown','drag-known','drag-unknown'); card.style.transform=''; card.style.opacity='';
    row.querySelectorAll('button').forEach(b=>b.classList.remove('active-known','active-unknown'));
    if(states[idx]) apply(states[idx],false);
    dots.querySelectorAll('i').forEach((d,i)=>d.classList.toggle('active',i===idx));
    const w=card.querySelector('[data-peek]'); if(w) w.addEventListener('click',()=>openPeek(w.dataset.peek||'issue'));
  }
  const peekData={
    issue:{core:'先抓住这个 Word 的整体轮廓',story:'在现代英语里，issue 既常见于“问题 / 议题”，也常作为动词表示“正式发布、签发、发放”。Overview 不要求你背一串历史词源，而是先知道这些 Usage 属于同一个 Word，再逐个学清楚。'},
    refrain:{core:'核心感觉：把自己收住，不去做某件事',story:'它强调的是主动克制、忍住某个动作。最常见的结构是 refrain from doing something。先有这个整体感觉，再去学具体 Usage，会更容易把表达连起来。'}
  };
  function openPeek(word){
    const d=peekData[word]||peekData.issue;
    document.getElementById('peekWord').textContent=word;
    document.getElementById('peekCore').textContent=d.core;
    document.getElementById('peekStory').textContent=d.story;
    peek.classList.add('open');
  }
  function apply(choice,reveal=true){
    states[idx]=choice; phone.classList.toggle('state-known',choice==='known');phone.classList.toggle('state-unknown',choice==='unknown');
    row.querySelectorAll('button').forEach(b=>{b.classList.toggle('active-known',b.dataset.choice==='known'&&choice==='known');b.classList.toggle('active-unknown',b.dataset.choice==='unknown'&&choice==='unknown')});
    if(reveal||states[idx]) card.querySelectorAll('.answer-reveal').forEach(el=>el.classList.add('visible'));
  }
  row.addEventListener('click',e=>{const b=e.target.closest('button[data-choice]');if(b) apply(b.dataset.choice)});
  next.addEventListener('click',()=>{idx=(idx+1)%slides.length;render()});
  card.addEventListener('pointerdown',e=>{
    if(!slides[idx].judge) return;
    startX=e.clientX; dragX=0; card.setPointerCapture?.(e.pointerId); card.classList.add('dragging');
  });
  card.addEventListener('pointermove',e=>{
    if(startX===null||!slides[idx].judge) return;
    dragX=Math.max(-95,Math.min(95,e.clientX-startX));
    card.style.transform=`translateX(${dragX}px) rotate(${dragX/80}deg)`;
    card.style.opacity=String(1-Math.min(Math.abs(dragX)/620,.08));
    phone.classList.toggle('drag-known',dragX < -18);
    phone.classList.toggle('drag-unknown',dragX > 18);
  });
  const finishDrag=e=>{
    if(startX===null) return;
    const dx=dragX; startX=null; dragX=0; card.classList.remove('dragging');
    phone.classList.remove('drag-known','drag-unknown');
    if(Math.abs(dx)>55 && slides[idx].judge) apply(dx<0?'known':'unknown');
    card.style.transform=''; card.style.opacity='';
    try{card.releasePointerCapture?.(e.pointerId)}catch(_){}
  };
  card.addEventListener('pointerup',finishDrag);
  card.addEventListener('pointercancel',finishDrag);
  peekClose.addEventListener('click',()=>peek.classList.remove('open')); peek.addEventListener('click',e=>{if(e.target===peek) peek.classList.remove('open')});
  fb.addEventListener('click',()=>pop.classList.toggle('open')); pop.addEventListener('click',()=>pop.classList.remove('open'));
  document.addEventListener('click',e=>{if(!fb.contains(e.target)&&!pop.contains(e.target)) pop.classList.remove('open')});
  render();
}
