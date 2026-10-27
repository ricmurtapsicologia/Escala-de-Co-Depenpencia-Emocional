import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source=fs.readFileSync('assets/codependencia-results-v1.js','utf8');
const win={};
vm.runInNewContext(source,{window:win,document:{},console});
const engine=win.CODEPENDENCIA_RESULTS;
assert.equal(typeof engine.calculate,'function');
const vectors=[
  {name:'all-minimum',answers:Array(40).fill(1),dependencia:20,codependencia:20},
  {name:'all-maximum',answers:Array(40).fill(5),dependencia:100,codependencia:100},
  {name:'all-neutral',answers:Array(40).fill(3),dependencia:60,codependencia:60},
  {name:'split-dimensions',answers:[...Array(20).fill(1),...Array(20).fill(5)],dependencia:20,codependencia:100},
  {name:'inverted-split',answers:[...Array(20).fill(5),...Array(20).fill(1)],dependencia:100,codependencia:20},
  {name:'ascending',answers:Array.from({length:40},(_,i)=>i%5+1),dependencia:60,codependencia:60}
];
for(const v of vectors) {
 const actual=engine.calculate(v.answers);
 assert.equal(actual.dependencia,v.dependencia,v.name+':dependencia');
 assert.equal(actual.codependencia,v.codependencia,v.name+':codependencia');
 assert.ok(Object.isFrozen(actual));
}
for(const bad of [null,undefined,[],Array(39).fill(1),Array(41).fill(1),
  [...Array(39).fill(1),0],[...Array(39).fill(1),6],
  [...Array(39).fill(1),NaN],[...Array(39).fill(1),2.5],
  [...Array(39).fill(1),'Concordo'],[...Array(39).fill(1),null]]) {
 assert.throws(()=>engine.calculate(bad),/RESULTS_/);
}
assert.match(source,/RESULTS_NOT_PERSISTED/);
assert.doesNotMatch(source,/localStorage|sessionStorage|indexedDB|sendBeacon|fetch\(/);
assert.doesNotMatch(source,/getResultDescription|Normal:|Faixa "Leve"|faixa de gravidade/i);
assert.match(source,/aria-label/);
assert.match(source,/selectedStatements/);
console.log('CODEPENDENCIA_RESULTS_TEST_PASS vectors='+vectors.length+' invalid=11');
