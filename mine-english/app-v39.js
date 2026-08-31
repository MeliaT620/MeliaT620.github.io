/* Mine English v43 — reward growth metaphor + reflection refinements. */
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
    if(completeCopy)completeCopy.textContent='今天种下的 My Seeds，会慢慢长成 My Flowers。那些认真学过的东西，也会在未来某个时刻重新来到你身边。';

    const completeLabel=document.querySelector('.learning-reward-complete small');
    const completeStrong=document.querySelector('.learning-reward-complete strong');
    if(completeLabel)completeLabel.textContent='My Seeds';
    if(completeStrong)completeStrong.textContent='+18 Seeds';

    const seed=document.querySelector('.reward-mode-mark.seed');
    if(seed){seed.classList.add('seed-icon');seed.innerHTML=sprout;}
    const coinMark=document.querySelector('.reward-mode-mark.coin');
    if(coinMark){coinMark.classList.add('coin-icon');coinMark.innerHTML=coin;}

    const seedCard=document.querySelector('.learning-reward-mode');
    if(seedCard){
      const small=seedCard.querySelector('small');
      const h=seedCard.querySelector('h4');
      const p=seedCard.querySelector('p');
      const flow=seedCard.querySelector('.reward-flow');
      if(small)small.textContent='MY SEEDS';
      if(h)h.textContent='今天种下的，会在未来某一天开花。';
      if(p)p.textContent='My Seeds 是每天真实学习留下的成长记录，不是钱。那些今天看起来很小的积累，会慢慢长成 My Flowers；就像学过的一句话，也许会在未来某个时刻自然地从脑海里出现。月末积累的 My Flowers 越多，下个月的会员价格也会得到更温柔的奖励。';
      if(flow)flow.innerHTML='<span>真实学习</span><i>→</i><span>My Seeds</span><i>→</i><span>My Flowers</span><i>→</i><span>下月会员奖励</span>';
    }

    const coinCard=document.querySelector('.coin-mode');
    if(coinCard){
      const small=coinCard.querySelector('small');
      const ps=coinCard.querySelectorAll('p');
      if(small)small.textContent='MY COINS';
      if(ps[0])ps[0].textContent='贡献高质量 Example、表达说明或其他内容，被 Mine 采纳以后，可以获得 My Coins；如果这份贡献持续帮助更多学习者，还可以获得更多回馈。';
      if(ps[1])ps[1].textContent='My Coins 是 App 内余额，可用于订阅或其他 App 内支付；它和学习获得的 My Seeds 完全不同。';
      const flow=coinCard.querySelector('.reward-flow');
      if(flow)flow.innerHTML='<span>真实贡献</span><i>→</i><span>被采纳 / 使用</span><i>→</i><span>My Coins</span>';
    }

    const head=document.querySelector('.reward-system-head>span');
    const intro=document.querySelector('.reward-system-head>p');
    if(head)head.textContent='MY SEEDS · MY COINS';
    if(intro)intro.textContent='学习本身会留下 My Seeds；真正创造了对别人有价值的内容，才会得到可以使用的 My Coins。';
  }

  function removeLibrary(){
    const lib=document.getElementById('library');
    if(lib)lib.remove();
  }

  function boot(){
    refineCallouts();refineRewards();removeLibrary();
    const t=setInterval(()=>{refineCallouts();refineRewards();removeLibrary();},120);
    setTimeout(()=>clearInterval(t),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
