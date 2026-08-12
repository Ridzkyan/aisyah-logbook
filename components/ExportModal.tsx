'use client';

import React, { useState, useEffect } from 'react';
import { useLogbook } from '@/contexts/LogbookContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, FileDown, Loader2, Heart } from 'lucide-react';
import { exportToWordTemplate } from '@/lib/export/word-template';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const { logbook } = useLogbook();
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Generate default filename
  const getDefaultFilename = () => {
    if (!logbook) return 'Logbook';
    const { templateType, header } = logbook;
    const parts = [
      'Logbook',
      templateType,
      header.nama || 'Untitled',
      header.pekanKe ? `Pekan${header.pekanKe}` : '',
    ].filter(Boolean);
    return parts.join('_').replace(/\s+/g, '_');
  };

  // Set default filename when dialog opens
  useEffect(() => {
    if (open && !filename) {
      setFilename(getDefaultFilename());
    }
  }, [open]);

  const handleExport = async () => {
    if (!logbook) {
      alert('Tidak ada data logbook');
      return;
    }

    if (!filename.trim()) {
      alert('Nama file tidak boleh kosong');
      return;
    }

    setIsExporting(true);
    try {
      await exportToWordTemplate(logbook, filename);
      
      // Show success message
      setTimeout(() => {
        onOpenChange(false);
        setIsExporting(false);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert(error instanceof Error ? error.message : 'Gagal export logbook');
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 rounded-2xl shadow-2xl bg-white overflow-hidden p-0">
        <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400"></div>
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-800 flex items-center gap-2">
              Export Logbook <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Simpan logbook kamu ke dalam format dokumen Word (.docx)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-blue-50/50 border border-blue-100 p-4 text-sm text-blue-700 rounded-xl">
              <p><strong>Tips PDF:</strong> Untuk hasil PDF yang 100% identik dengan template, buka file Word hasil export lalu gunakan fitur <strong>Save As &gt; PDF</strong> di Microsoft Word Anda.</p>
            </div>

            {/* Filename Input */}
            <div className="space-y-3">
              <Label htmlFor="filename" className="text-gray-700 font-semibold">Nama File</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Nama file..."
                className="rounded-lg border-gray-200 focus-visible:ring-pink-400 shadow-sm"
              />
              <p className="text-xs text-gray-500">
                File akan disimpan sebagai: <span className="font-bold text-gray-700">{filename}.docx</span>
              </p>
            </div>

            {/* Preview Info */}
            {logbook && (
              <div className="relative rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5 shadow-sm overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                  <Heart className="w-24 h-24 text-pink-500 fill-pink-500" />
                </div>
                <p className="text-xs font-bold uppercase text-pink-600 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Info Logbook
                </p>
                <div className="space-y-2 text-sm text-gray-600 relative z-10">
                  <p className="flex justify-between">
                    <span>Template:</span>
                    <span className="font-bold text-gray-900">{logbook.templateType}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Nama:</span>
                    <span className="font-bold text-gray-900">{logbook.header.nama || '-'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Pekan:</span>
                    <span className="font-bold text-gray-900">{logbook.header.pekanKe || '-'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Total Entry:</span>
                    <span className="font-bold text-gray-900">{logbook.entries.length}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
              className="rounded-full border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting || !filename.trim()}
              className="rounded-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Word (.docx)
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
