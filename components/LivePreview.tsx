'use client';

import { useLogbook } from '@/contexts/LogbookContext';
import { KKNEntry, PLPEntry, AMEntry } from '@/types/logbook';

export default function LivePreview() {
  const { logbook } = useLogbook();

  if (!logbook) return null;

  return (
    <div className="h-full overflow-auto bg-white p-8">
      <div className="mx-auto max-w-4xl">
        {/* Preview Document Style */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 font-mono text-sm">
            <p><span className="font-bold">Nama</span>             : {logbook.header.nama || '_______________'}</p>
            <p><span className="font-bold">NIM</span>              : {logbook.header.nim || '_______________'}</p>
            <p><span className="font-bold">Laporan</span>          : {logbook.header.laporan}</p>
            <p><span className="font-bold">Pekan ke-</span>        : {logbook.header.pekanKe || '_______________'}</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black text-sm">
              <thead className="bg-gray-100">
                {renderTableHeader(logbook.templateType)}
              </thead>
              <tbody>
                {logbook.entries.length === 0 ? (
                  <tr>
                    <td colSpan={getColSpan(logbook.templateType)} className="border border-black p-4 text-center text-gray-500">
                      Belum ada entry
                    </td>
                  </tr>
                ) : (
                  renderTableBody(logbook.templateType, logbook.entries)
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {logbook.footer && (
            <div className="space-y-4 font-mono text-sm">
              {(logbook.templateType === 'PLP' || logbook.templateType === 'AM') && (
                <div>
                  <p className="font-bold mb-2">Jumlah Jam:</p>
                  {logbook.templateType === 'PLP' && (
                    <div className="ml-4 space-y-1">
                      <p>Pembelajaran: {logbook.footer.jumlahJamPembelajaran || '-'}</p>
                      <p>Administrasi: {logbook.footer.jumlahJamAdministrasi || '-'}</p>
                      <p>Adaptasi Teknologi: {logbook.footer.jumlahJamAdaptasiTeknologi || '-'}</p>
                    </div>
                  )}
                  {logbook.templateType === 'AM' && (
                    <div className="ml-4 space-y-1">
                      <p>Menyusun Perangkat: {logbook.footer.jumlahJamMenyusunPerangkat || '-'}</p>
                      <p>Melaksanakan Pembelajaran: {logbook.footer.jumlahJamMelaksanakanPembelajaran || '-'}</p>
                      <p>Asesmen: {logbook.footer.jumlahJamAsesmen || '-'}</p>
                      <p>Refleksi: {logbook.footer.jumlahJamRefleksi || '-'}</p>
                      <p>Pengambilan Data: {logbook.footer.jumlahJamPengambilanData || '-'}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="font-bold mb-2">Analisis Kegiatan:</p>
                <p className="ml-4 whitespace-pre-wrap">{logbook.footer.analisisKegiatan || '-'}</p>
              </div>

              <div>
                <p className="font-bold mb-2">Hambatan & Upaya:</p>
                <p className="ml-4 whitespace-pre-wrap">{logbook.footer.hambatanUpaya || '-'}</p>
              </div>

              <div>
                <p className="font-bold mb-2">Rencana Perbaikan:</p>
                <p className="ml-4 whitespace-pre-wrap">{logbook.footer.rencanaPerbaikan || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderTableHeader(templateType: string) {
  switch (templateType) {
    case 'KKN':
      return (
        <tr>
          <th className="border border-black p-2 font-bold">No.</th>
          <th className="border border-black p-2 font-bold">Hari/Tanggal</th>
          <th className="border border-black p-2 font-bold">Program Kerja</th>
          <th className="border border-black p-2 font-bold">Deskripsi</th>
          <th className="border border-black p-2 font-bold">Foto</th>
          <th className="border border-black p-2 font-bold">Link Dokumen</th>
        </tr>
      );
    case 'PLP':
      return (
        <tr>
          <th className="border border-black p-2 font-bold">No.</th>
          <th className="border border-black p-2 font-bold">Hari/Tanggal</th>
          <th className="border border-black p-2 font-bold">Jam P</th>
          <th className="border border-black p-2 font-bold">Jam A</th>
          <th className="border border-black p-2 font-bold">Jam T</th>
          <th className="border border-black p-2 font-bold">Deskripsi</th>
          <th className="border border-black p-2 font-bold">Foto</th>
          <th className="border border-black p-2 font-bold">Link</th>
        </tr>
      );
    case 'AM':
      return (
        <tr>
          <th className="border border-black p-2 font-bold text-xs">No.</th>
          <th className="border border-black p-2 font-bold text-xs">Tanggal</th>
          <th className="border border-black p-2 font-bold text-xs">Perangkat</th>
          <th className="border border-black p-2 font-bold text-xs">Pembelajaran</th>
          <th className="border border-black p-2 font-bold text-xs">Asesmen</th>
          <th className="border border-black p-2 font-bold text-xs">Refleksi</th>
          <th className="border border-black p-2 font-bold text-xs">Data</th>
          <th className="border border-black p-2 font-bold text-xs">Deskripsi</th>
          <th className="border border-black p-2 font-bold text-xs">Foto</th>
          <th className="border border-black p-2 font-bold text-xs">Link</th>
        </tr>
      );
    default:
      return null;
  }
}

function renderTableBody(templateType: string, entries: any[]) {
  switch (templateType) {
    case 'KKN':
      return entries.map((entry: KKNEntry) => (
        <tr key={entry.id}>
          <td className="border border-black p-2 text-center">{entry.no}</td>
          <td className="border border-black p-2">{entry.hariTanggal || '-'}</td>
          <td className="border border-black p-2">{entry.programKerja || '-'}</td>
          <td className="border border-black p-2 whitespace-pre-wrap">{entry.deskripsi || '-'}</td>
          <td className="border border-black p-2 text-xs break-all">
            {entry.fotos && entry.fotos.length > 0
              ? entry.fotos.length === 1
                ? (entry.fotos[0].type === 'upload' ? '[Gambar]' : entry.fotos[0].url)
                : `[${entry.fotos.length} Foto]`
              : '-'}
          </td>
          <td className="border border-black p-2 text-xs break-all">{entry.linkDokumen || '-'}</td>
        </tr>
      ));
    case 'PLP':
      return entries.map((entry: PLPEntry) => (
        <tr key={entry.id}>
          <td className="border border-black p-2 text-center">{entry.no}</td>
          <td className="border border-black p-2">{entry.hariTanggal || '-'}</td>
          <td className="border border-black p-2 text-center">{entry.jamPembelajaran || '-'}</td>
          <td className="border border-black p-2 text-center">{entry.jamAdministrasi || '-'}</td>
          <td className="border border-black p-2 text-center">{entry.jamAdaptasiTeknologi || '-'}</td>
          <td className="border border-black p-2 text-xs">
            <p><strong>P:</strong> {entry.kegiatanPembelajaran || '-'}</p>
            <p><strong>A:</strong> {entry.kegiatanAdministrasi || '-'}</p>
            <p><strong>T:</strong> {entry.kegiatanAdaptasiTeknologi || '-'}</p>
          </td>
          <td className="border border-black p-2 text-xs break-all">
            {entry.fotos && entry.fotos.length > 0
              ? entry.fotos.length === 1
                ? (entry.fotos[0].type === 'upload' ? '[Gambar]' : entry.fotos[0].url)
                : `[${entry.fotos.length} Foto]`
              : '-'}
          </td>
          <td className="border border-black p-2 text-xs break-all">{entry.linkDokumen || '-'}</td>
        </tr>
      ));
    case 'AM':
      return entries.map((entry: AMEntry) => (
        <tr key={entry.id}>
          <td className="border border-black p-2 text-center text-xs">{entry.no}</td>
          <td className="border border-black p-2 text-xs">{entry.hariTanggal || '-'}</td>
          <td className="border border-black p-2 text-center text-xs">{entry.jamMenyusunPerangkat || '-'}</td>
          <td className="border border-black p-2 text-center text-xs">{entry.jamMelaksanakanPembelajaran || '-'}</td>
          <td className="border border-black p-2 text-center text-xs">{entry.jamAsesmen || '-'}</td>
          <td className="border border-black p-2 text-center text-xs">{entry.jamRefleksi || '-'}</td>
          <td className="border border-black p-2 text-center text-xs">{entry.jamPengambilanData || '-'}</td>
          <td className="border border-black p-2 text-xs whitespace-pre-wrap">{entry.deskripsiAktivitas || '-'}</td>
          <td className="border border-black p-2 text-xs break-all">
            {entry.fotos && entry.fotos.length > 0
              ? entry.fotos.length === 1
                ? (entry.fotos[0].type === 'upload' ? '[Gambar]' : entry.fotos[0].url)
                : `[${entry.fotos.length} Foto]`
              : '-'}
          </td>
          <td className="border border-black p-2 text-xs break-all">{entry.linkDokumen || '-'}</td>
        </tr>
      ));
    default:
      return null;
  }
}

function getColSpan(templateType: string): number {
  switch (templateType) {
    case 'KKN': return 6;
    case 'PLP': return 8;
    case 'AM': return 10;
    default: return 6;
  }
}
