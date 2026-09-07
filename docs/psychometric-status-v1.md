# Status psicométrico — Dependência e Codependência Emocional v1

Data de revisão: 2026-09-07

## Decisão

O instrumento atual de 40 itens pode permanecer como **coletor clínico estruturado em validação**, mas não deve usar, no frontend ou no relatório profissional, as antigas categorias automáticas `Normal`, `Leve`, `Moderada` e `Alta` nem os cortes `<=39`, `40–59`, `60–79` e `>=80` como se fossem pontos de corte psicométricos validados.

Estado canônico:

- contrato estrutural: **VALIDADO 40/40**;
- coleta: **pode ser provisionada, inicialmente fechada**;
- interpretação automatizada de gravidade: **NÃO VALIDADA**;
- scorer permitido nesta etapa: **raw_only**;
- escore/diagnóstico para o paciente: **PROIBIDO**;
- ativação em produção: **BLOQUEADA até teste real de persistência, relatório e recibo**.

## O que foi confirmado no código legado

A lógica antiga soma respostas de `q1` a `q20` em uma dimensão e `q21` a `q40` em outra. Cada item usa respostas de 1 a 5, portanto cada bloco de 20 itens possui amplitude aritmética bruta de 20 a 100.

Essa coerência aritmética não demonstra validade dos pontos de corte nem autoriza rótulos de gravidade.

## Revisão de evidências

### Dependência emocional

A literatura brasileira localizada para o *Cuestionario de Dependencia Emocional* (CDE) descreve um instrumento diferente do atual: 23 itens, escala Likert de seis pontos e evidências psicométricas brasileiras publicadas por Fonsêca et al. (2020). O estudo de adaptação brasileira encontrou estrutura unifatorial e precisão satisfatória.

Referências:

- Fonsêca PN, Couto RN, Silva PGN, Guimarães CLC, Machado MOS. Evidências psicométricas do Cuestionario de Dependencia Emocional (CDE). Avaliação Psicológica. 2020;19(1). https://submission-pepsic.scielo.br/index.php/avp/article/view/16791
- Aplicação contemporânea da versão brasileira do CDE: https://www.scielo.br/j/pusf/a/Rg7pzH4Q93sKX3F9VVwZ9cN/?lang=pt

### Codependência

A literatura localizada descreve instrumentos próprios para codependência, também diferentes do atual conjunto de 20 itens. A *Composite Codependency Scale* (CCS) foi estudada com 19 itens em três dimensões — autossacrifício, controle interpessoal e supressão emocional — e posteriormente teve uma versão abreviada de nove itens testada em familiares afetados por transtorno por uso de substâncias e população geral.

Referências:

- Askian P et al. How do psychological characteristics of family members affected by substance use influence quality of life? BMC Psychiatry. 2019. https://pmc.ncbi.nlm.nih.gov/articles/PMC6620238/
- PubMed: https://pubmed.ncbi.nlm.nih.gov/30895489/

## Consequência para o sistema

Não há base suficiente, nesta revisão, para afirmar que o instrumento customizado 40/40 é equivalente ao CDE brasileiro, à CCS ou a outro instrumento validado, nem para transplantar pontos de corte dessas escalas.

Portanto:

1. preservar os 40 itens atuais como contrato de coleta até decisão clínica/metodológica posterior;
2. retirar a interpretação automática categórica do paciente;
3. aceitar apenas revisão clínica bruta no backend nesta etapa;
4. não criar novos cortes por regra de três, percentuais ou normalização ad hoc;
5. qualquer migração para instrumento validado deve ser tratada como nova versão, com análise de autorização de uso, população-alvo, tradução/adaptação, estrutura fatorial e regra oficial de correção;
6. rastreio não equivale a diagnóstico.

## Critério para liberar scorer clínico

Um scorer diferente de `raw_only` só poderá ser ativado quando houver, para a versão exata dos itens em produção:

- fonte técnica identificada;
- definição de dimensões;
- itens invertidos, se houver;
- regra de soma/transformação;
- tratamento de respostas ausentes;
- interpretação tecnicamente defensável;
- pontos de corte somente se suportados pela fonte correspondente;
- testes unitários de mínimo, máximo, limites, itens invertidos e casos incompletos;
- concordância entre frontend, coletor, planilha, scorer e relatório.
