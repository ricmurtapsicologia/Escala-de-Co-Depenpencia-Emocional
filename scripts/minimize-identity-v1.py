from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')
original=s

legacy_lines=[
    '\t\t\t\t<input type="email" id="email" placeholder="E-mail" required>\n',
    '\t\t\t\t<input type="text" id="phoneNumber" placeholder="Telefone">\n',
    '\t\t\t\t<input type="text" id="age" placeholder="Idade">\n',
]
for line in legacy_lines:
    s=s.replace(line,'',1)

# Garantias de identidade canônica.
for sentinel in [
    'id="fullName"',
    'id="birthDate"',
    'id="date"',
]:
    if sentinel not in s:
        raise SystemExit(f'CANONICAL_IDENTITY_MISSING:{sentinel}')

# A migração não pode tocar nos 40 itens nem em sua escala 1–5.
for i in range(1,41):
    block=re.search(rf'<select name="q{i}" required>(.*?)</select>',s,re.S)
    if not block:
        raise SystemExit(f'QUESTION_MISSING:q{i}')
    values=re.findall(r'<option value="([1-5])">',block.group(1))
    if values != ['1','2','3','4','5']:
        raise SystemExit(f'QUESTION_OPTIONS_CHANGED:q{i}:{values}')

for forbidden in ['id="email"','id="phoneNumber"','id="age"']:
    if forbidden in s:
        raise SystemExit(f'LEGACY_PII_STILL_PRESENT:{forbidden}')

if s == original:
    print('IDENTITY_ALREADY_MINIMIZED')
else:
    p.write_text(s,encoding='utf-8')
    print('IDENTITY_MINIMIZED')
