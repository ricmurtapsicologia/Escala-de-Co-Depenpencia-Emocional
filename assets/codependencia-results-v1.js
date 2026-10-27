/**
 * Devolutiva descritiva v1 — componente visual recuperado do conceito histórico.
 * Não há pontos de corte psicométricos validados. Sem diagnóstico, rótulos de
 * gravidade, envio de dados a terceiros ou armazenamento local.
 */
(() => {
  'use strict';
  const ITEM_COUNT = 40;
  const OPTIONS = Object.freeze(['Discordo Totalmente','Discordo','Neutro','Concordo','Concordo Totalmente']);
  const CONFIG = Object.freeze([
    {id:'depGauge',heading:'Dependência emocional',start:0,end:20,
      description:'Esta dimensão organiza respostas sobre autonomia, necessidade de aprovação, segurança nos vínculos e receio de rejeição.',
      meaning:'A necessidade de validação e o medo de rejeição podem influenciar escolhas nas relações, mas sua presença em respostas isoladas não define dependência emocional.',
      reflection:['Em quais situações você consegue escolher sem buscar aprovação?', 'Quando surge o receio de desagradar, que limites gostaria de preservar?']},
    {id:'codepGauge',heading:'Codependência emocional',start:20,end:40,
      description:'Esta dimensão organiza respostas sobre limites, autocuidado, responsabilidade pelos outros e dificuldade de dizer não.',
      meaning:'Cuidar de pessoas próximas não é, por si só, codependência. Importa investigar quando o cuidado se torna obrigação, autossacrifício ou dificuldade de reconhecer as próprias necessidades.',
      reflection:['Quando você ajuda alguém, consegue reconhecer o que está ao seu alcance?', 'Como costuma equilibrar o cuidado com os outros e suas próprias necessidades?']}
  ]);
  function extract(raw) {
    if (!Array.isArray(raw) || raw.length!==ITEM_COUNT) throw Error('RESULTS_INCOMPLETE_40');
    const values = raw.map(v => Number(v));
    if(values.some((n,i)=>!Number.isInteger(n)||n<1||n>5||String(raw[i])!==String(n)))
      throw Error('RESULTS_INVALID_OPTION');
    return values;
  }
  function calculate(raw) {
    const answers=extract(raw);
    return Object.freeze({
      dependencia: answers.slice(0,20).reduce((a,b)=>a+b,0),
      codependencia: answers.slice(20).reduce((a,b)=>a+b,0)
    });
  }
  function node(tag,cls,text) {
    const element=document.createElement(tag);
    if(cls) element.className=cls;
    if(text!==undefined) element.textContent=text;
    return element;
  }
  const svgNS='http://www.w3.org/2000/svg';
  function svg(tag,attrs={}) {
    const element=document.createElementNS(svgNS,tag);
    for(const [name,value] of Object.entries(attrs)) element.setAttribute(name,String(value));
    return element;
  }
  function gauge(hostId,value,title) {
    const host=document.getElementById(hostId);
    if(!host) throw Error('RESULTS_GAUGE_MISSING_'+hostId);
    host.replaceChildren();
    const graphic=svg('svg',{viewBox:'0 0 240 160',width:'100%',height:'auto',role:'img',
      'aria-label':title+': '+value+' pontos brutos, de 20 a 100.'});
    const defs=svg('defs');
    const gradient=svg('linearGradient',{id:hostId+'Colors',x1:'0%',x2:'100%',y1:'0%',y2:'0%'});
    [['0%','#159b82'],['36%','#95b94b'],['66%','#eab34f'],['100%','#d56c52']].forEach(([offset,color])=>
      gradient.append(svg('stop',{offset,'stop-color':color})));
    defs.append(gradient);graphic.append(defs);
    const arc='M 24 132 A 96 96 0 0 1 216 132';
    graphic.append(svg('path',{d:arc,fill:'none',stroke:'#dce6e4','stroke-width':19,'stroke-linecap':'round'}));
    graphic.append(svg('path',{d:arc,fill:'none',stroke:'url(#'+hostId+'Colors)','stroke-width':13,'stroke-linecap':'round'}));
    const angle=-90+180*(value-20)/80;
    const needle=svg('g',{transform:'rotate('+angle+' 120 132)'});
    needle.append(svg('path',{d:'M 116 137 L 120 45 L 124 137 Z',fill:'#233f47'}));
    needle.append(svg('circle',{cx:120,cy:132,r:8,fill:'#233f47'}));
    needle.append(svg('circle',{cx:120,cy:132,r:3,fill:'#fff'}));
    graphic.append(needle);
    const left=svg('text',{x:20,y:156,'font-size':12,'text-anchor':'middle',fill:'#526a70'});left.textContent='20';
    const right=svg('text',{x:220,y:156,'font-size':12,'text-anchor':'middle',fill:'#526a70'});right.textContent='100';
    graphic.append(left,right);
    host.append(graphic);
    host.append(node('p','codep-score-number',String(value)+' / 100'));
    host.append(node('p','codep-score-unit','Pontuação bruta • 20 respostas'));
  }
  function selectedStatements(values,start) {
    const statements=[];
    for(let k=0;k<20;k++){
      if(values[start+k]<4)continue;
      const label=document.querySelector('label[for="q'+(start+k+1)+'"]');
      const text=(label?.textContent||'').replace(/^\s*\d+\.\s*/,'').trim();
      if(text)statements.push(text);
    }
    return statements;
  }
  function createCard(config,values,score) {
    const card=node('article','codep-results-card');
    const head=node('h3','codep-results-card-title',config.heading);
    const host=node('div','codep-gauge-visual');
    host.id=config.id;
    const desc=node('p','codep-results-explanation',config.description);
    const meaning=node('div','codep-results-meaning');
    meaning.append(node('h4','codep-results-subtitle','O que suas respostas mostram'));
    const agreed=selectedStatements(values,config.start);
    if(agreed.length){
      meaning.append(node('p','codep-results-context',
        'Entre as afirmações com as quais você concordou, estão:'));
      const list=node('ul','codep-results-examples');
      agreed.slice(0,3).forEach(item=>list.append(node('li','',item)));
      meaning.append(list);
      if(agreed.length>3)meaning.append(node('p','codep-results-context',
        'Outras '+(agreed.length-3)+' afirmações também receberam concordância.'));
    }else{
      meaning.append(node('p','codep-results-context',
        'Você não selecionou “Concordo” ou “Concordo Totalmente” nas afirmações desta dimensão.'));
    }
    meaning.append(node('p','codep-results-context',config.meaning));
    meaning.append(node('h4','codep-results-subtitle','Para refletir'));
    const prompts=node('ul','codep-results-examples');
    config.reflection.forEach(question=>prompts.append(node('li','',question)));
    meaning.append(prompts);
    meaning.append(node('p','codep-results-context',
      'Esta devolutiva organiza o que foi respondido e não estabelece uma classificação clínica.'));
    card.append(head,host,desc,meaning);
    gaugeHostQueue.push([host.id,score,config.heading]);
    return card;
  }
  let gaugeHostQueue=[];
  function render(raw) {
    const answers=extract(raw);
    const scores=calculate(answers);
    const area=document.getElementById('codep-results');
    const cards=document.getElementById('codep-results-cards');
    if(!area||!cards)throw Error('RESULTS_UI_MISSING');
    // Only the submit module can authorize rendering following a positive Sheet receipt.
    if(!document.documentElement.hasAttribute('data-codep-persisted'))throw Error('RESULTS_NOT_PERSISTED');
    gaugeHostQueue=[];
    cards.replaceChildren(
      createCard(CONFIG[0],answers,scores.dependencia),
      createCard(CONFIG[1],answers,scores.codependencia)
    );
    gaugeHostQueue.forEach(args=>gauge(...args));
    area.hidden=false;
    area.setAttribute('data-results-ready','true');
    return scores;
  }
  window.CODEPENDENCIA_RESULTS=Object.freeze({calculate,render,version:'2026-10-27.2'});
})();
