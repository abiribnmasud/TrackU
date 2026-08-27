import React, { useState } from 'react';
import { X, Dumbbell, Sprout, DollarSign, Calendar, Clock, MessageSquare, Filter, Award } from 'lucide-react';
import type { SectorType, TrackedItem, LogEntry } from '../types/tracker';

interface SectorBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: SectorType | null;
  items: TrackedItem[];
  logs: LogEntry[];
}

export const SectorBreakdownModal: React.FC<SectorBreakdownModalProps> = ({
  isOpen,
  onClose,
  sector,
  items,
  logs
}) => {
  const [filterDate, setFilterDate] = useState<string>('');

  if (!isOpen || !sector) return null;

  const sectorItems = items.filter((i) => i.sector === sector);
  const sectorItemIds = new Set(sectorItems.map((i) => i.id));
  const itemsMap = new Map<string, TrackedItem>();
  sectorItems.forEach((i) => itemsMap.set(i.id, i));

  // Filter logs strictly belonging to this sector
  const sectorLogs = logs
    .filter((l) => sectorItemIds.has(l.itemId))
    .filter((l) => (filterDate ? l.date === filterDate : true))
    .sort((a, b) => b.timestamp - a.timestamp);

  const getSectorIcon = () => {
    if (sector === 'fitness') return <Dumbbell size={20} className="sector-icon" />;
    if (sector === 'growth') return <Sprout size={20} className="sector-icon" />;
    return <DollarSign size={20} className="sector-icon" />;
  };

  const getSectorTitle = () => {
    if (sector === 'fitness') return 'Fitness Sector Breakdown';
    if (sector === 'growth') return 'Growth Sector Breakdown';
    return 'Financial Sector Breakdown';
  };

  const formatTimestampTime = (timestamp: number): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={`sector-badge ${sector}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              {getSectorIcon()} {sector.toUpperCase()}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{getSectorTitle()}</h2>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Filter size={16} />
            <span>Total Tracked Items: <strong>{sectorItems.length}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} color="var(--text-muted)" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field"
              style={{ padding: '4px 10px', fontSize: '0.82rem', width: 'auto' }}
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.72rem', minHeight: '28px' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Detailed Timeline Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {sectorLogs.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)' }}>
              No log history entries recorded for {sector.toUpperCase()} {filterDate ? `on ${filterDate}` : ''}.
            </div>
          ) : (
            sectorLogs.map((log) => {
              const item = itemsMap.get(log.itemId);
              if (!item) return null;

              return (
                <div
                  key={log.id}
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  {/* Top Row: Title, Date & Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.title}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-dim)',
                        textTransform: 'uppercase'
                      }}>
                        {item.period}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {log.date}
                      </span>
                      {log.timestamp && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {formatTimestampTime(log.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Logged Value & Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Logged Entry:</span>
                    {item.inputType === 'percentage' && (
                      <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={15} /> {log.value}% completion
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
                      <span style={{ color: '#ffffff', fontStyle: 'italic' }}>"{String(log.value)}"</span>
                    )}
                  </div>

                  {/* Bottom Row: Remarks (if present) */}
                  {log.remark && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderLeft: '2px solid #8b5cf6'
                    }}>
                      <MessageSquare size={13} color="#a78bfa" />
                      <span>Remark: <em>"{log.remark}"</em></span>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
