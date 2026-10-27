# Verificação CATS-style — Codependência

## Objetivo

Reutilizar o protocolo de transporte comprovado no VIII CATS:
formulário HTML do site -> POST Google Forms `/formResponse` -> planilha privada -> verificador Apps Script somente de leitura -> confirmação no navegador.

A página sempre mantém o Google Forms oficial como padrão enquanto o verificador clínico NÃO estiver implantado. Não reutilizar os endpoints do CATS: eles são específicos de outra planilha e de outros dados pessoais.

## Estado

- POST sintético com 43 entradas do Forms: confirmado, HTTP 200, resposta inserida na aba `Form Responses 1`.
- Abas: `Form Responses 1` original e `Respostas consolidadas` derivada (44 colunas).
- Perguntas 1–40 e respectivas opções: preservadas.
- Frontend CATS-style: `assets/codependencia-cats-bridge-v1.js`, com isolamento de dados e confirmação baseada em fingerprint.
- Verificador Apps Script: `apps-script/CodependenciaPersistenceVerifier.gs`.
- Flag de ativação: `assets/codependencia-persistence-config-v1.js`, vazia por padrão.
- Não considerar o endpoint implantado até receber URL própria e E2E positivo de gravação.

## Implantação do verificador (no Google Form de Codependência, NÃO no CATS)

1. No Formulário `Autonomia, limites e cuidado nas relações`, abrir menu `⋮ > Apps Script`.
2. Criar projeto isolado, colar o conteúdo integral de `apps-script/CodependenciaPersistenceVerifier.gs` em `Código.gs` e salvar.
3. Em `Configurações do projeto > Propriedades do script`, criar `CLINICAL_SHEET_ID` com o ID da planilha privada `Respostas — Autonomia, limites e cuidado nas relações`.
4. Implantar como aplicativo da Web, executar como proprietário, com acesso conforme a política de utilização do formulário externo. A implantação exige autorização explícita da conta proprietária.
5. Abrir o URL `/exec` gerado. Deve retornar JSON com `status:"ready"`, `configured:true` e `protocol:"codependencia-persistence-v1"`.
6. Inserir o URL exatamente como retornado em `assets/codependencia-persistence-config-v1.js`; sem reaproveitar a URL do CATS.
7. Verificar E2E com identificação sintética exclusiva: preencher e enviar no site; aguardar `persisted:true`; conferir a nova linha em `Form Responses 1` e `Respostas consolidadas` e confirmar igualdade 40/40. Identificar o teste como NÃO PACIENTE. Não apagar somente a linha da planilha sem conciliar a resposta mantida no Google Forms.

## Critérios de segurança

- Sem resposta ou sem endpoint configurado: a versão atual do Google Forms continua visível.
- O iframe de transporte não significa sucesso. Somente `persisted:true` com hash correspondente permite mostrar confirmação de registro.
- Dados individuais nunca devem ser enviados ao GitHub, aos logs do navegador, a analytics, nem ao endpoint de verificação (apenas SHA-256).
- Sem escore automatizado, interpretação diagnóstica ou classificação de gravidade.
- Nenhum e-mail é enviado ao coordenador por este verificador; o CATS possui política de e-mail distinta.
- Se a confirmação falhar, não executar retentativa de envio automático: evitar duplicatas.
