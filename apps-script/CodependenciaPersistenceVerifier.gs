/**
 * Rastreio de dependência/codependência: verificador de persistência.
 * Adaptado do contrato do CATS pré-curso, sem transportar respostas ao browser.
 * Configurar em Apps Script > Project Settings > Script properties:
 * CLINICAL_SHEET_ID = ID da planilha de respostas do Google Forms.
 *
 * Implementar como novo Web App ("Executar como: eu", acesso público conforme
 * política de privacidade do consultório). Não reutilizar o script do CATS.
 */
const CODEP = Object.freeze({
  protocol: 'codependencia-persistence-v1',
  sheetName: 'Form Responses 1',
  windowMs: 45 * 60 * 1000,
  maxRows: 100,
  version: '2026-10-27.1'
});

function asJSON_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function doGet() {
  return asJSON_({ status: 'ready', protocol: CODEP.protocol, version: CODEP.version,
    configured: !!PropertiesService.getScriptProperties().getProperty('CLINICAL_SHEET_ID') });
}
function clean_(value) {
  return String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
}
function dateISO_(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, timezone, 'yyyy-MM-dd');
  }
  const text = clean_(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    // Native Forms response sheet has en_US locale, but actual Date values
    // above are preferred. This only handles unparsed displayed strings.
    const month = match[1], day = match[2], year = match[3];
    return [year, month.padStart(2,'0'), day.padStart(2,'0')].join('-');
  }
  return '';
}
function hash_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}
function fingerprint_(row, base, timezone) {
  const name = clean_(row[base]).toUpperCase();
  const birth = dateISO_(row[base+1], timezone);
  const application = dateISO_(row[base+2], timezone);
  const answers = row.slice(base+3, base+43).map(clean_);
  const options = ['Discordo Totalmente','Discordo','Neutro','Concordo','Concordo Totalmente'];
  if (!name || !birth || !application || answers.length !== 40 ||
      answers.some(answer => !options.includes(answer))) return null;
  return hash_([name,birth,application,...answers].join('|'));
}
function doPost(e) {
  let incoming = {};
  try {
    incoming = JSON.parse(e && e.postData && e.postData.contents || '{}');
  } catch (_) {
    return asJSON_({ persisted:false, reason:'invalid-json' });
  }
  if (incoming.protocol !== CODEP.protocol || !/^[a-f0-9]{64}$/.test(String(incoming.fingerprint||''))) {
    return asJSON_({ persisted:false, reason:'invalid-contract' });
  }
  const id = PropertiesService.getScriptProperties().getProperty('CLINICAL_SHEET_ID');
  if (!id) return asJSON_({persisted:false,reason:'not-configured'});
  try {
    const book = SpreadsheetApp.openById(id);
    const sheet = book.getSheetByName(CODEP.sheetName);
    if (!sheet) return asJSON_({persisted:false,reason:'sheet-not-found'});
    const last = sheet.getLastRow();
    if (last < 2) return asJSON_({persisted:false,reason:'no-responses'});
    const start = Math.max(2,last-CODEP.maxRows+1);
    const rows = sheet.getRange(start,1,last-start+1,Math.min(sheet.getLastColumn(),87)).getValues();
    const now = Date.now();
    const timezone = book.getSpreadsheetTimeZone() || 'America/Sao_Paulo';
    for (let i=rows.length-1;i>=0;i--) {
      const row=rows[i];
      const timestamp=row[0];
      const time=timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime();
      if (!Number.isFinite(time) || now-time < -5*60000 || now-time > CODEP.windowMs) continue;
      // Original Forms columns: B:AR (base 1); re-created question columns: AS:CI (base 44).
      const base=clean_(row[44]) ? 44 : 1;
      const signature=fingerprint_(row,base,timezone);
      if(signature===incoming.fingerprint) {
        return asJSON_({persisted:true, protocol:CODEP.protocol,
          fingerprint:incoming.fingerprint, version:CODEP.version});
      }
    }
    return asJSON_({persisted:false,reason:'not-yet-visible'});
  } catch (_) {
    return asJSON_({persisted:false,reason:'sheet-unavailable'});
  }
}