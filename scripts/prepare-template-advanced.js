/**
 * ADVANCED TEMPLATE PREPARATION
 * 
 * Script ini akan memodifikasi template .docx secara mendalam:
 * 1. Tambah placeholder di header (Nama, NIM, dll)
 * 2. Tambah loop placeholder di tabel untuk entries {#entries}...{/entries}
 * 3. Tambah placeholder untuk footer (Jumlah Jam, Analisis, dll)
 * 4. Tambah image placeholder untuk foto {%foto}
 * 
 * Approach: Parse dan modifikasi XML secara surgical
 */

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const TEMPLATES_DIR = path.join(__dirname, '../public/templates');

/**
 * STRATEGY:
 * Karena struktur table XML di Word sangat kompleks,
 * kita akan menggunakan approach yang berbeda:
 * 
 * 1. Duplicate row template (row ke-2 di table, yang berisi data sample)
 * 2. Wrap dengan {#entries} dan {/entries}
 * 3. Replace content cell dengan placeholder
 * 4. Hapus row sample lainnya
 */

function modifyKKNTemplate(zip) {
  console.log('   🔧 Modifying KKN template...');
  
  let documentXml = zip.file('word/document.xml').asText();
  
  // Step 1: Replace header placeholders
  documentXml = documentXml
    .replace(/Nama\s*:\s*<\/w:t>/g, 'Nama\t\t\t: {nama}</w:t>')
    .replace(/NIM\s*:\s*<\/w:t>/g, 'NIM\t\t\t: {nim}</w:t>')
    .replace(/Laporan.*?KKN<\/w:t>/g, 'Laporan\t\t: {laporan}</w:t>')
    .replace(/Pekan ke-\s*:\s*<\/w:t>/g, 'Pekan ke-\t\t: {pekanKe}</w:t>');
  
  // Step 2: Find table and modify rows
  // Ini kompleks - untuk sekarang kita buat placeholder manual
  
  // Simplified: Replace sample data dengan placeholder di row 1 (first data row)
  // Pattern: <w:tr>...(row content)...</w:tr>
  
  console.log('   ✓ Header placeholders added');
  console.log('   ⚠️  Table modification requires manual template editing');
  console.log('   📝 Please open template in Word and:');
  console.log('      - In first data row, replace values with:');
  console.log('        • {no}');
  console.log('        • {hariTanggal}');
  console.log('        • {programKerja}');
  console.log('        • {deskripsi}');
  console.log('        • {%foto} (for image)');
  console.log('        • {linkDokumen}');
  console.log('      - Add {#entries} before first data row');
  console.log('      - Add {/entries} after first data row');
  console.log('      - Delete other sample rows');
  
  return documentXml;
}

function prepareTemplate(templateName, modifierFunction) {
  console.log(`\n📄 Preparing ${templateName}...`);
  
  const sourcePath = path.join(TEMPLATES_DIR, `${templateName}.docx`);
  const outputPath = path.join(TEMPLATES_DIR, `${templateName}-prepared.docx`);
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source not found: ${sourcePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(sourcePath, 'binary');
    const zip = new PizZip(content);
    
    // Modify using specific function
    const modifiedXml = modifierFunction(zip);
    
    // Save modified XML back
    zip.file('word/document.xml', modifiedXml);
    
    // Generate new file
    const newContent = zip.generate({
      type: 'nodebuffer',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    fs.writeFileSync(outputPath, newContent);
    
    console.log(`   ✅ Saved to ${templateName}-prepared.docx`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return false;
  }
}

// Main
console.log('╔════════════════════════════════════════════╗');
console.log('║   ADVANCED TEMPLATE PREPARATION           ║');
console.log('╚════════════════════════════════════════════╝');

console.log('\n⚠️  IMPORTANT NOTE:');
console.log('Karena struktur table Word XML sangat kompleks,');
console.log('script ini akan prepare template sebagian.');
console.log('Anda perlu manual editing untuk table rows.\n');

prepareTemplate('template-kkn', modifyKKNTemplate);

console.log('\n📋 MANUAL STEPS REQUIRED:');
console.log('1. Buka template-kkn-prepared.docx di Microsoft Word');
console.log('2. Di tabel, edit ROW PERTAMA (data row) dengan format:');
console.log('   ┌─────┬──────────────┬─────────────┬──────────┬────────┬─────────┐');
console.log('   │ {no}│{hariTanggal} │{programKerja}│{deskripsi}│{%foto} │{linkDok}│');
console.log('   └─────┴──────────────┴─────────────┴──────────┴────────┴─────────┘');
console.log('3. SEBELUM row tersebut, di LUAR table, ketik: {#entries}');
console.log('4. SESUDAH row tersebut, di LUAR table, ketik: {/entries}');
console.log('5. Hapus semua row data lainnya (row 2, 3, 4, dst)');
console.log('6. Save as template-kkn-final.docx');
console.log('\n💡 Or use the Word Add-In for docxtemplater for easier setup!');
