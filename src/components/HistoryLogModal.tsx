import React, { useState } from 'react';
import { X, Trash2, Calendar, MessageSquare } from 'lucide-react';
import type { LogEntry, TrackedItem, SectorType } from '../types/tracker';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  items: TrackedItem[];
  onDeleteLog: (logId: string) => void;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  items,
  onDeleteLog
}) => {
  const [selectedSector, setSelectedSector] = useState<SectorType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const itemsMap = new Map<string, TrackedItem>();
  items.forEach((i) => itemsMap.set(i.id, i));

  // Sorted logs (newest timestamp / date first)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const filteredLogs = sortedLogs.filter((log) => {
    const item = itemsMap.get(log.itemId);
    if (!item) return false;

    if (selectedSector !== 'all' && item.sector !== selectedSector) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchRemark = (log.remark || '').toLowerCase().includes(q);
      const matchDate = log.date.includes(q);
      return matchTitle || matchRemark || matchDate;
    }

    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Consistency & Activity Log History</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Timeline of all logged entries, percentages, expenses, and remarks.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, date, or remark..."
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            {(['all', 'fitness', 'growth', 'finance'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`btn-secondary ${selectedSector === sec ? 'active' : ''}`}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  background: selectedSector === sec ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  borderColor: selectedSector === sec ? 'var(--border-bright)' : 'transparent'
                }}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No history log entries match your filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const item = itemsMap.get(log.itemId);
              if (!item) return null;

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`sector-badge ${item.sector}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {item.sector}
                      </span>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>{item.title}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {log.date}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>Value:</strong>
                      {item.inputType === 'percentage' && (
                        <span style={{ color: '#34d399', fontWeight: 700 }}>
                          {log.value}% completion
                        </span>
                      )}
                      {item.inputType === 'number' && (
                        <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                          {log.value} {item.unit || ''}
                        </span>
                      )}
                      {item.inputType === 'boolean' && (
                        <span style={{ color: log.value === true ? '#34d399' : '#f87171', fontWeight: 700 }}>
                          {log.value === true ? 'Completed' : 'Pending'}
                        </span>
                      )}
                      {item.inputType === 'string' && (
                        <span>"{String(log.value)}"</span>
                      )}
                    </div>

                    {log.remark && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={12} color="var(--text-dim)" />
                        <em>Remark: "{log.remark}"</em>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(239, 68, 68, 0.7)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    title="Delete Log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
