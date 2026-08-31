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
  initWordPeek();initJudgeScenes();initAccentToggles();initAudio();initReelAudio();
}

function initJudgeScenes(){
  document.querySelectorAll('.judge-scene').forEach(scene=>{
    const threshold=42;
    let active=false,startX=0,startY=0,lastX=0;
    const setGlow=dx=>{
      const mag=Math.min(Math.abs(dx)/95,1),eased=Math.pow(mag,.72);
      if(dx<0){scene.style.setProperty('--left-glow',eased.toFixed(3));scene.style.setProperty('--right-glow','0');scene.style.setProperty('--left-spread',(7+eased*25).toFixed(1)+'px');scene.style.setProperty('--left-width',(2.2+eased*2.2).toFixed(1)+'px')}
      else if(dx>0){scene.style.setProperty('--right-glow',eased.toFixed(3));scene.style.setProperty('--left-glow','0');scene.style.setProperty('--right-spread',(7+eased*25).toFixed(1)+'px');scene.style.setProperty('--right-width',(2.2+eased*2.2).toFixed(1)+'px')}
    };
    const reveal=choice=>{scene.classList.remove('known','not-yet');scene.classList.add(choice==='known'?'known':'not-yet');scene.dataset.choice=choice;scene.querySelectorAll('.answer-reveal').forEach(el=>el.classList.add('visible'));scene.querySelectorAll('.blank-target').forEach(el=>el.classList.add('revealed'));scene.querySelectorAll('.reveal-only-audio').forEach(el=>el.classList.add('visible'));scene.style.removeProperty('--left-glow');scene.style.removeProperty('--right-glow')};
    const clearTransient=()=>{if(scene.dataset.choice)return;scene.style.setProperty('--left-glow','0');scene.style.setProperty('--right-glow','0')};
    const start=(x,y)=>{active=true;startX=lastX=x;startY=y};
    const move=(x,y,e)=>{if(!active)return;lastX=x;const dx=x-startX,dy=y-startY;if(Math.abs(dx)>Math.abs(dy)+6){if(e?.cancelable)e.preventDefault();setGlow(dx)}};
    const end=()=>{if(!active)return;const dx=lastX-startX;active=false;if(dx<=-threshold)reveal('known');else if(dx>=threshold)reveal('not-yet');else clearTransient()};
    scene.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;start(e.clientX,e.clientY);try{scene.setPointerCapture(e.pointerId)}catch(_){}});
    scene.addEventListener('pointermove',e=>move(e.clientX,e.clientY,e));scene.addEventListener('pointerup',e=>{end();try{scene.releasePointerCapture(e.pointerId)}catch(_){}});scene.addEventListener('pointercancel',end);
    scene.addEventListener('touchstart',e=>{if(e.target.closest('button,a'))return;const t=e.touches[0];if(t)start(t.clientX,t.clientY)},{passive:true});scene.addEventListener('touchmove',e=>{const t=e.touches[0];if(t)move(t.clientX,t.clientY,e)},{passive:false});scene.addEventListener('touchend',end,{passive:true});
  });
}

function initAccentToggles(){
  const render=(raw,diff)=>{if(!raw||!diff)return raw||'';const i=raw.lastIndexOf(diff);return i<0?raw:raw.slice(0,i)+'<span class="ipa-diff">'+diff+'</span>'+raw.slice(i+diff.length)};
  document.addEventListener('click',e=>{const b=e.target.closest('.accent-switch button');if(!b)return;e.preventDefault();e.stopPropagation();const sw=b.closest('.accent-switch'),ipa=sw.closest('.pron-line')?.querySelector('.ipa');sw.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));const raw=b.dataset.accent==='UK'?sw.dataset.uk:sw.dataset.us;if(ipa)ipa.innerHTML=render(raw,sw.dataset.diff||'')});
}

const AUDIO_B64={
  adj_US:'audio/deliberate_adj_us.mp3.b64',
  adj_UK:'audio/deliberate_adj_uk.mp3.b64',
  verb_US:'audio/deliberate_verb_us.mp3.b64',
  verb_UK:'audio/deliberate_verb_uk.mp3.b64'
};
const audioCache=new Map();
async function loadAudio(key){
  if(audioCache.has(key))return audioCache.get(key);
  const text=(await fetch(AUDIO_B64[key],{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('audio');return r.text()})).trim();
  const bin=atob(text),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));audioCache.set(key,url);return url;
}

function initAudio(){
  const speak=(text,lang='en-US',rate=.92)=>{if(!text||!('speechSynthesis' in window))return;try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;window.speechSynthesis.speak(u)}catch(_){}};
  const scope=el=>el.closest('.learning-scene,.peek-sheet,.reflection-screen')||document;
  const accent=el=>scope(el).querySelector('.accent-switch button.active')?.dataset.accent==='UK'?'UK':'US';
  document.addEventListener('click',async e=>{
    const b=e.target.closest('.word-audio');if(!b)return;e.preventDefault();e.stopPropagation();const key=(b.dataset.reading||'adj')+'_'+accent(b);b.classList.add('playing');setTimeout(()=>b.classList.remove('playing'),520);
    try{const src=await loadAudio(key);const a=new Audio(src);a.volume=1;await a.play()}catch(_){speak('deliberate',accent(b)==='UK'?'en-GB':'en-US',.86)}
  });
  const timers=new WeakMap();
  document.addEventListener('click',e=>{const b=e.target.closest('.example-audio');if(!b)return;e.preventDefault();e.stopPropagation();const old=timers.get(b);if(old)clearTimeout(old);timers.set(b,setTimeout(()=>{const ac=accent(b);b.classList.add('playing');setTimeout(()=>b.classList.remove('playing'),420);speak(b.dataset.focus||b.dataset.full||'',ac==='UK'?'en-GB':'en-US',.9);timers.delete(b)},230))});
  document.addEventListener('dblclick',e=>{const b=e.target.closest('.example-audio');if(!b)return;e.preventDefault();e.stopPropagation();const old=timers.get(b);if(old)clearTimeout(old);timers.delete(b);const ac=accent(b);b.classList.add('playing');setTimeout(()=>b.classList.remove('playing'),500);speak(b.dataset.full||b.dataset.focus||'',ac==='UK'?'en-GB':'en-US',.92)});
}

function initWordPeek(){
  let o=document.getElementById('globalWordPeek');if(!o){o=document.createElement('div');o.id='globalWordPeek';o.className='global-word-peek';o.innerHTML=`<div class="peek-sheet example-first-peek"><button class="peek-x">×</button><small>WORD OVERVIEW</small><div class="peek-example">It was a <mark><span class="core-word">deliberate</span> lie</mark>.<button class="example-audio" data-full="It was a deliberate lie." data-focus="a deliberate lie">🔊</button></div><div class="peek-translation">这是一个蓄意的谎言。</div><div class="word-divider peek-divider"></div><div class="peek-word">deliberate</div><div class="pron-line"><span class="accent-switch" data-us="/dɪˈlɪb.ɚ.ət/" data-uk="/dɪˈlɪb.ər.ət/" data-diff="ət"><button class="active" data-accent="US">US</button><button data-accent="UK">UK</button></span><span class="ipa">/dɪˈlɪb.ɚ.<span class="ipa-diff">ət</span>/</span><button class="word-audio" data-reading="adj">🔊</button></div><div class="micro-divider"></div><div class="usage-meaning"><span class="usage-pos">adj.</span><div class="usage-explain"><div class="usage-zh">故意的；蓄意的</div><div class="usage-en">done consciously and intentionally</div></div></div><div class="semantic-bridge peek-bridge">不是随手发生，而是经过意识与考虑。</div><div class="overview-story peek-story">作形容词时，它强调某件事是有意识地做出的；作动词时，则进一步表示经过仔细考虑或讨论后再作决定。</div></div>`;document.body.appendChild(o)}
  document.querySelectorAll('[data-peek]').forEach(w=>w.addEventListener('click',e=>{e.stopPropagation();o.classList.add('open')}));o.querySelector('.peek-x')?.addEventListener('click',()=>o.classList.remove('open'));o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')});
}

function initReelAudio(){
  if(!('speechSynthesis' in window))return;const played=new WeakSet();const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting||e.intersectionRatio<.78||played.has(e.target))return;const b=e.target.querySelector('.example-audio'),f=b?.dataset.focus;if(!f)return;played.add(e.target);const ac=e.target.querySelector('.accent-switch button.active')?.dataset.accent==='UK'?'en-GB':'en-US';const u=new SpeechSynthesisUtterance(f);u.lang=ac;u.rate=.9;setTimeout(()=>window.speechSynthesis.speak(u),220)}),{threshold:[.78]});document.querySelectorAll('.learning-scene').forEach(s=>io.observe(s));
}
