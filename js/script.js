// Replace with your actual spreadsheet ID
const SPREADSHEET_ID = '1YuEF_iRlK0_MwwwIMwB6gqU6xAx0DSu3_Dd5ZlmF1xQ';
const SHEET_NAME = 'main_sheet';

// Utility to get the sheet
function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

// Common headers for CORS and JSON output
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Handle preflight OPTIONS request
function doOptions(e) {
  return buildResponse({});
}

// Handle GET requests (only getAll supported here)
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getAll') {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    const headers = rows.shift();
    const data = rows.map(r => headers.reduce((obj, h, i) => (obj[h] = r[i], obj), {}));
    return buildResponse(data);
  }
  return buildResponse({ error: 'Invalid GET action' });
}

// Handle POST requests for add/update/delete
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];

  if (action === 'add') {
    // Append new record
    const record = params.record;
    const values = headers.map(h => JSON.stringify(record[h] || ''));
    sheet.appendRow(values.map(v => JSON.parse(v)));
    return buildResponse(record);
  }

  // Find existing row by id
  const idCol = headers.indexOf('id');
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === params.record.id) {
      const rowIndex = i + 1;
      if (action === 'update') {
        // Overwrite each column
        headers.forEach((h, j) => {
          const val = params.record[h];
          sheet.getRange(rowIndex, j + 1).setValue(
            typeof val === 'object' ? JSON.stringify(val) : val
          );
        });
        return buildResponse(params.record);
      }
      if (action === 'delete') {
        sheet.deleteRow(rowIndex);
        return buildResponse({ id: params.record.id, deleted: true });
      }
    }
  }

  return buildResponse({ error: 'Record not found for ' + action });
}
