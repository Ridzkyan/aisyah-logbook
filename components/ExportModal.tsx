'use client';

import React, { useState, useEffect } from 'react';
import { useLogbook } from '@/contexts/LogbookContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, FileDown, Loader2 } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Logbook</DialogTitle>
          <DialogDescription>
            Simpan logbook kamu ke dalam format dokumen Word (.docx)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-xs text-blue-700 font-medium rounded-r-md">
            <p><strong>Tips PDF:</strong> Untuk hasil PDF yang 100% identik dengan template, buka file Word hasil export lalu gunakan fitur <strong>Save As &gt; PDF</strong> di Microsoft Word Anda.</p>
          </div>

          {/* Filename Input */}
          <div className="space-y-2">
            <Label htmlFor="filename">Nama File</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Nama file..."
            />
            <p className="text-xs text-gray-500">
              File akan disimpan sebagai: <span className="font-bold">{filename}.docx</span>
            </p>
          </div>

          {/* Preview Info */}
          {logbook && (
            <div className="neo-border bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase text-gray-700 mb-2">Info Logbook</p>
              <div className="space-y-1 text-xs font-medium text-gray-600">
                <p>Template: <span className="font-bold text-black">{logbook.templateType}</span></p>
                <p>Nama: <span className="font-bold text-black">{logbook.header.nama || '-'}</span></p>
                <p>Pekan: <span className="font-bold text-black">{logbook.header.pekanKe || '-'}</span></p>
                <p>Total Entry: <span className="font-bold text-black">{logbook.entries.length}</span></p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Export Word (.docx)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
