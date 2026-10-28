import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {chromium} from 'playwright-core';

/* 5-case live-site E2E, intercepting external Forms writes. No patient data. */
const profile=String(process.env.CODEP_E2E_PROFILE||'').trim();
const cases={
 minimum:{answers:Array(40).fill(1),scores:[20,20],endorsed:0},
 maximum:{answers:Array(40).fill(5),scores:[100,100],endorsed:40},
 neutral:{answers:Array(40).fill(3),scores:[60,60],endorsed:0},
 split:{answers:[...Array(20).fill(5),...Array(20).fill(1)],scores:[100,20],endorsed:20},
 alternating:{answers:Array.from({length:40},(_,i)=>(i%5)+1),scores:[60,60],endorsed:16}
};
assert.ok(Object.hasOwn(cases,profile),'unknown E2E profile: '+profile);
const vector=cases[profile];
const target='https://ricmurtapsicologia.github.io/Escala-de-Co-Depenpencia-Emocional/';
const mock='https://script.google.com/macros/s/CODEP_FIVE_RUNS_MOCK/exec';
const option=['Discordo Totalmente','Discordo','Neutro','Concordo','Concordo Totalmente'];
const formId='1FAIpQLSclFCONlWGL3oVZfOH-Kg_xjCVySUFO8fJr8v89dDW8SJsNJA';
const ENTRY_IDS=[1359859439,176700673,1046896049,969101508,1759076618,
 182960338,266284871,984457803,492791275,5603632,
 2136686512,27355118,1327304731,1642239371,1588960955,
 766782572,1193393150,972407744,914229679,849175949,
 64262415,1403462485,753885327,744557412,1809124136,
 1446308025,281510744,947771279,1751870394,2039371910,
 197498688,309079155,1117655823,26337985,1412674550,
 1037739138,195084684,1681614358,1551956198,162875766];
assert.equal(ENTRY_IDS.length,40);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
let passed=0;
try {
 for(const mobile of [false,true]){
   const device=mobile?'mobile':'desktop';
   const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},locale:'pt-BR'});
   const page=await ctx.newPage();
   let postCount=0,verifierCount=0,received=null,verificationFingerprint=null;
   const pageErrors=[];
   page.on('pageerror',e=>pageErrors.push(e.message));
   await page.route('**/assets/codependencia-persistence-config-v1.js*',route=>
     route.fulfill({status:200,contentType:'application/javascript',
       body:"window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL='"+mock+"';"}));
   await page.route(mock,async route=>{
     const req=route.request();
     if(req.method()==='GET') {
       await route.fulfill({status:200,contentType:'application/json',
         headers:{'access-control-allow-origin':'*'},
         body:JSON.stringify({protocol:'codependencia-persistence-v1',status:'ready',configured:true})});
     } else if(req.method()==='POST') {
       verifierCount++;
       const payload=JSON.parse(req.postData()||'{}');
       verificationFingerprint=payload.fingerprint;
       await route.fulfill({status:200,contentType:'application/json',
         headers:{'access-control-allow-origin':'*'},
         body:JSON.stringify({protocol:'codependencia-persistence-v1',persisted:Boolean(received),
           fingerprint:payload.fingerprint})});
     } else await route.abort();
   });
   await page.route('https://docs.google.com/forms/d/e/**/formResponse',async route=>{
     postCount++;received=new URLSearchParams(route.request().postData()||'');
     await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>accepted synthetic</title>'});
   });
   const resp=await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(resp.status(),200,'published site must return HTTP 200');
   await page.waitForFunction(()=>document.documentElement.dataset.codepVerifiedCollector==='true',null,{timeout:16000});
   await page.waitForTimeout(1250); // allows branded splash to dismiss
   assert.equal(await page.locator('#rm-splash-screen').count(),0);
   assert.equal(await page.locator('.rm-clinical-hero').isVisible(),true);
   assert.equal(await page.locator('.rm-onboard-step').count(),3);
   assert.equal(await page.locator('#scaleForm select[name^="q"]').count(),40);
   assert.equal(await page.locator('#rm-official-fallback-hint').isVisible(),false);
   assert.equal(await page.locator('#codep-results').isVisible(),false);
   assert.equal(await page.locator('#codep-personal-insights').isVisible(),false);
   const name='TESTE E2E CINCO CICLOS NAO PACIENTE';
   await page.locator('#fullName').fill(name);
   await page.locator('#birthDate').fill('2000-01-01');
   await page.locator('#date').fill('2026-10-27');
   await page.evaluate(values=>{
     for(let i=1;i<=40;i++){
       const el=document.querySelector('#q'+i);
       if(!el)throw Error('missing item '+i);
       el.value=String(values[i-1]);
       el.dispatchEvent(new Event('change',{bubbles:true}));
     }
   },vector.answers);
   assert.equal(await page.locator('#screening-submit').isDisabled(),false);
   assert.equal(await page.locator('#codep-personal-insights').isVisible(),false);
   await page.locator('#screening-submit').click();
   await page.waitForFunction(()=>document.querySelector('#rm-form-status')?.textContent?.includes('Registro confirmado na planilha'),null,{timeout:16000});
   await page.locator('#codep-results[data-results-ready="true"]').waitFor({state:'visible',timeout:7000});
   assert.equal(postCount,1,'one Forms POST only');
   assert.ok(verifierCount>=1&&verifierCount<=5,'persistence may need repeated read-only verification, but never a duplicated Forms POST');
   assert.ok(received,'Forms post must be intercepted');
   assert.equal(received.get('entry.2145128820'),name);
   assert.equal(received.get('entry.680549210'),'2000-01-01');
   assert.equal(received.get('entry.1092281443'),'2026-10-27');
   for(let i=0;i<40;i++)assert.equal(received.get('entry.'+ENTRY_IDS[i]),option[vector.answers[i]-1],'item '+(i+1));
   const hash=crypto.createHash('sha256').update([name.toUpperCase(),'2000-01-01','2026-10-27',
     ...vector.answers.map(n=>option[n-1])].join('|')).digest('hex');
   assert.equal(verificationFingerprint,hash,'independent verifier must receive exact SHA-256 of 43 responses');
   const receipts=await page.evaluate(()=>({confirmed:document.documentElement.dataset.codepPersisted,
     ready:document.querySelector('#codep-personal-insights')?.dataset.insightsReady,
     progress:document.querySelector('#rm-progress-fill')?.style.width}));
   assert.equal(receipts.confirmed,'true');
   assert.equal(receipts.ready,'true');
   assert.equal(receipts.progress,'100.0%');
   const labels=await page.locator('.codep-score-number').allInnerTexts();
   assert.deepEqual(labels,vector.scores.map(n=>n+' / 100'));
   assert.equal(await page.locator('#depGauge svg').count(),1);
   assert.equal(await page.locator('#codepGauge svg').count(),1);
   assert.equal(await page.locator('#codep-personal-insights .rm-insight-domain').count(),3);
   const reflection=await page.locator('#codep-personal-insights').innerText();
   assert.match(reflection,/No trabalho, se for pertinente/);
   assert.match(reflection,/Na vida conjugal ou afetiva, se aplicável/);
   assert.match(reflection,/O que fazer a partir de agora/);
   assert.match(reflection,/não consequências identificadas pelo questionário/i);
   if(vector.endorsed===0)assert.match(reflection,/não marcou/);
   else assert.match(reflection,/O que você pode reconhecer em si/i);
   assert.equal(await page.locator('#screening-submit').isDisabled(),true);
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,
     main:document.querySelector('main.rm-screening-shell').getBoundingClientRect().width,viewport:innerWidth}));
   assert.equal(layout.overflow,false,'no horizontal overflow');
   assert.ok(layout.main>layout.viewport*(mobile?.88:.68));
   assert.deepEqual(pageErrors,[],'uncaught page errors');
   console.log('E2E_FIVE_RESULT='+JSON.stringify({profile,device,status:'PASS',
     http:resp.status(),formsPOST:postCount,verifiedPOST:verifierCount,items:40,
     scores:vector.scores,personalInsights:true,privacy:'synthetic/intercepted',
     hashVerified:verificationFingerprint===hash,layout:true}));
   passed++;
   await ctx.close();
 }
 assert.equal(passed,2);
 console.log('E2E_FIVE_PROFILE_PASS='+JSON.stringify({profile,devices:2,status:'PASS',realWrites:0}));
}finally{await browser.close()}
