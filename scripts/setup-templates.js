/**
 * TEMPLATE SETUP SCRIPT
 * 
 * Script ini akan:
 * 1. Membaca template .docx asli dari public/templates/
 * 2. Parse XML di dalamnya
 * 3. Tambahkan placeholder untuk docxtemplater
 * 4. Save template yang sudah dimodifikasi
 * 
 * Jalankan: node scripts/setup-templates.js
 */

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

// Path ke template files
const TEMPLATES_DIR = path.join(__dirname, '../public/templates');

const TEMPLATES = {
  kkn: {
    source: 'template-kkn.docx',
    output: 'template-kkn-ready.docx',
    placeholders: {
      // Header placeholders
      'Nama\t\t\t: ': 'Nama\t\t\t: {nama}',
      'NIM\t\t\t: ': 'NIM\t\t\t: {nim}',
      'Laporan\t\t: KKN': 'Laporan\t\t: {laporan}',
      'Pekan ke-\t\t: ': 'Pekan ke-\t\t: {pekanKe}',
    }
  },
  plp: {
    source: 'template-plp.docx',
    output: 'template-plp-ready.docx',
    placeholders: {
      'Nama\t\t\t: ': 'Nama\t\t\t: {nama}',
      'NIM\t\t\t: ': 'NIM\t\t\t: {nim}',
      'Laporan\t\t: PLP': 'Laporan\t\t: {laporan}',
      'Pekan ke-\t\t: ': 'Pekan ke-\t\t: {pekanKe}',
    }
  },
  am: {
    source: 'template-am.docx',
    output: 'template-am-ready.docx',
    placeholders: {
      'Nama\t\t\t: ': 'Nama\t\t\t: {nama}',
      'NIM\t\t\t: ': 'NIM\t\t\t: {nim}',
      'Laporan\t\t: Asistensi Mengajar': 'Laporan\t\t: {laporan}',
      'Pekan ke-\t\t: ': 'Pekan ke-\t\t: {pekanKe}',
    }
  }
};

/**
 * Replace text dalam XML document
 */
function replaceInXML(xml, replacements) {
  let modifiedXml = xml;
  
  for (const [oldText, newText] of Object.entries(replacements)) {
    // Encode untuk XML
    const encodedOld = oldText
      .replace(/\t/g, '</w:t><w:tab/><w:t xml:space="preserve">')
      .replace(/\n/g, '</w:t><w:br/><w:t xml:space="preserve">');
    
    const encodedNew = newText
      .replace(/\t/g, '</w:t><w:tab/><w:t xml:space="preserve">')
      .replace(/\n/g, '</w:t><w:br/><w:t xml:space="preserve">');
    
    modifiedXml = modifiedXml.replace(new RegExp(encodedOld, 'g'), encodedNew);
    
    // Try simple replacement too
    modifiedXml = modifiedXml.replace(new RegExp(oldText, 'g'), newText);
  }
  
  return modifiedXml;
}

/**
 * Process single template
 */
function processTemplate(templateConfig) {
  console.log(`\n📄 Processing ${templateConfig.source}...`);
  
  const sourcePath = path.join(TEMPLATES_DIR, templateConfig.source);
  const outputPath = path.join(TEMPLATES_DIR, templateConfig.output);
  
  try {
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Source file not found: ${sourcePath}`);
      return false;
    }
    
    // Read template
    const content = fs.readFileSync(sourcePath, 'binary');
    const zip = new PizZip(content);
    
    // Get document.xml (main content)
    const documentXml = zip.file('word/document.xml').asText();
    
    console.log('   ✓ Template loaded');
    
    // Replace placeholders
    const modifiedXml = replaceInXML(documentXml, templateConfig.placeholders);
    
    console.log('   ✓ Placeholders added');
    
    // Update zip with modified XML
    zip.file('word/document.xml', modifiedXml);
    
    // Generate new docx
    const newContent = zip.generate({
      type: 'nodebuffer',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    // Save
    fs.writeFileSync(outputPath, newContent);
    
    console.log(`   ✓ Saved to ${templateConfig.output}`);
    console.log(`   ✅ SUCCESS!`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error processing template:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   LOGBOOK TEMPLATE SETUP UTILITY          ║');
  console.log('║   Menambahkan placeholder ke template     ║');
  console.log('╚════════════════════════════════════════════╝');
  
  // Check if templates directory exists
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`\n❌ Templates directory not found: ${TEMPLATES_DIR}`);
    console.log('\nSilakan pastikan folder public/templates/ ada dan berisi:');
    console.log('  - template-kkn.docx');
    console.log('  - template-plp.docx');
    console.log('  - template-am.docx');
    process.exit(1);
  }
  
  let successCount = 0;
  let totalCount = 0;
  
  // Process each template
  for (const [key, config] of Object.entries(TEMPLATES)) {
    totalCount++;
    if (processTemplate(config)) {
      successCount++;
    }
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log(`║   SUMMARY: ${successCount}/${totalCount} templates processed    ║`);
  console.log('╚════════════════════════════════════════════╝');
  
  if (successCount === totalCount) {
    console.log('\n✅ All templates ready! Template dengan suffix "-ready.docx" siap digunakan.');
    console.log('\n📝 Next steps:');
    console.log('   1. Cek file *-ready.docx di public/templates/');
    console.log('   2. Buka di Word untuk verifikasi');
    console.log('   3. Update export function untuk gunakan template ini');
  } else {
    console.log('\n⚠️  Some templates failed. Check errors above.');
  }
}

// Run
if (require.main === module) {
  main();
}

module.exports = { processTemplate, replaceInXML };
