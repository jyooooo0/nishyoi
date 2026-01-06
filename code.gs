/**
 * Code.gs
 * 
 * 1. Deploy this script as a Web App.
 *    - Execute as: Me (your email)
 *    - Who has access: Anyone (or "Anyone with Google account" if restricted)
 * 2. Copy the resulting URL and paste it into rasendo/index.html (GAS_API_URL).
 */

const SHEET_NAME = 'Reservations';

function doPost(e) {
  try {
    // 1. Parse Data
    // Default to JSON parsing, fallback to parameter map if needed
    const params = JSON.parse(e.postData.contents);
    const { name, email, date, guests, notes } = params;
    
    // 2. Open Spreadsheet
    const sheet = getOrCreateSheet(SHEET_NAME);
    
    // 3. Append Data
    const timestamp = new Date();
    sheet.appendRow([timestamp, name, email, date, guests, notes]);
    
    // 4. Send Emails (Optional - requires permissions)
    sendNotification(name, email, date, guests);
    
    // 5. Return Success
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Reserved' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper to get sheet or create if missing
 */
function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Header row
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Date', 'Guests', 'Notes']);
  }
  return sheet;
}

/**
 * Send Email Notification
 */
function sendNotification(name, email, date, guests) {
  const subject = `【予約受付】${name}様 (${date})`;
  const body = `
    以下の予約を受け付けました。
    
    お名前: ${name}
    宿泊日: ${date}
    人数: ${guests}名
    Email: ${email}
    
    ※このメールは自動送信です。
  `;
  
  // To Admin aka yourself (Effective User)
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), subject, body);
  
  // To User (Optional, uncomment if safe)
  // MailApp.sendEmail(email, "【螺旋堂】予約を受け付けました", body);
}
