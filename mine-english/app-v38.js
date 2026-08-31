/* Mine English v38 — small structural polish without changing the v37 interaction model. */
(function(){
  function addCurveLegends(){
    const configs=[
      ['.usage-row.fading',['唤起','再巩固','开始变模糊']],
      ['.usage-row.fragile',['学会','再唤起','现在值得找回']]
    ];
    configs.forEach(([selector,labels])=>{
      const row=document.querySelector(selector);
      if(!row)return;
      const box=row.querySelector('.curve-box');
      if(!box||box.querySelector('.curve-legend'))return;
      const legend=document.createElement('div');
      legend.className='curve-legend';
      labels.forEach(text=>{const span=document.createElement('span');span.textContent=text;legend.appendChild(span)});
      const result=box.querySelector('.usage-result');
      if(result)box.insertBefore(legend,result);else box.appendChild(legend);
    });
  }

  function decorateIpa(){
    document.querySelectorAll('.support-grid').forEach(grid=>{
      const toggle=grid.querySelector('.accent-toggle');
      const ipa=grid.querySelector('.ipa');
      if(!toggle||!ipa)return;
      const text=ipa.textContent;
      let diff='';
      if(text.includes('iː'))diff='iː';
      else if(text.includes('e'))diff='e';
      if(!diff)return;
      const idx=text.indexOf(diff);
      ipa.innerHTML=text.slice(0,idx)+'<span class="ipa-diff">'+diff+'</span>'+text.slice(idx+diff.length);
    });
  }

  function keepIpaDecorated(){
    document.addEventListener('click',e=>{
      if(!e.target.closest('.accent-toggle'))return;
      setTimeout(decorateIpa,0);
    },true);
  }

  function softenSocialCounts(){
    document.querySelectorAll('.social-action small').forEach(el=>el.style.background='transparent');
  }

  function boot(){
    addCurveLegends();
    decorateIpa();
    softenSocialCounts();
    keepIpaDecorated();
    const timer=setInterval(()=>{
      addCurveLegends();decorateIpa();softenSocialCounts();
    },120);
    setTimeout(()=>clearInterval(timer),5000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
