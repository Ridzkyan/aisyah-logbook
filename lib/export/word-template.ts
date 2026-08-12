/**
 * WORD EXPORT USING DOCXTEMPLATER + ORIGINAL TEMPLATE FILES
 *
 * Strategy: Load the original faculty .docx template from /public/templates/,
 * inject user data via docxtemplater placeholders, then download.
 * This guarantees 100% formatting match with the original template.
 */

import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import ImageModule from 'docxtemplater-image-module-free';
import { saveAs } from 'file-saver';
import { Logbook, KKNEntry, PLPEntry, AMEntry, ImageInput } from '@/types/logbook';

// Template URLs (served from /public/templates/)
const TEMPLATE_URLS: Record<string, string> = {
  KKN: '/templates/template-kkn.docx',
  PLP: '/templates/template-plp.docx',
  AM: '/templates/template-am.docx',
};

/**
 * Fetch a template file from the public directory and return as ArrayBuffer
 */
async function fetchTemplate(templateType: string): Promise<ArrayBuffer> {
  const url = TEMPLATE_URLS[templateType];
  if (!url) throw new Error(`No template found for type: ${templateType}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}

/**
 * Convert base64 data URL to ArrayBuffer for docxtemplater-image-module
 */
function base64DataURLToArrayBuffer(dataURL: string) {
  const base64Regex = /^data:image\/(png|jpg|jpeg|svg|svg\+xml|gif);base64,/;
  if (!base64Regex.test(dataURL)) {
    return null;
  }
  const stringBase64 = dataURL.replace(base64Regex, '');
  const binaryString = window.atob(stringBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getWordImageValue(foto: ImageInput | null | undefined): string {
  if (!foto) return '';
  if (foto.type === 'upload') return foto.preview;
  if (foto.type === 'url') return foto.url;
  return '';
}

/**
 * Prepare data for KKN template
 */
function prepareKKNData(logbook: Logbook) {
  const entries = (logbook.entries as KKNEntry[]).map((entry) => ({
    no: entry.no,
    hariTanggal: entry.hariTanggal || '',
    programKerja: entry.programKerja || '',
    deskripsi: entry.deskripsi || '',
    foto: getWordImageValue(entry.foto),
    linkDokumen: entry.linkDokumen || '',
  }));

  return {
    nama: logbook.header.nama || '',
    nim: logbook.header.nim || '',
    pekanKe: logbook.header.pekanKe || '',
    entries,
  };
}

/**
 * Prepare data for PLP template
 */
function preparePLPData(logbook: Logbook) {
  const entries = (logbook.entries as PLPEntry[]).map((entry) => ({
    no: entry.no,
    hariTanggal: entry.hariTanggal || '',
    jamPembelajaran: entry.jamPembelajaran || '',
    jamAdministrasi: entry.jamAdministrasi || '',
    jamAdaptasiTeknologi: entry.jamAdaptasiTeknologi || '',
    kegiatanPembelajaran: entry.kegiatanPembelajaran || '',
    kegiatanAdministrasi: entry.kegiatanAdministrasi || '',
    kegiatanAdaptasiTeknologi: entry.kegiatanAdaptasiTeknologi || '',
    foto: getWordImageValue(entry.foto),
    linkDokumen: entry.linkDokumen || '',
  }));

  return {
    nama: logbook.header.nama || '',
    nim: logbook.header.nim || '',
    pekanKe: logbook.header.pekanKe || '',
    entries,
    analisisKegiatan: logbook.footer?.analisisKegiatan || '',
    hambatanUpaya: logbook.footer?.hambatanUpaya || '',
    rencanaPerbaikan: logbook.footer?.rencanaPerbaikan || '',
    jumlahJamPembelajaran: logbook.footer?.jumlahJamPembelajaran || '',
    jumlahJamAdministrasi: logbook.footer?.jumlahJamAdministrasi || '',
    jumlahJamAdaptasiTeknologi: logbook.footer?.jumlahJamAdaptasiTeknologi || '',
  };
}

/**
 * Prepare data for AM template
 */
function prepareAMData(logbook: Logbook) {
  const entries = (logbook.entries as AMEntry[]).map((entry) => ({
    no: entry.no,
    hariTanggal: entry.hariTanggal || '',
    jamMenyusunPerangkat: entry.jamMenyusunPerangkat || '',
    jamMelaksanakanPembelajaran: entry.jamMelaksanakanPembelajaran || '',
    jamAsesmen: entry.jamAsesmen || '',
    jamRefleksi: entry.jamRefleksi || '',
    jamPengambilanData: entry.jamPengambilanData || '',
    deskripsiAktivitas: entry.deskripsiAktivitas || '',
    foto: getWordImageValue(entry.foto),
    linkDokumen: entry.linkDokumen || '',
  }));

  return {
    nama: logbook.header.nama || '',
    nim: logbook.header.nim || '',
    pekanKe: logbook.header.pekanKe || '',
    entries,
    analisisKegiatan: logbook.footer?.analisisKegiatan || '',
    hambatanUpaya: logbook.footer?.hambatanUpaya || '',
    rencanaPerbaikan: logbook.footer?.rencanaPerbaikan || '',
    jumlahJamMenyusunPerangkat: logbook.footer?.jumlahJamMenyusunPerangkat || '',
    jumlahJamMelaksanakanPembelajaran: logbook.footer?.jumlahJamMelaksanakanPembelajaran || '',
    jumlahJamAsesmen: logbook.footer?.jumlahJamAsesmen || '',
    jumlahJamRefleksi: logbook.footer?.jumlahJamRefleksi || '',
    jumlahJamPengambilanData: logbook.footer?.jumlahJamPengambilanData || '',
  };
}

/**
 * MAIN EXPORT FUNCTION
 * Uses original faculty template + docxtemplater injection
 */
export async function exportToWordTemplate(logbook: Logbook, filename: string): Promise<boolean> {
  try {
    // 1. Fetch the template file
    const templateBuffer = await fetchTemplate(logbook.templateType);
    
    // 2. Load into PizZip
    const zip = new PizZip(templateBuffer);
    
    // 3. Setup Image Module
    const imageDimensionsCache: Record<string, { w: number; h: number }> = {};

    const imageOptions = {
      centered: false,
      getImage: function (tagValue: string) {
        return new Promise((resolve, reject) => {
          if (!tagValue) return resolve('');
          
          const resolveBuffer = () => {
            if (tagValue.startsWith('data:image')) {
              const buffer = base64DataURLToArrayBuffer(tagValue);
              if (buffer) return resolve(buffer);
              return resolve(tagValue); // fallback
            }
            // If it's a URL, try to fetch it
            fetch(tagValue)
              .then((res) => res.arrayBuffer())
              .then((buffer) => resolve(buffer))
              .catch(() => resolve(tagValue)); // fallback
          };

          const img = new Image();
          img.onload = () => {
            imageDimensionsCache[tagValue] = { w: img.width, h: img.height };
            resolveBuffer();
          };
          img.onerror = () => {
            resolveBuffer();
          };
          img.src = tagValue;
        });
      },
      getSize: function (img: any, tagValue: string) {
        const dim = imageDimensionsCache[tagValue];
        if (dim) {
          // Ukuran maksimum area (sekitar 4cm)
          const maxW = 150;
          const maxH = 150;
          
          // Menghitung rasio agar gambar tidak gepeng (menjaga aspek rasio)
          const ratio = Math.min(maxW / dim.w, maxH / dim.h);
          return [dim.w * ratio, dim.h * ratio];
        }
        return [150, 150]; // Fallback
      },
    };
    const imageModule = new ImageModule(imageOptions);

    // 4. Initialize Docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    // 5. Prepare data based on template type
    let data: Record<string, unknown>;
    switch (logbook.templateType) {
      case 'KKN':
        data = prepareKKNData(logbook);
        break;
      case 'PLP':
        data = preparePLPData(logbook);
        break;
      case 'AM':
        data = prepareAMData(logbook);
        break;
      default:
        throw new Error('Unknown template type');
    }

    // 5. Render (inject data)
    await doc.renderAsync(data);

    // 6. Generate output blob
    const outputBlob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // 7. Download
    saveAs(outputBlob, `${filename}.docx`);
    return true;

  } catch (error) {
    console.error('Export to Word (template) failed:', error);
    
    // Provide helpful error message
    if (error instanceof Error) {
      if (error.message.includes('Failed to load template')) {
        throw new Error('Template file tidak ditemukan. Pastikan file template ada di folder public/templates/');
      }
      throw new Error('Gagal export ke Word: ' + error.message);
    }
    throw new Error('Gagal export ke Word');
  }
}
