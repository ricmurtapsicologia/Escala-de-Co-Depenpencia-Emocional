import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('assets/codependencia-insights-v4.js','utf8');
const sandbox={window:{},document:{}};
vm.runInNewContext(source,sandbox);
const derive=sandbox.window.CODEPENDENCIA_INSIGHTS.derive;
const cases=[
 {name:'none',data:Array(40).fill(1),focus:[],count:0},
 {name:'all',data:Array(40).fill(5),count:40,all:6},
 {name:'approval',data:Array.from({length:40},(_,i)=>i===0?5:1),focus:['approval'],count:1},
 {name:'abandonment',data:Array.from({length:40},(_,i)=>i===9?4:1),focus:['abandonment'],count:1},
 {name:'boundaries',data:Array.from({length:40},(_,i)=>i===21?4:1),focus:['boundaries'],count:1},
 {name:'responsibility',data:Array.from({length:40},(_,i)=>i===34?5:1),focus:['responsibility'],count:1},
 {name:'control',data:Array.from({length:40},(_,i)=>i===25?5:1),focus:['control'],count:1}
];
for(const c of cases) {
 const result=derive(c.data);
 assert.equal(result.totalEndorsed,c.count,c.name);
 if(c.focus)assert.deepEqual(Array.from(result.focus.map(x=>x.id)),c.focus,c.name);
 if(c.all)assert.equal(result.groups.length,c.all);
}
for(const invalid of [null,[],Array(39).fill(2),Array(41).fill(2),[...Array(39).fill(1),0],[...Array(39).fill(1),6]])
 assert.throws(()=>derive(invalid),/INSIGHTS_/);
assert.match(source,/trabalho NÃO são medidos diretamente/);
assert.match(source,/não consequências identificadas pelo questionário/);
assert.match(source,/situação → pensamento imediato → emoção \(0–10\) → reação → consequência/);
assert.match(source,/vida conjugal ou afetiva, se aplicável/);
assert.match(source,/INSIGHTS_REQUIRE_CONFIRMED_PERSISTENCE/);
assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|fetch\(|sendBeacon|innerHTML/);
console.log('PERSONAL_INSIGHTS_TEST_PASS vectors='+cases.length+' invalid=6');
