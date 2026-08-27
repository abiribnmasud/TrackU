import { useState, useEffect } from 'react';
import type { TrackedItem, LogEntry } from './types/tracker';
import {
  getStoredItems,
  saveStoredItems,
  getStoredLogs,
  saveLogEntry,
  deleteTrackedItem,
  deleteLogEntry,
  syncWithSupabaseCloud
} from './utils/storage';
import { getSectorSummaries, calculateWeeklyInsights, formatDateString } from './utils/analytics';
import { getCurrentUser, logoutUser } from './utils/auth';
import type { UserSession } from './utils/auth';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { SectorSummaryCards } from './components/SectorSummaryCards';
import { TodayCheckinSection } from './components/TodayCheckinSection';
import { WeeklyInsightsSection } from './components/WeeklyInsightsSection';
import { ItemConfigModal } from './components/ItemConfigModal';
import { HistoryLogModal } from './components/HistoryLogModal';
import { ProfilePage } from './components/ProfilePage';
import { SectorFullPageView } from './components/SectorFullPageView';

export function App() {
  const [user, setUser] = useState<UserSession | null>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [items, setItems] = useState<TrackedItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(formatDateString(new Date()));

  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TrackedItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Load items & logs from storage & sync Supabase cloud
  const refreshData = () => {
    const loadedItems = getStoredItems();
    const loadedLogs = getStoredLogs();
    setItems(loadedItems);
    setLogs(loadedLogs);
  };

  useEffect(() => {
    refreshData();
    syncWithSupabaseCloud().then((synced) => {
      if (synced) {
        setItems(synced.items);
        setLogs(synced.logs);
      }
    });
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // If user is not logged in, render the Login Screen overlay
  if (!user) {
    return <LoginPage onLoginSuccess={(session) => setUser(session)} />;
  }

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

  // Delete tracked item
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
    <div className="app-container">
      
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
        consistencyScore={weeklyInsights.overallConsistencyScore}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, minWidth: 0 }}>
        
        {/* Top Header with Mobile Hamburger Menu Toggle */}
        <Header
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onOpenConfigModal={handleOpenCreateItem}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          onDataImported={refreshData}
          consistencyScore={weeklyInsights.overallConsistencyScore}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <SectorSummaryCards
              summaries={sectorSummaries}
              insights={weeklyInsights}
              onSelectSectorBreakdown={(sector) => setActiveTab(sector as NavTab)}
            />

            <TodayCheckinSection
              items={items}
              logs={logs}
              currentDate={currentDate}
              onSaveLog={handleSaveLog}
              onEditItem={handleOpenEditItem}
              onDeleteItem={handleDeleteItem}
              forcedSectorFilter="all"
            />

            <WeeklyInsightsSection
              insights={weeklyInsights}
              items={items}
              logs={logs}
              currentDate={currentDate}
            />
          </>
        )}

        {/* TAB 2: FITNESS FULL PAGE VIEW */}
        {activeTab === 'fitness' && (
          <SectorFullPageView
            sector="fitness"
            items={items}
            logs={logs}
            currentDate={currentDate}
            onSaveLog={handleSaveLog}
            onEditItem={handleOpenEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* TAB 3: GROWTH FULL PAGE VIEW */}
        {activeTab === 'growth' && (
          <SectorFullPageView
            sector="growth"
            items={items}
            logs={logs}
            currentDate={currentDate}
            onSaveLog={handleSaveLog}
            onEditItem={handleOpenEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* TAB 4: FINANCE FULL PAGE VIEW */}
        {activeTab === 'finance' && (
          <SectorFullPageView
            sector="finance"
            items={items}
            logs={logs}
            currentDate={currentDate}
            onSaveLog={handleSaveLog}
            onEditItem={handleOpenEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            items={items}
            logs={logs}
            insights={weeklyInsights}
            onDataImported={refreshData}
          />
        )}

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          TrackU • Logged in as <strong>{user.name}</strong> • Permanent session active
        </footer>
      </main>

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

    </div>
  );
}

export default App;
