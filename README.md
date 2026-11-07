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

Semua nama, keluarga, tanggal, alamat, dan tempat adalah **data contoh**. Periksa dan ganti sebelum dipublikasikan. Form RSVP belum menyimpan/mengirim jawaban; sambungkan ke backend/database (misalnya Supabase) bila ingin mengumpulkan data.
