import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logbook, KKNEntry, PLPEntry, AMEntry, ImageInput } from '@/types/logbook';

// Helper to get image text for PDF export
function getImageText(fotos: import('@/types/logbook').ImageInput[]): string {
  if (!fotos || fotos.length === 0) return '-';
  const foto = fotos[0];
  if (foto.type === 'url') return foto.url;
  return fotos.length > 1 ? `[${fotos.length} Gambar]` : '[Gambar]';
}

export async function exportToPDF(logbook: Logbook, filename: string) {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Default font to Times New Roman
    doc.setFont('times', 'normal');

    // Header
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text(`Nama`, 14, 15);
    doc.text(`: ${logbook.header.nama}`, 40, 15);
    doc.text(`NIM`, 14, 22);
    doc.text(`: ${logbook.header.nim}`, 40, 22);
    doc.text(`Laporan`, 14, 29);
    doc.text(`: ${logbook.header.laporan}`, 40, 29);
    doc.text(`Pekan ke-`, 14, 36);
    doc.text(`: ${logbook.header.pekanKe}`, 40, 36);

    // Table
    const startY = 45;
    
    switch (logbook.templateType) {
      case 'KKN':
        createKKNTable(doc, logbook, startY);
        break;
      case 'PLP':
        createPLPTable(doc, logbook, startY);
        break;
      case 'AM':
        createAMTable(doc, logbook, startY);
        break;
    }

    // Footer
    if (logbook.footer) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      addFooter(doc, logbook, finalY);
    }

    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Export to PDF failed:', error);
    throw new Error('Gagal export ke PDF');
  }
}

function createKKNTable(doc: jsPDF, logbook: Logbook, startY: number) {
  const entries = logbook.entries as KKNEntry[];
  
  autoTable(doc, {
    startY,
    head: [[
      { content: 'No.', styles: { halign: 'center', valign: 'middle' } },
      { content: 'Hari/Tanggal', styles: { halign: 'center', valign: 'middle' } },
      { content: 'Program Kerja', styles: { halign: 'center', valign: 'middle' } },
      { content: 'Deskripsi', styles: { halign: 'center', valign: 'middle' } },
      { content: 'Sampel Foto\nDokumentasi', styles: { halign: 'center', valign: 'middle' } },
      { content: 'Link Dokumen Terkait', styles: { halign: 'center', valign: 'middle' } }
    ]],
    body: entries.map(entry => [
      entry.no,
      entry.hariTanggal || '-',
      entry.programKerja || '-',
      entry.deskripsi || '-',
      entry.fotos?.[0]?.type === 'upload' ? '' : getImageText(entry.fotos),
      entry.linkDokumen || '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [208, 206, 206], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [0,0,0] },
    bodyStyles: { textColor: [0,0,0], lineWidth: 0.1, lineColor: [0,0,0], font: 'times' },
    styles: { fontSize: 10, cellPadding: 3, font: 'times' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 50 },
      3: { cellWidth: 80 },
      4: { cellWidth: 40 },
      5: { cellWidth: 40 },
    },
    didDrawCell: (data) => {
      // Index 4 is Foto
      if (data.section === 'body' && data.column.index === 4) {
        const foto = entries[data.row.index]?.fotos?.[0];
        if (foto && foto.type === 'upload') {
          try {
            // Draw image inside cell with padding
            const dim = 30; // 30x30 mm
            const imgData = foto.preview; // data:image/png;base64,...
            const x = data.cell.x + (data.cell.width - dim) / 2;
            const y = data.cell.y + 2;
            // Get format from base64 string
            let format = 'JPEG';
            if (imgData.includes('image/png')) format = 'PNG';
            
            doc.addImage(imgData, format, x, y, dim, dim);
            
            // Adjust row height if needed, autoTable doesn't do this automatically if content is empty string
            // But we can't easily change row height from didDrawCell. We'll set a minimum cell height in didParseCell if needed.
          } catch(e) {
            console.error('Failed to draw image in PDF:', e);
          }
        }
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const foto = entries[data.row.index]?.fotos?.[0];
        if (foto && foto.type === 'upload') {
          data.cell.styles.minCellHeight = 35; // 30mm image + 5mm padding
        }
      }
    }
  });
}

function createPLPTable(doc: jsPDF, logbook: Logbook, startY: number) {
  const entries = logbook.entries as PLPEntry[];
  
  autoTable(doc, {
    startY,
    head: [
      [
        { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Hari/Tanggal', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Jumlah Jam Membantu', colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Kegiatan Membantu', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Sampel Foto\nDokumentasi', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Link Dokumen Terkait', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
      ],
      [
        { content: 'Pembelajaran', styles: { halign: 'center', valign: 'middle' } },
        { content: 'Administrasi', styles: { halign: 'center', valign: 'middle' } },
        { content: 'Adaptasi Teknologi', styles: { halign: 'center', valign: 'middle' } }
      ]
    ],
    body: entries.map(entry => [
      entry.no,
      entry.hariTanggal || '-',
      entry.jamPembelajaran || '-',
      entry.jamAdministrasi || '-',
      entry.jamAdaptasiTeknologi || '-',
      `Kegiatan Membantu Pembelajaran:\n${entry.kegiatanPembelajaran || '-'}\n\nKegiatan Membantu Administrasi:\n${entry.kegiatanAdministrasi || '-'}\n\nKegiatan Membantu Adaptasi Teknologi:\n${entry.kegiatanAdaptasiTeknologi || '-'}`,
      entry.fotos?.[0]?.type === 'upload' ? '' : getImageText(entry.fotos),
      entry.linkDokumen || '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [208, 206, 206], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [0,0,0] },
    bodyStyles: { textColor: [0,0,0], lineWidth: 0.1, lineColor: [0,0,0], font: 'times' },
    styles: { fontSize: 9, cellPadding: 2, font: 'times' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 80 },
      6: { cellWidth: 35 },
      7: { cellWidth: 35 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const foto = entries[data.row.index]?.fotos?.[0];
        if (foto && foto.type === 'upload') {
          try {
            const dim = 25;
            const format = foto.preview.includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(foto.preview, format, data.cell.x + (data.cell.width - dim) / 2, data.cell.y + 2, dim, dim);
          } catch(e) {}
        }
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const foto = entries[data.row.index]?.fotos?.[0];
        if (foto && foto.type === 'upload') {
          data.cell.styles.minCellHeight = 30;
        }
      }
    }
  });
}

function createAMTable(doc: jsPDF, logbook: Logbook, startY: number) {
  const entries = logbook.entries as AMEntry[];
  
  autoTable(doc, {
    startY,
    head: [
      [
        { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Hari/Tanggal', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Waktu Pelaksanaan (Jumlah Jam)', colSpan: 5, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Deskripsi Aktivitas', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Sampel Foto\nDokumentasi', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Link Dokumen Terkait', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
      ],
      [
        { content: 'Menyusun\nPerangkat', styles: { halign: 'center', valign: 'middle' } },
        { content: 'Melaksanakan\nPembelajaran', styles: { halign: 'center', valign: 'middle' } },
        { content: 'Asesmen', styles: { halign: 'center', valign: 'middle' } },
        { content: 'Refleksi', styles: { halign: 'center', valign: 'middle' } },
        { content: 'Pengambilan\nData', styles: { halign: 'center', valign: 'middle' } }
      ]
    ],
    body: entries.map(entry => [
      entry.no,
      entry.hariTanggal || '-',
      entry.jamMenyusunPerangkat || '-',
      entry.jamMelaksanakanPembelajaran || '-',
      entry.jamAsesmen || '-',
      entry.jamRefleksi || '-',
      entry.jamPengambilanData || '-',
      entry.deskripsiAktivitas || '-',
      entry.fotos?.[0]?.type === 'upload' ? '' : getImageText(entry.fotos),
      entry.linkDokumen || '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [208, 206, 206], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1, lineColor: [0,0,0] },
    bodyStyles: { textColor: [0,0,0], lineWidth: 0.1, lineColor: [0,0,0], font: 'times' },
    styles: { fontSize: 8, cellPadding: 2, font: 'times' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 60 },
      8: { cellWidth: 35 },
      9: { cellWidth: 35 },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const foto = entries[data.row.index]?.fotos?.[0];
        if (foto && foto.type === 'upload') {
          try {
            const dim = 25;
            const format = foto.preview.includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(foto.preview, format, data.cell.x + (data.cell.width - dim) / 2, data.cell.y + 2, dim, dim);
          } catch(e) {}
        }
      }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const foto = entries[data.row.index]?.fotos?.[0];
        if (foto && foto.type === 'upload') {
          data.cell.styles.minCellHeight = 30;
        }
      }
    }
  });
}

function addFooter(doc: jsPDF, logbook: Logbook, startY: number) {
  if (!logbook.footer) return;

  doc.setFontSize(10);
  let currentY = startY;

  // Jumlah Jam
  if (logbook.templateType === 'PLP') {
    doc.setFont('times', 'bold');
    doc.text('Jumlah Jam:', 14, currentY);
    currentY += 7;
    doc.setFont('times', 'normal');
    doc.text(`Pembelajaran: ${logbook.footer.jumlahJamPembelajaran || '-'}`, 14, currentY);
    currentY += 6;
    doc.text(`Administrasi: ${logbook.footer.jumlahJamAdministrasi || '-'}`, 14, currentY);
    currentY += 6;
    doc.text(`Adaptasi Teknologi: ${logbook.footer.jumlahJamAdaptasiTeknologi || '-'}`, 14, currentY);
    currentY += 10;
  } else if (logbook.templateType === 'AM') {
    doc.setFont('times', 'bold');
    doc.text('Jumlah Jam:', 14, currentY);
    currentY += 7;
    doc.setFont('times', 'normal');
    doc.text(`Menyusun Perangkat: ${logbook.footer.jumlahJamMenyusunPerangkat || '-'}`, 14, currentY);
    currentY += 6;
    doc.text(`Melaksanakan Pembelajaran: ${logbook.footer.jumlahJamMelaksanakanPembelajaran || '-'}`, 14, currentY);
    currentY += 6;
    doc.text(`Asesmen: ${logbook.footer.jumlahJamAsesmen || '-'}`, 14, currentY);
    currentY += 6;
    doc.text(`Refleksi: ${logbook.footer.jumlahJamRefleksi || '-'}`, 14, currentY);
    currentY += 6;
    doc.text(`Pengambilan Data: ${logbook.footer.jumlahJamPengambilanData || '-'}`, 14, currentY);
    currentY += 10;
  }

  // Analisis
  doc.setFont('times', 'bold');
  doc.text('Analisis Kegiatan:', 14, currentY);
  currentY += 7;
  doc.setFont('times', 'normal');
  const analisisLines = doc.splitTextToSize(logbook.footer.analisisKegiatan || '-', 260);
  doc.text(analisisLines, 14, currentY);
  currentY += analisisLines.length * 6 + 4;

  // Hambatan
  doc.setFont('times', 'bold');
  doc.text('Hambatan & Upaya:', 14, currentY);
  currentY += 7;
  doc.setFont('times', 'normal');
  const hambatanLines = doc.splitTextToSize(logbook.footer.hambatanUpaya || '-', 260);
  doc.text(hambatanLines, 14, currentY);
  currentY += hambatanLines.length * 6 + 4;

  // Rencana
  doc.setFont('times', 'bold');
  doc.text('Rencana Perbaikan:', 14, currentY);
  currentY += 7;
  doc.setFont('times', 'normal');
  const rencanaLines = doc.splitTextToSize(logbook.footer.rencanaPerbaikan || '-', 260);
  doc.text(rencanaLines, 14, currentY);
}
