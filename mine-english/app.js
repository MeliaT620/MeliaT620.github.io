(async()=>{
  const host=document.getElementById('contentHost');
  const parts=await Promise.all([1,2,3].map(i=>fetch(`content-${i}.html`).then(r=>{if(!r.ok) throw new Error(`content-${i}.html ${r.status}`);return r.text()})));
  host.innerHTML=parts.join('\n');
  initMinePage();
})().catch(err=>{console.error(err);document.getElementById('contentHost').innerHTML='<div style="padding:120px 20px;text-align:center;font-family:system-ui">Mine English preview failed to load.</div>';});

function initMinePage(){
  const nav = document.getElementById('siteNav');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const progress = document.getElementById('scrollProgress');

  menuBtn?.addEventListener('click', () => {
    nav.classList.toggle('open');
    menuBtn.textContent = nav.classList.contains('open') ? '×' : '☰';
  });

  navLinks.forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    if (menuBtn) menuBtn.textContent = '☰';
  }));

  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
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
  }, {threshold:.12, rootMargin:'0px 0px -40px'});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const sections = [...document.querySelectorAll('section[id]')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, {threshold:.28, rootMargin:'-12% 0px -58% 0px'});
  sections.forEach(section => sectionObserver.observe(section));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}
