'use client';

import { useLogbook } from '@/contexts/LogbookContext';
import { PLPEntry } from '@/types/logbook';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface Props {
  entry: PLPEntry;
  isFirst: boolean;
  isLast: boolean;
}

export default function PLPEntryCard({ entry, isFirst, isLast }: Props) {
  const { updateEntry, deleteEntry, reorderEntry } = useLogbook();

  const handleDelete = () => {
    if (confirm('Apakah kamu yakin ingin menghapus entry ini?')) {
      deleteEntry(entry.id);
    }
  };

  return (
    <div className="neo-border neo-shadow-lg bg-white">
      <div className="neo-border-b border-b-[3px] bg-green-500 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neo-border neo-shadow bg-white p-2 font-black text-lg">
              #{entry.no}
            </div>
            <span className="text-sm font-bold uppercase text-white">Entry {entry.no}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => reorderEntry(entry.id, 'up')}
              disabled={isFirst}
              className="neo-border neo-shadow bg-white hover:bg-gray-100 disabled:opacity-30 h-8 w-8 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => reorderEntry(entry.id, 'down')}
              disabled={isLast}
              className="neo-border neo-shadow bg-white hover:bg-gray-100 disabled:opacity-30 h-8 w-8 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="neo-border neo-shadow bg-red-500 text-white hover:bg-red-600 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Hari/Tanggal</Label>
          <Input
            placeholder="Contoh: Senin, 13 Juli 2026"
            value={entry.hariTanggal}
            onChange={(e) => updateEntry(entry.id, { hariTanggal: e.target.value })}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Jam Pembelajaran</Label>
            <Input
              placeholder="Contoh: 3"
              value={entry.jamPembelajaran}
              onChange={(e) => updateEntry(entry.id, { jamPembelajaran: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Jam Administrasi</Label>
            <Input
              placeholder="Contoh: 2"
              value={entry.jamAdministrasi}
              onChange={(e) => updateEntry(entry.id, { jamAdministrasi: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Jam Adaptasi Teknologi</Label>
            <Input
              placeholder="Contoh: 1"
              value={entry.jamAdaptasiTeknologi}
              onChange={(e) => updateEntry(entry.id, { jamAdaptasiTeknologi: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Kegiatan Membantu Pembelajaran</Label>
          <Textarea
            placeholder="Tuliskan kegiatan pembelajaran..."
            value={entry.kegiatanPembelajaran}
            onChange={(e) => updateEntry(entry.id, { kegiatanPembelajaran: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Kegiatan Membantu Administrasi</Label>
          <Textarea
            placeholder="Tuliskan kegiatan administrasi..."
            value={entry.kegiatanAdministrasi}
            onChange={(e) => updateEntry(entry.id, { kegiatanAdministrasi: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Kegiatan Membantu Adaptasi Teknologi</Label>
          <Textarea
            placeholder="Tuliskan kegiatan adaptasi teknologi..."
            value={entry.kegiatanAdaptasiTeknologi}
            onChange={(e) => updateEntry(entry.id, { kegiatanAdaptasiTeknologi: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Foto Dokumentasi</Label>
            <ImageUploader
              value={entry.foto}
              onChange={(foto) => updateEntry(entry.id, { foto })}
            />
          </div>
          <div className="space-y-2">
            <Label>Link Dokumen (Opsional)</Label>
            <Input
              placeholder="https://drive.google.com/..."
              value={entry.linkDokumen}
              onChange={(e) => updateEntry(entry.id, { linkDokumen: e.target.value })}
            />
            <p className="text-xs text-gray-500">Link Google Drive, OneDrive, dll</p>
          </div>
        </div>
      </div>
    </div>
  );
}
