/**
 * Devolutiva situacional v4 — leitura educacional de endossos, não diagnóstico.
 * Vida conjugal e trabalho NÃO são medidos diretamente pelos 40 itens.
 * As cenas são hipóteses para auto-observação, nunca consequências confirmadas.
 */
(() => {
  'use strict';
  const GROUPS=Object.freeze([
    {id:'approval',name:'necessidade de aprovação',
      items:[1,4,8,15,19,20],
      signal:'Você assinalou concordância em afirmações sobre buscar aprovação ou confirmação de outras pessoas.',
      relational:'Observe se você muda uma opinião, esconde uma preferência ou busca confirmação repetida para evitar desagradar.',
      work:'Se isso ocorrer no trabalho, investigue se receia discordar, decidir sem consultar alguém ou receber uma crítica.',
      partner:'Se estiver em uma relação afetiva, observe se a necessidade de confirmação interfere em conversas e decisões a dois.',
      action:'Em uma escolha pequena e segura, identifique sua preferência antes de buscar a opinião de alguém.'},
    {id:'abandonment',name:'receio de afastamento',
      items:[2,5,7,9,10,11,16,18],
      signal:'Você concordou com afirmações relacionadas a insegurança diante da distância ou possibilidade de rejeição.',
      relational:'Observe o que pensa quando alguém demora a responder ou precisa de espaço, distinguindo fatos de interpretações.',
      work:'Caso reconheça algo semelhante no trabalho, observe como reage a silêncio, retorno demorado ou feedback pouco claro.',
      partner:'Se vive uma relação afetiva, observe se períodos de distância despertam cobranças, preocupação ou necessidade de confirmação.',
      action:'Quando surgir insegurança, anote o fato observado e duas explicações alternativas antes de agir.'},
    {id:'autonomy',name:'decisões e autonomia',
      items:[3,6,12,13,14,17],
      signal:'Você concordou com afirmações sobre depender de orientação ou ajustar escolhas para atender a outras pessoas.',
      relational:'Observe em quais decisões suas preferências ficam em segundo plano e quando pedir ajuda é uma escolha livre.',
      work:'Se isso fizer sentido no trabalho, perceba se você adia decisões, pede validação excessiva ou aceita tarefas sem avaliar prioridades.',
      partner:'Se estiver em uma relação afetiva, investigue como são negociados os planos individuais e conjuntos.',
      action:'Escolha uma decisão cotidiana de baixo risco e formule primeiro o que você quer e por quê.'},
    {id:'boundaries',name:'limites e autocuidado',
      items:[21,22,23,27,28,30,31,33,38,39],
      signal:'Você assinalou concordância em afirmações sobre dificuldade de limitar demandas e priorizar suas necessidades.',
      relational:'Observe quando diz “sim” sem desejar, se sobrecarrega ou deixa de comunicar uma necessidade.',
      work:'Se isso acontece no trabalho, observe aceitação de tarefas extras, dificuldade de negociar prazos e sinais de sobrecarga.',
      partner:'Em uma relação conjugal ou amorosa, se aplicável, investigue como divide responsabilidades e comunica limites sem culpa.',
      action:'Experimente uma resposta respeitosa em situação segura: “Preciso verificar minha disponibilidade antes de confirmar”.'},
    {id:'responsibility',name:'responsabilidade pelos outros',
      items:[24,29,32,34,35,36,37,40],
      signal:'Você concordou com afirmações sobre sentir-se responsável por resolver problemas ou emoções de outras pessoas.',
      relational:'Observe se tenta resolver problemas que pertencem ao outro ou sente culpa ao oferecer apoio com limites.',
      work:'Caso essa tendência apareça no trabalho, investigue se assume problemas de colegas e deixa de cumprir suas próprias prioridades.',
      partner:'Na vida conjugal, quando aplicável, observe se cuidado e responsabilidade estão sendo divididos ou concentrados em você.',
      action:'Antes de ajudar, pergunte: “O que é responsabilidade minha, o que é da outra pessoa e o que podemos compartilhar?”.'},
    {id:'control',name:'controle e vínculos',
      items:[25,26],
      signal:'Você assinalou concordância em afirmações relacionadas a controle ou envolvimento com situações complexas.',
      relational:'Observe que preocupações surgem em situações incertas, sem presumir que isso represente um padrão de codependência.',
      work:'Se pertinente no trabalho, reconheça onde há controle real e onde é mais útil negociar ou tolerar incerteza.',
      partner:'Se vive uma relação afetiva, investigue como conversam quando não podem controlar todos os acontecimentos.',
      action:'Nomeie um aspecto que você pode influenciar e outro que não depende exclusivamente de você.'}
  ]);
  const node=(tag,cls,value)=>{
    const el=document.createElement(tag); if(cls)el.className=cls;
    if(value!==undefined)el.textContent=value; return el;
  };
  function derive(raw) {
    if(!Array.isArray(raw)||raw.length!==40)throw new Error('INSIGHTS_INVALID_LENGTH');
    const values=raw.map(Number);
    if(values.some(x=>!Number.isInteger(x)||x<1||x>5))throw new Error('INSIGHTS_INVALID_VALUE');
    const groups=GROUPS.map(g=>({
      ...g, endorsed:g.items.filter(n=>values[n-1]>=4),
      count:g.items.filter(n=>values[n-1]>=4).length
    })).filter(g=>g.count>0).sort((a,b)=>
      b.count/b.items.length-a.count/a.items.length || b.count-a.count || a.items[0]-b.items[0]);
    return Object.freeze({
      hasEndorsements:groups.length>0,
      groups, focus:groups.slice(0,2),
      totalEndorsed:values.filter(x=>x>=4).length
    });
  }
  function render(raw) {
    if(document.documentElement.dataset.codepPersisted!=='true')
      throw new Error('INSIGHTS_REQUIRE_CONFIRMED_PERSISTENCE');
    const model=derive(raw);
    const section=document.getElementById('codep-personal-insights');
    if(!section)throw new Error('INSIGHTS_MOUNT_MISSING');
    const content=node('div','rm-insight-content');
    content.append(node('p','rm-insight-eyebrow','Um olhar para o cotidiano'));
    content.append(node('h3','rm-insight-title','Como essas respostas podem aparecer na sua vida'));
    content.append(node('p','rm-insight-lead',
      'Os temas abaixo são possibilidades para você verificar em situações reais — não consequências identificadas pelo questionário. Não é possível afirmar, somente pelas respostas, se há prejuízo no trabalho ou na vida conjugal.'));
    const focus=model.focus[0];
    const self=node('section','rm-insight-panel');
    self.append(node('h4','','O que você pode reconhecer em si'));
    if(focus){
      self.append(node('p','',focus.signal));
      if(model.focus[1])self.append(node('p','',
        'Outro tema presente nas afirmações com concordância foi: '+model.focus[1].name+'.'));
      self.append(node('p','rm-insight-note',
        'A concordância com afirmações não comprova um problema. Observe a frequência, o contexto, o desconforto e o impacto antes de tirar conclusões.'));
    }else{
      self.append(node('p','',
        'Você não marcou “Concordo” ou “Concordo Totalmente” nas afirmações. Isso não confirma nem descarta dificuldades: observe como se sente em situações reais e leve qualquer dúvida à conversa clínica.'));
    }
    content.append(self);
    const domains=node('div','rm-insight-domains');
    const domainPairs=[
      ['Nos relacionamentos',focus?.relational||'Observe como você comunica desejos, lida com divergências e preserva seus limites nas relações.'],
      ['No trabalho, se for pertinente',focus?.work||'Se você trabalha, observe como decide, recebe críticas, negocia tarefas e protege períodos de descanso.'],
      ['Na vida conjugal ou afetiva, se aplicável',focus?.partner||'Se você vive uma relação afetiva, observe a divisão de responsabilidades, a comunicação e a autonomia de cada pessoa.']
    ];
    domainPairs.forEach(([title,body])=>{
      const box=node('article','rm-insight-domain');
      box.append(node('h4','',title),node('p','',body));
      domains.append(box);
    });
    content.append(domains);
    const steps=node('section','rm-insight-steps');
    steps.append(node('h4','','O que fazer a partir de agora'));
    const ordered=node('ol','');
    [
      'Identifique uma situação concreta da última semana em que o tema apareceu — ou confirme que não apareceu.',
      'Registre: situação → pensamento imediato → emoção (0–10) → reação → consequência. Diferencie o que ocorreu do que você supôs.',
      focus?.action||'Escolha uma atitude pequena e segura que respeite seus valores e limites, sem alterar uma relação por causa de um resultado.',
      'Converse com seu psicólogo sobre o registro e sobre o que realmente interfere em seu bem-estar.'
    ].forEach(x=>ordered.append(node('li','',x)));
    steps.append(ordered);
    steps.append(node('p','rm-insight-note',
      'Não é necessário confrontar alguém nem modificar uma relação por causa deste resultado. Se uma situação envolver controle coercitivo, ameaça ou violência, priorize sua segurança e procure apoio apropriado.'));
    content.append(steps);
    section.replaceChildren(content);
    section.hidden=false;
    section.dataset.insightsReady='true';
    return model;
  }
  window.CODEPENDENCIA_INSIGHTS=Object.freeze({derive,render,version:'2026-10-27.4'});
})();
