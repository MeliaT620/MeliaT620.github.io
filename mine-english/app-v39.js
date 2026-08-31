/* Mine English v42 — reward growth metaphor + Mine Library + tiny copy refinements. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';

  function refineCallouts(){
    const upper=document.querySelector('.reflection-callout.callout-upper small');
    const lower=document.querySelector('.reflection-callout.callout-lower small');
    if(upper)upper.innerHTML='单击朗读高亮<br>双击朗读整句';
    if(lower)lower.textContent='单击朗读单词';
  }

  function refineRewards(){
    const completeMark=document.querySelector('.learning-reward-complete .coin-mark');
    if(completeMark){completeMark.classList.add('seed-icon');completeMark.innerHTML=sprout;}
    const completeCopy=document.querySelector('.learning-reward-complete + p');
    if(completeCopy)completeCopy.textContent='今天种下的 Seeds，会在月末开成 Flowers，用于下个月的会员优惠。';

    const seed=document.querySelector('.reward-mode-mark.seed');
    if(seed){seed.classList.add('seed-icon');seed.innerHTML=sprout;}
    const coinMark=document.querySelector('.reward-mode-mark.coin');
    if(coinMark){coinMark.classList.add('coin-icon');coinMark.innerHTML=coin;}

    const seedCard=document.querySelector('.learning-reward-mode');
    if(seedCard){
      const h=seedCard.querySelector('h4');
      const p=seedCard.querySelector('p');
      const flow=seedCard.querySelector('.reward-flow');
      if(h)h.textContent='今天种下 Seeds，下个月收获 Flowers。';
      if(p)p.textContent='Mine Seeds 是每天真实学习留下的成长记录，不是钱。到月末，积累的 Seeds 会开成 Mine Flowers；Flowers 用来抵扣下个月的会员价格。';
      if(flow)flow.innerHTML='<span>真实学习</span><i>→</i><span>Mine Seeds</span><i>→</i><span>Mine Flowers</span><i>→</i><span>下月优惠</span>';
    }
    const head=document.querySelector('.reward-system-head>span');
    if(head)head.textContent='MINE SEEDS → MINE FLOWERS · MINE COINS';
  }

  function installLibrary(){
    if(document.getElementById('library'))return true;
    const human=document.getElementById('human');
    if(!human)return false;
    const section=document.createElement('section');
    section.id='library';
    section.className='mine-library';
    section.innerHTML=`<div class="wrap"><div class="section-head"><div class="kicker">Mine Library</div><h2>学过的语言，慢慢变成你的。</h2><p>不是一个“收藏夹”。Mine Library 留下的是你已经真正遇见、理解、想起过的语言。</p></div><div class="library-grid"><article><span>Mine Words</span><strong>按 Usage 留下每个 Word 的记忆地图。</strong><p>回看词义、读音、Meaning Story，以及每个 Usage 自己的学习轨迹。</p></article><article><span>Mine Sentences</span><strong>把真正值得记住的表达留下来。</strong><p>来自 Learning、Reflection 或你主动保存的自然句子，最终成为可以再次调用的语言。</p></article></div><div class="library-path"><span>Mine Words</span><i>→</i><span>Mine Sentences</span><i>→</i><span>Real Situation</span></div></div>`;
    human.parentNode.insertBefore(section,human);
    return true;
  }

  function boot(){
    refineCallouts();refineRewards();installLibrary();
    const t=setInterval(()=>{refineCallouts();refineRewards();if(installLibrary()){}},120);
    setTimeout(()=>clearInterval(t),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
