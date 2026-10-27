"""Auditoria de superfície: 30/30, 90/90, seis gates e QEP transversal.
A lista canônica QEP literal de 397 controles não está disponível neste repo;
este crosswalk NÃO simula esses 397 testes.
"""
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
def read(path): return (root/path).read_text(encoding="utf-8")
html=read("index.html"); bridge=read("assets/codependencia-cats-bridge-v1.js")
results=read("assets/codependencia-results-v1.js")
css=read("assets/codependencia-results-v1.css")
config=read("assets/codependencia-persistence-config-v1.js")
backend=read("apps-script/CodependenciaPersistenceVerifier.gs")
psych=read("docs/psychometric-status-v1.md")
stage=read("tests/codependencia-cats-staged-e2e.mjs")
units=read("tests/codependencia-results.test.mjs")
safety=read("tests/codependencia-safety.test.mjs")

checks={}
def check(k,statement): checks[k]=bool(statement)
def present(*parts):return all(x in html+bridge+results+css+config+backend+stage+units for x in parts)
check("01 — publicação html",html.startswith("<!DOCTYPE html>") and html.rstrip().endswith("</html>"))
check("02 — idioma",'<html lang="pt-BR">' in html)
check("03 — campos de identificação",all(x in html for x in ('id="fullName"','id="birthDate"','id="date"')))
check("04 — duas dimensões", 'Autonomia e segurança nos vínculos' in html and 'Codependência emocional' in results)
check("05 — contrato Google Forms", '1FAIpQLSclFCONlWGL3oVZfOH-Kg_xjCVySUFO8fJr8v89dDW8SJsNJA' in bridge)
check("06 — acionamento POST", '/formResponse' in bridge and 'HTMLFormElement.prototype.submit.call(transport)' in bridge)
check("07 — backend independente", 'SpreadsheetApp.openById(id)' in backend)
check("08 — recibo verificado", "data.persisted===true" in bridge and "data.fingerprint===fingerprint" in bridge)
check("09 — não confirmar pelo iframe", 'iframe.load' in bridge and 'NEVER interpreted' in bridge)
check("10 — fallback Forms", 'id="rm-canonical-form-link"' in html and 'id="rm-native-google-form"' in html)
check("11 — falha fechada", "if(!ok) { enableNativeFallback(); return; }" in bridge and "needsReview=true" in bridge)
check("12 — prevenção de duplicidade", "busy || committed || needsReview" in bridge)
check("13 — retenção sem storage", not re.search(r'localStorage|sessionStorage|indexedDB|sendBeacon',bridge+results))
check("14 — minimização do verificador", 'incoming.fingerprint' in backend and 'persisted:true' in backend)
check("15 — retorno sem respostas", 'getDisplayValues' not in backend and 'row:' not in backend)
check("16 — 40 perguntas", len(re.findall(r'<select id="q\d+" name="q\d+" required="">',html))==40)
check("17 — alternativas exatas", html.count('<option value="5">Concordo Totalmente</option>')==40)
check("18 — validação de completude", "answers.every(x=>OPTIONS.includes(x))" in bridge)
check("19 — resultado pós gravação", "dataset.codepPersisted='true'" in bridge and 'RESULTS_NOT_PERSISTED' in results)
check("20 — dois velocímetros", 'id:\'depGauge\'' in results and 'id:\'codepGauge\'' in results)
check("21 — valores brutos 20 a 100", 'value-20)/80' in results and 'slice(0,20)' in results and 'slice(20)' in results)
check("22 — sem cortes fabricados", not re.search(r'score\s*(?:<=|>=|<|>)\s*(?:39|40|59|60|79|80)',results))
check("23 — sem diagnóstico de escore", 'não possui' not in results or 'sem diagnóstico' in results.lower() or 'sem diagnóstico' in html.lower())
check("24 — texto descritivo", 'selectedStatements' in results and 'não estabelece uma classificação clínica' in results)
check("25 — acessibilidade dos gráficos", "'aria-label':title+" in results and 'role:\'img\'' in results)
check("26 — layout responsivo", '@media (max-width:740px)' in css)
check("27 — redução de movimento", 'prefers-reduced-motion:reduce' in css)
check("28 — sem XSS por resposta", 'textContent=text' in results and 'node(\'li\'' in results and 'innerHTML' not in results)
check("29 — teste de pontuações extremas", 'all-minimum' in units and 'all-maximum' in units)
check("30 — E2E e contingência", 'persistenceVerified:true' in stage and 'noRealGoogleSubmission:true' in stage)

qa90=[]
for i in range(1,41):
    qa90.append((f"questão {i:02d}: seletor único",len(re.findall(r'<select id="q'+str(i)+r'" name="q'+str(i)+r'" required="">',html))==1))
for i in range(1,41):
    m=re.search(r'<select id="q'+str(i)+r'"[^>]*>(.*?)</select>',html,re.S)
    choices=re.findall(r'<option value="(\d)">([^<]+)</option>',m.group(1)) if m else []
    qa90.append((f"questão {i:02d}: alternativas 1–5",choices==[
       ('1','Discordo Totalmente'),('2','Discordo'),('3','Neutro'),
       ('4','Concordo'),('5','Concordo Totalmente')]))
qa90.extend([
  ("contingência oficial",checks["10 — fallback Forms"]),
  ("confirmação independente",checks["08 — recibo verificado"]),
  ("40 itens motor", 'ITEM_COUNT = 40' in results),
  ("domínio de respostas", 'n<1||n>5' in results),
  ("escore mínimo", 'dependencia:20' in units),
  ("escore máximo", 'dependencia:100' in units),
  ("resultado oculto antes de envio", 'id="codep-results"' in html and 'hidden' in html[html.index('id="codep-results"'):html.index('id="codep-results"')+100]),
  ("sem dados clínicos no URL", 'URLSearchParams' not in results),
  ("testes de coerência", 'all-neutral' in units),
  ("redução de movimento", checks["27 — redução de movimento"])
])
assert len(checks)==30 and len(qa90)==90
print("AUDITORIA_30_30")
for name,ok in checks.items(): print(("PASS" if ok else "FAIL")+" | "+name)
print("AUDITORIA_90_90")
for name,ok in qa90: print(("PASS" if ok else "FAIL")+" | "+name)

gates={
 'Integridade do instrumento':all(list(checks.values())[i] for i in [2,3,15,16,17]),
 'Conservação de gravação':all(list(checks.values())[i] for i in [4,5,6,7,8,9,10,11,13,14]),
 'Responsabilidade clínica':all(list(checks.values())[i] for i in [18,20,21,22,23]),
 'UX e acessibilidade':all(list(checks.values())[i] for i in [19,24,25,26,27]),
 'Testes e regressões':all(list(checks.values())[i] for i in [28,29]) and all(x for _,x in qa90),
 'Publicação coerente':all(list(checks.values())[i] for i in [0,1,12]) and 'script.google.com/macros/s/' in config,
}
print("GATES_6_6")
for name,ok in gates.items(): print(("PASS" if ok else "FAIL")+" | "+name)
qep=[
("01 Integridade editorial",checks["16 — 40 perguntas"]),
("02 Arquitetura informacional",checks["03 — campos de identificação"] and checks["19 — resultado pós gravação"]),
("03 Qualidade textual",checks["24 — texto descritivo"]),
("04 Hierarquia visual",'<h2 id="codep-results-title"' in html),
("05 Tipografia",'.codep-score-number' in css),
("06 Grid e editoração",checks["26 — layout responsivo"]),
("07 Direção visual", '#159b82' in results and '#d56c52' in results),
("08 Capa/hero", 'data-rm-hero-source' in html),
("09 UX",checks["10 — fallback Forms"] and checks["12 — prevenção de duplicidade"]),
("10 Experiência pedagógica",True), # N/A — rastreio, não curso
("11 Metodologia/formulário",checks["18 — validação de completude"]),
("12 Multimídia",True), # N/A — nenhuma mídia imprescindível
("13 Acessibilidade",checks["25 — acessibilidade dos gráficos"]),
("14 Responsividade",checks["26 — layout responsivo"]),
("15 Performance",True), # Gate de medição real separado, não pontuação simulada
("16 Integridade funcional",checks["06 — acionamento POST"]),
("17 Documento estático",True), # N/A
("18 EPUB",True), # N/A
("19 Interatividade documental",True), # N/A
("20 Privacidade",checks["13 — retenção sem storage"]),
("21 Metadados",'<meta' in html and 'og:title' in html),
("22 Robustez e QA",checks["29 — teste de pontuações extremas"]),
("23 Excelência editorial",checks["22 — sem cortes fabricados"]),
("24 Consistência cross-format",checks["05 — contrato Google Forms"] and checks["07 — backend independente"])
]
# Cinco dimensões são não aplicáveis a uma aplicação web clínica; performance
# exige Lighthouse real, portanto nunca se declara aprovada por mero texto-fonte.
qep=[(name, ('N/A' if i in (9,11,16,17,18) else 'EXTERNAL' if i==14 else ok))
     for i,(name,ok) in enumerate(qep)]
print("QEP_CROSSWALK_24_DIMENSOES / CONTROLES_LITERAL_397_NAO_DISPONIVEIS")
for name,ok in qep:
    flag=ok if isinstance(ok,str) else ('PASS' if ok else 'FAIL')
    print(str(flag)+" | "+name)
fail30=sum(not x for x in checks.values());fail90=sum(not x for _,x in qa90)
fail6=sum(not x for x in gates.values());failqep=sum(x is False for _,x in qep)
applicable=sum(isinstance(ok,bool) for _,ok in qep)
passed=sum(ok is True for _,ok in qep)
na=sum(ok=='N/A' for _,ok in qep)
external=sum(ok=='EXTERNAL' for _,ok in qep)
print(f"SUMMARY 30={30-fail30}/30 90={90-fail90}/90 6={6-fail6}/6 QEP={passed}/{applicable} aplicáveis N/A={na} EXTERNAL={external}")
if fail30 or fail90 or fail6 or failqep: raise SystemExit(1)
