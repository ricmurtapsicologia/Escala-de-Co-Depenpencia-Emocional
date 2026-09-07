from pathlib import Path
from html import unescape
import hashlib, json, re

source = Path('index.html')
out = Path('contracts/collector-v1.json')
html = source.read_text(encoding='utf-8')

identity = [
    {'key':'fullName','label':'Nome completo','sourceSelector':'#fullName','type':'text','required':True},
    {'key':'birthDate','label':'Data de nascimento','sourceSelector':'#birthDate','type':'date','required':True},
    {'key':'applicationDate','label':'Data de aplicação do rastreio','sourceSelector':'#date','type':'date','required':True},
]
for field in identity:
    if field['sourceSelector'][1:] not in html:
        raise SystemExit('IDENTITY_SOURCE_MISSING:'+field['key'])

items=[]
for number in range(1,41):
    pattern=rf'<div class="question">\s*<label>\s*{number}\.\s*(.*?)</label>\s*<select name="q{number}" required>(.*?)</select>'
    match=re.search(pattern,html,re.S)
    if not match:
        raise SystemExit(f'QUESTION_CONTRACT_MISSING:q{number}')
    label=unescape(re.sub(r'<[^>]+>','',match.group(1))).strip()
    options=[]
    for value,text in re.findall(r'<option value="([^"]+)">(.*?)</option>',match.group(2),re.S):
        options.append({'value':value,'label':unescape(re.sub(r'<[^>]+>','',text)).strip()})
    values=[o['value'] for o in options]
    if values != ['1','2','3','4','5']:
        raise SystemExit(f'QUESTION_OPTIONS_CHANGED:q{number}:{values}')
    items.append({
        'key':f'q{number}',
        'number':number,
        'section':'dependencia_emocional' if number<=20 else 'codependencia',
        'label':label,
        'required':True,
        'responseType':'single_choice',
        'options':options
    })

contract={
    'schemaVersion':'1.0.0',
    'instrumentId':'codependencia',
    'technicalName':'Rastreio de Dependência e Codependência Emocional',
    'source':{
        'repository':'ricmurtapsicologia/Escala-de-Co-Depenpencia-Emocional',
        'path':'index.html',
        'sha256':hashlib.sha256(html.encode('utf-8')).hexdigest()
    },
    'identityProfile':'screening_canonical',
    'identity':identity,
    'items':items,
    'itemCount':len(items),
    'scoringIncluded':False,
    'submissionSupported':False,
    'deploymentState':'SPEC_ONLY',
    'safety':{
        'patientFacingScoresAllowed':False,
        'clinicalResponsesInGitHubAllowed':False,
        'browserPersistenceAllowed':False,
        'googleFormsPatientFacingAllowed':False
    },
    'activationRule':'A collector may only be enabled after backend deployment, persistence receipt and E2E submission validation.'
}
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('CODEPENDENCIA_COLLECTOR_CONTRACT_V1_BUILT items=40')
