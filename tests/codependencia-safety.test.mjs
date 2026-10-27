import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const client=fs.readFileSync('assets/codependencia-cats-bridge-v1.js','utf8');
const config=fs.readFileSync('assets/codependencia-persistence-config-v1.js','utf8');
const backend=fs.readFileSync('apps-script/CodependenciaPersistenceVerifier.gs','utf8');

assert.match(html, /<html lang="pt-BR">/);
assert.match(html, /<form id="scaleForm" method="post" action="#" autocomplete="off" onsubmit="return false;"/);
assert.match(html, /id="screening-submit" type="submit" disabled aria-disabled="true"/);
assert.equal((html.match(/<select id="q\d+" name="q\d+" required="">/g)||[]).length, 40);
assert.equal((html.match(/<label for="q\d+">/g)||[]).length, 40);
assert.equal((html.match(/<option value="" selected disabled>Selecione uma resposta<\/option>/g)||[]).length, 40);
for(let i=1;i<=40;i++) {
  assert.match(html,new RegExp('<label for="q'+i+'">'+i+'\\.'));
  assert.match(html,new RegExp('<select id="q'+i+'" name="q'+i+'" required="">'));
}
assert.match(html, /assets\/codependencia-cats-bridge-v1\.js\?v=/);
assert.match(html, /assets\/codependencia-persistence-config-v1\.js\?v=/);
assert.match(html,/name="referrer" content="no-referrer"/);
assert.match(html,/id="rm-form-progress"/);
assert.match(html,/id="rm-form-status"/);
assert.match(html,/id="rm-canonical-fallback"/);
assert.match(html,/id="rm-canonical-form-link"/);
assert.match(html,/https:\/\/docs\.google\.com\/forms\/d\/e\/1FAIpQLSclFCONlWGL3oVZfOH-Kg_xjCVySUFO8fJr8v89dDW8SJsNJA\/viewform/);
assert.match(html,/rel="noopener noreferrer"/);
assert.match(html,/#scaleForm \{display:none !important;\}/);
assert.match(html,/html\[data-codep-verified-collector="true"\] #scaleForm/);
assert.match(html,/id="rm-native-google-form"/);
assert.match(html,/embedded=true/);
assert.match(config,/VERIFY_URL = ''/); // Backend not deployed: native Google Form stays primary.
assert.match(client,/document\.documentElement\.dataset\.codepVerifiedCollector='true'/);
assert.match(client,/form\.removeAttribute\('onsubmit'\)/);
assert.match(client,/\/formResponse/);
assert.match(client,/data\.persisted===true/);
assert.match(client,/data\.fingerprint===fingerprint/);
assert.match(client,/const validEndpoint =/);
const entries=client.match(/questions:\s*\[([\s\S]*?)\]\s*\}/)[1].match(/\d+/g).map(Number);
assert.equal(entries.length,40);
assert.equal(new Set(entries).size,40);
assert.match(backend,/CLINICAL_SHEET_ID/);
assert.match(backend,/sheetName: 'Form Responses 1'/);
assert.match(backend,/row\[44\]/); // Dual historical/new Forms block.
assert.match(backend,/CODEP\.windowMs/);
assert.doesNotMatch(client,/localStorage|sessionStorage|indexedDB|navigator\.sendBeacon/);
new Function(client);
new Function(config);
console.log('CODEPENDENCIA_FORM_SAFETY_PASS');
