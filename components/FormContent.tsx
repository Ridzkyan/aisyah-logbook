'use client';

import { useState } from 'react';
import { useLogbook } from '@/contexts/LogbookContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Save, Cloud, CloudOff, Eye, EyeOff, FileDown } from 'lucide-react';
import Link from 'next/link';
import HeaderForm from '@/components/HeaderForm';
import EntryList from '@/components/EntryList';
import FooterForm from '@/components/FooterForm';
import LivePreview from '@/components/LivePreview';
import ExportModal from '@/components/ExportModal';
import { getTemplateName } from '@/types/logbook';

export default function FormContent() {
  const { logbook, addEntry, saveToStorage, isSaving } = useLogbook();
  const [showPreview, setShowPreview] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  if (!logbook) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 neo-border-b border-b-[4px] bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/history">
                <Button variant="outline" size="icon" className="neo-lift">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg md:text-xl font-black uppercase">
                  {getTemplateName(logbook.templateType)}
                </h1>
                <p className="text-xs font-bold text-gray-600">
                  {logbook.header.nama || 'Logbook Baru'} • Pekan {logbook.header.pekanKe || '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Auto-save indicator */}
              <div className="hidden sm:flex items-center gap-2 neo-border neo-shadow bg-white px-3 py-2">
                {isSaving ? (
                  <>
                    <Cloud className="h-4 w-4 animate-pulse text-blue-600" />
                    <span className="text-xs font-bold">Saving...</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold text-green-600">Saved</span>
                  </>
                )}
              </div>
              <Button onClick={saveToStorage} variant="outline" size="sm" className="hidden md:flex neo-lift">
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
              <Button 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline" 
                size="sm"
                className="hidden lg:flex neo-lift"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Section */}
        <div className={`flex-1 overflow-auto transition-all ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Header Form */}
              <HeaderForm />

              {/* Entries Section */}
              <div className="neo-border neo-shadow-lg bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase">Daftar Kegiatan</h2>
                  <Button onClick={addEntry} size="sm" className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Entry
                  </Button>
                </div>
                <EntryList />
              </div>

              {/* Footer Form (only for PLP and AM) */}
              {logbook.templateType !== 'KKN' && <FooterForm />}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pb-8">
                <Link href="/history">
                  <Button variant="outline" className="w-full sm:w-auto neo-lift">
                    Kembali ke Riwayat
                  </Button>
                </Link>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none neo-lift lg:hidden"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    className="flex-1 sm:flex-none bg-yellow-400 text-black hover:bg-yellow-500" 
                    onClick={() => setExportModalOpen(true)}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section - Desktop Only */}
        {showPreview && (
          <div className="hidden lg:block lg:w-1/2 neo-border-l border-l-[4px] bg-white overflow-auto">
            <div className="sticky top-0 neo-border-b border-b-[3px] bg-yellow-400 p-4 z-10">
              <h3 className="text-lg font-black uppercase text-center">Live Preview</h3>
            </div>
            <LivePreview />
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="sticky top-0 neo-border-b border-b-[4px] bg-yellow-400 p-4 flex items-center justify-between">
            <h3 className="text-lg font-black uppercase">Preview</h3>
            <Button variant="ghost" onClick={() => setShowPreview(false)}>
              <EyeOff className="h-5 w-5" />
            </Button>
          </div>
          <div className="overflow-auto h-[calc(100vh-64px)]">
            <LivePreview />
          </div>
        </div>
      )}
    </div>
  );
}
