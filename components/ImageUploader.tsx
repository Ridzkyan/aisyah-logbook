'use client';

import { useRef } from 'react';
import { ImageInput } from '@/types/logbook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Plus } from 'lucide-react';
import { compressImage, validateImageFile, validateImageUrl } from '@/lib/image';
import { useState } from 'react';

interface ImageUploaderProps {
  value: ImageInput[];
  onChange: (value: ImageInput[]) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await compressImage(file);
      onChange([...value, { type: 'upload', file, preview: base64 }]);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal upload gambar');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length === 0) {
      alert('File harus berupa gambar (JPG, PNG, GIF, WebP)');
      return;
    }
    files.forEach((file) => handleFile(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => handleFile(file));
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    if (!validateImageUrl(urlInput)) {
      alert('URL tidak valid. Harus dimulai dengan http:// atau https://');
      return;
    }
    onChange([...value, { type: 'url', url: urlInput }]);
    setUrlInput('');
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Existing photos — stacked vertically */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((foto, index) => {
            const previewUrl = foto.type === 'upload' ? foto.preview : foto.url;
            const label =
              foto.type === 'upload' ? foto.file.name : foto.url;
            return (
              <div
                key={index}
                className="neo-border neo-shadow bg-white p-3 flex items-center gap-3"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 neo-border h-14 w-14 overflow-hidden bg-gray-100">
                  <img
                    src={previewUrl}
                    alt={`Foto ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56"%3E%3Crect fill="%23ddd" width="56" height="56"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase text-gray-500 mb-0.5">
                    {foto.type === 'upload' ? `Foto ${index + 1}` : `URL ${index + 1}`}
                  </p>
                  <p className="text-xs font-medium text-gray-700 truncate">{label}</p>
                </div>

                {/* Remove */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="flex-shrink-0 h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('upload')}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button
          type="button"
          variant={mode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('url')}
          className="flex-1"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          URL
        </Button>
      </div>

      {mode === 'upload' ? (
        <div
          className={`neo-border neo-shadow bg-white p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          {isUploading ? (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
              <p className="text-sm font-bold uppercase">Uploading...</p>
            </>
          ) : (
            <>
              <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" strokeWidth={2} />
              <p className="text-sm font-bold uppercase mb-1">
                {isDragging ? 'Drop gambar disini!' : 'Tambah Foto'}
              </p>
              <p className="text-xs font-medium text-gray-600">
                Drag & drop atau klik • bisa pilih banyak file (Max 2MB/foto)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            className="w-full"
            variant="secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah URL
          </Button>
        </div>
      )}
    </div>
  );
}
