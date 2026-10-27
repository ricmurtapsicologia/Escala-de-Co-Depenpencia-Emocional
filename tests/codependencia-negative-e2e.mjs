import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const url=process.env.CODEP_SMOKE_URL||'http://127.0.0.1:8123/Escala-de-Co-Depenpencia-Emocional/';
const verifier='https://script.google.com/macros/s/CODEP_NEGATIVE_MOCK/exec';
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 let submissions=0,verifications=0;
 await page.route('**/assets/codependencia-persistence-config-v1.js*',route=>
  route.fulfill({status:200,contentType:'application/javascript',body:"window.CODEPENDENCIA_PERSISTENCE_VERIFY_URL='"+verifier+"';"}));
 await page.route(verifier,async route=>{
   const req=route.request();
   if(req.method()==='GET'){
     await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
       body:JSON.stringify({status:'ready',configured:true,protocol:'codependencia-persistence-v1'})});
   }else {
     verifications++;
     await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
       body:JSON.stringify({persisted:false,reason:'not-yet-visible'})});
   }
 });
 await page.route('https://docs.google.com/forms/d/e/**/formResponse',async route=>{
   submissions++;await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>ok</title>'});
 });
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
 await page.waitForFunction(()=>document.documentElement.dataset.codepVerifiedCollector==='true',null,{timeout:10000});
 await page.locator('#fullName').fill('TESTE NEGATIVO NÃO PACIENTE');
 await page.locator('#birthDate').fill('2000-01-01');
 await page.locator('#date').fill('2026-10-27');
 await page.evaluate(()=>{
   for(let i=1;i<=40;i++){
     const el=document.querySelector('#q'+i);
     el.value='3';el.dispatchEvent(new Event('change',{bubbles:true}));
   }
 });
 await page.locator('#screening-submit').click();
 await page.waitForTimeout(4500);
 assert.equal(await page.locator('#codep-results').isVisible(),false);
 assert.equal(await page.locator('#screening-submit').isDisabled(),true);
 assert.equal(submissions,1);
 await page.waitForFunction(()=>
   /Não foi possível confirmar a gravação/i.test(document.querySelector('#rm-form-status')?.textContent||''),
   null,{timeout:57000});
 assert.equal(await page.locator('#codep-results').isVisible(),false);
 assert.equal(await page.locator('#screening-submit').isDisabled(),true);
 assert.equal(submissions,1,'must not retry original clinical POST without confirmation');
 assert.ok(verifications>1,'independent verifier retry, not repeated submission');
 assert.equal(await page.locator('html').getAttribute('data-codep-persisted'),null);
 console.log(JSON.stringify({scenario:'denied-persistence',result:'PASS',submissions,verifications,
  noFalseReceipt:true,noPatientResults:true,duplicateSubmitPrevented:true}));
}finally{await browser.close()}
