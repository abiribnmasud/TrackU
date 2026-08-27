import type { TrackedItem, LogEntry } from '../types/tracker';
import {
  isSupabaseConfigured,
  fetchCloudItems,
  fetchCloudLogs,
  saveCloudItems,
  saveCloudLog,
  deleteCloudItem,
  deleteCloudLog
} from './supabase';

const STORAGE_KEY_ITEMS = 'tracku_items_v1';
const STORAGE_KEY_LOGS = 'tracku_logs_v1';

export const DEFAULT_ITEMS: TrackedItem[] = [
  {
    id: 'default-fit-1',
    title: 'Workout 30 mins',
    sector: 'fitness',
    type: 'goal',
    period: 'daily',
    inputType: 'percentage',
    unit: 'mins',
    targetValue: 30,
    addRemark: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-fit-2',
    title: 'Exercise 20 mins',
    sector: 'fitness',
    type: 'goal',
    period: 'daily',
    inputType: 'percentage',
    unit: 'mins',
    targetValue: 20,
    addRemark: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-gro-1',
    title: 'Guitar practice 30 mins',
    sector: 'growth',
    type: 'habit',
    period: 'daily',
    inputType: 'percentage',
    unit: 'mins',
    targetValue: 30,
    addRemark: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-gro-2',
    title: 'Meditation 15 mins',
    sector: 'growth',
    type: 'habit',
    period: 'daily',
    inputType: 'percentage',
    unit: 'mins',
    targetValue: 15,
    addRemark: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-gro-3',
    title: 'Study 30 mins',
    sector: 'growth',
    type: 'habit',
    period: 'daily',
    inputType: 'percentage',
    unit: 'mins',
    targetValue: 30,
    addRemark: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-fin-1',
    title: 'Smoking bills',
    sector: 'finance',
    type: 'expense',
    period: 'daily',
    inputType: 'number',
    unit: '$',
    targetValue: 0,
    addRemark: false,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-fin-2',
    title: 'Transportation expense',
    sector: 'finance',
    type: 'expense',
    period: 'daily',
    inputType: 'number',
    unit: '$',
    targetValue: 0,
    addRemark: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

export const getStoredItems = (): TrackedItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(DEFAULT_ITEMS));
      return DEFAULT_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tracked items:', err);
    return DEFAULT_ITEMS;
  }
};

export const saveStoredItems = (items: TrackedItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    if (isSupabaseConfigured()) {
      saveCloudItems(items);
    }
  } catch (err) {
    console.error('Failed to save tracked items:', err);
  }
};

export const getStoredLogs = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load log entries:', err);
    return [];
  }
};

export const saveStoredLogs = (logs: LogEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save log entries:', err);
  }
};

export const saveLogEntry = (entry: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry => {
  const logs = getStoredLogs();
  const timestamp = Date.now();

  const updatedEntry: LogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp
  };

  logs.push(updatedEntry);
  saveStoredLogs(logs);

  if (isSupabaseConfigured()) {
    saveCloudLog(updatedEntry);
  }

  return updatedEntry;
};

export const deleteLogEntry = (logId: string): void => {
  const logs = getStoredLogs().filter((l) => l.id !== logId);
  saveStoredLogs(logs);

  if (isSupabaseConfigured()) {
    deleteCloudLog(logId);
  }
};

export const deleteTrackedItem = (itemId: string): void => {
  const items = getStoredItems().filter((i) => i.id !== itemId);
  saveStoredItems(items);

  const logs = getStoredLogs().filter((l) => l.itemId !== itemId);
  saveStoredLogs(logs);

  if (isSupabaseConfigured()) {
    deleteCloudItem(itemId);
  }
};

// Initial sync on app boot if Supabase is connected
export const syncWithSupabaseCloud = async (): Promise<{ items: TrackedItem[]; logs: LogEntry[] } | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const cloudItems = await fetchCloudItems();
    const cloudLogs = await fetchCloudLogs();

    if (cloudItems && cloudItems.length > 0) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(cloudItems));
    } else {
      // If cloud table is empty, seed initial items to Supabase
      const localItems = getStoredItems();
      saveCloudItems(localItems);
    }

    if (cloudLogs && cloudLogs.length > 0) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(cloudLogs));
    }

    return {
      items: getStoredItems(),
      logs: getStoredLogs()
    };
  } catch (err) {
    console.error('Supabase cloud sync failed:', err);
    return null;
  }
};

export const exportDataJSON = (): string => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    items: getStoredItems(),
    logs: getStoredLogs()
  };
  return JSON.stringify(data, null, 2);
};

export const importDataJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.items) && Array.isArray(data.logs)) {
      saveStoredItems(data.items);
      saveStoredLogs(data.logs);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import JSON data:', err);
    return false;
  }
};
