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
   assert.equal(await page.locator('#rm-native-google-form').isVisible(),false);
   await page.locator('#fullName').fill('TESTE E2E NÃO PACIENTE CATS');
   await page.locator('#birthDate').fill('2000-01-01');
   await page.locator('#date').fill('2026-10-27');
   await page.evaluate(()=>{
     for(let i=1;i<=40;i++){
       const el=document.querySelector('#q'+i);
       el.value='1';el.dispatchEvent(new Event('change',{bubbles:true}));
     }
   });
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
   assert.ok(FORM_IDS.every(id=>intercepted.get('entry.'+id)==='Discordo Totalmente'));
   const expected=crypto.createHash('sha256').update(
     ['TESTE E2E NÃO PACIENTE CATS','2000-01-01','2026-10-27',
       ...Array(40).fill('Discordo Totalmente')].join('|')).digest('hex');
   assert.equal(verification.fingerprint,expected);
   assert.equal(await page.locator('#screening-submit').isDisabled(),true);
   assert.ok((await page.locator('#rm-form-status').innerText()).includes('Registro confirmado'));
   console.log(JSON.stringify({mode:mobile?'mobile':'desktop',result:'PASS',
     questionsMapped:40,identificationMapped:3,sent:true,persistenceVerified:true,
     noRealGoogleSubmission:true}));
   await ctx.close();
 }
} finally {await browser.close();}
