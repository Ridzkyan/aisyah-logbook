'use client';

import { useLogbook } from '@/contexts/LogbookContext';
import { KKNEntry } from '@/types/logbook';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/ImageUploader';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface Props {
  entry: KKNEntry;
  isFirst: boolean;
  isLast: boolean;
}

export default function KKNEntryCard({ entry, isFirst, isLast }: Props) {
  const { updateEntry, deleteEntry, reorderEntry } = useLogbook();

  const handleDelete = () => {
    if (confirm('Apakah kamu yakin ingin menghapus entry ini?')) {
      deleteEntry(entry.id);
    }
  };

  return (
    <div className="neo-border neo-shadow-lg bg-white">
      <div className="neo-border-b border-b-[3px] bg-blue-500 p-3">
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Hari/Tanggal</Label>
            <Input
              placeholder="Contoh: Senin, 13 Juli 2026"
              value={entry.hariTanggal}
              onChange={(e) => updateEntry(entry.id, { hariTanggal: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Program Kerja</Label>
            <Input
              placeholder="Masukkan program kerja"
              value={entry.programKerja}
              onChange={(e) => updateEntry(entry.id, { programKerja: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Deskripsi Aktivitas yang Dilakukan</Label>
          <Textarea
            placeholder="Tuliskan deskripsi kegiatan secara detail..."
            value={entry.deskripsi}
            onChange={(e) => updateEntry(entry.id, { deskripsi: e.target.value })}
            rows={4}
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
