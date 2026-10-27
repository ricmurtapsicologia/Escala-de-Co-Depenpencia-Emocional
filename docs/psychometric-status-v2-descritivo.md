# Adendo clínico — resultados descritivos de dependência e codependência

Data: 27/10/2026

## Escopo da decisão
A versão histórica tinha dois velocímetros e uma devolutiva textual ao final do preenchimento.
Em solicitação expressa do responsável clínico, essa experiência visual foi restaurada.
Este adendo complementa o registro de 07/09/2026 (`psychometric-status-v1.md`)
e substitui **somente** a proibição absoluta de mostrar escores brutos ao respondente.

## O que a nova página exibe
- Dois velocímetros, com somas **brutas** das respostas q1–q20 e q21–q40.
- Intervalo aritmético por bloco: 20–100 (20 itens de 1 a 5).
- Identificação das afirmações nas quais o respondente assinalou concordância.
- Significado **descritivo** dos temas explorados por cada dimensão e perguntas para reflexão.
- Advertência explícita: cores ilustrativas, sem pontos de corte de gravidade validados.
- Exibição condicionada à confirmação positiva de persistência na planilha.

## O que permanece proibido / não fundamentado
- Classificação automática como normal, leve, moderada ou alta.
- Diagnóstico, prognóstico, inferência causal ou conduta terapêutica produzidos a partir do escore.
- Uso de pontos de corte arbitrários 39/59/79/80 ou equivalência com CDE/CCS.
- Divulgação das respostas a serviços de analytics, logs ou armazenamento local.
- Exibir resultados antes da confirmação de gravação (fail-closed).

## Condição de uso
A interpretação clínica depende de profissional habilitado, entrevista, contexto, evolução
e instrumentos apropriados quando aplicáveis. A descrição automatizada não equivale a laudo.

## Referência técnica
- Motor: `assets/codependencia-results-v1.js`
- Composição/estética: `assets/codependencia-results-v1.css`
- Transporte mantido: `assets/codependencia-cats-bridge-v1.js`
- Verificador remoto: Apps Script `codependencia-persistence-v1`
- Contrato: 43 entradas Google Forms (3 identificação, 40 itens).
