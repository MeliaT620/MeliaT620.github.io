/* Mine English v51 — horizontal-only Learning demo. */
(function(){
  function initStaticLearning(){
    const viewport=document.getElementById('learningStaticViewport');
    const track=document.getElementById('learningStaticTrack');
    const label=document.getElementById('learningStaticPage');
    const dots=[...(document.querySelectorAll('#learningStaticDots i')||[])];
    if(!viewport||!track)return false;
    const pages=[...track.children];
    let index=0,startX=0,startY=0,dx=0,active=false,horizontal=false;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    function render(animate=true){
      track.style.transition=animate?'transform .28s cubic-bezier(.22,.8,.25,1)':'none';
      track.style.transform=`translate3d(${-index*100}%,0,0)`;
      if(label)label.textContent=`${index+1} / ${pages.length}`;
      dots.forEach((d,i)=>d.classList.toggle('active',i===index));
    }
    viewport.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,a'))return;
      active=true;horizontal=false;dx=0;startX=e.clientX;startY=e.clientY;
      try{viewport.setPointerCapture(e.pointerId)}catch(_){}
    });
    viewport.addEventListener('pointermove',e=>{
      if(!active)return;
      const x=e.clientX-startX,y=e.clientY-startY;dx=x;
      if(!horizontal){if(Math.abs(x)<10)return;if(Math.abs(x)>Math.abs(y)*1.25)horizontal=true;else return;}
      if(e.cancelable)e.preventDefault();
      const width=Math.max(viewport.clientWidth,1);
      let visual=x;
      if((index===0&&x>0)||(index===pages.length-1&&x<0))visual*=.22;
      track.style.transition='none';
      track.style.transform=`translate3d(calc(${-index*100}% + ${visual}px),0,0)`;
    },{passive:false});
    function end(e){
      if(!active)return;active=false;
      if(horizontal&&Math.abs(dx)>Math.max(52,viewport.clientWidth*.16))index=clamp(index+(dx<0?1:-1),0,pages.length-1);
      render(true);
      try{viewport.releasePointerCapture(e.pointerId)}catch(_){}
    }
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
    viewport.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)*1.2)return;
      e.preventDefault();
      if(e.deltaX>22)index=clamp(index+1,0,pages.length-1);else if(e.deltaX<-22)index=clamp(index-1,0,pages.length-1);render(true);
    },{passive:false});
    viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){index=clamp(index+1,0,pages.length-1);render(true)}else if(e.key==='ArrowLeft'){index=clamp(index-1,0,pages.length-1);render(true)}});
    render(false);return true;
  }
  function boot(){if(initStaticLearning())return;const t=setInterval(()=>{if(initStaticLearning())clearInterval(t)},120);setTimeout(()=>clearInterval(t),6000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();