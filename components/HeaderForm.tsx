'use client';

import { useLogbook } from '@/contexts/LogbookContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function HeaderForm() {
  const { logbook, updateHeader } = useLogbook();

  if (!logbook) return null;

  return (
    <div className="neo-border neo-shadow-lg bg-white">
      <div className="neo-border-b border-b-[3px] bg-blue-500 p-4">
        <h2 className="text-xl font-black uppercase text-white">Informasi Mahasiswa</h2>
      </div>
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              placeholder="Masukkan nama lengkap"
              value={logbook.header.nama}
              onChange={(e) => updateHeader({ nama: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <Input
              id="nim"
              placeholder="Masukkan NIM"
              value={logbook.header.nim}
              onChange={(e) => updateHeader({ nim: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="laporan">Laporan</Label>
            <Input
              id="laporan"
              value={logbook.header.laporan}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pekanKe">Pekan ke-</Label>
            <Input
              id="pekanKe"
              placeholder="Contoh: 1"
              value={logbook.header.pekanKe}
              onChange={(e) => updateHeader({ pekanKe: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
