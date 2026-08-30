(async()=>{
  const host=document.getElementById('contentHost');
  const parts=await Promise.all([1,2,3].map(i=>fetch(`content-${i}.html`).then(r=>{if(!r.ok) throw new Error(`content-${i}.html ${r.status}`);return r.text()})));
  host.innerHTML=parts.join('\n');
  initMinePage();
})().catch(err=>{console.error(err);document.getElementById('contentHost').innerHTML='<div style="padding:120px 20px;text-align:center;font-family:system-ui">Mine English preview failed to load.</div>';});

function initMinePage(){
  const progress = document.getElementById('scrollProgress');
  const tocBtn = document.getElementById('tocBtn');
  const tocClose = document.getElementById('tocClose');
  const tocPanel = document.getElementById('tocPanel');
  const tocBackdrop = document.getElementById('tocBackdrop');
  const tocLinks = [...document.querySelectorAll('.toc-links a')];

  const setToc = open => {
    document.body.classList.toggle('toc-open', open);
    tocPanel?.classList.toggle('open', open);
    tocBackdrop?.classList.toggle('open', open);
    tocBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  tocBtn?.addEventListener('click',()=>setToc(!tocPanel.classList.contains('open')));
  tocClose?.addEventListener('click',()=>setToc(false));
  tocBackdrop?.addEventListener('click',()=>setToc(false));
  tocLinks.forEach(a=>a.addEventListener('click',()=>setToc(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape') setToc(false)});

  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  document.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.10, rootMargin:'0px 0px -34px'});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const sections=[...document.querySelectorAll('section[id]')];
  const sectionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      tocLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));
    });
  },{threshold:.22,rootMargin:'-12% 0px -58% 0px'});
  sections.forEach(s=>sectionObserver.observe(s));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}
