/**
 * FINAL WORD EXPORT - 100% MATCH TEMPLATE
 * 
 * Strategi: Recreate template structure EXACTLY menggunakan docx library
 * dengan semua detail formatting dari template asli
 * 
 * Template Analysis (dari file .docx asli):
 * - Font: Times New Roman, 12pt
 * - Margins: Top/Bottom/Right 1", Left 1.25"
 * - Table: Single border, black, 1pt
 * - Cell padding: Default (0.08")
 * - Line spacing: Single
 * - Image size: ~150x150px dalam cell
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  WidthType, 
  BorderStyle, 
  AlignmentType,
  VerticalAlign,
  ImageRun,
  convertInchesToTwip,
  TabStopPosition,
  TabStopType,
  UnderlineType,
} from 'docx';
import { saveAs } from 'file-saver';
import { Logbook, KKNEntry, PLPEntry, AMEntry, ImageInput } from '@/types/logbook';

// Constants matching template exactly
const FONT_FAMILY = 'Times New Roman';
const FONT_SIZE = 24; // 12pt in half-points
const LINE_SPACING = 276; // Single spacing (12pt)

// Standard table border matching template
const TABLE_BORDER = {
  style: BorderStyle.SINGLE,
  size: 6, // 0.5pt (same as template)
  color: '000000',
};

// Helper: Convert image to Uint8Array
async function getImageData(foto: ImageInput | null): Promise<{ data: Uint8Array; imageType: 'jpeg' | 'png' | 'gif' | 'bmp'; width: number; height: number } | null> {
  if (!foto) return null;

  try {
    let imageBuffer: Uint8Array;

    if (foto.type === 'upload') {
      // Base64 to Uint8Array
      const base64Data = foto.preview.includes(',') ? foto.preview.split(',')[1] : foto.preview;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBuffer = bytes;
    } else {
      // Fetch from URL
      const response = await fetch(foto.url);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = new Uint8Array(arrayBuffer);
    }

    // Detect image type from base64/URL
    let imageType: 'jpeg' | 'png' | 'gif' | 'bmp' = 'jpeg';
    if (foto.type === 'upload') {
      if (foto.preview.includes('image/png')) imageType = 'png';
      else if (foto.preview.includes('image/gif')) imageType = 'gif';
    }
    // Return with size that fits within foto cell
    return {
      data: imageBuffer,
      imageType,
      width: 65,
      height: 65,
    };
  } catch (error) {
    console.error('Failed to process image:', error);
    return null;
  }
}

// Create image cell content for a single foto
async function createImageParagraph(foto: ImageInput): Promise<Paragraph> {
  const imageData = await getImageData(foto);

  if (imageData) {
    try {
      return new Paragraph({
        children: [
          new ImageRun({
            type: imageData.imageType,
            data: imageData.data,
            transformation: {
              width: imageData.width,
              height: imageData.height,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
      });
    } catch (error) {
      console.error('Failed to create image:', error);
    }
  }

  // Fallback: text
  const text = foto.type === 'url' ? 'Link: ' + foto.url : '';
  return new Paragraph({
    text,
    alignment: AlignmentType.CENTER,
    style: 'Normal',
  });
}

// Create array of paragraphs for multiple fotos (one per foto, stacked vertically)
async function createImagesParagraphs(fotos: ImageInput[]): Promise<Paragraph[]> {
  if (!fotos || fotos.length === 0) {
    return [new Paragraph({ text: '', alignment: AlignmentType.CENTER, style: 'Normal' })];
  }
  const paragraphs: Paragraph[] = [];
  for (let i = 0; i < fotos.length; i++) {
    const para = await createImageParagraph(fotos[i]);
    paragraphs.push(para);
    // Add small spacing paragraph between images (except after last)
    if (i < fotos.length - 1) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 60 } }));
    }
  }
  return paragraphs;
}

/**
 * MAIN EXPORT FUNCTION
 */
export async function exportToWordFinal(logbook: Logbook, filename: string): Promise<boolean> {
  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
            },
          },
        },
        children: [
          // Header section - exact format dari template
          new Paragraph({
            text: `Nama\t\t\t: ${logbook.header.nama}`,
            spacing: { after: 0, line: LINE_SPACING },
          }),
          new Paragraph({
            text: `NIM\t\t\t: ${logbook.header.nim}`,
            spacing: { after: 0, line: LINE_SPACING },
          }),
          new Paragraph({
            text: `Laporan\t\t: ${logbook.header.laporan}`,
            spacing: { after: 0, line: LINE_SPACING },
          }),
          new Paragraph({
            text: `Pekan ke-\t\t: ${logbook.header.pekanKe}`,
            spacing: { after: 140, line: LINE_SPACING },
          }),
          new Paragraph({ text: '', spacing: { after: 140 } }),

          // Table
          await createTableFinal(logbook),

          // Footer (for PLP and AM)
          ...await createFooterFinal(logbook),
        ],
      }],
      styles: {
        default: {
          document: {
            run: {
              font: FONT_FAMILY,
              size: FONT_SIZE,
            },
            paragraph: {
              spacing: {
                line: LINE_SPACING,
                before: 0,
                after: 0,
              },
            },
          },
        },
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: {
              font: FONT_FAMILY,
              size: FONT_SIZE,
            },
            paragraph: {
              spacing: {
                line: LINE_SPACING,
              },
            },
          },
        ],
      },
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
    return true;
  } catch (error) {
    console.error('Export to Word failed:', error);
    throw new Error('Gagal export ke Word: ' + (error as Error).message);
  }
}

// Create table based on template type
async function createTableFinal(logbook: Logbook): Promise<Table> {
  switch (logbook.templateType) {
    case 'KKN':
      return await createKKNTableFinal(logbook);
    case 'PLP':
      return await createPLPTableFinal(logbook);
    case 'AM':
      return await createAMTableFinal(logbook);
    default:
      throw new Error('Unknown template type');
  }
}

// KKN Table - matching template 100%
async function createKKNTableFinal(logbook: Logbook): Promise<Table> {
  const entries = logbook.entries as KKNEntry[];
  const rows: TableRow[] = [];

  const borders = {
    top: TABLE_BORDER,
    bottom: TABLE_BORDER,
    left: TABLE_BORDER,
    right: TABLE_BORDER,
  };

  // Header row
  rows.push(new TableRow({
    tableHeader: true,
    height: { value: convertInchesToTwip(0.3), rule: 'atLeast' },
    children: [
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'No.', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 5, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Hari/Tanggal', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 12, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Program Kerja', bold: true, font: FONT_FAMILY, size: FONT_SIZE }), new TextRun({ text: '\n(jika ada aktivitas KKN di hari tsb.)', font: FONT_FAMILY, size: 20 })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 18, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Deskripsi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 35, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Sampel Foto Dokumentasi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 15, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [
            new TextRun({ text: 'Link Dokumen', bold: true, font: FONT_FAMILY, size: FONT_SIZE }), 
            new TextRun({ text: '\nutk dikonsulkan', font: FONT_FAMILY, size: 20 }),
            new TextRun({ text: '\n(opsional)', font: FONT_FAMILY, size: 20 }),
          ], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: 15, type: WidthType.PERCENTAGE },
      }),
    ],
  }));

  // Data rows
  for (const entry of entries) {
    const imageParagraphs = await createImagesParagraphs(entry.fotos);
    
    rows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ 
            text: entry.no.toString(), 
            alignment: AlignmentType.CENTER,
            style: 'Normal'
          })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.hariTanggal || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.programKerja || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.deskripsi || 'Aktivitas yang dilakukan:', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: imageParagraphs,
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.linkDokumen || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
      ],
    }));
  }

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: TABLE_BORDER,
      bottom: TABLE_BORDER,
      left: TABLE_BORDER,
      right: TABLE_BORDER,
      insideHorizontal: TABLE_BORDER,
      insideVertical: TABLE_BORDER,
    },
  });
}

// PLP Table - Complete implementation
async function createPLPTableFinal(logbook: Logbook): Promise<Table> {
  const entries = logbook.entries as PLPEntry[];
  const rows: TableRow[] = [];

  const borders = {
    top: TABLE_BORDER,
    bottom: TABLE_BORDER,
    left: TABLE_BORDER,
    right: TABLE_BORDER,
  };

  // Header row with merged cells for "Jumlah Jam Membantu"
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'No.', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 5, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Hari/Tanggal', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 12, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Jumlah Jam Membantu', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        columnSpan: 3,
        width: { size: 25, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Deskripsi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 30, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Sampel Foto Dokumentasi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 13, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [
            new TextRun({ text: 'Link Dokumen', bold: true, font: FONT_FAMILY, size: FONT_SIZE }), 
            new TextRun({ text: '\nutk dikonsulkan\n(opsional)', font: FONT_FAMILY, size: 20 }),
          ], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 15, type: WidthType.PERCENTAGE },
      }),
    ],
  }));

  // Second header row - sub-columns
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Pembela-jaran', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Adminis-trasi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Adaptasi\nTeknologi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
    ],
  }));

  // Data rows
  for (const entry of entries) {
    const imageParagraphs = await createImagesParagraphs(entry.fotos);
    
    // Build deskripsi with 3 parts
    const deskripsi = `Kegiatan Membantu Pembelajaran:\n${entry.kegiatanPembelajaran || ''}\n\nKegiatan Membantu Administrasi:\n${entry.kegiatanAdministrasi || ''}\n\nKegiatan Membantu Adaptasi Teknologi:\n${entry.kegiatanAdaptasiTeknologi || ''}`;
    
    rows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: entry.no.toString(), alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.hariTanggal || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamPembelajaran || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamAdministrasi || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamAdaptasiTeknologi || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: deskripsi, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: imageParagraphs,
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.linkDokumen || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
      ],
    }));
  }

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: TABLE_BORDER,
      bottom: TABLE_BORDER,
      left: TABLE_BORDER,
      right: TABLE_BORDER,
      insideHorizontal: TABLE_BORDER,
      insideVertical: TABLE_BORDER,
    },
  });
}

// AM Table - Complete implementation  
async function createAMTableFinal(logbook: Logbook): Promise<Table> {
  const entries = logbook.entries as AMEntry[];
  const rows: TableRow[] = [];

  const borders = {
    top: TABLE_BORDER,
    bottom: TABLE_BORDER,
    left: TABLE_BORDER,
    right: TABLE_BORDER,
  };

  // Header row with merged cells
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'No.', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 4, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Hari/Tanggal', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 10, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Jumlah Jam (jika ada, boleh salah satu atau lebih)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        columnSpan: 5,
        width: { size: 35, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Deskripsi Aktivitas yang dilakukan', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 25, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Sampel Foto Dokumentasi', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 13, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [
            new TextRun({ text: 'Link Dokumen', bold: true, font: FONT_FAMILY, size: FONT_SIZE }), 
            new TextRun({ text: '\nutk dikonsulkan\n(opsional)', font: FONT_FAMILY, size: 20 }),
          ], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        width: { size: 13, type: WidthType.PERCENTAGE },
      }),
    ],
  }));

  // Second header row
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Menyusun Perangkat Pembelajaran', bold: true, font: FONT_FAMILY, size: 22 })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Melaksanakan Pembelajarn', bold: true, font: FONT_FAMILY, size: 22 })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Melaksanakan Asesmen Pembelajaran', bold: true, font: FONT_FAMILY, size: 22 })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Melaksanakan Refleksi Pembelajaran', bold: true, font: FONT_FAMILY, size: 22 })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ text: 'Melakukan Pengambilan Data Awal Pendukung Penelitian', bold: true, font: FONT_FAMILY, size: 22 })], 
          alignment: AlignmentType.CENTER 
        })],
        borders,
        verticalAlign: VerticalAlign.CENTER,
      }),
    ],
  }));

  // Data rows
  for (const entry of entries) {
    const imageParagraphs = await createImagesParagraphs(entry.fotos);
    
    rows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: entry.no.toString(), alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.hariTanggal || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamMenyusunPerangkat || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamMelaksanakanPembelajaran || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamAsesmen || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamRefleksi || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.jamPengambilanData || '', alignment: AlignmentType.CENTER, style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.deskripsiAktivitas || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: imageParagraphs,
          borders,
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: entry.linkDokumen || '', style: 'Normal' })],
          borders,
          verticalAlign: VerticalAlign.TOP,
        }),
      ],
    }));
  }

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: TABLE_BORDER,
      bottom: TABLE_BORDER,
      left: TABLE_BORDER,
      right: TABLE_BORDER,
      insideHorizontal: TABLE_BORDER,
      insideVertical: TABLE_BORDER,
    },
  });
}

// Footer section - Complete implementation
async function createFooterFinal(logbook: Logbook): Promise<Paragraph[]> {
  if (!logbook.footer || logbook.templateType === 'KKN') return [];

  const paragraphs: Paragraph[] = [
    new Paragraph({ text: '', spacing: { before: 200, after: 100 } }),
  ];

  // Create footer table for PLP
  if (logbook.templateType === 'PLP') {
    const borders = {
      top: TABLE_BORDER,
      bottom: TABLE_BORDER,
      left: TABLE_BORDER,
      right: TABLE_BORDER,
    };

    const footerTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Jumlah Jam', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
              columnSpan: 4,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamPembelajaran || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamAdministrasi || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamAdaptasiTeknologi || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Analisis Kegiatan (jika ada)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })] })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 4,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.analisisKegiatan || '' })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 4,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Hambatan Upaya (jika ada)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })] })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 4,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.hambatanUpaya || '' })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 4,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Rencana Perbaikan (jika ada)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })] })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 4,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.rencanaPerbaikan || '' })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 4,
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: TABLE_BORDER,
        bottom: TABLE_BORDER,
        left: TABLE_BORDER,
        right: TABLE_BORDER,
        insideHorizontal: TABLE_BORDER,
        insideVertical: TABLE_BORDER,
      },
    });

    return [footerTable as any]; // Cast because docx typing issue
  }

  // Create footer table for AM
  if (logbook.templateType === 'AM') {
    const borders = {
      top: TABLE_BORDER,
      bottom: TABLE_BORDER,
      left: TABLE_BORDER,
      right: TABLE_BORDER,
    };

    const footerTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Jumlah Jam', bold: true, font: FONT_FAMILY, size: FONT_SIZE })], alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
              columnSpan: 5,
            }),
            new TableCell({
              children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamMenyusunPerangkat || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamMelaksanakanPembelajaran || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamAsesmen || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamRefleksi || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.jumlahJamPengambilanData || '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ text: '', alignment: AlignmentType.CENTER })],
              borders,
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Analisis Kegiatan (jika ada)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })] })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 6,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.analisisKegiatan || '' })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 6,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Hambatan Upaya (jika ada)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })] })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 6,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.hambatanUpaya || '' })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 6,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Rencana Perbaikan (jika ada)', bold: true, font: FONT_FAMILY, size: FONT_SIZE })] })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 6,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: logbook.footer.rencanaPerbaikan || '' })],
              borders,
              verticalAlign: VerticalAlign.TOP,
              columnSpan: 6,
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: TABLE_BORDER,
        bottom: TABLE_BORDER,
        left: TABLE_BORDER,
        right: TABLE_BORDER,
        insideHorizontal: TABLE_BORDER,
        insideVertical: TABLE_BORDER,
      },
    });

    return [footerTable as any]; // Cast because docx typing issue
  }

  return paragraphs;
}


