/* Dependência/codependência — transporte CATS-style, fail-closed.
 * User-facing result is shown ONLY after a positive independent Sheets verifier.
 * With no configured verifier, the existing official Google Form remains primary.
 */
(() => {
  'use strict';
  const FORM_ID = '1FAIpQLSclFCONlWGL3oVZfOH-Kg_xjCVySUFO8fJr8v89dDW8SJsNJA';
  const ACTION = 'https://docs.google.com/forms/d/e/' + FORM_ID + '/formResponse';
  const PROTOCOL = 'codependencia-persistence-v1';
  const OPTIONS = ['Discordo Totalmente','Discordo','Neutro','Concordo','Concordo Totalmente'];
  const ENTRIES = Object.freeze({
    name: 2145128820, birth: 680549210, application: 1092281443,
    questions: [1359859439,176700673,1046896049,969101508,1759076618,
      182960338,266284871,984457803,492791275,5603632,
      2136686512,27355118,1327304731,1642239371,1588960955,
      766782572,1193393150,972407744,914229679,849175949,
      64262415,1403462485,753885327,744557412,1809124136,
      1446308025,281510744,947771279,1751870394,2039371910,
      197498688,309079155,1117655823,26337985,1412674550,
      1037739138,195084684,1681614358,1551956198,162875766]
  });
  const endpoint = String(window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL || '').trim();
  const validEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(endpoint);
  const form = document.getElementById('scaleForm');
  const button = document.getElementById('screening-submit');
  const status = document.getElementById('rm-form-status');
  const progress = document.getElementById('rm-form-progress');
  if (!form || !button || !status || !progress || ENTRIES.questions.length!==40) return;
  function enableNativeFallback() {
    document.documentElement.dataset.codepNativeReady='true';
    const fallbackHint=document.getElementById('rm-official-fallback-hint');
    if(fallbackHint) fallbackHint.hidden=false;
    const iframe=document.getElementById('rm-native-google-form');
    if(iframe && iframe.dataset.src && iframe.src!==iframe.dataset.src) {
      iframe.loading='eager';
      iframe.src=iframe.dataset.src;
    }
    status.textContent='Integração indisponível. Utilize o formulário oficial acima.';
  }
  // Always fail closed: no fallback request through the legacy form.
  button.disabled = true;
  button.setAttribute('aria-disabled','true');
  if (!validEndpoint || !window.crypto?.subtle) { enableNativeFallback(); return; }

  let busy = false;
  let committed = false;
  let needsReview = false;
  const fields = Array.from({length:40}, (_,i)=>form.querySelector('[name="q'+(i+1)+'"]'));
  if (fields.some(x=>!x)) return;
  const identify = () => ({
    name: (form.querySelector('#fullName')?.value||'').trim().replace(/\s+/g,' '),
    birth: form.querySelector('#birthDate')?.value||'',
    application: form.querySelector('#date')?.value||''
  });
  const answerLabels = () => fields.map(select => {
    const v=select.value;
    return /^[1-5]$/.test(v) ? OPTIONS[Number(v)-1] : '';
  });
  const ready = () => {
    const id=identify(),answers=answerLabels();
    return id.name.length>0 && /^\d{4}-\d{2}-\d{2}$/.test(id.birth) &&
      /^\d{4}-\d{2}-\d{2}$/.test(id.application) && answers.every(x=>OPTIONS.includes(x));
  };
  const setStatus = text => { status.textContent=text; };
  const update = () => {
    const answered=answerLabels().filter(Boolean).length;
    progress.textContent=answered+' de 40 questões respondidas.';
    button.disabled=busy || committed || needsReview || !ready();
    button.setAttribute('aria-disabled',String(button.disabled));
    if (!busy && !committed && !needsReview) setStatus(ready()
      ? 'Respostas completas. Confira seus dados e envie para registro.'
      : 'Preencha a identificação e as 40 questões para habilitar o envio.');
  };

  // Only activate the custom form after the verifier independently proves it is live.
  async function backendReady() {
    try {
      const r=await fetch(endpoint,{method:'GET',cache:'no-store',credentials:'omit'});
      if(!r.ok) return false;
      const data=await r.json();
      return data.status==='ready' && data.protocol===PROTOCOL && data.configured===true;
    } catch (_) { return false; }
  }
  async function digest(value) {
    const bytes=new TextEncoder().encode(value);
    const raw=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(raw),b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function pollConfirmation(fingerprint) {
    const deadline=Date.now()+45000;
    while(Date.now()<deadline) {
      try {
        const r=await fetch(endpoint,{method:'POST',credentials:'omit',cache:'no-store',
          redirect:'follow',headers:{'Content-Type':'text/plain;charset=UTF-8'},
          body:JSON.stringify({protocol:PROTOCOL,fingerprint})});
        if(r.ok) {
          const data=await r.json();
          if(data.persisted===true && data.protocol===PROTOCOL &&
              data.fingerprint===fingerprint) return true;
        }
      } catch (_) { /* CATS-style eventual consistency retry */ }
      await new Promise(resolve=>setTimeout(resolve,2200));
    }
    return false;
  }
  function put(form, key, value) {
    const node=document.createElement('input');
    node.type='hidden';node.name=key;node.value=String(value);form.appendChild(node);
  }
  function putDate(transport,id,iso) {
    const [year,month,day]=iso.split('-');
    // Both formats were accepted by the official Google Forms mapping probe.
    put(transport,'entry.'+id,iso);
    put(transport,'entry.'+id+'_year',year);
    put(transport,'entry.'+id+'_month',month);
    put(transport,'entry.'+id+'_day',day);
  }
  function send(id,answers) {
    const iframe=document.createElement('iframe');
    iframe.name='codep-google-response';
    iframe.title='Resposta técnica do formulário';
    iframe.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0;';
    iframe.setAttribute('aria-hidden','true');
    const transport=document.createElement('form');
    transport.style.display='none';transport.action=ACTION;transport.method='POST';
    transport.target=iframe.name;transport.enctype='application/x-www-form-urlencoded';
    put(transport,'entry.'+ENTRIES.name,id.name);
    putDate(transport,ENTRIES.birth,id.birth);
    putDate(transport,ENTRIES.application,id.application);
    ENTRIES.questions.forEach((entry,i)=>put(transport,'entry.'+entry,answers[i]));
    put(transport,'fvv','1');put(transport,'pageHistory','0');put(transport,'submit','Submit');
    document.body.append(iframe,transport);
    // Crucially, iframe.load is NEVER interpreted as Sheets persistence.
    HTMLFormElement.prototype.submit.call(transport);
    window.setTimeout(()=>transport.remove(),5000);
    window.setTimeout(()=>iframe.remove(),60000);
  }
  form.removeAttribute('onsubmit');
  form.addEventListener('submit',async event => {
    event.preventDefault();
    if(busy || committed || needsReview || !ready()) { update(); return; }
    busy=true;button.disabled=true;button.setAttribute('aria-disabled','true');
    setStatus('Enviando e aguardando confirmação de gravação na planilha clínica...');
    try {
      const id=identify(),answers=answerLabels();
      const signature=await digest([id.name.toUpperCase(),id.birth,id.application,...answers].join('|'));
      send(id,answers);
      const persisted=await pollConfirmation(signature);
      if(persisted) {
        committed=true;
        form.querySelectorAll('input,select').forEach(el=>{el.disabled=true;});
        setStatus('Registro confirmado na planilha. O psicólogo responsável analisará suas respostas.');
        button.textContent='Respostas registradas';
        document.documentElement.dataset.codepPersisted='true';
        try {
          if(window.CODEPENDENCIA_RESULTS?.render) {
            window.CODEPENDENCIA_RESULTS.render(answers.map((_,i)=>fields[i].value));
          }
        } catch(_) {
          // Persistence was independently verified: a view failure must never
          // falsify the successful receipt or trigger a duplicate submission.
          setStatus('Registro confirmado na planilha. A visualização dos resultados está indisponível neste dispositivo.');
        }
      } else {
        needsReview=true;
        setStatus('Não foi possível confirmar a gravação. Não envie novamente antes de contatar o psicólogo.');
      }
    } catch(_) {
      needsReview=true;
      setStatus('Ocorreu uma falha técnica. Não repita o envio antes de confirmar com o psicólogo.');
    } finally {
      busy=false;
      update();
    }
  });
  // The old native link remains available as an explicit manual fallback.
  status.textContent='Verificando conexão com o registro clínico...';
  backendReady().then(ok=>{
    if(!ok) { enableNativeFallback(); return; }
    document.documentElement.dataset.codepVerifiedCollector='true';
    for(const input of fields) input.addEventListener('change',update);
    form.querySelectorAll('input').forEach(el=>el.addEventListener('input',update));
    update();
  });
})();