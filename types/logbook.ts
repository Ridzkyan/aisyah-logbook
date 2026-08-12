// Base Types
export type TemplateType = 'KKN' | 'PLP' | 'AM';

export type ImageInput = 
  | { type: 'upload'; file: File; preview: string }
  | { type: 'url'; url: string };

// Header Data (common for all templates)
export interface LogbookHeader {
  nama: string;
  nim: string;
  laporan: string; // Auto-filled based on template
  pekanKe: string;
}

// Entry Types for each template
export interface KKNEntry {
  id: string;
  no: number;
  hariTanggal: string;
  programKerja: string;
  deskripsi: string;
  foto: ImageInput | null;
  linkDokumen: string;
}

export interface PLPEntry {
  id: string;
  no: number;
  hariTanggal: string;
  jamPembelajaran: string;
  jamAdministrasi: string;
  jamAdaptasiTeknologi: string;
  kegiatanPembelajaran: string;
  kegiatanAdministrasi: string;
  kegiatanAdaptasiTeknologi: string;
  foto: ImageInput | null;
  linkDokumen: string;
}

export interface AMEntry {
  id: string;
  no: number;
  hariTanggal: string;
  jamMenyusunPerangkat: string;
  jamMelaksanakanPembelajaran: string;
  jamAsesmen: string;
  jamRefleksi: string;
  jamPengambilanData: string;
  deskripsiAktivitas: string;
  foto: ImageInput | null;
  linkDokumen: string;
}

// Footer Data
export interface LogbookFooter {
  // PLP fields
  jumlahJamPembelajaran?: string;
  jumlahJamAdministrasi?: string;
  jumlahJamAdaptasiTeknologi?: string;
  // AM fields
  jumlahJamMenyusunPerangkat?: string;
  jumlahJamMelaksanakanPembelajaran?: string;
  jumlahJamAsesmen?: string;
  jumlahJamRefleksi?: string;
  jumlahJamPengambilanData?: string;
  // Common fields
  analisisKegiatan: string;
  hambatanUpaya: string;
  rencanaPerbaikan: string;
}

// Main Logbook Model
export interface Logbook {
  id: string;
  templateType: TemplateType;
  header: LogbookHeader;
  entries: KKNEntry[] | PLPEntry[] | AMEntry[];
  footer?: LogbookFooter; // Only for PLP and AM
  createdAt: Date;
  updatedAt: Date;
}

// Saved Logbooks in LocalStorage
export interface SavedLogbooks {
  logbooks: Logbook[];
  lastModified: Date;
}

// Type Guards
export function isKKNEntry(entry: any): entry is KKNEntry {
  return 'programKerja' in entry && 'deskripsi' in entry;
}

export function isPLPEntry(entry: any): entry is PLPEntry {
  return 'jamPembelajaran' in entry && 'kegiatanPembelajaran' in entry;
}

export function isAMEntry(entry: any): entry is AMEntry {
  return 'jamMenyusunPerangkat' in entry && 'deskripsiAktivitas' in entry;
}

// Helper to get template display name
export function getTemplateName(type: TemplateType): string {
  const names = {
    KKN: 'Kuliah Kerja Nyata (KKN)',
    PLP: 'Pengenalan Lapangan Persekolahan (PLP)',
    AM: 'Asistensi Mengajar (AM)',
  };
  return names[type];
}

// Helper to get template laporan name
export function getLaporanName(type: TemplateType): string {
  const names = {
    KKN: 'KKN',
    PLP: 'PLP',
    AM: 'Asistensi Mengajar',
  };
  return names[type];
}
