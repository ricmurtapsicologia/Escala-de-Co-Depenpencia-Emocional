import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const target='https://ricmurtapsicologia.github.io/Escala-de-Co-Depenpencia-Emocional/';
const browser=await chromium.launch({
  executablePath:process.env.CHROMIUM_PATH||'/usr/bin/google-chrome',
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage']
});
const diagnostics=[];
try {
  for (const mobile of [false,true]) {
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
    const page=await context.newPage();let posts=0;
    page.on('pageerror',err=>diagnostics.push('pageerror:'+String(err.message).slice(0,180)));
    await page.route('https://script.google.com/**', async route=>{
      if(route.request().method()==='POST') posts++;
      await route.abort();
    });
    const resp=await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
    assert.equal(resp.status(),200,'public page HTTP must be 200');
    await page.waitForTimeout(8000);
    const result=await page.evaluate(()=>{
      const sels=[...document.querySelectorAll('#scaleForm select[name^="q"]')];
      const shell=document.querySelector('.rm-screening-shell');
      const form=document.getElementById('scaleForm');
      const btn=document.getElementById('screening-submit');
      return {total:sels.length,unanswered:sels.filter(x=>x.value==='').length,labels:sels.filter(x=>document.querySelector('label[for="'+x.id+'"]')).length,shell:!!shell,buttonInitiallyDisabled:btn.disabled,formMethod:form.method,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth};
    });
    assert.equal(result.total,40);
    assert.equal(result.unanswered,40);
    assert.equal(result.labels,40);
    assert.equal(result.formMethod,'post');
    assert.equal(result.buttonInitiallyDisabled,true);
    assert.equal(result.shell,true,'public design shell should initialize');
    assert.ok(result.documentWidth<=result.viewportWidth+2,'horizontal overflow');
    const fill=await page.evaluate(()=>{
      for(const [i,s] of [...document.querySelectorAll('#scaleForm select[name^="q"]')].entries()){
        s.value=String(i%5+1);
        s.dispatchEvent(new Event('change',{bubbles:true}));
      }
      for(const [k,v] of Object.entries({name:'TESTE AUTOMATIZADO - NÃO PACIENTE',birth:'1991-01-01',application:'2026-10-27'})){
        const field=document.querySelector('[data-rm="'+k+'"]');
        if(field){field.value=v;field.dispatchEvent(new Event('input',{bubbles:true}));}
      }
      return {answered:[...document.querySelectorAll('#scaleForm select[name^="q"]')].filter(x=>x.value).length,buttonDisabled:document.querySelector('#screening-submit').disabled,status:document.querySelector('#rm-form-status')?.textContent||''};
    });
    assert.equal(fill.answered,40);
    assert.equal(fill.buttonDisabled,true,'clinical release must remain disabled');
    assert.equal(posts,0,'no backend writes in locked mode');
    console.log(JSON.stringify({mode:mobile?'mobile':'desktop',status:'PASS',http:resp.status(),...result,afterFill:fill,postCount:posts}));
    await context.close();
  }
  const noJsContext=await browser.newContext({javaScriptEnabled:false});
  const p=await noJsContext.newPage();await p.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(await p.locator('button#screening-submit').isDisabled(),true);
  assert.equal(await p.locator('select[name^="q"]').count(),40);
  console.log(JSON.stringify({mode:'no-javascript',status:'PASS',buttonDisabled:true}));
  await noJsContext.close();
  const bridgeUrl='https://script.google.com/macros/s/AKfycbzrJuvVPBNPgMCZ-tmeCXy6LUMFBZB5vlNXSiP8aK3XBfiYh3xm4a4nq02xafnt65U/exec';
  try {
    const http=await browser.newContext();
    const response=await http.request.get(bridgeUrl,{timeout:15000});
    const body=await response.text();
    const health=/"health"\\s*:\\s*true|&quot;health&quot;\\s*:\\s*true/.test(body);
    const configured=/codependencia/.test(body);
    console.log(JSON.stringify({mode:'apps-script-health',httpStatus:response.status(),healthDetected:health,codependenciaListed:configured,bodyLength:body.length}));
    await http.close();
  } catch(e){console.log(JSON.stringify({mode:'apps-script-health',status:'UNVERIFIED',reason:String(e.message).slice(0,160)}));}
  if(diagnostics.length) console.log('Browser script observations:',diagnostics.slice(0,12));
} finally {await browser.close();}
