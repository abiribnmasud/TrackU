import { createClient } from '@supabase/supabase-js';
import type { TrackedItem, LogEntry } from '../types/tracker';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database interface maps
export interface DBTrackedItem {
  id: string;
  title: string;
  sector: string;
  type: string;
  period: string;
  input_type: string;
  unit?: string;
  target_value?: number;
  add_remark: boolean;
  is_default: boolean;
  created_at?: string;
}

export interface DBLogEntry {
  id: string;
  item_id: string;
  date: string;
  value: any;
  percentage_value?: number;
  remark?: string;
  timestamp: number;
}

// Convert app model -> DB model
export const toDBItem = (item: TrackedItem): DBTrackedItem => ({
  id: item.id,
  title: item.title,
  sector: item.sector,
  type: item.type,
  period: item.period,
  input_type: item.inputType,
  unit: item.unit,
  target_value: item.targetValue,
  add_remark: item.addRemark,
  is_default: item.isDefault || false,
  created_at: item.createdAt
});

// Convert DB model -> app model
export const fromDBItem = (db: DBTrackedItem): TrackedItem => ({
  id: db.id,
  title: db.title,
  sector: db.sector as any,
  type: db.type as any,
  period: db.period as any,
  inputType: db.input_type as any,
  unit: db.unit,
  targetValue: db.target_value ? Number(db.target_value) : undefined,
  addRemark: db.add_remark,
  isDefault: db.is_default,
  createdAt: db.created_at || new Date().toISOString()
});

// Convert app log -> DB log
export const toDBLog = (log: LogEntry): DBLogEntry => ({
  id: log.id,
  item_id: log.itemId,
  date: log.date,
  value: log.value,
  percentage_value: log.percentageValue,
  remark: log.remark,
  timestamp: log.timestamp
});

// Convert DB log -> app log
export const fromDBLog = (db: DBLogEntry): LogEntry => ({
  id: db.id,
  itemId: db.item_id,
  date: db.date,
  value: db.value,
  percentageValue: db.percentage_value ? Number(db.percentage_value) : undefined,
  remark: db.remark,
  timestamp: Number(db.timestamp)
});

// Fetch items from Supabase
export const fetchCloudItems = async (): Promise<TrackedItem[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('tracked_items').select('*');
    if (error) {
      console.warn('Supabase fetch items error:', error.message);
      return null;
    }
    return (data || []).map(fromDBItem);
  } catch (err) {
    console.warn('Failed to fetch items from Supabase:', err);
    return null;
  }
};

// Fetch logs from Supabase
export const fetchCloudLogs = async (): Promise<LogEntry[] | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('log_entries').select('*');
    if (error) {
      console.warn('Supabase fetch logs error:', error.message);
      return null;
    }
    return (data || []).map(fromDBLog);
  } catch (err) {
    console.warn('Failed to fetch logs from Supabase:', err);
    return null;
  }
};

// Save items array to Supabase
export const saveCloudItems = async (items: TrackedItem[]): Promise<void> => {
  if (!supabase) return;
  try {
    const dbItems = items.map(toDBItem);
    await supabase.from('tracked_items').upsert(dbItems, { onConflict: 'id' });
  } catch (err) {
    console.error('Failed to sync items to Supabase:', err);
  }
};

// Save single log entry to Supabase
export const saveCloudLog = async (log: LogEntry): Promise<void> => {
  if (!supabase) return;
  try {
    const dbLog = toDBLog(log);
    await supabase.from('log_entries').upsert(dbLog, { onConflict: 'id' });
  } catch (err) {
    console.error('Failed to sync log entry to Supabase:', err);
  }
};

// Delete item from Supabase
export const deleteCloudItem = async (itemId: string): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.from('tracked_items').delete().eq('id', itemId);
  } catch (err) {
    console.error('Failed to delete item from Supabase:', err);
  }
};

// Delete log entry from Supabase
export const deleteCloudLog = async (logId: string): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.from('log_entries').delete().eq('id', logId);
  } catch (err) {
    console.error('Failed to delete log entry from Supabase:', err);
  }
};
