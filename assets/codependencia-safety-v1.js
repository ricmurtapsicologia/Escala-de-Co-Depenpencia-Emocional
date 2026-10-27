/* Codependência — fail-closed UI guard. No patient data are persisted by this module. */
(() => {
  'use strict';
  const ID = 'codependencia';
  const ROOT = 'https://ricmurtapsicologia.github.io/Inicio-de-Jornada-Terapeutica/assets/';
  const form = document.getElementById('scaleForm');
  const button = document.getElementById('screening-submit');
  const status = document.getElementById('rm-form-status');
  const progress = document.getElementById('rm-form-progress');
  if (!form || !button || !status || !progress) return;

  const fields = Array.from({length: 40}, (_, i) => form.elements.namedItem('q' + (i + 1)));
  let authorized = false;
  let configurationResolved = false;
  let submitted = false;

  // A JavaScript failure must never fall back to a native public submission.
  form.addEventListener('submit', event => event.preventDefault());
  button.disabled = true;
  button.setAttribute('aria-disabled', 'true');

  function identityComplete() {
    const read = key => String(document.querySelector('[data-rm="' + key + '"]')?.value || '').trim();
    return Boolean(read('name') && read('birth') && read('application'));
  }
  function countAnswered() {
    return fields.filter(f => f && ['1','2','3','4','5'].includes(f.value)).length;
  }
  function reconcile() {
    const answered = countAnswered();
    progress.textContent = answered + ' de 40 questões respondidas.';
    const bridgeReady = window.RM_SCREENING_V3_CLIENT_READY === true;
    const ready = authorized && bridgeReady && identityComplete() && answered === 40 && !submitted;
    button.disabled = !ready;
    button.setAttribute('aria-disabled', String(!ready));
    if (submitted) status.textContent = 'Enviando respostas para confirmação segura.';
    else if (!configurationResolved || !authorized) status.textContent = 'O envio deste rastreio permanece indisponível até a validação técnica da integração clínica.';
    else if (!bridgeReady) status.textContent = 'Aguardando conexão com o serviço de registro clínico.';
    else if (!identityComplete()) status.textContent = 'Preencha a identificação para habilitar o envio.';
    else if (answered < 40) status.textContent = 'Responda às 40 questões para habilitar o envio.';
    else status.textContent = 'Preenchimento completo. Revise as respostas e conclua o rastreio.';
  }

  fields.forEach(f => f?.addEventListener('change', reconcile));
  form.addEventListener('input', reconcile);
  document.addEventListener('input', reconcile);
  document.addEventListener('change', reconcile);
  window.addEventListener('rm:screening-bridge-ready', reconcile);
  window.addEventListener('rm:screening-completed', () => {
    submitted = true;
    reconcile();
  });
  window.addEventListener('rm:screening-submit-failed', event => {
    if (event.detail?.instrumentId !== ID) return;
    submitted = false;
    reconcile();
  });
  form.addEventListener('submit', e => {
    if (!authorized || window.RM_SCREENING_V3_CLIENT_READY !== true || countAnswered() !== 40 || !identityComplete()) {
      e.preventDefault();
      e.stopPropagation();
      reconcile();
      return;
    }
    submitted = true;
    // The shared bridge performs the actual transport during document capture.
    reconcile();
  });
  Promise.all([
    fetch(ROOT + 'screening-public-experience-v2.json?v=5.0.0', {cache: 'no-store'}).then(r => {if (!r.ok) throw Error('CONFIG_HTTP'); return r.json();}),
    fetch(ROOT + 'screening-adapters-v2.json?v=5.0.0', {cache: 'no-store'}).then(r => {if (!r.ok) throw Error('ADAPTER_HTTP'); return r.json();})
  ]).then(([publicConfig, adapters]) => {
    const c = publicConfig?.instruments?.[ID];
    const a = adapters?.instruments?.[ID];
    authorized = c?.productionReady === true && c?.collectorReady === true &&
      c?.scorerValidated === true && a?.submissionSupported === true &&
      a?.mode === 'form' && a?.formSelector === '#scaleForm';
    configurationResolved = true;
    reconcile();
  }).catch(() => {
    authorized = false;
    configurationResolved = true;
    reconcile();
  });
  reconcile();
})();
