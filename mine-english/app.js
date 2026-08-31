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

  const setToc=open=>{
    toc.classList.toggle('open',open);
    backdrop.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
  };
  btn.addEventListener('click',()=>setToc(!toc.classList.contains('open')));
  close.addEventListener('click',()=>setToc(false));
  backdrop.addEventListener('click',()=>setToc(false));
  links.forEach(a=>a.addEventListener('click',()=>setToc(false)));

  const update=()=>{
    const h=document.documentElement;
    const max=h.scrollHeight-h.clientHeight;
    progress.style.width=(max>0?h.scrollTop/max*100:0)+'%';
  };
  document.addEventListener('scroll',update,{passive:true});update();

  const ro=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target)}
  }),{threshold:.09,rootMargin:'0px 0px -35px'});
  document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

  const so=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting) links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))
  }),{threshold:.2,rootMargin:'-15% 0px -60% 0px'});
  document.querySelectorAll('section[id]').forEach(s=>so.observe(s));
}
