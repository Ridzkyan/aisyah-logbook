'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Logbook, KKNEntry, PLPEntry, AMEntry, LogbookHeader, LogbookFooter, TemplateType } from '@/types/logbook';
import { LocalStorageService } from '@/lib/storage';
import { generateUUID } from '@/lib/uuid';

interface LogbookContextValue {
  logbook: Logbook | null;
  isSaving: boolean;
  setLogbook: (logbook: Logbook) => void;
  updateHeader: (header: Partial<LogbookHeader>) => void;
  addEntry: () => void;
  updateEntry: (id: string, entry: Partial<KKNEntry | PLPEntry | AMEntry>) => void;
  deleteEntry: (id: string) => void;
  reorderEntry: (id: string, direction: 'up' | 'down') => void;
  updateFooter: (footer: Partial<LogbookFooter>) => void;
  saveToStorage: () => void;
}

const LogbookContext = createContext<LogbookContextValue | null>(null);

type LogbookAction =
  | { type: 'SET_LOGBOOK'; payload: Logbook }
  | { type: 'UPDATE_HEADER'; payload: Partial<LogbookHeader> }
  | { type: 'ADD_ENTRY' }
  | { type: 'UPDATE_ENTRY'; payload: { id: string; entry: Partial<any> } }
  | { type: 'DELETE_ENTRY'; payload: string }
  | { type: 'REORDER_ENTRY'; payload: { id: string; direction: 'up' | 'down' } }
  | { type: 'UPDATE_FOOTER'; payload: Partial<LogbookFooter> }
  | { type: 'SET_SAVING'; payload: boolean };

function createEmptyEntry(templateType: TemplateType, no: number): KKNEntry | PLPEntry | AMEntry {
  const base = {
    id: generateUUID(),
    no,
    hariTanggal: '',
    fotos: [],
    linkDokumen: '',
  };

  switch (templateType) {
    case 'KKN':
      return { ...base, programKerja: '', deskripsi: '' };
    case 'PLP':
      return {
        ...base,
        jamPembelajaran: '',
        jamAdministrasi: '',
        jamAdaptasiTeknologi: '',
        kegiatanPembelajaran: '',
        kegiatanAdministrasi: '',
        kegiatanAdaptasiTeknologi: '',
      };
    case 'AM':
      return {
        ...base,
        jamMenyusunPerangkat: '',
        jamMelaksanakanPembelajaran: '',
        jamAsesmen: '',
        jamRefleksi: '',
        jamPengambilanData: '',
        deskripsiAktivitas: '',
      };
  }
}

function logbookReducer(state: Logbook | null, action: LogbookAction): Logbook | null {
  if (!state) return null;

  switch (action.type) {
    case 'SET_LOGBOOK':
      return action.payload;

    case 'UPDATE_HEADER':
      return {
        ...state,
        header: { ...state.header, ...action.payload },
        updatedAt: new Date(),
      };

    case 'ADD_ENTRY': {
      const newEntry = createEmptyEntry(state.templateType, state.entries.length + 1);
      return {
        ...state,
        entries: [...state.entries, newEntry] as typeof state.entries,
        updatedAt: new Date(),
      };
    }

    case 'UPDATE_ENTRY': {
      const updatedEntries = state.entries.map((entry: any) =>
        entry.id === action.payload.id ? { ...entry, ...action.payload.entry } : entry
      );
      return {
        ...state,
        entries: updatedEntries as typeof state.entries,
        updatedAt: new Date(),
      };
    }

    case 'DELETE_ENTRY': {
      const filtered = state.entries.filter((entry: any) => entry.id !== action.payload);
      // Renumber entries
      const renumbered = filtered.map((entry: any, index) => ({ ...entry, no: index + 1 }));
      return {
        ...state,
        entries: renumbered as typeof state.entries,
        updatedAt: new Date(),
      };
    }

    case 'REORDER_ENTRY': {
      const { id, direction } = action.payload;
      const index = state.entries.findIndex((e: any) => e.id === id);
      if (index === -1) return state;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= state.entries.length) return state;

      const reordered = [...state.entries];
      [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
      
      // Renumber
      const renumberedReordered = reordered.map((entry: any, idx) => ({ ...entry, no: idx + 1 }));

      return {
        ...state,
        entries: renumberedReordered as typeof state.entries,
        updatedAt: new Date(),
      };
    }

    case 'UPDATE_FOOTER':
      return {
        ...state,
        footer: { ...state.footer, ...action.payload } as LogbookFooter,
        updatedAt: new Date(),
      };

    default:
      return state;
  }
}

export function LogbookProvider({ children, initialLogbook }: { children: React.ReactNode; initialLogbook: Logbook | null }) {
  const [logbook, dispatch] = useReducer(logbookReducer, initialLogbook);
  const [isSaving, setIsSaving] = React.useState(false);

  // Auto-save with debounce
  useEffect(() => {
    if (!logbook) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      try {
        LocalStorageService.save(logbook);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [logbook]);

  const saveToStorage = useCallback(() => {
    if (!logbook) return;
    setIsSaving(true);
    try {
      LocalStorageService.save(logbook);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Gagal menyimpan logbook');
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [logbook]);

  const value: LogbookContextValue = {
    logbook,
    isSaving,
    setLogbook: (lb) => dispatch({ type: 'SET_LOGBOOK', payload: lb }),
    updateHeader: (header) => dispatch({ type: 'UPDATE_HEADER', payload: header }),
    addEntry: () => dispatch({ type: 'ADD_ENTRY' }),
    updateEntry: (id, entry) => dispatch({ type: 'UPDATE_ENTRY', payload: { id, entry } }),
    deleteEntry: (id) => dispatch({ type: 'DELETE_ENTRY', payload: id }),
    reorderEntry: (id, direction) => dispatch({ type: 'REORDER_ENTRY', payload: { id, direction } }),
    updateFooter: (footer) => dispatch({ type: 'UPDATE_FOOTER', payload: footer }),
    saveToStorage,
  };

  return <LogbookContext.Provider value={value}>{children}</LogbookContext.Provider>;
}

export function useLogbook() {
  const context = useContext(LogbookContext);
  if (!context) {
    throw new Error('useLogbook must be used within LogbookProvider');
  }
  return context;
}
