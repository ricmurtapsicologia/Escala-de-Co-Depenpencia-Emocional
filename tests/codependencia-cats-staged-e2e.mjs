import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright-core';

const base=process.env.CODEP_SMOKE_URL||
  'http://127.0.0.1:8123/Escala-de-Co-Depenpencia-Emocional/';
const backend='https://script.google.com/macros/s/CODEP_TECHNICAL_MOCK/exec';
const FORM_IDS=[1359859439,176700673,1046896049,969101508,1759076618,
 182960338,266284871,984457803,492791275,5603632,2136686512,27355118,
 1327304731,1642239371,1588960955,766782572,1193393150,972407744,
 914229679,849175949,64262415,1403462485,753885327,744557412,
 1809124136,1446308025,281510744,947771279,1751870394,2039371910,
 197498688,309079155,1117655823,26337985,1412674550,1037739138,
 195084684,1681614358,1551956198,162875766];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
 for(const mobile of [false,true]) {
   const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
   const page=await ctx.newPage();
   page.on('pageerror',e=>console.log('BROWSER_PAGEERROR='+String(e.message).slice(0,180)));
   let intercepted=null,verification=null,health=0;
   await page.route('**/assets/codependencia-persistence-config-v1.js*',route=>
     route.fulfill({status:200,contentType:'application/javascript',
       body:"window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL = '"+backend+"';"}));
   await page.route(backend,async route=>{
     const req=route.request();
     console.log('MOCK_VERIFIER_METHOD='+req.method());
     if(req.method()==='GET') {
       health++;
       await route.fulfill({status:200,contentType:'application/json',
         headers:{'access-control-allow-origin':'*'},
         body:JSON.stringify({status:'ready',configured:true,protocol:'codependencia-persistence-v1'})});
     } else if(req.method()==='POST') {
       verification=JSON.parse(req.postData()||'{}');
       await route.fulfill({status:200,contentType:'application/json',
         headers:{'access-control-allow-origin':'*'},
         body:JSON.stringify({persisted:Boolean(intercepted),
           protocol:'codependencia-persistence-v1',fingerprint:verification.fingerprint})});
     } else await route.abort();
   });
   await page.route('https://docs.google.com/forms/d/e/**/formResponse',async route=>{
     intercepted=new URLSearchParams(route.request().postData()||'');
     console.log('MOCK_FORM_POST_FIELD_COUNT='+[...intercepted.keys()].length);
     await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>ok</title>'});
   });
   const r=await page.goto(base,{waitUntil:'domcontentloaded',timeout:35000});
   assert.equal(r.status(),200);
   console.log('BEFORE_ACTIVATE='+JSON.stringify(await page.evaluate(()=>({ready:document.documentElement.dataset.codepVerifiedCollector||'no',endpointConfigured:Boolean(window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL),endpointText:String(window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL||'').slice(0,60),cryptoSubtle:!!window.crypto?.subtle,scripts:[...document.scripts].map(x=>x.src).filter(x=>x.includes('codependencia-'))}))));
   await page.waitForFunction(()=>document.documentElement.dataset.codepVerifiedCollector==='true',null,{timeout:10000});
   console.log('ACTIVATED');
   assert.equal(await page.locator('#scaleForm').isVisible(),true);
   assert.equal(await page.locator('.rm-clinical-hero').isVisible(),true);
   assert.equal(await page.locator('.rm-hero-cta').isVisible(),true);
   assert.equal(await page.locator('.rm-onboard-step').count(),3);
   await page.waitForTimeout(1300);
   assert.equal(await page.locator('#rm-splash-screen').count(),0,'splash must self-dismiss');
   const geometry=await page.evaluate(()=>{
     const main=document.querySelector('main.rm-screening-shell').getBoundingClientRect();
     const hero=document.querySelector('.rm-clinical-hero').getBoundingClientRect();
     return {main:main.width,hero:hero.width,viewport:innerWidth};
   });
   assert.ok(geometry.main>=geometry.viewport*(mobile?.91:.68),'clinical page must use available reading width');
   assert.ok(geometry.hero>=geometry.main*.89,'hero must occupy main reading width');
   for(const id of ['fullName','birthDate','date']) {
     const label=page.locator('#scaleForm label[for="'+id+'"]');
     assert.equal(await label.isVisible(),true,'identification field must have visible label: '+id);
   }
   const visual=await page.evaluate(()=>{
     const select=document.querySelector('#q1');
     const anchor=document.querySelector('#rm-canonical-form-link');
     const title=document.querySelector('#rm-fallback-title');
     return {
       firstSelectBorder:getComputedStyle(select).borderTopColor,
       officialLinkBackground:getComputedStyle(anchor).backgroundColor,
       fallbackHidden:!anchor.getClientRects().length && document.getElementById('rm-official-fallback-hint').hidden,
       fallbackURL:anchor.href,
       titleVisible:!!title?.getClientRects().length,
       horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2
     };
   });
   assert.notEqual(visual.firstSelectBorder,'rgb(172, 84, 67)','unanswered select cannot be styled as an error');
   assert.ok(visual.titleVisible,'title must remain visible');
   assert.ok(!visual.horizontalOverflow,'no horizontal overflow');
   assert.equal(visual.fallbackHidden,true,'official fallback must remain hidden when integration works');
   assert.match(visual.fallbackURL,/docs\.google\.com\/forms\/d\/e\//);
   assert.equal(await page.locator('#rm-native-google-form').isVisible(),false);
   assert.equal(await page.locator('#rm-official-fallback-hint').isVisible(),false);
   await page.locator('#fullName').fill('TESTE E2E NÃO PACIENTE CATS');
   await page.locator('#birthDate').fill('2000-01-01');
   await page.locator('#date').fill('2026-10-27');
   // 2026-10-28 surgical QA: identify missing questions and block incomplete submit.
   await page.locator('#q1').selectOption(mobile?'5':'1');
   assert.equal(await page.locator('#rm-unanswered').isVisible(),true);
   assert.match(await page.locator('#rm-unanswered-summary').innerText(),/39 questões/);
   assert.equal(await page.locator('#rm-unanswered-list li').count(),39);
   assert.equal(await page.locator('#q2').getAttribute('aria-invalid'),'true');
   assert.equal(await page.locator('#screening-submit').isDisabled(),true);
   await page.locator('#rm-go-to-unanswered').click();
   assert.equal(await page.locator('#q2').evaluate(el=>document.activeElement===el),true);
   await page.evaluate(value=>{
     for(let i=1;i<=40;i++){
       const el=document.querySelector('#q'+i);
       el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));
     }
   },mobile?'5':'1');
   assert.equal(await page.locator('#rm-unanswered').isVisible(),false,'full form has no unanswered questions');
   assert.equal(await page.locator('#codep-results').isVisible(),false,'results must be hidden before a verified write');
   assert.equal(await page.locator('#codep-personal-insights').isVisible(),false,'reflections require confirmed record');
   await page.waitForFunction(()=>!document.querySelector('#screening-submit').disabled,null,{timeout:10000});
   console.log('READY_TO_SUBMIT');
   await page.locator('#screening-submit').click();
   console.log('SUBMIT_CLICKED');
   try {await page.waitForFunction(()=>document.querySelector('#rm-form-status')?.textContent?.includes('Registro confirmado'),null,{timeout:12000});}
   catch(e){const diag=await page.evaluate(()=>({status:document.querySelector('#rm-form-status')?.textContent,btnDisabled:document.querySelector('#screening-submit')?.disabled}));console.log('POST_TIMEOUT_STATE='+JSON.stringify({diag,hasFormPost:Boolean(intercepted),hasVerifier:Boolean(verification),health}));throw e;}
   assert.ok(intercepted,'formResponse POST must occur');
   assert.equal(health,1);
   assert.ok(verification&&verification.protocol==='codependencia-persistence-v1');
   assert.equal(intercepted.get('entry.2145128820'),'TESTE E2E NÃO PACIENTE CATS');
   assert.equal(intercepted.get('entry.680549210'),'2000-01-01');
   assert.equal(intercepted.get('entry.1092281443'),'2026-10-27');
   assert.ok(FORM_IDS.every(id=>intercepted.get('entry.'+id)===(mobile?'Concordo Totalmente':'Discordo Totalmente')));
   const expected=crypto.createHash('sha256').update(
     ['TESTE E2E NÃO PACIENTE CATS','2000-01-01','2026-10-27',
       ...Array(40).fill(mobile?'Concordo Totalmente':'Discordo Totalmente')].join('|')).digest('hex');
   assert.equal(verification.fingerprint,expected);
   assert.equal(await page.locator('#screening-submit').isDisabled(),true);
   await page.locator('#codep-results[data-results-ready="true"]').waitFor({state:'visible',timeout:7000});
   assert.equal(await page.locator('#depGauge svg').count(),1);
   assert.equal(await page.locator('#codepGauge svg').count(),1);
   assert.equal(await page.locator('#codep-personal-insights[data-insights-ready="true"]').isVisible(),true);
   const insights=await page.locator('#codep-personal-insights').innerText();
   assert.match(insights,/Como essas respostas podem aparecer na sua vida/);
   assert.match(insights,/No trabalho, se for pertinente/);
   assert.match(insights,/Na vida conjugal ou afetiva, se aplicável/);
   assert.match(insights,/O que fazer a partir de agora/);
   assert.match(insights,/não consequências identificadas pelo questionário/i);
   if(mobile)assert.match(insights,/Você assinalou concordância em afirmações/);
   else assert.match(insights,/Você não marcou/);
   assert.equal(await page.locator('#codep-personal-insights .rm-insight-domain').count(),3);
   const resultCards=await page.locator('.codep-results-card').count();
   assert.equal(resultCards,2);
   const narrative=await page.evaluate(()=>{
      const cards=[...document.querySelectorAll('.codep-results-card')];
      return cards.map(card=>{
        const cardRect=card.getBoundingClientRect();
        const heading=card.querySelector('h3').getBoundingClientRect();
        return {width:cardRect.width,titleWidth:heading.width,overflow:card.scrollWidth>card.clientWidth+2};
      });
   });
   assert.ok(narrative.every(x=>x.width>250 && x.titleWidth>x.width*.70 && !x.overflow),
     'professional result cards should have wide, non-overflowing narrative');
   const expectedScore=mobile?'100 / 100':'20 / 100';
   const scoreTexts=await page.locator('.codep-score-number').allInnerTexts();
   assert.deepEqual(scoreTexts,[expectedScore,expectedScore]);
   assert.match(await page.locator('#codep-results').innerText(),/não usam pontos de corte validados/i);
   if(mobile)assert.match(await page.locator('#codep-results').innerText(),/Você marcou concordância em/);
   else assert.match(await page.locator('#codep-results').innerText(),/não assinalou concordância/);
   const gaugeAccessibility=await page.locator('#depGauge svg').getAttribute('aria-label');
   assert.match(gaugeAccessibility,/pont[oau]s brutos/i);
   assert.ok((await page.locator('#rm-form-status').innerText()).includes('Registro confirmado'));
   console.log(JSON.stringify({mode:mobile?'mobile':'desktop',result:'PASS',
     questionsMapped:40,identificationMapped:3,sent:true,persistenceVerified:true,restoredGauges:2,
     noRealGoogleSubmission:true}));
   await ctx.close();
 }
 // Contingency E2E: disabled verifier must reveal the official Google Form.
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 const page=await ctx.newPage();
 let externalFormLoaded=false;
 await page.route('**/assets/codependencia-persistence-config-v1.js*',route=>
   route.fulfill({status:200,contentType:'application/javascript',
     body:"window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL = '"+backend+"';"}));
 await page.route(backend,route=>route.fulfill({status:200,contentType:'application/json',
   headers:{'access-control-allow-origin':'*'},
   body:JSON.stringify({status:'ready',configured:false,protocol:'codependencia-persistence-v1'})}));
 await page.route('https://docs.google.com/forms/d/e/**/viewform?embedded=true',route=>{
   externalFormLoaded=true;
   return route.fulfill({status:200,contentType:'text/html',
     body:'<!doctype html><html><body><h1>Google Forms oficial</h1></body></html>'});
 });
 const res=await page.goto(base,{waitUntil:'domcontentloaded',timeout:35000});
 assert.equal(res.status(),200);
 await page.waitForFunction(()=>document.documentElement.dataset.codepNativeReady==='true',
   null,{timeout:12000});
 assert.equal(await page.locator('#scaleForm').isVisible(),false);
 assert.equal(await page.locator('#rm-official-fallback-hint').isVisible(),true);
 assert.equal(await page.locator('#rm-canonical-form-link').isVisible(),true);
 assert.ok((await page.locator('#rm-canonical-form-link').getAttribute('href')).includes('/viewform'));
 assert.equal(await page.locator('#rm-native-google-form').isVisible(),true);
 await page.waitForTimeout(1000);
 assert.ok(externalFormLoaded,'native Google Forms fallback should load on contingency');
 console.log(JSON.stringify({scenario:'verifier-offline-native-fallback',result:'PASS',
  linkOnlyOnFailure:true,siteFormHidden:true,officialFormLoaded:true,noRealGoogleSubmission:true}));
 await ctx.close();
} finally {await browser.close();}
