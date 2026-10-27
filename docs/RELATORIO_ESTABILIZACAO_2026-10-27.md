# Relatório de estabilização — Rastreio de Dependência e Codependência Emocional

**Data:** 27/10/2026

## Pinpoint e restauração

A interface histórica com `JustGage`, dois velocímetros, cálculo e devolutivas existia na revisão `3cb5bb3950`. Os elementos foram removidos no commit `415d297978` (07/09/2026), anterior à integração atual do Google Forms.

O trabalho recuperou a experiência visual com SVG independente de bibliotecas externas, mantendo:
- Identificação (3 campos), 40 itens e respectivas alternativas sem mudanças.
- Mapeamento oficial `entry.*` no POST do Google Forms.
- Apps Script `codependencia-persistence-v1` e planilha clínica existentes.
- Resultado exibido apenas após `persisted:true` e fingerprint correspondente.
- Dois velocímetros coloridos para somas brutas q1–20 e q21–40 (20 a 100 por bloco).
- Resultados descritivos, afirmações de concordância e perguntas de reflexão, sem cortes de gravidade fabricados.
- Contingência pelo Forms oficial se o Apps Script não estiver operacional.
- Proteção contra reenvio automático e falso recibo.

## Hotfixes técnicos

1. `assets/codependencia-results-v1.js`: motor puro de escore bruto, DOM seguro, duas gauge SVG, interpretação descritiva.
2. `assets/codependencia-results-v1.css`: responsividade, contraste e redução de movimento.
3. `index.html`: restauração da seção de resultados, descrição clínica, favicon local SVG, texto estável no primeiro paint.
4. `assets/codependencia-cats-bridge-v1.js`: renderização exclusivamente após confirmação externa; o caminho de coleta permanece intacto.
5. Contingência do iframe Google Forms passou a ser carregada somente após falha de disponibilidade do verificador, removendo terceiros do caminho crítico.
6. Analytics agregado preservado, iniciado durante ociosidade para não bloquear o formulário.
7. `docs/psychometric-status-v2-descritivo.md`: governança da devolutiva.

## Testes com evidência

- Auditoria 30/30: **30/30**.
- Auditoria granular 90/90: **90/90**.
- Gates 6/6: **6/6**.
- QEP crosswalk: **18/18 dimensões aplicáveis**, **5 não aplicáveis**, **1 aferida por Lighthouse externo**. A redação dos 397 controles canônicos não estava disponível neste repositório; **não** se afirma execução dos 397.
- Motor: **6 vetores aritméticos + 11 entradas inválidas** aprovados.
- E2E simulado com POST interceptado: desktop e celular **PASS**, 40 campos de resposta mapeados, dois gauges, recibo positivo e limites.
- E2E negativo: **PASS**, 1 único POST ao formulário, 21 consultas ao verificador, nenhuma confirmação falsa e nenhum reenvio.
- Smoke e auditoria de segurança: **PASS**.
- E2E positivo e negativo não criaram respostas na planilha de produção. Não representam uma nova submissão real desta versão.

**Ações GitHub:**
- E2E + QA: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40596931465
- Smoke: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40596931406
- Segurança: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40596931436
- Lighthouse produção: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40596931445

## Lighthouse produção

| Categoria | Celular | Desktop |
| --- | ---: | ---: |
| Performance | 94 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 2,0 s | 0,5 s |
| CLS | 0,039 | 0 |

INP não foi medido nesse teste sintético, sem interação humana representativa.

## Estado de liberação e ressalvas

**GO técnico** para a restauração visual, o contrato de dados e o comportamento testado.
**Limitação de validação:** o E2E integral com gravação de uma resposta inédita na planilha real, na versão final com resultado, não foi executado nesta rodada. O POST/Forms/Sheets foi previamente verificado, mas a nova versão foi protegida por interceptação em CI para não poluir respostas reais.

A página pública permanece:
https://ricmurtapsicologia.github.io/Escala-de-Co-Depenpencia-Emocional/

**Rollback:** usar o histórico de versões do GitHub; não reverter planilha, Apps Script ou dados para desfazer uma regressão visual. Antes de qualquer rollback, confirmar os commits da superfície HTML e assets de resultado.
