function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('NongTKI - Nongkrong Tenaga Kerja Indie')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheet() {
  // TODO: Ganti dengan ID Google Sheet Anda
  const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; 
  const SHEET_NAME = 'Data Kreatif';
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ambilData() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Hanya row header
    
    const rows = data.slice(1);
    
    return rows.map((row, i) => {
      // Index menyesuaikan dengan kolom di Sheet 
      // [Timestamp, Nama, Kategori, Bio, IG, Threads, Web, URL_Foto]
      return {
        id: i.toString(),
        name: row[1] || '',
        category: row[2] || '',
        bio: row[3] || '',
        ig: row[4] || '',
        threads: row[5] || '',
        web: row[6] || '',
        photo: row[7] || ''
      };
    }).reverse(); // Yang paling baru di atas
  } catch (error) {
    return { error: error.toString() };
  }
}

function simpanData(formData) {
  try {
    const sheet = getSheet();
    
    // Setup header jika sheet kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Nama', 'Kategori', 'Deskripsi/Bio', 'Link Instagram', 'Link Threads', 'Link Website', 'URL Foto']);
    }
    
    sheet.appendRow([
      new Date(),
      formData.name,
      formData.category,
      formData.bio,
      formData.ig,
      formData.threads,
      formData.web,
      formData.photo
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
