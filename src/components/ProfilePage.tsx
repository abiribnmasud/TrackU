import React, { useRef } from 'react';
import { Award, Dumbbell, Sprout, DollarSign, Download, Upload, ShieldCheck, Database } from 'lucide-react';
import type { UserSession } from '../utils/auth';
import type { TrackedItem, LogEntry, WeeklyInsightSummary } from '../types/tracker';
import { exportDataJSON, importDataJSON } from '../utils/storage';
import { isSupabaseConfigured } from '../utils/supabase';

interface ProfilePageProps {
  user: UserSession;
  items: TrackedItem[];
  logs?: LogEntry[];
  insights: WeeklyInsightSummary;
  onDataImported: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  items,
  insights,
  onDataImported
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fitnessCount = items.filter((i) => i.sector === 'fitness').length;
  const growthCount = items.filter((i) => i.sector === 'growth').length;
  const financeCount = items.filter((i) => i.sector === 'finance').length;

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracku-profile-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Data imported successfully!');
          onDataImported();
        } else {
          alert('Failed to import JSON data.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header Card */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '160px',
          height: '160px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #8b5cf6, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{user.name}</h2>
              <span className="sector-badge fitness" style={{ fontSize: '0.72rem' }}>
                <ShieldCheck size={12} /> Verified Account
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              TrackU Member • Persistent Session Active (No Inactive Timeout)
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Award size={16} /> Weekly Consistency
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {insights.overallConsistencyScore}%
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Calculated across all 3 sectors
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Dumbbell size={16} /> Fitness Trackers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {fitnessCount} items
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Workouts, running, hydration
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Sprout size={16} /> Growth Trackers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {growthCount} items
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Guitar, meditation, study
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
            <DollarSign size={16} /> Finance Trackers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            {financeCount} items
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Expenses, bills, savings
          </p>
        </div>

      </div>

      {/* Cloud & Backup Management Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#a78bfa" /> Data Management & Sync Status
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Supabase Cloud Database Status
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isSupabaseConfigured()
                ? '✅ Connected & Syncing automatically in real-time.'
                : '⚠️ Operating in Local Storage mode.'}
            </div>
          </div>

          <span className={`sector-badge ${isSupabaseConfigured() ? 'fitness' : 'finance'}`}>
            {isSupabaseConfigured() ? 'Cloud Sync Active' : 'Local Storage Mode'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} /> Export Backup (.json)
          </button>
          <button onClick={handleImportClick} className="btn-secondary">
            <Upload size={16} /> Import Backup (.json)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
      </div>

    </div>
  );
};
