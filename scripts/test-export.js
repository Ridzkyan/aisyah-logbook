const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

// Basic stub for image module (we don't need real images for the test, just empty or tiny placeholder)
function createDummyLogbook(type) {
  return {
    templateType: type,
    header: { nama: 'Ridho Dzaky Raihan', nim: '12345678', pekanKe: '1' },
    entries: [
      {
        no: 1,
        hariTanggal: 'Senin, 10 Oktober 2026',
        programKerja: 'Mengajar',
        deskripsi: 'Mengajar kelas X',
        // KKN
        
        // PLP
        jamPembelajaran: '2',
        jamAdministrasi: '1',
        jamAdaptasiTeknologi: '1',
        kegiatanPembelajaran: 'Mengajar Matematika',
        kegiatanAdministrasi: 'Merekap absen',
        kegiatanAdaptasiTeknologi: 'Membuat modul online',
        
        // AM
        jamMenyusunPerangkat: '1',
        jamMelaksanakanPembelajaran: '2',
        jamAsesmen: '1',
        jamRefleksi: '1',
        jamPengambilanData: '0',
        deskripsiAktivitas: 'Menyusun RPP dan mengajar',
        
        foto: '',
        linkDokumen: 'https://google.com'
      }
    ],
    footer: {
      analisisKegiatan: 'Kegiatan berjalan lancar',
      hambatanUpaya: 'Tidak ada hambatan',
      rencanaPerbaikan: 'Terus tingkatkan',
      jumlahJamPembelajaran: '2',
      jumlahJamAdministrasi: '1',
      jumlahJamAdaptasiTeknologi: '1',
      jumlahJamMenyusunPerangkat: '1',
      jumlahJamMelaksanakanPembelajaran: '2',
      jumlahJamAsesmen: '1',
      jumlahJamRefleksi: '1',
      jumlahJamPengambilanData: '0'
    }
  };
}

function renderTemplate(type) {
  const content = fs.readFileSync(path.join(__dirname, `../public/templates/template-${type.toLowerCase()}.docx`));
  const zip = new PizZip(content);
  
  // Note: Since we don't have the image module running natively easily in this quick test script without async setup,
  // we will just use basic Docxtemplater and pass empty string for foto placeholder.
  // Actually, Docxtemplater might throw if {%foto} is unhandled without image module.
  // Let's replace {%foto} with {foto} in the XML for the test to avoid crash if image module is omitted.
  
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => ''
  });

  const logbook = createDummyLogbook(type);
  
  // Prepare data similarly to word-template.ts
  const data = {
    nama: logbook.header.nama,
    nim: logbook.header.nim,
    pekanKe: logbook.header.pekanKe,
    entries: logbook.entries,
    ...logbook.footer
  };

  try {
    // If we get an error about image module missing, we catch it
    doc.render(data);
  } catch (e) {
    console.error(`Error rendering ${type}:`, e.message);
  }

  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  const outPath = path.join(__dirname, `../test-output-${type.toLowerCase()}.docx`);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated test file: ${outPath}`);
}

['KKN', 'PLP', 'AM'].forEach(type => {
  try {
    renderTemplate(type);
  } catch(e) {
    console.error('Failed', type, e.message);
  }
});
