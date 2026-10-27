import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const client=fs.readFileSync('assets/codependencia-safety-v1.js','utf8');

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
assert.match(html,/screening-uniformity-v1\.js\?v=5\.1\.0-codependencia-safety/);
assert.match(html,/assets\/codependencia-safety-v1\.js\?v=1\.0\.0/);
assert.match(html,/name="referrer" content="no-referrer"/);
assert.match(html,/id="rm-form-progress"/);
assert.match(html,/id="rm-form-status"/);
assert.match(html, /id="rm-canonical-fallback"/);
assert.match(html, /id="rm-canonical-form-link"/);
assert.match(html, /https:\/\/docs\.google\.com\/forms\/d\/e\/1FAIpQLSclFCONlWGL3oVZfOH-Kg_xjCVySUFO8fJr8v89dDW8SJsNJA\/viewform/);
assert.match(html, /rel="noopener noreferrer"/);
assert.match(html, /#scaleForm \{display:none !important;\}/);
assert.match(html, /id="rm-native-google-form"/);
assert.match(html, /embedded=true/);
assert.match(client,/RM_SCREENING_V3_CLIENT_READY === true/);
assert.match(client,/form\.addEventListener\('submit', event => event\.preventDefault\(\)\)/);
assert.match(client,/c\?\.productionReady === true/);
assert.match(client,/c\?\.collectorReady === true/);
assert.match(client,/c\?\.scorerValidated === true/);
assert.match(client,/a\?\.submissionSupported === true/);
assert.doesNotMatch(client,/localStorage|sessionStorage|indexedDB|navigator\.sendBeacon/);
new Function(client);
console.log('CODEPENDENCIA_FORM_SAFETY_PASS');
