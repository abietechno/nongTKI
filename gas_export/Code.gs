function getSheet() {
  // TODO: Ganti dengan ID Google Sheet Anda
  const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; 
  const SHEET_NAME = 'Data Kreatif';
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = data.slice(1);
    
    const formattedData = rows.map((row, i) => {
      // [Timestamp, Nama, Kategori, Bio, IG, CustomLink, Web, URL_Foto]
      return {
        id: i.toString(),
        name: row[1] || '',
        category: row[2] || '',
        bio: row[3] || '',
        ig: row[4] || '',
        customLink: row[5] || '',
        web: row[6] || '',
        photo: row[7] || ''
      };
    }).reverse();
    
    return ContentService.createTextOutput(JSON.stringify(formattedData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = getSheet();
    
    // Setup header jika sheet kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Nama', 'Kategori', 'Deskripsi/Bio', 'Link Instagram', 'Custom Link', 'Link Website', 'URL Foto']);
    }
    
    let formData = {};
    if (e.postData && e.postData.contents) {
      formData = JSON.parse(e.postData.contents);
    }
    
    sheet.appendRow([
      new Date(),
      formData.name || '',
      formData.category || '',
      formData.bio || '',
      formData.ig || '',
      formData.customLink || '',
      formData.web || '',
      formData.photo || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
