/* Experience-only enhancements; no form transport, identifiers or patient data storage. */
(() => {
  'use strict';
  const form=document.getElementById('scaleForm');
  const indicator=document.getElementById('rm-progress-fill');
  const splash=document.getElementById('rm-splash-screen');
  if (!form) return;
  const selects=Array.from(form.querySelectorAll('select[name^="q"]'));
  function refresh() {
    if(!indicator || selects.length!==40)return;
    const count=selects.filter(field=>field.value!==''&&field.value!==null).length;
    indicator.style.width=(count/40*100).toFixed(1)+'%';
  }
  form.addEventListener('change',refresh,{passive:true});
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
