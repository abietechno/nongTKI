# Panduan Deploy & Integrasi NongTKI

Aplikasi ini dapat di-deploy dengan 2 cara berbeda:
1. **Full-Stack di Google Apps Script (GAS)**: Frontend & backend sepenuhnya di-host oleh Google.
2. **Headless Backend (GAS) + Frontend di Vercel (React)**: Backend menggunakan fungsi Web App GAS sebagai REST API, dan frontend modern Next/React di-deploy ke Vercel.

Berikut adalah langkah-langkah untuk mengatur sinkronisasi ke Google Sheets dan memilih opsi deployment yang Anda inginkan.

---

## 🛠 LENGKAH 1: Persiapan Google Sheets Server
Langkah pertama untuk kedua opsi adalah mengamankan database Google Sheets Anda:

1. Buat **Spreadsheet Baru** di [Google Sheets](https://sheets.new).
2. Beri nama Sheet tersebut, misalnya: `Data Kreatif` (harus sama dengan yang ada di code `SHEET_NAME`).
3. (Opsional tapi disarankan) Buat Header di Baris 1: `Timestamp`, `Nama`, `Kategori`, `Deskripsi/Bio`, `Link Instagram`, `Link Threads`, `Link Website`, `URL Foto`
4. Dapatkan **Spreadsheet ID** dari URL. Contoh: `https://docs.google.com/spreadsheets/d/INI_ADALAH_SPREADSHEET_ID/edit`

---

## OPSI A: Deploy 100% di Google Apps Script (Sederhana)
Jika Anda hanya ingin menggunakan file di dalam folder `/gas_export/` (murni HTML, JS, Tailwind CDN) tanpa perlu server Vercel:

1. Di Google Sheets Anda, klik menu **Ekstensi > Apps Script**.
2. Ubah nama project di bagian atas (misal: `NongTKI WebApp`).
3. Ganti isi `Code.gs` dengan kode dari `/gas_export/Code.gs` project ini.
4. Jangan lupa **ganti** `const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';` dengan Spreadsheet ID asli Anda.
5. Buat file HTML baru (Klik tombol tambah `+` -> HTML) beri nama `Index.html`, lalu paste isi dari `/gas_export/Index.html`.
6. Buat file HTML satu lagi beri nama `JavaScript.html` lalu paste isi dari `/gas_export/JavaScript.html`.
7. **Deploy!** Klik tombol biru **Terapkan (Deploy) > Deployment Baru**.
   - **Pilih Jenis:** `Aplikasi Web` (Web App).
   - **Beri deskripsi:** (misal "Versi 1.0").
   - **Jalankan sebagai:** `Saya` (Akun Anda).
   - **Siapa yang memiliki akses:** `Siapa saja` (Anyone / Penting agar publik bisa akses web).
   - Klik **Terapkan**.
8. Setujui izin (_Authorization_) saat diminta (Lanjutkan > Buka "Aman" / "Unsafe" > Allow).
9. Anda akan mendapatkan **URL Web App**. Web Anda sudah online dan terkoneksi ke Sheet!

---

## OPSI B: Deploy Frontend di Vercel & Backend API di GAS (Advanced)
Jika Anda memilih untuk deploy versi Frontend React (folder `/src/` & `App.tsx` di project ini) ke **Vercel** dan menyimpan datanya di Google Sheets, Anda butuh pengaturan via API (Fetch/REST). 

### 1. Ubah GAS menjadi JSON API (Backend)
Buka Google Apps Script seperti langkah OPSI A, tapi ganti isi `Code.gs` menjadi format API untuk menangani CORS dan JSON:

```javascript
// Konfigurasi Database
const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Data Kreatif';

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

// Menangani permintaan GET (Ambil Data ke Frontend Vercel)
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return responseJSON([], 200);
    
    const rows = data.slice(1);
    const result = rows.map((row, i) => ({
      id: i.toString(),
      name: row[1] || '',
      category: row[2] || '',
      bio: row[3] || '',
      ig: row[4] || '',
      threads: row[5] || '',
      web: row[6] || '',
      photo: row[7] || ''
    })).reverse();
    
    return responseJSON(result, 200);
  } catch (err) {
    return responseJSON({ error: err.toString() }, 500);
  }
}

// Menangani permintaan POST (Kirim Data dari Frontend Vercel)
function doPost(e) {
  try {
    const formData = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Nama', 'Kategori', 'Deskripsi/Bio', 'Link Instagram', 'Link Threads', 'Link Website', 'URL Foto']);
    }
    
    sheet.appendRow([
      new Date(),
      formData.name, formData.category, formData.bio, 
      formData.ig, formData.threads, formData.web, formData.photo
    ]);
    
    return responseJSON({ success: true, message: "Berhasil disimpan!" }, 200);
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() }, 500);
  }
}

// CORS & Response Format Helper
function responseJSON(data, code) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Penting untuk method preflight OPTIONS jika ada request di sisi client/browser
function doOptions(e) { 
  return responseJSON({ success: true }, 200);
}
```

1. Deploy script tersebut sebagai **Aplikasi Web** (Siapa saja memiliki akses). 
2. Salin **URL Web App** terbaru Anda, URL ini sekarang bertindak sebagai `ENDPOINT_API` yang bisa di-fetch.

### 2. Hubungkan React di Vercel ke Endpoint URL
Di dalam aplikasi React/Vercel (misal di `src/App.tsx`), modifikasi kode fetch/submit form untuk mengambil/mengirim data dari **URL Web App** tadi. 

Ganti block simulasi di `App.tsx` menjadi:

**Untuk Fetching (Get):**
```ts
const ENDPOINT_API = "https://script.google.com/macros/s/AKfycb.../exec";

useEffect(() => {
  setIsLoading(true);
  fetch(ENDPOINT_API)
    .then(res => res.json())
    .then(data => {
      setData(data);
      setIsLoading(false);
    });
}, []);
```

**Untuk Submitting (Post):**
```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    await fetch(ENDPOINT_API, {
      method: "POST",
      body: JSON.stringify(formData),
    });
    // Jika sukses otomatis re-fetch atau set state visual
    setIsModalOpen(false);
    // ... reset form
  } catch(e) {
    console.error("Gagal simpan", e);
  }
  setIsSubmitting(false);
};
```

### 3. Deploy Frontend (React) ke Vercel
1. Upload folder project ini (khusus node + React) ke repository **GitHub** Anda.
2. Login ke **[Vercel](https://vercel.com)** dengan akun GitHub.
3. Klik **Add New Project**, pilih repository yang sudah diupload.
4. Di bagian **Environment Variables** (sebelum mengeklik Deploy), tambahkan sebuah *Key* dan *Value* baru:
   - **Key:** `VITE_GAS_ENDPOINT_URL`
   - **Value:** `[Salin/Tempel URL Web App dari GAS Anda]`
   *(Environment variabel ini sangat penting agar Vercel mendeteksi URL Endpoint data GAS Anda).*
5. Framework Preset akan terdeteksi otomatis sebagai **Vite** (jika pakai Vite React).
6. Klik **Deploy** dan tunggu proses build selesai.
7. Anda akan mendapatkan URL Vercel yang fresh dan sudah fully-integrated dengan backend Google Sheets Anda via API.

---

### Tips Menghindari Error Integrasi di Vercel:
Jika Anda melihat data tetap kosong walaupun di deploy ke Vercel:
- Pergi ke Project **Settings > Environment Variables** di Vercel.
- Cek dan pastikan _Key_ `VITE_GAS_ENDPOINT_URL` dipaste dan disimpan dengan baik disitu.
- Jika baru ditambahkan, Anda perlu **Redeploy** (Deployments > ⋮ > Redeploy) pada Vercel agar perubahan `env` dikenali.

Dengan mengikuti petunjuk di atas, sistem Frontend (React - Vercel) dan Backend (Google Sheets - GAS) Anda dijamin akan berjalan mulus dan sinkron.
