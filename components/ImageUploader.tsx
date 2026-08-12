'use client';

import { useState, useRef } from 'react';
import { ImageInput } from '@/types/logbook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { compressImage, validateImageFile, validateImageUrl } from '@/lib/image';

interface ImageUploaderProps {
  value: ImageInput | null;
  onChange: (value: ImageInput | null) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value?.type === 'url' ? value.url : '');
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
      onChange({ type: 'upload', file, preview: base64 });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal upload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    } else {
      alert('File harus berupa gambar (JPG, PNG, GIF, WebP)');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      onChange(null);
      return;
    }

    if (!validateImageUrl(urlInput)) {
      alert('URL tidak valid. Harus dimulai dengan http:// atau https://');
      return;
    }

    onChange({ type: 'url', url: urlInput });
  };

  const handleRemove = () => {
    onChange(null);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render preview
  if (value) {
    const previewUrl = value.type === 'upload' ? value.preview : value.url;
    
    return (
      <div className="neo-border neo-shadow bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="neo-border h-20 w-20 overflow-hidden bg-gray-100">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase text-gray-700 mb-1">
              {value.type === 'upload' ? 'File Terupload' : 'URL Gambar'}
            </p>
            {value.type === 'upload' ? (
              <p className="text-xs font-medium text-gray-600 break-all">{value.file.name}</p>
            ) : (
              <p className="text-xs font-medium text-gray-600 break-all">{value.url}</p>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
          className={`neo-border neo-shadow bg-white p-8 text-center cursor-pointer transition-colors ${
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
            onChange={handleFileSelect}
            className="hidden"
          />
          <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" strokeWidth={2} />
          {isUploading ? (
            <p className="text-sm font-bold uppercase">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-bold uppercase mb-1">
                {isDragging ? 'Drop gambar disini!' : 'Drag & Drop gambar'}
              </p>
              <p className="text-xs font-medium text-gray-600">
                atau klik untuk pilih file (Max 2MB)
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
            Set URL
          </Button>
        </div>
      )}
    </div>
  );
}
