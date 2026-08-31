/* Mine English v46 — reward growth metaphor + reflection refinements. */
(function(){
  const sprout='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V11"/><path d="M12 13C8.5 13 6 10.5 6 7c3.8 0 6 2.2 6 6Z"/><path d="M12 10c0-3.4 2.5-5.8 6-5.8 0 3.5-2.3 5.8-6 5.8Z"/></svg>';
  const coin='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="5.4"/><path d="M9.4 12h5.2M12 9.4v5.2"/></svg>';

  function refineCallouts(){
    const upper=document.querySelector('.reflection-callout.callout-upper small');
    const lower=document.querySelector('.reflection-callout.callout-lower small');
    const word=document.querySelector('.reflection-callout.callout-word small');
    if(upper)upper.innerHTML='单击朗读高亮<br>双击朗读整句';
    if(lower)lower.textContent='单击朗读单词';
    if(word)word.innerHTML='单击任意单词<br>查看 Word Overview';
  }

  function liftFlow(card){
    if(!card)return;
    const flow=card.querySelector('.reward-flow');
    if(flow&&flow.parentElement!==card)card.appendChild(flow);
  }

  function refineRewards(){
    const completeMark=document.querySelector('.learning-reward-complete .coin-mark');
    if(completeMark){completeMark.classList.add('seed-icon');completeMark.innerHTML=sprout;}
    const completeCopy=document.querySelector('.learning-reward-complete + p');
    if(completeCopy)completeCopy.textContent='今天种下的 Mine Seeds，会慢慢长成 Mine Flowers。那些认真学过的东西，也会在未来某个时刻重新来到你身边。';

    const completeLabel=document.querySelector('.learning-reward-complete small');
    const completeStrong=document.querySelector('.learning-reward-complete strong');
    if(completeLabel)completeLabel.textContent='Mine Seeds';
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
      if(small)small.textContent='MINE SEEDS';
      if(h)h.textContent='今天种下的，会在未来某一天开花。';
      if(p)p.textContent='Mine Seeds 是每天真实学习留下的成长记录，不是钱。那些今天看起来很小的积累，会慢慢长成 Mine Flowers；就像学过的一句话，也许会在未来某个时刻自然地从脑海里出现。Mine Flowers 越多，下个月的会员价格也会得到更温柔的奖励。';
      if(flow)flow.innerHTML='<span>真实学习</span><i>→</i><span>Seeds</span><i>→</i><span>Flowers</span><i>→</i><span>奖励</span>';
      liftFlow(seedCard);
    }

    const coinCard=document.querySelector('.coin-mode');
    if(coinCard){
      const small=coinCard.querySelector('small');
      const ps=coinCard.querySelectorAll('p');
      if(small)small.textContent='MINE COINS';
      if(ps[0])ps[0].textContent='贡献高质量 Example、表达说明或其他内容，被 Mine 采纳以后，可以获得 Mine Coins；如果这份贡献持续帮助更多学习者，还可以获得更多回馈。';
      if(ps[1])ps[1].textContent='Mine Coins 是 App 内余额，可用于订阅或其他 App 内支付；它和学习获得的 Mine Seeds 完全不同。';
      const flow=coinCard.querySelector('.reward-flow');
      if(flow)flow.innerHTML='<span>真实贡献</span><i>→</i><span>采纳 / 使用</span><i>→</i><span>Coins</span>';
      liftFlow(coinCard);
    }

    const head=document.querySelector('.reward-system-head>span');
    const title=document.querySelector('.reward-system-head>h3');
    const intro=document.querySelector('.reward-system-head>p');
    if(head)head.textContent='MINE SEEDS · MINE COINS';
    if(title)title.textContent='一种记录成长，一种回应你创造的价值。';
    if(intro)intro.textContent='学习本身会留下 Mine Seeds；真正创造了对别人有价值的内容，才会得到可以使用的 Mine Coins。';

    const principle=document.querySelector('.reward-principle-v40 strong');
    const principleNote=document.querySelector('.reward-principle-v40 span');
    if(principle)principle.textContent='Seeds 记录你怎样成长，Coins 回应你创造的价值。';
    if(principleNote)principleNote.textContent='学习留下成长，贡献产生可以使用的 App 内余额。';
  }

  function refineHumanCare(){
    const quiet=document.querySelector('.encouragement-card');
    if(quiet){
      const h=quiet.querySelector('h3');
      const p=quiet.querySelector('p');
      if(h)h.textContent='学习应该得到回应，坚持学习应该得到鼓励。';
      if(p)p.textContent='Mine 想认真回应那些真实发生过的学习。每天完成一点，是值得被看见的积累；愿意一次次回来，也是一件很了不起的事。我们希望鼓励坚持，但不把坚持变成压力。';
    }
    const recovery=document.querySelector('.recovery-v40');
    if(recovery){
      const h=recovery.querySelector('h3');
      const ps=recovery.querySelectorAll('p');
      if(h)h.textContent='坚持固然可贵，但努力永远不会太晚。';
      if(ps[0])ps[0].textContent='没能一直坚持，不应该换来惩罚。偶尔错过一天，也还有机会把它重新接回来。Recovery Card 就是为这样的时刻留下的一点余地。';
      if(ps[1])ps[1].textContent='它不能直接购买，而需要通过真实学习获得。使用时，先完成今天，再选择过去漏掉的一天，真实完成一次轻量补学；完成以后，那一天才会重新被点亮。';
    }
  }

  function removeLibrary(){
    const lib=document.getElementById('library');
    if(lib)lib.remove();
  }

  function boot(){
    refineCallouts();refineRewards();refineHumanCare();removeLibrary();
    const t=setInterval(()=>{refineCallouts();refineRewards();refineHumanCare();removeLibrary();},120);
    setTimeout(()=>clearInterval(t),6000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
