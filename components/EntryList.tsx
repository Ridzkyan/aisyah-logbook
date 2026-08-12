'use client';

import { useLogbook } from '@/contexts/LogbookContext';
import KKNEntryCard from '@/components/entries/KKNEntryCard';
import PLPEntryCard from '@/components/entries/PLPEntryCard';
import AMEntryCard from '@/components/entries/AMEntryCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function EntryList() {
  const { logbook, addEntry } = useLogbook();

  if (!logbook) return null;

  if (logbook.entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-4 rounded-full bg-gray-100 p-6 w-fit">
          <Plus className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Belum ada kegiatan
        </h3>
        <p className="text-gray-500 mb-6">
          Mulai tambahkan kegiatan pertama kamu
        </p>
        <Button onClick={addEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Entry Pertama
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logbook.entries.map((entry: any, index) => {
        const key = entry.id;
        switch (logbook.templateType) {
          case 'KKN':
            return <KKNEntryCard key={key} entry={entry} isFirst={index === 0} isLast={index === logbook.entries.length - 1} />;
          case 'PLP':
            return <PLPEntryCard key={key} entry={entry} isFirst={index === 0} isLast={index === logbook.entries.length - 1} />;
          case 'AM':
            return <AMEntryCard key={key} entry={entry} isFirst={index === 0} isLast={index === logbook.entries.length - 1} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
