'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { LogbookProvider } from '@/contexts/LogbookContext';
import { LocalStorageService } from '@/lib/storage';
import { generateUUID } from '@/lib/uuid';
import { Logbook, TemplateType, getLaporanName } from '@/types/logbook';
import FormContent from '@/components/FormContent';

export default function FormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [logbook, setLogbook] = useState<Logbook | null>(null);
  const [loading, setLoading] = useState(true);

  const templateType = params.templateType as TemplateType;
  const logbookId = searchParams.get('id');

  useEffect(() => {
    // Validate template type
    if (!['KKN', 'PLP', 'AM'].includes(templateType)) {
      router.push('/');
      return;
    }

    // Load existing or create new logbook
    if (logbookId) {
      const existing = LocalStorageService.getById(logbookId);
      if (existing && existing.templateType === templateType) {
        setLogbook(existing);
      } else {
        router.push('/');
        return;
      }
    } else {
      // Create new logbook
      const newLogbook: Logbook = {
        id: generateUUID(),
        templateType,
        header: {
          nama: '',
          nim: '',
          laporan: getLaporanName(templateType),
          pekanKe: '',
        },
        entries: [],
        footer: templateType !== 'KKN' ? {
          analisisKegiatan: '',
          hambatanUpaya: '',
          rencanaPerbaikan: '',
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLogbook(newLogbook);
    }

    setLoading(false);
  }, [templateType, logbookId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!logbook) {
    return null;
  }

  return (
    <LogbookProvider initialLogbook={logbook}>
      <FormContent />
    </LogbookProvider>
  );
}
