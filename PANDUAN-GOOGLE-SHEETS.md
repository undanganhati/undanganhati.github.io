# Menghubungkan RSVP dan Ucapan ke Google Sheets

Ikuti langkah ini sekali saja. Hasilnya: konfirmasi kehadiran dan ucapan dari semua HP tersimpan pada satu Google Sheet dan tampil untuk semua pengunjung.

## 1. Buat Google Sheet

1. Buka [Google Sheets](https://sheets.new) dan beri nama, misalnya `Ucapan Pernikahan Aulia & Amelia`.
2. Pilih menu **Extensions → Apps Script**.

## 2. Pasang kode backend

1. Hapus kode contoh yang ada pada editor Apps Script.
2. Buka file `google-apps-script/Code.gs` dari folder proyek ini, salin seluruh isinya, lalu tempel ke editor Apps Script.
3. Klik ikon **Save**.

## 3. Terbitkan sebagai Web App

1. Klik **Deploy → New deployment**.
2. Pada *Select type*, pilih **Web app**.
3. Pilih **Execute as: Me**.
4. Pada akses, pilih **Anyone** / **Anyone with the link**. Pengunjung tidak perlu login agar bisa mengirim ucapan.
5. Klik **Deploy**, lakukan otorisasi Google bila diminta, lalu salin URL yang berakhir dengan `/exec`.

> Jangan gunakan URL yang berakhir dengan `/dev`, karena itu hanya dapat diakses oleh pemilik skrip.

## 4. Hubungkan URL ke website

1. Buka `script.js` di proyek Anda.
2. Temukan baris berikut di bagian atas:

```js
const GUESTBOOK_ENDPOINT = '';
```

3. Tempel URL `/exec` di antara tanda kutip, misalnya:

```js
const GUESTBOOK_ENDPOINT = 'https://script.google.com/macros/s/CONTOH_ID/exec';
```

4. Unggah `script.js` yang sudah diubah ke GitHub dan lakukan *Commit changes*.

## Hasil dan catatan

- Semua data tersimpan pada tab **Ucapan** di Sheet.
- Website memuat maksimal 100 ucapan terbaru.
- Website ini bersifat publik; URL Web App terlihat di file JavaScript. Kode sudah memvalidasi isi dasar, tetapi jangan gunakan data sensitif di formulir.
