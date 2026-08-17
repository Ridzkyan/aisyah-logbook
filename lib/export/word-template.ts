import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import ImageModule from 'docxtemplater-image-module-free';
import { saveAs } from 'file-saver';
import { Logbook, KKNEntry, PLPEntry, AMEntry, ImageInput } from '@/types/logbook';

const TEMPLATE_URLS: Record<string, string> = {
  KKN: '/templates/template-kkn.docx',
  PLP: '/templates/template-plp.docx',
  AM: '/templates/template-am.docx',
};

async function fetchTemplate(templateType: string): Promise<ArrayBuffer> {
  const url = TEMPLATE_URLS[templateType];
  if (!url) throw new Error(`No template found for type: ${templateType}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
  }
  return response.arrayBuffer();
}

function base64DataURLToArrayBuffer(dataURL: string) {
  const base64Regex = /^data:image\/(png|jpg|jpeg|svg|svg\+xml|gif);base64,/;
  if (!base64Regex.test(dataURL)) return null;
  const stringBase64 = dataURL.replace(base64Regex, '');
  const binaryString = window.atob(stringBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Stitch multiple images vertically on a canvas
async function getWordImageValue(fotos: ImageInput[]): Promise<string> {
  if (!fotos || fotos.length === 0) return '';
  if (fotos.length === 1) {
    return fotos[0].type === 'upload' ? fotos[0].preview : fotos[0].url;
  }

  return new Promise((resolve) => {
    const imgElements: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    fotos.forEach((foto, index) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        imgElements[index] = img;
        loadedCount++;
        if (loadedCount === fotos.length) drawCanvas();
      };
      img.onerror = () => {
        const dummy = new Image();
        imgElements[index] = dummy;
        loadedCount++;
        if (loadedCount === fotos.length) drawCanvas();
      };
      img.src = foto.type === 'upload' ? foto.preview : foto.url;
    });

    function drawCanvas() {
      const validImgs = imgElements.filter(img => img.width > 0);
      if (validImgs.length === 0) {
        resolve('');
        return;
      }
      
      const maxWidth = Math.max(...validImgs.map(i => i.width));
      const gap = 40; // Spacing between images
      const totalHeight = validImgs.reduce((sum, img) => sum + img.height, 0) + (gap * (validImgs.length - 1));
      
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, maxWidth, totalHeight);
      
      let currentY = 0;
      validImgs.forEach(img => {
        const x = (maxWidth - img.width) / 2;
        ctx.drawImage(img, x, currentY);
        currentY += img.height + gap;
      });
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    }
  });
}

async function prepareKKNData(logbook: Logbook) {
  const entries = await Promise.all((logbook.entries as KKNEntry[]).map(async (entry) => ({
    no: entry.no,
    hariTanggal: entry.hariTanggal || '',
    programKerja: entry.programKerja || '',
    deskripsi: entry.deskripsi || '',
    foto: await getWordImageValue(entry.fotos),
    linkDokumen: entry.linkDokumen || '',
  })));

  return {
    nama: logbook.header.nama || '',
    nim: logbook.header.nim || '',
    pekanKe: logbook.header.pekanKe || '',
    entries,
  };
}

async function preparePLPData(logbook: Logbook) {
  const entries = await Promise.all((logbook.entries as PLPEntry[]).map(async (entry) => ({
    no: entry.no,
    hariTanggal: entry.hariTanggal || '',
    jamPembelajaran: entry.jamPembelajaran || '',
    jamAdministrasi: entry.jamAdministrasi || '',
    jamAdaptasiTeknologi: entry.jamAdaptasiTeknologi || '',
    kegiatanPembelajaran: entry.kegiatanPembelajaran || '',
    kegiatanAdministrasi: entry.kegiatanAdministrasi || '',
    kegiatanAdaptasiTeknologi: entry.kegiatanAdaptasiTeknologi || '',
    foto: await getWordImageValue(entry.fotos),
    linkDokumen: entry.linkDokumen || '',
  })));

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

async function prepareAMData(logbook: Logbook) {
  const entries = await Promise.all((logbook.entries as AMEntry[]).map(async (entry) => ({
    no: entry.no,
    hariTanggal: entry.hariTanggal || '',
    jamMenyusunPerangkat: entry.jamMenyusunPerangkat || '',
    jamMelaksanakanPembelajaran: entry.jamMelaksanakanPembelajaran || '',
    jamAsesmen: entry.jamAsesmen || '',
    jamRefleksi: entry.jamRefleksi || '',
    jamPengambilanData: entry.jamPengambilanData || '',
    deskripsiAktivitas: entry.deskripsiAktivitas || '',
    foto: await getWordImageValue(entry.fotos),
    linkDokumen: entry.linkDokumen || '',
  })));

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

export async function exportToWordTemplate(logbook: Logbook, filename: string): Promise<boolean> {
  try {
    const templateBuffer = await fetchTemplate(logbook.templateType);
    const zip = new PizZip(templateBuffer);
    const imageDimensionsCache: Record<string, { w: number; h: number }> = {};

    const imageOptions = {
      centered: false,
      getImage: function (tagValue: string) {
        return new Promise((resolve) => {
          if (!tagValue) return resolve('');
          
          const resolveBuffer = () => {
            if (tagValue.startsWith('data:image')) {
              const buffer = base64DataURLToArrayBuffer(tagValue);
              if (buffer) return resolve(buffer);
              return resolve(tagValue);
            }
            fetch(tagValue)
              .then((res) => res.arrayBuffer())
              .then((buffer) => resolve(buffer))
              .catch(() => resolve(tagValue));
          };

          const img = new Image();
          img.onload = () => {
            imageDimensionsCache[tagValue] = { w: img.width, h: img.height };
            resolveBuffer();
          };
          img.onerror = () => resolveBuffer();
          img.src = tagValue;
        });
      },
      getSize: function (img: any, tagValue: string) {
        const dim = imageDimensionsCache[tagValue];
        if (dim) {
          const maxW = 150;
          // IMPORTANT FIX: Keep the ratio purely by width so it can be as tall as needed!
          const ratio = maxW / dim.w;
          return [dim.w * ratio, dim.h * ratio];
        }
        return [150, 150];
      },
    };
    const imageModule = new ImageModule(imageOptions);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
    });

    let data: Record<string, unknown>;
    switch (logbook.templateType) {
      case 'KKN':
        data = await prepareKKNData(logbook);
        break;
      case 'PLP':
        data = await preparePLPData(logbook);
        break;
      case 'AM':
        data = await prepareAMData(logbook);
        break;
      default:
        throw new Error('Unknown template type');
    }

    await doc.renderAsync(data);

    const outputBlob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    saveAs(outputBlob, `${filename}.docx`);
    return true;

  } catch (error) {
    console.error('Export to Word (template) failed:', error);
    if (error instanceof Error) {
      if (error.message.includes('Failed to load template')) {
        throw new Error('Template file tidak ditemukan. Pastikan file template ada di folder public/templates/');
      }
      throw new Error('Gagal export ke Word: ' + error.message);
    }
    throw new Error('Gagal export ke Word');
  }
}
