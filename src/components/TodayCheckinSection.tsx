import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Dumbbell, Sprout, DollarSign, Check, X, Edit3, Trash2, MessageSquare } from 'lucide-react';
import type { TrackedItem, LogEntry, SectorType } from '../types/tracker';

interface TodayCheckinSectionProps {
  items: TrackedItem[];
  logs: LogEntry[];
  currentDate: string;
  onSaveLog: (itemId: string, value: number | boolean | string, remark?: string) => void;
  onEditItem: (item: TrackedItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const TodayCheckinSection: React.FC<TodayCheckinSectionProps> = ({
  items,
  logs,
  currentDate,
  onSaveLog,
  onEditItem,
  onDeleteItem
}) => {
  const [activeSectorFilter, setActiveSectorFilter] = useState<SectorType | 'all'>('all');

  const logsMap = new Map<string, LogEntry>();
  logs.filter((l) => l.date === currentDate).forEach((l) => {
    logsMap.set(l.itemId, l);
  });

  const fireConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const renderSectorSection = (sector: SectorType, title: string, Icon: any) => {
    const sectorItems = items.filter((i) => i.sector === sector);
    if (sectorItems.length === 0 && activeSectorFilter !== 'all') return null;

    return (
      <div key={sector} style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span className={`sector-badge ${sector}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            <Icon size={16} /> {title} ({sectorItems.length})
          </span>
        </div>

        {sectorItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No items tracked in {title}. Click <strong>Manage Items</strong> to add one!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {sectorItems.map((item) => {
              const currentLog = logsMap.get(item.id);
              const currentValue = currentLog ? currentLog.value : '';
              const currentRemark = currentLog?.remark || '';

              // For percentage input type: convert current value to number (0-100)
              const pctVal = typeof currentValue === 'number' ? currentValue : 0;

              const handleValueChange = (val: number | boolean | string) => {
                onSaveLog(item.id, val, currentRemark);
                if ((typeof val === 'number' && val >= 100) || val === true) {
                  fireConfetti();
                }
              };

              const handleRemarkChange = (rem: string) => {
                onSaveLog(item.id, currentValue, rem);
              };

              return (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                        {item.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-dim)',
                          textTransform: 'uppercase',
                          fontWeight: 600
                        }}>
                          {item.period} • {item.type}
                        </span>
                        {item.unit && (
                          <span style={{
                            fontSize: '0.72rem',
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-muted)'
                          }}>
                            Target: {item.targetValue} {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Edit & Delete Actions */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => onEditItem(item)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'var(--transition-fast)'
                        }}
                        title="Edit Item"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(239, 68, 68, 0.7)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'var(--transition-fast)'
                        }}
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Input Type Renderers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* PERCENTAGE INPUT */}
                    {item.inputType === 'percentage' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Progress:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '110px' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={typeof currentValue === 'number' ? currentValue : ''}
                              onChange={(e) => {
                                const num = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                handleValueChange(num);
                              }}
                              className="input-field"
                              style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700 }}
                              placeholder="0"
                            />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>%</span>
                          </div>
                        </div>

                        {/* Animated Dynamic Progress Bar */}
                        <div className="progress-container">
                          <div
                            className={`progress-bar-fill ${item.sector}`}
                            style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                          />
                        </div>

                        {/* Percentage Preset Pill Buttons */}
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginTop: '4px' }}>
                          {[25, 50, 75, 100].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => handleValueChange(preset)}
                              className={`preset-btn ${pctVal === preset ? 'active' : ''}`}
                              style={{ flex: 1 }}
                            >
                              {preset}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NUMBER INPUT */}
                    {item.inputType === 'number' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          Amount logged:
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                          <input
                            type="number"
                            value={typeof currentValue === 'number' ? currentValue : ''}
                            onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
                            className="input-field"
                            placeholder="Enter amount..."
                          />
                          {item.unit && (
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* BOOLEAN INPUT */}
                    {item.inputType === 'boolean' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Status:</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleValueChange(true)}
                            className={currentValue === true ? 'btn-primary' : 'btn-secondary'}
                            style={{
                              padding: '6px 14px',
                              background: currentValue === true ? 'rgba(16, 185, 129, 0.25)' : undefined,
                              borderColor: currentValue === true ? '#10b981' : undefined,
                              color: currentValue === true ? '#34d399' : undefined
                            }}
                          >
                            <Check size={14} /> Completed
                          </button>
                          <button
                            onClick={() => handleValueChange(false)}
                            className={currentValue === false ? 'btn-danger' : 'btn-secondary'}
                            style={{ padding: '6px 14px' }}
                          >
                            <X size={14} /> Pending
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STRING INPUT */}
                    {item.inputType === 'string' && (
                      <div>
                        <input
                          type="text"
                          value={String(currentValue)}
                          onChange={(e) => handleValueChange(e.target.value)}
                          className="input-field"
                          placeholder="Type log entry or note..."
                        />
                      </div>
                    )}

                    {/* CONDITIONAL REMARKS INPUT (Only if addRemark === true) */}
                    {item.addRemark && (
                      <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <MessageSquare size={13} color="var(--text-dim)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                            Optional Remarks:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={currentRemark}
                          onChange={(e) => handleRemarkChange(e.target.value)}
                          className="input-field"
                          style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                          placeholder="Add notes, e.g. feeling energetic, expensive ride..."
                        />
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <section>
      {/* Sector Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Today's Check-in & Trackers</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Log exact values, percentages, expenses, and notes for {currentDate}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {(['all', 'fitness', 'growth', 'finance'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSectorFilter(sec)}
              className={`btn-secondary ${activeSectorFilter === sec ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                textTransform: 'capitalize',
                background: activeSectorFilter === sec ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                borderColor: activeSectorFilter === sec ? 'var(--border-bright)' : 'transparent'
              }}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Render Sector Groups */}
      {(activeSectorFilter === 'all' || activeSectorFilter === 'fitness') &&
        renderSectorSection('fitness', 'Fitness Tracking', Dumbbell)}

      {(activeSectorFilter === 'all' || activeSectorFilter === 'growth') &&
        renderSectorSection('growth', 'Growth Tracking', Sprout)}

      {(activeSectorFilter === 'all' || activeSectorFilter === 'finance') &&
        renderSectorSection('finance', 'Financial Tracking', DollarSign)}
    </section>
  );
};
