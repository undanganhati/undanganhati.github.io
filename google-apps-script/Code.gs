/**
 * Backend ucapan & RSVP untuk undangan digital.
 * Pasang kode ini melalui Extensions > Apps Script dari Google Sheet Anda.
 */
const SHEET_NAME = 'Ucapan';
const MAX_ENTRIES = 100;

function doGet(e) {
  const entries = getEntries_();
  return output_({ ok: true, entries: entries }, e && e.parameter && e.parameter.callback);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const name = clean_(data.name, 80);
    const wish = clean_(data.wish, 1000);
    const attendance = data.attendance === 'Hadir' ? 'Hadir' : 'Tidak hadir';
    const guests = data.guests === '2' ? '2' : '1';

    if (!name || !wish) return output_({ ok: false, message: 'Nama dan ucapan wajib diisi.' });

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const sheet = getSheet_();
      sheet.appendRow([new Date(), name, attendance, guests, wish]);
    } finally {
      lock.releaseLock();
    }
    return output_({ ok: true });
  } catch (error) {
    return output_({ ok: false, message: 'Data tidak dapat disimpan.' });
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(['Waktu', 'Nama', 'Kehadiran', 'Jumlah Tamu', 'Ucapan & Doa']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getEntries_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const startRow = Math.max(2, lastRow - MAX_ENTRIES + 1);
  return sheet.getRange(startRow, 1, lastRow - startRow + 1, 5).getValues()
    .reverse()
    .map((row) => ({ name: row[1], wish: row[4] }));
}

function clean_(value, limit) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, limit);
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
