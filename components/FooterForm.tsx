'use client';

import { useLogbook } from '@/contexts/LogbookContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function FooterForm() {
  const { logbook, updateFooter } = useLogbook();

  if (!logbook || !logbook.footer) return null;

  const isPLP = logbook.templateType === 'PLP';
  const isAM = logbook.templateType === 'AM';

  return (
    <div className="neo-border neo-shadow-lg bg-white">
      <div className="neo-border-b border-b-[3px] bg-purple-500 p-4">
        <h2 className="text-xl font-black uppercase text-white">Ringkasan & Refleksi</h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Total Hours - conditional based on template */}
        {(isPLP || isAM) && (
          <div>
            <Label className="mb-3 block text-base font-semibold">Jumlah Jam Total</Label>
            {isPLP && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Pembelajaran</Label>
                  <Input
                    placeholder="Total jam"
                    value={logbook.footer.jumlahJamPembelajaran || ''}
                    onChange={(e) => updateFooter({ jumlahJamPembelajaran: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Administrasi</Label>
                  <Input
                    placeholder="Total jam"
                    value={logbook.footer.jumlahJamAdministrasi || ''}
                    onChange={(e) => updateFooter({ jumlahJamAdministrasi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adaptasi Teknologi</Label>
                  <Input
                    placeholder="Total jam"
                    value={logbook.footer.jumlahJamAdaptasiTeknologi || ''}
                    onChange={(e) => updateFooter({ jumlahJamAdaptasiTeknologi: e.target.value })}
                  />
                </div>
              </div>
            )}
            {isAM && (
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label className="text-xs">Menyusun Perangkat</Label>
                  <Input
                    placeholder="0"
                    value={logbook.footer.jumlahJamMenyusunPerangkat || ''}
                    onChange={(e) => updateFooter({ jumlahJamMenyusunPerangkat: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Melaksanakan Pembelajaran</Label>
                  <Input
                    placeholder="0"
                    value={logbook.footer.jumlahJamMelaksanakanPembelajaran || ''}
                    onChange={(e) => updateFooter({ jumlahJamMelaksanakanPembelajaran: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Asesmen</Label>
                  <Input
                    placeholder="0"
                    value={logbook.footer.jumlahJamAsesmen || ''}
                    onChange={(e) => updateFooter({ jumlahJamAsesmen: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Refleksi</Label>
                  <Input
                    placeholder="0"
                    value={logbook.footer.jumlahJamRefleksi || ''}
                    onChange={(e) => updateFooter({ jumlahJamRefleksi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Pengambilan Data</Label>
                  <Input
                    placeholder="0"
                    value={logbook.footer.jumlahJamPengambilanData || ''}
                    onChange={(e) => updateFooter({ jumlahJamPengambilanData: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analisis Kegiatan */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Analisis Kegiatan</Label>
          <Textarea
            placeholder="Tuliskan analisis dari kegiatan yang telah dilakukan..."
            value={logbook.footer.analisisKegiatan}
            onChange={(e) => updateFooter({ analisisKegiatan: e.target.value })}
            rows={4}
          />
        </div>

        {/* Hambatan Upaya */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Hambatan & Upaya</Label>
          <Textarea
            placeholder="Tuliskan hambatan yang dihadapi dan upaya yang dilakukan..."
            value={logbook.footer.hambatanUpaya}
            onChange={(e) => updateFooter({ hambatanUpaya: e.target.value })}
            rows={4}
          />
        </div>

        {/* Rencana Perbaikan */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Rencana Perbaikan</Label>
          <Textarea
            placeholder="Tuliskan rencana perbaikan untuk kegiatan selanjutnya..."
            value={logbook.footer.rencanaPerbaikan}
            onChange={(e) => updateFooter({ rencanaPerbaikan: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
