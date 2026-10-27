# Relatório de hotfix integrado — experiência clínica v3
**Data:** 27/10/2026 | **Escopo:** frontend, devolutiva, coleta e análise profissional.

## Diagnóstico
O frontend anterior restringia o conteúdo a colunas estreitas, tinha texto excessivo, hero insuficiente e ausência de onboarding. Os indicadores apresentavam números brutos que poderiam ser confundidos com intensidade clínica. A planilha registrava os itens, mas não tinha síntese estruturada para revisão pelo psicólogo.

## Entrega ao paciente
- Hero em largura ampla, identidade própria, splash leve no desktop e experiência imediata no celular.
- Onboarding de três etapas; progressão visual das 40 respostas.
- Revisão tipográfica, textos justificados quando adequados, layout responsivo.
- Dois velocímetros SVG em painéis com conteúdo em largura ampla, paleta não semafórica.
- Devolutiva limitada a pontuação bruta contextualizada, até duas afirmações endossadas, reflexão e proposta de conversa terapêutica.
- Sem cutoff, risco estimado, percentis, classificação de gravidade ou diagnóstico automático.

## Entrega ao profissional
Planilha vinculada preservada, com nova aba `Análise clínica · Reservada`, contendo:
- Campos de identificação e data da aplicação;
- completude das respostas;
- somas de itens 1–20 e 21–40; médias;
- totais de discordâncias (1–2), neutralidade (3) e concordâncias (4–5);
- seis agrupamentos **temáticos exploratórios**, sem estrutura psicométrica validada;
- números de itens assinalados 4–5;
- campos próprios para registro e conferência clínica.

As respostas originais não foram sobrescritas. As fórmulas foram conferidas nos registros disponíveis; campos com resposta futura vazia não produzem zero artificial nos temas.

**Atenção:** a aba profissional está no mesmo arquivo Google Sheets; sua visibilidade depende das permissões de compartilhamento do arquivo inteiro. A coluna de anotações deve ser usada com os cuidados de guarda e sigilo clínico.

## Limites técnico-científicos
O questionário atual de 40 itens não é equivalente ao CDE validado de 23 itens de Lemos e Londoño. Não há evidências próprias de normas, precisão ou validade que permitam transformar 20–100 pontos em “gravidade”, “percentual de dependência” ou critério diagnóstico. Os agrupamentos por tema servem como apoio à entrevista, e não como subescalas psicométricas.

Fontes de contexto regulatório: https://satepsi.cfp.org.br/ ; https://site.cfp.org.br/publicacao/guia-pratico-de-elaboracao-e-submissao-de-testes-psicologicos-ao-satepsi/

## Testes e auditorias
- Auditoria 30/30: 30/30 — aprovada.
- Auditoria granular 90/90: 90/90 — aprovada.
- Gates 6/6: 6/6 — aprovados.
- QEP adaptado: 18/18 dimensões aplicáveis, cinco não aplicáveis, uma aferida por Lighthouse. **Não foram executados os 397 controles canônicos completos.**
- E2E em desktop e celular: PASS, 43 entradas mapeadas, dois indicadores exibidos apenas após recibo simulado.
- Cenário negativo: um único envio ao Google Forms, consultas de confirmação e nenhum falso recibo/reenvio automático.
- Contingência: o Google Forms oficial aparece apenas se o verificador não estiver disponível.
- Segurança do repositório: PASS.
- Planilha: fórmulas verificadas no conector com valores existentes, sem erro em linhas preenchidas e sem zeros fantasmas nas linhas vazias.
- A integração final com um novo envio real **não** foi repetida nessa rodada: o E2E positivo interceptou o POST para não criar dados artificiais em produção.

## Lighthouse de produção — medição após publicação
| Categoria | Celular | Desktop |
|---|---:|---:|
| Performance | **99** | **100** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |
| LCP | **2,1 s** | **0,5 s** |
| CLS | **0** | **0** |

INP não foi aferido na execução de laboratório.

## Evidências
- E2E + auditorias: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40602622387
- Smoke + contingência: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40602622423
- Segurança: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40602622383
- Lighthouse após publicação: https://github.com/ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional/actions/runs/40602868177
- Protocolo e limitações: `docs/PROTOCOLO_CLINICO_QUESTIONARIO_V3.md`

## Estado
**GO técnico** para interface, responsividade, integração preservada e cálculo descritivo auditado. Os escores permanecem não normativos; nenhuma conclusão diagnóstica é automatizada.
