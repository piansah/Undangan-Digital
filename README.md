# Template Undangan Digital (Next.js + TypeScript)

## Menjalankan di komputer

1. Pasang Node.js versi 20.9 atau lebih baru.
2. Buka terminal pada folder proyek ini (folder yang berisi `package.json`).
3. Jalankan `npm install` satu kali untuk memasang dependensi.
4. Jalankan `npm run dev`, lalu buka alamat yang ditampilkan (biasanya http://localhost:3000).

## Data yang perlu diganti

- `app/page.tsx`: nama pasangan dan orang tua, tanggal, waktu, alamat, tautan peta, teks, serta tanggal hitung mundur di `weddingDate`.
- `app/globals.css`: warna, tipografi, tata letak, dan foto contoh.
- Personalisasi penerima melalui query string, misalnya `http://localhost:3000/?untuk=Andi%20Pratama`.

Semua nama, keluarga, tanggal, alamat, dan tempat adalah **data contoh**. Periksa dan ganti sebelum dipublikasikan.

## Menghubungkan RSVP ke Google Sheets

1. Buat Google Sheet baru, lalu buka **Extensions → Apps Script**.
2. Salin isi `google-apps-script/Code.gs` ke editor Apps Script dan simpan.
3. Pilih **Deploy → New deployment → Web app**. Atur **Execute as: Me** dan **Who has access: Anyone**, lalu deploy dan izinkan akses Sheets/Drive saat diminta.
4. Pastikan URL Web App berakhiran `/exec` dan sesuai dengan `APPS_SCRIPT_URL` di `app/api/rsvp/route.ts`.
5. Deploy ulang di Vercel setelah perubahan kode agar endpoint proxy baru aktif.

Script akan membuat tab `RSVP` saat kiriman pertama dan menulis waktu, nama, nama penerima undangan, status kehadiran, serta ucapan. Bukti tanda kasih (opsional, maksimal 3 MB) disimpan ke Google Drive pemilik Apps Script; tautan file dicatat di sheet. Jangan bagikan akses spreadsheet/Drive jika bukti harus tetap privat.

Form mengirim RSVP ke route Next.js `/api/rsvp`, yang meneruskan kiriman ke Apps Script dari server. Website hanya menampilkan sukses jika Apps Script membalas bahwa baris sudah tersimpan; jika tidak, pesan galat akan ditampilkan.
