/* v28 — insert a lightweight Chinese thinking prompt before Review · Understand reveal. */
(function(){
  const install=()=>{
    const scene=document.querySelector('[data-stage="review-understand"]');
    const example=scene?.querySelector('.review-example-first');
    if(!scene||!example)return false;
    if(scene.querySelector('.judge-question'))return true;

    const q=document.createElement('div');
    q.className='judge-question';
    q.innerHTML='<strong>这句话是什么意思？</strong><span>先在心里说出它的中文意思。</span>';
    example.insertAdjacentElement('afterend',q);
    return true;
  };

  if(!install()){
    const timer=setInterval(()=>{if(install())clearInterval(timer)},50);
    setTimeout(()=>clearInterval(timer),5000);
  }
})();
