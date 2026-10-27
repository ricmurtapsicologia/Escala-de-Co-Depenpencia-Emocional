# Protocolo técnico e clínico — Questionário de vínculos (v3)

Atualização: 27 de outubro de 2026.

## Natureza do instrumento
O questionário desta plataforma contém 40 afirmações próprias em dois blocos de 20. Trata-se de um **recurso exploratório de organização de relatos**, e não de um teste psicométrico padronizado. Não há documentação de validade de construto, precisão, normas de interpretação ou estudos de sensibilidade/especificidade que sustentem pontos de corte.

O CDE de Lemos e Londoño (2006) possui 23 itens e seis dimensões, portanto **não** fornece equivalência, normas ou cutoffs para esta escala de 40 itens. As definições normativas do SATEPSI/CFP não devem ser extrapoladas por analogia.

Fontes institucionais:
- https://satepsi.cfp.org.br/
- https://site.cfp.org.br/publicacao/guia-pratico-de-elaboracao-e-submissao-de-testes-psicologicos-ao-satepsi/

## Regras de cálculo (descritivas, não diagnósticas)
- Itens 1–20: temas de autonomia, validação e segurança nos vínculos.
- Itens 21–40: temas de limites, autossacrifício e responsabilidade relacional.
- Respostas: discordo totalmente = 1; discordo = 2; neutro = 3; concordo = 4; concordo totalmente = 5.
- Todos os 40 itens estão redigidos no mesmo sentido de endosso ao tema; **não** há itens invertidos na versão atual.
- Somatório simples por bloco: mínimo aritmético 20, máximo 100; média = soma/20.
- Contagens de resposta 1–2, 3 e 4–5 por bloco; contagem completa obrigatória para exibir um resultado.
- As cores dos indicadores são identitárias, **não** limiares clínicos.
- Proibido atribuir baixo/médio/alto, risco, diagnóstico, prognóstico, percentis, escores T, prevalência ou percentuais de transtorno a esses valores.
- O total somado não é equivalente a um percentil; também não é o percentual da intensidade de uma característica.
- Os padrões de itens 4–5 são descrições de endosso, não sinais clínicos confirmados.

## Frontend — devolutiva ao paciente
Mostrar apenas: confirmação de registro, dois painéis breves de pontuação bruta contextualizada, até duas afirmações com concordância, significado educacional **não causal** e uma proposta de reflexão para a conversa terapêutica. Não revelar indicadores internos de triagem, contagem de itens temáticos exploratórios, planilha ou protocolos técnicos.

## Planilha profissional — uso reservado ao responsável
O arquivo existente contém:
1. `Form Responses 1`: resposta nativa original do Google Forms, não editável pela aplicação.
2. `Respostas consolidadas`: projeção automática das 40 respostas e campos de identificação.
3. `Análise clínica · Reservada`: aba derivada, com as somas, médias, completude, contagens de concordância/neutro/discordância, temas de entrevista e os números dos itens assinalados 4–5, além de espaço para avaliação e revisão profissional.

As seis categorias temáticas são hipóteses descritivas por conteúdo (não subescalas validadas):
- Aprovação e validação — itens 1, 4, 8, 15, 19, 20.
- Abandono e solidão — itens 2, 5, 7, 9, 10, 11, 16, 18.
- Autonomia e decisão — itens 3, 6, 12, 13, 14, 17.
- Limites e autossacrifício — itens 21, 22, 23, 27, 28, 30, 31, 33, 38, 39.
- Responsabilidade pelo outro — itens 24, 29, 32, 34, 35, 36, 37, 40.
- Controle e vínculos — itens 25, 26.

Essas categorias não têm padronização, confiabilidade demonstrada ou pontuação normativa. Servem **somente** para orientar a seleção de perguntas de entrevista, integradas a outros dados clínicos.

## Privacidade e governança
- O frontend não inclui as fórmulas, os temas internos ou as anotações do psicólogo.
- Não enviar nome, nascimento, respostas ou dados clínicos ao GitHub Actions, analytics, logs de testes ou endpoints não autorizados.
- A aba `Análise clínica · Reservada` **não possui acesso individual separado** por estar dentro do mesmo arquivo da planilha do Forms. O compartilhamento do arquivo deve ser restrito ao responsável clínico. Proteger células não equivale a proteção de confidencialidade.
- Campos de anotação profissional exigem a mesma cautela com dados sensíveis e regras de guarda da atividade clínica.
- Não alterar o endpoint do Forms ou a vinculação com a planilha em hotfixes exclusivamente visuais.

## Critérios de teste
- 40/40 itens e 43 campos do contrato de envio preservados.
- Somas verificadas para todos 1, todos 5, neutros, dimensões divergentes e respostas mistas.
- Resultado somente após confirmação positiva pelo Apps Script, com zero reenvio automático.
- Verificar 40 respostas válidas e cálculos ao inserir nova linha; não converter resultados em diagnóstico.
