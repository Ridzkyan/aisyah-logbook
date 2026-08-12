/**
 * AUTOMATIC PLACEHOLDER INSERTION
 * 
 * Script ini akan otomatis menambahkan placeholder ke template .docx
 * tanpa perlu edit manual di Word
 * 
 * Strategy:
 * 1. Load template .docx
 * 2. Parse XML document
 * 3. Find dan replace text dengan placeholder
 * 4. Add loop tags untuk table rows
 * 5. Save sebagai *-final.docx
 */

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const TEMPLATES_DIR = path.join(__dirname, '../public/templates');

/**
 * Replace text in XML, handling Word's complex text runs
 */
function smartReplace(xml, searchText, replaceText) {
  // Word often splits text across multiple <w:t> tags
  // We need to handle this carefully
  
  // Simple replacement first
  let result = xml.replace(new RegExp(searchText, 'g'), replaceText);
  
  // Also try with XML encoding
  const searchEncoded = searchText
    .replace(/\s+/g, '</w:t><w:t xml:space="preserve"> </w:t><w:t xml:space="preserve">');
  
  result = result.replace(new RegExp(searchEncoded, 'g'), replaceText);
  
  return result;
}

/**
 * Add loop tags around table data rows
 */
function addTableLoops(xml, startMarker, endMarker) {
  // Find table structure
  // <w:tbl> ... </w:tbl>
  
  // This is complex - for now just return xml
  // Manual setup will be easier
  return xml;
}

/**
 * Process KKN Template
 */
function processKKNTemplate() {
  console.log('\n📄 Processing KKN Template...');
  
  const sourcePath = path.join(TEMPLATES_DIR, 'template-kkn.docx');
  const outputPath = path.join(TEMPLATES_DIR, 'template-kkn-final.docx');
  
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Source file not found:', sourcePath);
    return false;
  }
  
  try {
    // Load template
    const content = fs.readFileSync(sourcePath, 'binary');
    const zip = new PizZip(content);
    
    // Get document.xml
    let documentXml = zip.file('word/document.xml').asText();
    
    console.log('   ✓ Template loaded');
    
    // Replace header placeholders
    // Nama			: 
    documentXml = smartReplace(documentXml, 'Nama\t\t\t: ', 'Nama\t\t\t: {nama}');
    documentXml = smartReplace(documentXml, 'NIM\t\t\t: ', 'NIM\t\t\t: {nim}');
    documentXml = smartReplace(documentXml, 'Laporan`\t\t: KKN', 'Laporan\t\t: {laporan}');
    documentXml = smartReplace(documentXml, 'Pekan ke-\t\t: ', 'Pekan ke-\t\t: {pekanKe}');
    
    // For table cells - this is tricky
    // We need to find sample data and replace with placeholders
    
    // Save modified XML
    zip.file('word/document.xml', documentXml);
    
    // Generate new file
    const newContent = zip.generate({
      type: 'nodebuffer',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    fs.writeFileSync(outputPath, newContent);
    
    console.log('   ✅ Saved to template-kkn-final.docx');
    console.log('   ⚠️  Table rows still need manual setup!');
    
    return true;
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   AUTOMATIC PLACEHOLDER INSERTION TOOL           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  
  console.log('\n⚠️  IMPORTANT NOTE:');
  console.log('XML manipulation di Word .docx sangat kompleks.');
  console.log('Script ini akan prepare header placeholders,');
  console.log('tetapi table loops masih perlu setup manual.\n');
  
  processKKNTemplate();
  
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   NEXT STEPS - MANUAL SETUP REQUIRED            ║');
  console.log('╚══════════════════════════════════════════════════╝');
  
  console.log('\n📝 Silakan buka template-kkn-final.docx di Word dan:');
  console.log('');
  console.log('1. Di tabel, PILIH ROW PERTAMA (row dengan data sample)');
  console.log('2. Edit setiap cell dengan placeholder:');
  console.log('   • Cell 1 (No): {no}');
  console.log('   • Cell 2 (Hari/Tanggal): {hariTanggal}');
  console.log('   • Cell 3 (Program Kerja): {programKerja}');
  console.log('   • Cell 4 (Deskripsi): {deskripsi}');
  console.log('   • Cell 5 (Foto): {%foto}  <-- PENTING: gunakan {% %}');
  console.log('   • Cell 6 (Link): {linkDokumen}');
  console.log('');
  console.log('3. KLIK DI LUAR TABEL, SEBELUM tabel:');
  console.log('   Ketik: {#entries}');
  console.log('');
  console.log('4. KLIK DI LUAR TABEL, SESUDAH tabel:');
  console.log('   Ketik: {/entries}');
  console.log('');
  console.log('5. HAPUS semua row lain di tabel (row 2, 3, 4, dst)');
  console.log('   Sisakan HANYA:');
  console.log('   - Header row (bold)');
  console.log('   - 1 data row dengan placeholder');
  console.log('');
  console.log('6. SAVE file sebagai template-kkn-final.docx');
  console.log('');
  console.log('7. Ulangi untuk template-plp.docx dan template-am.docx');
  console.log('');
  console.log('\n💡 TIP: Lihat contoh screenshot di TEMPLATE-SETUP.md');
}

// Run
if (require.main === module) {
  main();
}

module.exports = { processKKNTemplate };
