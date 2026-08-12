import { Logbook, SavedLogbooks } from '@/types/logbook';
import { generateUUID } from './uuid';

export class LocalStorageService {
  private static KEY = 'logbooks-aisyah';

  static getAll(): Logbook[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return [];
      
      const parsed: SavedLogbooks = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return parsed.logbooks.map(logbook => ({
        ...logbook,
        createdAt: new Date(logbook.createdAt),
        updatedAt: new Date(logbook.updatedAt),
      }));
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  static getById(id: string): Logbook | null {
    const logbooks = this.getAll();
    return logbooks.find(l => l.id === id) || null;
  }

  static save(logbook: Logbook): void {
    if (typeof window === 'undefined') return;

    try {
      const logbooks = this.getAll();
      const index = logbooks.findIndex(l => l.id === logbook.id);

      if (index >= 0) {
        logbooks[index] = { ...logbook, updatedAt: new Date() };
      } else {
        logbooks.push({ ...logbook, createdAt: new Date(), updatedAt: new Date() });
      }

      const data: SavedLogbooks = {
        logbooks,
        lastModified: new Date(),
      };

      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some logbooks.');
      }
      throw error;
    }
  }

  static delete(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const logbooks = this.getAll().filter(l => l.id !== id);
      const data: SavedLogbooks = {
        logbooks,
        lastModified: new Date(),
      };

      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
      throw error;
    }
  }

  static duplicate(id: string): Logbook {
    const logbook = this.getById(id);
    if (!logbook) throw new Error('Logbook not found');

    const duplicated: Logbook = {
      ...logbook,
      id: generateUUID(),
      header: {
        ...logbook.header,
        pekanKe: '', // Reset week number for duplicate
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.save(duplicated);
    return duplicated;
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.KEY);
  }
}
