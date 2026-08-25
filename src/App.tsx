import { useState, useEffect } from 'react';
import type { TrackedItem, LogEntry } from './types/tracker';
import {
  getStoredItems,
  saveStoredItems,
  getStoredLogs,
  saveLogEntry,
  deleteTrackedItem,
  deleteLogEntry
} from './utils/storage';
import { getSectorSummaries, calculateWeeklyInsights, formatDateString } from './utils/analytics';
import { Header } from './components/Header';
import { SectorSummaryCards } from './components/SectorSummaryCards';
import { TodayCheckinSection } from './components/TodayCheckinSection';
import { WeeklyInsightsSection } from './components/WeeklyInsightsSection';
import { ItemConfigModal } from './components/ItemConfigModal';
import { HistoryLogModal } from './components/HistoryLogModal';

export function App() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(formatDateString(new Date()));

  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TrackedItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Load initial items & logs from local storage
  const refreshData = () => {
    const loadedItems = getStoredItems();
    const loadedLogs = getStoredLogs();
    setItems(loadedItems);
    setLogs(loadedLogs);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Save or update log entry
  const handleSaveLog = (itemId: string, value: number | boolean | string, remark?: string) => {
    const item = items.find((i) => i.id === itemId);
    let percentageValue: number | undefined;

    if (item && item.inputType === 'percentage' && typeof value === 'number') {
      percentageValue = value;
    }

    saveLogEntry({
      itemId,
      date: currentDate,
      value,
      percentageValue,
      remark
    });

    setLogs(getStoredLogs());
  };

  // Save or update tracked item configuration
  const handleSaveItem = (itemToSave: TrackedItem) => {
    const existingIndex = items.findIndex((i) => i.id === itemToSave.id);
    let updatedItems: TrackedItem[];
    if (existingIndex >= 0) {
      updatedItems = [...items];
      updatedItems[existingIndex] = itemToSave;
    } else {
      updatedItems = [...items, itemToSave];
    }
    saveStoredItems(updatedItems);
    setItems(updatedItems);
    setItemToEdit(null);
  };

  // Delete tracked item (works for both pre-configured defaults and custom items)
  const handleDeleteItem = (itemId: string) => {
    deleteTrackedItem(itemId);
    refreshData();
  };

  // Delete individual log entry
  const handleDeleteLog = (logId: string) => {
    deleteLogEntry(logId);
    setLogs(getStoredLogs());
  };

  const handleOpenEditItem = (item: TrackedItem) => {
    setItemToEdit(item);
    setIsConfigModalOpen(true);
  };

  const handleOpenCreateItem = () => {
    setItemToEdit(null);
    setIsConfigModalOpen(true);
  };

  // Live analytics computations
  const sectorSummaries = getSectorSummaries(items, logs, currentDate);
  const weeklyInsights = calculateWeeklyInsights(items, logs, currentDate);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenConfigModal={handleOpenCreateItem}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onDataImported={refreshData}
        consistencyScore={weeklyInsights.overallConsistencyScore}
      />

      {/* Top Summary Cards per Sector */}
      <SectorSummaryCards
        summaries={sectorSummaries}
        insights={weeklyInsights}
      />

      {/* Main Today Check-in Trackers Section */}
      <TodayCheckinSection
        items={items}
        logs={logs}
        currentDate={currentDate}
        onSaveLog={handleSaveLog}
        onEditItem={handleOpenEditItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Automated Weekly Insights & Comparison Section */}
      <WeeklyInsightsSection
        insights={weeklyInsights}
        items={items}
        logs={logs}
        currentDate={currentDate}
      />

      {/* Item Configuration / Manager Modal */}
      <ItemConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setItemToEdit(null);
        }}
        items={items}
        itemToEdit={itemToEdit}
        onSaveItem={handleSaveItem}
        onDeleteItem={handleDeleteItem}
      />

      {/* Activity Log History Modal */}
      <HistoryLogModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        logs={logs}
        items={items}
        onDeleteLog={handleDeleteLog}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        TrackU • 3-Sector Consistency, Goal & Expense Tracker • Data stored locally in browser
      </footer>
    </div>
  );
}

export default App;
