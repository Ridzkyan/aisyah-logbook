# 📄 TEMPLATE SETUP DOCUMENTATION

## Status: OPSI A - TEMPLATE-BASED APPROACH (Partial Complete)

Saya sudah mengimplementasikan **fondasi** untuk Opsi A, tetapi untuk mencapai **100% match dengan template fakultas**, ada beberapa langkah yang perlu diselesaikan.

---

## ✅ Yang Sudah Dikerjakan:

### 1. **Template Files**
- ✅ Template asli sudah dicopy ke `public/templates/`:
  - `template-kkn.docx`
  - `template-plp.docx`
  - `template-am.docx`

### 2. **Libraries Terinstall**
- ✅ `docxtemplater` - Untuk template-based export
- ✅ `pizzip` - Untuk manipulasi .docx (ZIP format)
- ✅ `jszip-utils` - Utilities untuk ZIP
- ✅ `docxtemplater-image-module-free` - Untuk embed gambar

### 3. **Scripts & Utilities**
- ✅ `scripts/setup-templates.js` - Helper untuk modifikasi template (partial)
- ✅ `lib/export/word-final.ts` - Export function dengan image embedding

### 4. **Export Function**
- ✅ `exportToWordFinal()` - Function yang recreate struktur template
- ✅ Image embedding support (base64 & URL)
- ✅ Font matching (Times New Roman 12pt)
- ✅ Margins matching (1" top/bottom/right, 1.25" left)
- ✅ Table borders matching template

---

## ⚠️ Yang Masih Perlu Diselesaikan:

### **ISSUE UTAMA: Table Structure Tidak 100% Match**

Saat ini, export function `word-final.ts` sudah bagus tapi belum **IDENTIK 100%** dengan template karena:

1. **Column Widths** - Belum exact persis dengan template
2. **Cell Padding** - Mungkin sedikit berbeda
3. **Row Heights** - Belum fixed sesuai template
4. **Merged Cells** - Template punya beberapa merged cells yang kompleks
5. **Footer Structure** - PLP dan AM footer belum diimplement lengkap

### **Untuk PLP dan AM:**
- ❌ Table structure belum diimplement lengkap (masih placeholder)
- ❌ Footer table belum ada

---

## 🎯 SOLUSI untuk 100% Match:

### **Opsi A1: Manual Template Setup (RECOMMENDED - Paling Mudah)**

Ini adalah cara **TERMUDAH dan PALING RELIABLE** untuk 100% match:

#### Langkah-langkah:

1. **Buka Template di Word** (`public/templates/template-kkn.docx`)

2. **Tambahkan Placeholder di Header:**
   ```
   Nama     : {nama}
   NIM      : {nim}
   Laporan  : {laporan}
   Pekan ke-: {pekanKe}
   ```

3. **Modifikasi Tabel:**
   - Hapus semua row data kecuali row pertama
   - Di row pertama (data row), ganti isi cell dengan:
     ```
     {no} | {hariTanggal} | {programKerja} | {deskripsi} | {%foto} | {linkDokumen}
     ```
   
4. **Tambahkan Loop Tags:**
   - SEBELUM tabel, tambah paragraf baru: `{#entries}`
   - SESUDAH tabel, tambah paragraf baru: `{/entries}`

5. **Save sebagai:**
   - `template-kkn-final.docx`
   - `template-plp-final.docx`
   - `template-am-final.docx`

6. **Update Code:**
   - Edit `lib/export/word-final.ts`
   - Ganti dengan docxtemplater approach
   - Load template yang sudah siap
   - Render dengan data

#### Contoh Code Update:

```typescript
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export async function exportToWordFinal(logbook: Logbook, filename: string) {
  // Load template
  const response = await fetch(`/templates/template-${logbook.templateType.toLowerCase()}-final.docx`);
  const templateBuffer = await response.arrayBuffer();
  
  // Parse dengan pizzip
  const zip = new PizZip(templateBuffer);
  
  // Setup docxtemplater
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  
  // Prepare data
  const data = {
    nama: logbook.header.nama,
    nim: logbook.header.nim,
    laporan: logbook.header.laporan,
    pekanKe: logbook.header.pekanKe,
    entries: logbook.entries.map(entry => ({
      ...entry,
      // Convert image to buffer if needed
    })),
  };
  
  // Render
  doc.render(data);
  
  // Generate file
  const blob = doc.getZip().generate({ type: 'blob' });
  saveAs(blob, `${filename}.docx`);
}
```

---

### **Opsi A2: Programmatic Table Generation (Current Approach)**

Terus improve `word-final.ts` dengan:
- ✅ Exact column widths dari template
- ✅ Exact row heights
- ✅ Cell padding matching
- ✅ Complete PLP and AM table structures
- ✅ Footer implementation

**Estimasi waktu:** 2-3 jam untuk perfect match

**Tantangan:** Sangat detail dan butuh trial & error banyak

---

## 🚀 REKOMENDASI SAYA:

### **Gunakan Opsi A1 (Manual Template Setup)**

**Alasan:**
1. ✅ **100% Guaranteed Match** - Karena pakai template asli
2. ✅ **Cepat** - Setup 15-30 menit, coding 30 menit
3. ✅ **Reliable** - docxtemplater sudah mature dan tested
4. ✅ **Easy Maintenance** - Jika template berubah, tinggal edit .docx

**Trade-off:**
- ⚠️ Butuh 1x manual setup (edit 3 template files)
- ⚠️ Template harus tersimpan di project

---

## 📝 Action Items Untuk Anda:

### **Jika Pilih Opsi A1 (Recommended):**

1. [ ] Saya buatkan tutorial lengkap step-by-step untuk edit template
2. [ ] Saya buatkan code docxtemplater yang complete
3. [ ] Test dan verify hasil match 100%

### **Jika Pilih Opsi A2 (Continue Current):**

1. [ ] Saya complete semua table structures (KKN, PLP, AM)
2. [ ] Saya implement footer sections
3. [ ] Saya fine-tune margins, paddings, widths
4. [ ] Multiple test & iterate sampai perfect

---

## 🤔 Keputusan Yang Harus Diambil:

**Pilih mana?**

- **A1** - Manual template setup (15 menit setup + 30 menit coding = **DONE**)
- **A2** - Continue improve word-final.ts (2-3 jam development + testing)

**Saran saya: PILIH A1** karena lebih cepat dan 100% guaranteed match! 🎯

Tolong beritahu saya pilihan Anda dan saya akan lanjutkan sesuai pilihan tersebut! 💪
