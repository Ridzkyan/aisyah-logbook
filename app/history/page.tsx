'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LocalStorageService } from '@/lib/storage';
import { Logbook } from '@/types/logbook';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, FileDown, Heart, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function HistoryPage() {
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogbooks();
  }, []);

  const loadLogbooks = () => {
    try {
      const data = LocalStorageService.getAll();
      // Sort by updated date (newest first)
      data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setLogbooks(data);
    } catch (error) {
      console.error('Error loading logbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah kamu yakin ingin menghapus logbook ini?')) {
      try {
        LocalStorageService.delete(id);
        loadLogbooks();
      } catch (error) {
        console.error('Error deleting logbook:', error);
        alert('Gagal menghapus logbook');
      }
    }
  };

  const getTemplateBg = (type: string) => {
    const colors = {
      KKN: 'bg-blue-500',
      PLP: 'bg-green-500',
      AM: 'bg-pink-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block neo-border neo-shadow-lg bg-white p-8">
            <div className="animate-spin rounded-full h-12 w-12 neo-border border-t-blue-500 border-r-blue-500 mx-auto mb-4"></div>
            <p className="font-bold uppercase">Memuat logbook...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="neo-border-b border-b-[6px] bg-blue-500">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-block neo-border neo-shadow-xl bg-yellow-400 px-6 py-3 rotate-1 mb-4">
                <h1 className="text-3xl md:text-5xl font-black uppercase flex items-center gap-3">
                  <BookOpen className="h-8 w-8 md:h-10 md:w-10" strokeWidth={3} />
                  Riwayat Logbook
                </h1>
              </div>
              <p className="text-xl font-bold text-white">
                {logbooks.length} logbook tersimpan
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-lg neo-shadow-xl w-full sm:w-auto">
                  Kembali ke Beranda
                </Button>
              </Link>
              <Link href="/#templates">
                <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg neo-shadow-xl w-full sm:w-auto">
                  <Plus className="h-5 w-5 mr-2" strokeWidth={3} />
                  Buat Baru
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        {logbooks.length === 0 ? (
          <div className="max-w-md mx-auto text-center">
            <div className="neo-border neo-shadow-xl bg-white p-12">
              <div className="neo-border neo-shadow bg-gray-100 p-8 inline-block mb-6">
                <BookOpen className="h-16 w-16 text-gray-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-black uppercase mb-3">Belum Ada Logbook</h2>
              <p className="text-base font-medium text-gray-600 mb-8">
                Mulai buat logbook pertamamu sekarang!
              </p>
              <Link href="/">
                <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Buat Logbook Baru
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {logbooks.map((logbook, idx) => {
              const rotation = idx % 3 === 0 ? '-rotate-1' : idx % 3 === 1 ? 'rotate-1' : '-rotate-2';
              return (
                <div key={logbook.id} className={`neo-border neo-shadow-lg bg-white hover:neo-shadow-xl transition-all neo-lift ${rotation}`}>
                  {/* Header Color Bar */}
                  <div className={`${getTemplateBg(logbook.templateType)} neo-border-b border-b-[3px] p-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black uppercase text-white">
                        {logbook.templateType}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="neo-border neo-shadow bg-red-500 text-white hover:bg-red-600 p-2"
                        onClick={() => handleDelete(logbook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-black uppercase mb-2 truncate">
                      {logbook.header.nama || 'Tanpa Nama'}
                    </h3>
                    <div className="space-y-1 text-sm font-bold text-gray-600 mb-4">
                      <p>NIM: {logbook.header.nim || '-'}</p>
                      <p>Pekan ke-{logbook.header.pekanKe || '-'}</p>
                      <p className="text-xs">
                        📝 {logbook.entries.length} entri
                      </p>
                    </div>
                    <div className="mb-6 text-xs font-medium text-gray-500">
                      Diperbarui {format(new Date(logbook.updatedAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/form/${logbook.templateType}?id=${logbook.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          // TODO: Implement export from history
                          alert('Buka logbook untuk export');
                        }}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="neo-border-t border-t-[6px] bg-white py-10 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block neo-border neo-shadow bg-pink-500 px-6 py-3 -rotate-2 mb-4">
            <p className="flex items-center gap-2 text-lg font-black text-white uppercase">
              Made with <Heart className="h-5 w-5 fill-white" /> by Ridho for Aisyah
            </p>
          </div>
          <p className="font-bold text-gray-600">
            © 2026 LogBook Aisyah. Data tersimpan lokal di perangkat kamu.
          </p>
        </div>
      </footer>
    </div>
  );
}
