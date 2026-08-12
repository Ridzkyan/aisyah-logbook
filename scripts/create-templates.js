const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("public/templates")) {
  fs.mkdirSync("public/templates", { recursive: true });
}

// ====== HELPER ======
function injectHeader(xml, namePlaceholder, pekanKePlaceholder) {
  // Replace Nama value
  xml = xml.replace(
    /(>Nama<\/w:t>(?:<w:tab\/>)+<w:t[^>]*>: )<\/w:t>/,
    "$1" + namePlaceholder + "</w:t>"
  );
  // Replace NIM value
  xml = xml.replace(
    /(>NIM<\/w:t>(?:<w:tab\/>)+<w:t[^>]*>: )<\/w:t>/,
    "$1{nim}</w:t>"
  );
  // Replace Pekan ke- value
  xml = xml.replace(
    /(>Pekan ke-<\/w:t>(?:<w:tab\/>)+<w:t[^>]*>: )<\/w:t>/,
    "$1" + pekanKePlaceholder + "</w:t>"
  );
  return xml;
}

// ====== KKN ======
function createKKN() {
  const input = path.join("..", "Logbook Individu KKN-Template Standar Logbook KKN (fleksibel, boleh berbeda menyesuaikan pembimbing).docx");
  const content = fs.readFileSync(input);
  const zip = new PizZip(content);
  let xml = zip.files["word/document.xml"].asText();

  xml = injectHeader(xml, "{nama}", "{pekanKe}");

  // Remove all data rows (keep only header row of table)
  // Header row is the first <w:tr>...</w:tr>
  const tblStart = xml.indexOf("<w:tbl>");
  const tblEnd = xml.indexOf("</w:tbl>") + "</w:tbl>".length;
  const tblXml = xml.substring(tblStart, tblEnd);
  const firstRowEnd = tblXml.indexOf("</w:tr>") + "</w:tr>".length;
  const headerRow = tblXml.substring(0, firstRowEnd);
  
  // Create looping data row template
  const loopRow = [
    '<w:tr>',
    '<w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="1800" w:hRule="atLeast"/></w:trPr>',
    '<w:tc><w:tcPr/><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{#entries}{no}</w:t></w:r></w:p></w:tc>',
    '<w:tc><w:tcPr/><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{hariTanggal}</w:t></w:r></w:p></w:tc>',
    '<w:tc><w:tcPr/><w:p><w:pPr/><w:r><w:t xml:space="preserve">{programKerja}</w:t></w:r></w:p></w:tc>',
    '<w:tc><w:tcPr/><w:p><w:pPr/><w:r><w:t xml:space="preserve">{deskripsi}</w:t></w:r></w:p></w:tc>',
    '<w:tc><w:tcPr/><w:p><w:pPr/><w:r><w:t xml:space="preserve">{linkFoto}</w:t></w:r></w:p></w:tc>',
    '<w:tc><w:tcPr/><w:p><w:pPr/><w:r><w:t>{linkDokumen}{/entries}</w:t></w:r></w:p></w:tc>',
    '</w:tr>'
  ].join("");
  
  // Rebuild table
  const tblProps = tblXml.substring(0, firstRowEnd);
  const newTbl = "<w:tbl>" + tblXml.substring("<w:tbl>".length, firstRowEnd) + loopRow + "</w:tbl>";
  
  xml = xml.substring(0, tblStart) + newTbl + xml.substring(tblEnd);
  
  zip.file("word/document.xml", xml);
  const out = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync("public/templates/template-kkn.docx", out);
  console.log("KKN template created");
}

createKKN();
console.log("All done");
