const PizZip = require("pizzip");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("public/templates")) {
  fs.mkdirSync("public/templates", { recursive: true });
}

function getAllRows(tblXml) {
  const rows = [];
  let idx = 0;
  while (true) {
    let start1 = tblXml.indexOf("<w:tr>", idx);
    let start2 = tblXml.indexOf("<w:tr ", idx);
    let start = -1;
    if (start1 === -1) start = start2;
    else if (start2 === -1) start = start1;
    else start = Math.min(start1, start2);
    if (start === -1) break;
    let depth = 0;
    let end = start;
    while (end < tblXml.length) {
      if (tblXml.startsWith("<w:tr>", end) || tblXml.startsWith("<w:tr ", end)) depth++;
      if (tblXml.startsWith("</w:tr>", end)) {
        depth--;
        if (depth === 0) {
          end += "</w:tr>".length;
          break;
        }
      }
      end++;
    }
    rows.push({ start, end, xml: tblXml.substring(start, end) });
    idx = end;
  }
  return rows;
}

function injectNamaNimPekan(xml) {
  xml = xml.replace(/>Nama<\/w:t>(<w:tab\/>)+<w:t[^>]*>: <\/w:t>/,
    ">Nama</w:t><w:tab/><w:tab/><w:tab/><w:t xml:space=\"preserve\">: {nama}</w:t>");
  xml = xml.replace(/>NIM<\/w:t>(<w:tab\/>)+<w:t[^>]*>: <\/w:t>/,
    ">NIM</w:t><w:tab/><w:tab/><w:tab/><w:t xml:space=\"preserve\">: {nim}</w:t>");
  xml = xml.replace(/>Pekan ke-<\/w:t>(<w:tab\/>)+<w:t[^>]*>: <\/w:t>/,
    ">Pekan ke-</w:t><w:tab/><w:tab/><w:t xml:space=\"preserve\">: {pekanKe}</w:t>");
  return xml;
}

const TC_PR = `<w:tcPr><w:tcMar><w:top w:w="150" w:type="dxa"/><w:left w:w="300" w:type="dxa"/><w:bottom w:w="150" w:type="dxa"/><w:right w:w="300" w:type="dxa"/></w:tcMar></w:tcPr>`;

function createKKN() {
  const input = path.join("..", "Logbook Individu KKN-Template Standar Logbook KKN (fleksibel, boleh berbeda menyesuaikan pembimbing).docx");
  const content = fs.readFileSync(input);
  const zip = new PizZip(content);
  let xml = zip.files["word/document.xml"].asText();
  xml = injectNamaNimPekan(xml);

  const tblStart = xml.indexOf("<w:tbl>");
  const tblEnd = xml.indexOf("</w:tbl>") + "</w:tbl>".length;
  const tblXml = xml.substring(tblStart, tblEnd);

  const rows = getAllRows(tblXml);
  const headerRowXml = rows[0].xml;

  const dataRow = `<w:tr>
<w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="1800" w:hRule="atLeast"/></w:trPr>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{#entries}{no}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{hariTanggal}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">{programKerja}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">{deskripsi}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">{%foto}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t>{linkDokumen}{/entries}</w:t></w:r></w:p></w:tc>
</w:tr>`;

  const tblProps = tblXml.substring(0, rows[0].start);
  const newTbl = tblProps + headerRowXml + dataRow + "</w:tbl>";
  
  xml = xml.substring(0, tblStart) + newTbl + xml.substring(tblEnd);
  zip.file("word/document.xml", xml);
  fs.writeFileSync("public/templates/template-kkn.docx", zip.generate({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("KKN template created");
}

function injectFooterPlaceholders(footerRows, placeholders) {
  const MARGIN_XML = `<w:tcMar><w:top w:w="150" w:type="dxa"/><w:left w:w="300" w:type="dxa"/><w:bottom w:w="150" w:type="dxa"/><w:right w:w="300" w:type="dxa"/></w:tcMar>`;
  for (let i = 0; i < footerRows.length; i++) {
    if (!footerRows[i]) continue;
    let xml = footerRows[i].replace(/<w:tcPr\/>/g, `<w:tcPr>${MARGIN_XML}</w:tcPr>`);
    xml = xml.replace(/<w:tcPr>([\s\S]*?)<\/w:tcPr>/g, (match, content) => {
      if (content.includes('<w:tcMar>')) return match;
      return `<w:tcPr>${MARGIN_XML}${content}</w:tcPr>`;
    });
    footerRows[i] = xml;
  }

  if (placeholders.jam && footerRows[0]) {
    let jamXml = footerRows[0];
    let jamIdx = 0;
    jamXml = jamXml.replace(/<w:tc>([\s\S]*?)<\/w:tc>/g, (match, content) => {
      if (content.includes('Jumlah Jam')) return match;
      if (jamIdx < placeholders.jam.length && match.includes('<w:p')) {
        const ph = placeholders.jam[jamIdx++];
        return match.replace(/(<w:p[^>]*>[\s\S]*?)<\/w:p>/, `$1<w:r><w:t xml:space="preserve">${ph}</w:t></w:r></w:p>`);
      }
      return match;
    });
    footerRows[0] = jamXml;
  }

  const injectRow = (rowXml, ph) => {
    if (!rowXml) return '';
    let replaced = false;
    return rowXml.replace(/<w:tc>([\s\S]*?)<\/w:tc>/g, (match, content) => {
      if (!replaced && !content.includes('Kegiatan') && !content.includes('Upaya') && !content.includes('Perbaikan')) {
        replaced = true;
        return match.replace(/(<w:p[^>]*>[\s\S]*?)<\/w:p>/, `$1<w:r><w:t xml:space="preserve">${ph}</w:t></w:r></w:p>`);
      }
      return match;
    });
  };

  if (footerRows[1]) footerRows[1] = injectRow(footerRows[1], '{analisisKegiatan}');
  if (footerRows[2]) footerRows[2] = injectRow(footerRows[2], '{hambatanUpaya}');
  if (footerRows[3]) footerRows[3] = injectRow(footerRows[3], '{rencanaPerbaikan}');

  return footerRows.join("");
}

function createPLP() {
  const input = path.join("..", "Logbook Individu PLP-Template Standar Logbook PLP (fleksibel, boleh berbeda menyesuaikan pembimbing).docx");
  const content = fs.readFileSync(input);
  const zip = new PizZip(content);
  let xml = zip.files["word/document.xml"].asText();
  xml = injectNamaNimPekan(xml);

  const tblStart = xml.indexOf("<w:tbl>");
  const tblEnd = xml.indexOf("</w:tbl>") + "</w:tbl>".length;
  const tblXml = xml.substring(tblStart, tblEnd);

  const rows = getAllRows(tblXml);
  const headerRows = rows[0].xml + rows[1].xml;

  const footerRows = rows.slice(rows.length - 4).map(r => r.xml);
  const footerXml = injectFooterPlaceholders(footerRows, {
    jam: ['{jumlahJamPembelajaran}', '{jumlahJamAdministrasi}', '{jumlahJamAdaptasiTeknologi}']
  });

  const dataRow = `<w:tr>
<w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="1800" w:hRule="atLeast"/></w:trPr>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{#entries}{no}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{hariTanggal}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamPembelajaran}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamAdministrasi}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamAdaptasiTeknologi}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">Kegiatan Membantu Pembelajaran:</w:t></w:r></w:p><w:p><w:pPr/><w:r><w:t xml:space="preserve">{kegiatanPembelajaran}</w:t></w:r></w:p><w:p><w:pPr/><w:r><w:t xml:space="preserve">Kegiatan Membantu Administrasi:</w:t></w:r></w:p><w:p><w:pPr/><w:r><w:t xml:space="preserve">{kegiatanAdministrasi}</w:t></w:r></w:p><w:p><w:pPr/><w:r><w:t xml:space="preserve">Kegiatan Membantu Adaptasi Teknologi:</w:t></w:r></w:p><w:p><w:pPr/><w:r><w:t xml:space="preserve">{kegiatanAdaptasiTeknologi}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">{%foto}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t>{linkDokumen}{/entries}</w:t></w:r></w:p></w:tc>
</w:tr>`;

  const tblProps = tblXml.substring(0, rows[0].start);
  const newTbl = tblProps + headerRows + dataRow + footerXml + "</w:tbl>";
  
  xml = xml.substring(0, tblStart) + newTbl + xml.substring(tblEnd);
  zip.file("word/document.xml", xml);
  fs.writeFileSync("public/templates/template-plp.docx", zip.generate({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("PLP template created");
}

function createAM() {
  const input = path.join("..", "Logbook Individu AM-Template Standar Logbook Asistensi Mengajar (fleksibel, boleh berbeda menyesuaikan pembimbing).docx");
  const content = fs.readFileSync(input);
  const zip = new PizZip(content);
  let xml = zip.files["word/document.xml"].asText();
  xml = injectNamaNimPekan(xml);

  const tblStart = xml.indexOf("<w:tbl>");
  const tblEnd = xml.indexOf("</w:tbl>") + "</w:tbl>".length;
  const tblXml = xml.substring(tblStart, tblEnd);

  const rows = getAllRows(tblXml);
  const headerRows = rows[0].xml + rows[1].xml;

  const footerRows = rows.slice(rows.length - 4).map(r => r.xml);
  const footerXml = injectFooterPlaceholders(footerRows, {
    jam: [
      '{jumlahJamMenyusunPerangkat}',
      '{jumlahJamMelaksanakanPembelajaran}',
      '{jumlahJamAsesmen}',
      '{jumlahJamRefleksi}',
      '{jumlahJamPengambilanData}'
    ]
  });

  const dataRow = `<w:tr>
<w:trPr><w:cantSplit w:val="0"/><w:trHeight w:val="1800" w:hRule="atLeast"/></w:trPr>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t>{#entries}{no}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{hariTanggal}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamMenyusunPerangkat}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamMelaksanakanPembelajaran}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamAsesmen}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamRefleksi}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t xml:space="preserve">{jamPengambilanData}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">{deskripsiAktivitas}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t xml:space="preserve">{%foto}</w:t></w:r></w:p></w:tc>
<w:tc>${TC_PR}<w:p><w:pPr/><w:r><w:t>{linkDokumen}{/entries}</w:t></w:r></w:p></w:tc>
</w:tr>`;

  const tblProps = tblXml.substring(0, rows[0].start);
  const newTbl = tblProps + headerRows + dataRow + footerXml + "</w:tbl>";
  
  xml = xml.substring(0, tblStart) + newTbl + xml.substring(tblEnd);
  zip.file("word/document.xml", xml);
  fs.writeFileSync("public/templates/template-am.docx", zip.generate({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("AM template created");
}

try { createKKN(); } catch(e) { console.error("KKN error:", e); }
try { createPLP(); } catch(e) { console.error("PLP error:", e); }
try { createAM(); } catch(e) { console.error("AM error:", e); }
console.log("All templates created!");
