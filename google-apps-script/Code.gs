/**
 * RSVP endpoint for the wedding invitation.
 * Bind this script to a Google Sheet, then deploy it as a Web App.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVP');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('RSVP');
      sheet.appendRow(['Waktu', 'Nama', 'Nama Tamu', 'Kehadiran', 'Ucapan', 'Bukti tanda kasih (Drive)']);
    }

    var proofUrl = '';
    if (data.proof && data.proof.base64) {
      var bytes = Utilities.base64Decode(data.proof.base64);
      var safeName = String(data.proof.name || 'bukti').replace(/[\\/:*?"<>|]/g, '_');
      var blob = Utilities.newBlob(bytes, data.proof.mimeType || 'application/octet-stream', new Date().toISOString() + '-' + safeName);
      var file = DriveApp.createFile(blob);
      proofUrl = file.getUrl();
    }

    sheet.appendRow([
      new Date(),
      String(data.name || '').slice(0, 200),
      String(data.guest || '').slice(0, 200),
      String(data.attendance || '').slice(0, 50),
      String(data.message || '').slice(0, 2000),
      proofUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(error) })).setMimeType(ContentService.MimeType.JSON);
  }
}
