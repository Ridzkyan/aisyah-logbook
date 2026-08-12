# 💙 LogBook Untuk Aisyah dari Ridho

> Buat Logbook KKN/PLP/AM dalam Hitungan Menit

Website tool untuk memudahkan pembuatan logbook mahasiswa dengan template KKN, PLP, dan Asistensi Mengajar. Data tersimpan otomatis di browser, tidak perlu database, dan bisa export ke Word atau PDF!

## ✨ Fitur

- 📝 **3 Template Logbook**: KKN, PLP (Pengenalan Lapangan Persekolahan), AM (Asistensi Mengajar)
- 💾 **Auto-Save**: Data otomatis tersimpan di browser (LocalStorage)
- 📄 **Export Word & PDF**: Download logbook dalam format Word atau PDF
- 🎨 **Modern UI**: Interface yang cantik dan mudah digunakan
- 📱 **Responsive**: Bisa diakses dari HP, tablet, atau laptop
- ⚡ **Cepat**: No database, semua di browser kamu
- 🔒 **Private**: Data tersimpan lokal, tidak ada server
- ✏️ **Edit Anytime**: Bisa edit logbook yang sudah dibuat
- 📊 **History**: Lihat semua logbook yang pernah dibuat

## 🚀 Teknologi

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Context API
- **Export**: docx, jsPDF, html2canvas
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Instalasi

```bash
# Clone repository
git clone [repository-url]

# Masuk ke folder project
cd logbook-aisyah

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka di browser
# http://localhost:3000
```

## 🎯 Cara Pakai

### 1. Pilih Template
Di halaman utama, pilih salah satu template:
- **KKN**: Untuk kegiatan Kuliah Kerja Nyata
- **PLP**: Untuk Pengenalan Lapangan Persekolahan
- **AM**: Untuk Asistensi Mengajar

### 2. Isi Data Header
Masukkan informasi dasar:
- Nama
- NIM
- Pekan ke-

### 3. Tambah Entries
Klik "Tambah Entry" untuk menambah kegiatan:
- Isi tanggal dan deskripsi kegiatan
- Upload foto atau paste URL gambar (opsional)
- Tambahkan link dokumen (opsional)

### 4. Isi Ringkasan (khusus PLP & AM)
Di bagian bawah, isi:
- Total jam kegiatan
- Analisis kegiatan
- Hambatan & upaya
- Rencana perbaikan

### 5. Auto-Save
Data otomatis tersimpan setiap 2 detik! Lihat indicator "Tersimpan" di kanan atas.

### 6. Export
Klik tombol "Export" untuk download dalam format:
- **Word (.docx)**: Format lengkap dengan tabel
- **PDF (.pdf)**: Siap print

### 7. Riwayat
Lihat semua logbook yang pernah dibuat di halaman "Riwayat". Bisa edit, hapus, atau export lagi kapan saja!

## 📂 Struktur Project

```
logbook-aisyah/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   ├── form/
│   │   └── [templateType]/  # Dynamic form route
│   └── history/             # History page
├── components/              # React components
│   ├── ui/                  # UI components (shadcn)
│   ├── entries/             # Entry card components
│   ├── HeaderForm.tsx
│   ├── EntryList.tsx
│   ├── FooterForm.tsx
│   └── FormContent.tsx
├── contexts/                # React contexts
│   └── LogbookContext.tsx
├── lib/                     # Utilities
│   ├── storage.ts           # LocalStorage service
│   ├── image.ts             # Image compression
│   ├── utils.ts             # Helper functions
│   └── uuid.ts              # UUID generator
└── types/                   # TypeScript types
    └── logbook.ts
```

## 🎨 Template Details

### KKN (Kuliah Kerja Nyata)
Fields:
- Hari/Tanggal
- Program Kerja
- Deskripsi Aktivitas
- Foto Dokumentasi
- Link Dokumen

### PLP (Pengenalan Lapangan Persekolahan)
Fields:
- Hari/Tanggal
- Jumlah Jam: Pembelajaran, Administrasi, Adaptasi Teknologi
- Kegiatan: Pembelajaran, Administrasi, Adaptasi Teknologi
- Foto Dokumentasi
- Link Dokumen
- Footer: Total jam, Analisis, Hambatan, Rencana Perbaikan

### AM (Asistensi Mengajar)
Fields:
- Hari/Tanggal
- Jumlah Jam: Menyusun Perangkat, Melaksanakan Pembelajaran, Asesmen, Refleksi, Pengambilan Data
- Deskripsi Aktivitas
- Foto Dokumentasi
- Link Dokumen
- Footer: Total jam, Analisis, Hambatan, Rencana Perbaikan

## 🔧 Build & Deploy

### Build untuk Production
```bash
npm run build
```

### Deploy ke Vercel
1. Push code ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Deploy otomatis!

Atau gunakan Vercel CLI:
```bash
npm i -g vercel
vercel
```

## 💡 Tips

- **Auto-save aktif**: Tidak perlu klik simpan manual, data otomatis tersimpan
- **Maksimal foto**: Upload foto max 2MB, akan otomatis dikompress
- **Backup data**: Export logbook secara berkala sebagai backup
- **Browser support**: Gunakan Chrome, Firefox, Safari, atau Edge versi terbaru
- **Clear cache**: Hati-hati saat clear browser cache, data logbook ikut terhapus

## 🐛 Troubleshooting

### Data hilang?
- Pastikan tidak clear browser cache
- Cek di browser yang sama saat membuat logbook
- Data tersimpan per browser (Chrome ≠ Firefox)

### Export tidak berfungsi?
- Pastikan browser mendukung download file
- Coba browser lain
- Cek pop-up blocker

### Foto tidak muncul?
- Pastikan URL gambar valid dan accessible
- Coba upload ulang atau gunakan URL dari hosting gambar lain

## 📝 TODO / Roadmap

- [ ] Fitur export Word & PDF (implementasi)
- [ ] Preview logbook sebelum export
- [ ] Upload gambar langsung (base64)
- [ ] Duplicate logbook
- [ ] Filter & search logbook
- [ ] Dark mode 🌙
- [ ] Import from Word/Excel
- [ ] Cloud sync (Google Drive)
- [ ] PWA (offline support)
- [ ] Multi-language

## 👨‍💻 Development

Dibuat dengan ❤️ menggunakan:
- ☕ Kopi
- 🎵 Spotify
- 💙 Cinta untuk Aisyah

## 📄 License

MIT License - Feel free to use this project!

---

**Made with 💙 by Ridho for Aisyah**

*Semoga memudahkan kamu dalam membuat logbook, sayang! 💕*
