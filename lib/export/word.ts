import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { Logbook, KKNEntry, PLPEntry, AMEntry, ImageInput } from '@/types/logbook';

// Helper to get image text for Word export
function getImageText(foto: ImageInput | null): string {
  if (!foto) return '-';
  if (foto.type === 'url') return foto.url;
  return '[Gambar terupload]';
}

export async function exportToWord(logbook: Logbook, filename: string) {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header Section
          new Paragraph({
            text: `Nama\t\t\t: ${logbook.header.nama}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `NIM\t\t\t: ${logbook.header.nim}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Laporan\t\t: ${logbook.header.laporan}`,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: `Pekan ke-\t\t: ${logbook.header.pekanKe}`,
            spacing: { after: 300 },
          }),

          // Table based on template type
          createTable(logbook),

          // Footer Section (only for PLP and AM)
          ...createFooter(logbook),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
    return true;
  } catch (error) {
    console.error('Export to Word failed:', error);
    throw new Error('Gagal export ke Word');
  }
}

function createTable(logbook: Logbook): Table {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: '000000',
  };

  const borders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
    insideHorizontal: borderStyle,
    insideVertical: borderStyle,
  };

  switch (logbook.templateType) {
    case 'KKN':
      return createKKNTable(logbook, borders);
    case 'PLP':
      return createPLPTable(logbook, borders);
    case 'AM':
      return createAMTable(logbook, borders);
    default:
      throw new Error('Unknown template type');
  }
}

function createKKNTable(logbook: Logbook, borders: any): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'No.', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hari/Tanggal', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Program Kerja', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Foto', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Link Dokumen', bold: true })], alignment: AlignmentType.CENTER })], borders }),
    ],
  });

  const dataRows = (logbook.entries as KKNEntry[]).map(entry => 
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: entry.no.toString(), alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.hariTanggal || '-' })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.programKerja || '-' })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.deskripsi || '-' })], borders }),
        new TableCell({ children: [new Paragraph({ text: getImageText(entry.foto) })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.linkDokumen || '-' })], borders }),
      ],
    })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function createPLPTable(logbook: Logbook, borders: any): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'No.', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hari/Tanggal', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jam Pembelajaran', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jam Administrasi', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jam Adaptasi Teknologi', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Foto', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Link Dokumen', bold: true })], alignment: AlignmentType.CENTER })], borders }),
    ],
  });

  const dataRows = (logbook.entries as PLPEntry[]).map(entry => {
    const deskripsi = [
      `Pembelajaran: ${entry.kegiatanPembelajaran || '-'}`,
      `Administrasi: ${entry.kegiatanAdministrasi || '-'}`,
      `Adaptasi Teknologi: ${entry.kegiatanAdaptasiTeknologi || '-'}`,
    ].join('\n');

    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: entry.no.toString(), alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.hariTanggal || '-' })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamPembelajaran || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamAdministrasi || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamAdaptasiTeknologi || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: deskripsi })], borders }),
        new TableCell({ children: [new Paragraph({ text: getImageText(entry.foto) })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.linkDokumen || '-' })], borders }),
      ],
    });
  });

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function createAMTable(logbook: Logbook, borders: any): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'No.', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hari/Tanggal', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Menyusun Perangkat', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Melaksanakan Pembelajaran', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Asesmen', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Refleksi', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengambilan Data', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi Aktivitas', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Foto', bold: true })], alignment: AlignmentType.CENTER })], borders }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Link Dokumen', bold: true })], alignment: AlignmentType.CENTER })], borders }),
    ],
  });

  const dataRows = (logbook.entries as AMEntry[]).map(entry =>
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: entry.no.toString(), alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.hariTanggal || '-' })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamMenyusunPerangkat || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamMelaksanakanPembelajaran || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamAsesmen || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamRefleksi || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.jamPengambilanData || '-', alignment: AlignmentType.CENTER })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.deskripsiAktivitas || '-' })], borders }),
        new TableCell({ children: [new Paragraph({ text: getImageText(entry.foto) })], borders }),
        new TableCell({ children: [new Paragraph({ text: entry.linkDokumen || '-' })], borders }),
      ],
    })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function createFooter(logbook: Logbook): Paragraph[] {
  if (!logbook.footer) return [];

  const paragraphs: Paragraph[] = [
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];

  // Jumlah Jam
  if (logbook.templateType === 'PLP') {
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: 'Jumlah Jam:', bold: true })], spacing: { after: 100 } }),
      new Paragraph({ text: `Pembelajaran: ${logbook.footer.jumlahJamPembelajaran || '-'}`, spacing: { after: 50 } }),
      new Paragraph({ text: `Administrasi: ${logbook.footer.jumlahJamAdministrasi || '-'}`, spacing: { after: 50 } }),
      new Paragraph({ text: `Adaptasi Teknologi: ${logbook.footer.jumlahJamAdaptasiTeknologi || '-'}`, spacing: { after: 200 } }),
    );
  } else if (logbook.templateType === 'AM') {
    paragraphs.push(
      new Paragraph({ children: [new TextRun({ text: 'Jumlah Jam:', bold: true })], spacing: { after: 100 } }),
      new Paragraph({ text: `Menyusun Perangkat: ${logbook.footer.jumlahJamMenyusunPerangkat || '-'}`, spacing: { after: 50 } }),
      new Paragraph({ text: `Melaksanakan Pembelajaran: ${logbook.footer.jumlahJamMelaksanakanPembelajaran || '-'}`, spacing: { after: 50 } }),
      new Paragraph({ text: `Asesmen: ${logbook.footer.jumlahJamAsesmen || '-'}`, spacing: { after: 50 } }),
      new Paragraph({ text: `Refleksi: ${logbook.footer.jumlahJamRefleksi || '-'}`, spacing: { after: 50 } }),
      new Paragraph({ text: `Pengambilan Data: ${logbook.footer.jumlahJamPengambilanData || '-'}`, spacing: { after: 200 } }),
    );
  }

  // Analisis, Hambatan, Rencana
  paragraphs.push(
    new Paragraph({ children: [new TextRun({ text: 'Analisis Kegiatan:', bold: true })], spacing: { after: 100 } }),
    new Paragraph({ text: logbook.footer.analisisKegiatan || '-', spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Hambatan & Upaya:', bold: true })], spacing: { after: 100 } }),
    new Paragraph({ text: logbook.footer.hambatanUpaya || '-', spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Rencana Perbaikan:', bold: true })], spacing: { after: 100 } }),
    new Paragraph({ text: logbook.footer.rencanaPerbaikan || '-' }),
  );

  return paragraphs;
}
