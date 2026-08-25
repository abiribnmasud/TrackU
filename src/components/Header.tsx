import React, { useRef } from 'react';
import { Calendar, Download, Upload, PlusCircle, Activity, History, Menu } from 'lucide-react';
import { exportDataJSON, importDataJSON } from '../utils/storage';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onOpenConfigModal: () => void;
  onOpenHistoryModal: () => void;
  onDataImported: () => void;
  consistencyScore: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  onOpenConfigModal,
  onOpenHistoryModal,
  onDataImported,
  consistencyScore,
  onToggleMobileMenu
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracku-backup-${currentDate}.json`;
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
          alert('Failed to import JSON data. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <header className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Mobile Hamburger Button + Brand logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="btn-secondary hamburger-btn"
              style={{ padding: '8px', minHeight: '40px' }}
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #8b5cf6 50%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}>
              <Activity size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                TrackU
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                3-Sector Consistency
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Consistency Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Calendar size={15} color="var(--text-muted)" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                outline: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            />
            {!isToday && (
              <button
                onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
                className="btn-secondary"
                style={{ padding: '2px 6px', fontSize: '0.7rem', minHeight: '26px' }}
              >
                Today
              </button>
            )}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            color: '#a78bfa',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <span>Score: {consistencyScore}%</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={onOpenHistoryModal} className="btn-secondary" title="View History Logs">
            <History size={16} />
            <span style={{ fontSize: '0.8rem' }}>Logs</span>
          </button>

          <button onClick={handleExport} className="btn-secondary" title="Export Backup JSON">
            <Download size={16} />
          </button>

          <button onClick={handleImportClick} className="btn-secondary" title="Import Backup JSON">
            <Upload size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button onClick={onOpenConfigModal} className="btn-primary">
            <PlusCircle size={16} />
            <span style={{ fontSize: '0.85rem' }}>Items</span>
          </button>
        </div>

      </div>
    </header>
  );
};
