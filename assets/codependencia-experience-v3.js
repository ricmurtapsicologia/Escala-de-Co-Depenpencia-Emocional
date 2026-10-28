/* Experience-only enhancements; no form transport, identifiers or patient data storage. */
(() => {
  'use strict';
  const form=document.getElementById('scaleForm');
  const indicator=document.getElementById('rm-progress-fill');
  const splash=document.getElementById('rm-splash-screen');
  if (!form) return;
  const selects=Array.from(form.querySelectorAll('select[name^="q"]'));
  const missingHost=document.getElementById('rm-unanswered');
  const missingList=document.getElementById('rm-unanswered-list');
  const missingSummary=document.getElementById('rm-unanswered-summary');
  const goToMissing=document.getElementById('rm-go-to-unanswered');
  const allowed=new Set(['1','2','3','4','5']);
  let firstMissing=null;
  function focusMissing(select) {
    if(!select) return;
    select.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    select.focus({preventScroll:true});
  }
  function refresh() {
    if(!indicator || selects.length!==40)return;
    const pending=selects.filter(field=>!allowed.has(field.value));
    const count=40-pending.length;
    indicator.style.width=(count/40*100).toFixed(1)+'%';
    firstMissing=pending[0]||null;
    const visible=count>0 && pending.length>0;
    if(missingHost)missingHost.hidden=!visible;
    if(missingSummary)missingSummary.textContent=visible
      ? 'Faltam responder '+pending.length+' '+(pending.length===1?'questão:':'questões:')+' '+pending.map(field=>field.name.slice(1)).join(', ')+'.'
      : '';
    for(const field of selects) {
      const question=field.closest('.question');
      if(question)question.classList.toggle('rm-question-pending',visible&&!allowed.has(field.value));
      field.setAttribute('aria-invalid',String(visible&&!allowed.has(field.value)));
    }
    if(missingList) {
      missingList.replaceChildren();
      if(visible) for(const field of pending) {
        const item=document.createElement('li');
        const anchor=document.createElement('a');
        const label=document.querySelector('label[for="'+field.id+'"]');
        anchor.href='#'+field.id;
        anchor.dataset.question=field.id;
        anchor.textContent=(label?.textContent||('Questão '+field.name.slice(1))).trim();
        item.appendChild(anchor);missingList.appendChild(item);
      }
    }
  }
  missingList?.addEventListener('click',event=>{
    const anchor=event.target.closest('a[data-question]');
    if(!anchor)return;
    event.preventDefault();
    focusMissing(document.getElementById(anchor.dataset.question));
  });
  goToMissing?.addEventListener('click',()=>focusMissing(firstMissing));
  form.addEventListener('change',refresh,{passive:true});
  form.addEventListener('input',refresh,{passive:true});
  refresh();
  // Fast, non-blocking splash. CSS also dismisses automatically if JS is delayed.
  if(splash) {
    splash.classList.add('rm-splash-ready');
    window.setTimeout(()=>splash.remove(),1150);
  }
  // Name the explanatory sections for screen-reader users.
  const preview=document.querySelector('#codep-results');
  if(preview) {
    const observer=new MutationObserver(()=>{
      if(preview.hasAttribute('data-results-ready')) {
        const title=preview.querySelector('#codep-results-title');
        title?.setAttribute('tabindex','-1');
        title?.focus({preventScroll:true});
        if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          preview.scrollIntoView({block:'start',behavior:'smooth'});
        } else preview.scrollIntoView({block:'start'});
        observer.disconnect();
      }
    });
    observer.observe(preview,{attributes:true,attributeFilter:['data-results-ready']});
  }
})();
