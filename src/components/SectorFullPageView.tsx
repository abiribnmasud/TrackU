import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Dumbbell, Sprout, DollarSign, Calendar, Clock, MessageSquare, ArrowUpDown, Filter, Check, Edit3, Trash2, Save, Award, Layers } from 'lucide-react';
import type { SectorType, TrackedItem, LogEntry } from '../types/tracker';

interface SectorFullPageViewProps {
  sector: SectorType;
  items: TrackedItem[];
  logs: LogEntry[];
  currentDate: string;
  onSaveLog: (itemId: string, value: number | boolean | string, remark?: string) => void;
  onEditItem: (item: TrackedItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export type SortMode = 'date_desc' | 'date_asc' | 'item_asc' | 'item_desc' | 'group_item';

export const SectorFullPageView: React.FC<SectorFullPageViewProps> = ({
  sector,
  items,
  logs,
  currentDate,
  onSaveLog,
  onEditItem,
  onDeleteItem
}) => {
  const [sortMode, setSortMode] = useState<SortMode>('date_desc');
  const [filterDate, setFilterDate] = useState<string>('');

  // Draft inputs for active check-in
  const [draftValues, setDraftValues] = useState<Record<string, any>>({});
  const [draftRemarks, setDraftRemarks] = useState<Record<string, string>>({});
  const [updatedToastItemId, setUpdatedToastItemId] = useState<string | null>(null);

  const sectorItems = items.filter((i) => i.sector === sector);
  const sectorItemIds = new Set(sectorItems.map((i) => i.id));
  const itemsMap = new Map<string, TrackedItem>();
  sectorItems.forEach((i) => itemsMap.set(i.id, i));

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

  const handleUpdateItem = (item: TrackedItem) => {
    const currentLog = logsMap.get(item.id);
    const draftVal = draftValues[item.id];
    const draftRem = draftRemarks[item.id];

    const finalValue = draftVal !== undefined ? draftVal : (currentLog ? currentLog.value : 0);
    const finalRemark = draftRem !== undefined ? draftRem : (currentLog?.remark || '');

    onSaveLog(item.id, finalValue, finalRemark);

    if ((typeof finalValue === 'number' && finalValue >= 100) || finalValue === true) {
      fireConfetti();
    }

    setUpdatedToastItemId(item.id);
    setTimeout(() => setUpdatedToastItemId(null), 2500);

    // Reset draft fields for fresh input
    setDraftValues((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    setDraftRemarks((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  // Filter logs for this sector
  const sectorLogs = logs
    .filter((l) => sectorItemIds.has(l.itemId))
    .filter((l) => (filterDate ? l.date === filterDate : true));

  // Sort logs according to sortMode
  const sortedLogs = [...sectorLogs].sort((a, b) => {
    const itemA = itemsMap.get(a.itemId);
    const itemB = itemsMap.get(b.itemId);

    if (sortMode === 'date_desc') {
      return b.timestamp - a.timestamp;
    }
    if (sortMode === 'date_asc') {
      return a.timestamp - b.timestamp;
    }
    if (sortMode === 'item_asc') {
      const titleA = itemA?.title || '';
      const titleB = itemB?.title || '';
      return titleA.localeCompare(titleB);
    }
    if (sortMode === 'item_desc') {
      const titleA = itemA?.title || '';
      const titleB = itemB?.title || '';
      return titleB.localeCompare(titleA);
    }
    if (sortMode === 'group_item') {
      const titleA = itemA?.title || '';
      const titleB = itemB?.title || '';
      const cmp = titleA.localeCompare(titleB);
      if (cmp !== 0) return cmp;
      return b.timestamp - a.timestamp;
    }
    return 0;
  });

  const getSectorIcon = () => {
    if (sector === 'fitness') return <Dumbbell size={24} color="#34d399" />;
    if (sector === 'growth') return <Sprout size={24} color="#a78bfa" />;
    return <DollarSign size={24} color="#fbbf24" />;
  };

  const formatTimestampTime = (timestamp: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Full Page Sector Banner */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '140px',
          height: '140px',
          background: sector === 'fitness' ? 'var(--fitness-glow)' : sector === 'growth' ? 'var(--growth-glow)' : 'var(--finance-glow)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getSectorIcon()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`sector-badge ${sector}`} style={{ fontSize: '0.8rem' }}>
                  {sector.toUpperCase()} SECTOR
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  • {sectorItems.length} active items
                </span>
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '2px' }}>
                {sector === 'fitness' ? 'Fitness & Physical Health' : sector === 'growth' ? 'Growth & Skill Development' : 'Financial Tracking & Expenses'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <ArrowUpDown size={16} />
              <span>Sort View:</span>
            </div>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="input-field"
              style={{ width: 'auto', minWidth: '200px', fontSize: '0.88rem' }}
            >
              <option value="date_desc">📅 Date: Newest First</option>
              <option value="date_asc">📅 Date: Oldest First</option>
              <option value="item_asc">🔤 Item Title: A to Z</option>
              <option value="item_desc">🔤 Item Title: Z to A</option>
              <option value="group_item">📂 Group by Item</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '4px 10px', fontSize: '0.82rem' }}
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
      </div>

      {/* Tracked Items & Check-in Section */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
          {sector.toUpperCase()} Tracked Items & Today's Check-in
        </h2>

        {sectorItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tracked items in {sector}. Click <strong>Manage Items</strong> in the header to create one!
          </div>
        ) : (
          <div className="checkin-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {sectorItems.map((item) => {
              const currentLog = logsMap.get(item.id);
              const loggedVal = currentLog ? currentLog.value : 0;
              const loggedRemark = currentLog?.remark || '';

              const hasDraft = draftValues[item.id] !== undefined;
              const displayVal = hasDraft ? draftValues[item.id] : '';
              const displayRemark = draftRemarks[item.id] !== undefined ? draftRemarks[item.id] : '';
              const pctVal = typeof loggedVal === 'number' ? loggedVal : 0;
              const isJustUpdated = updatedToastItemId === item.id;

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
                    borderColor: isJustUpdated ? '#10b981' : undefined,
                    boxShadow: isJustUpdated ? '0 0 15px rgba(16, 185, 129, 0.3)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                        {item.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {item.period} • {item.type}
                        </span>
                        {item.unit && (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}>
                            Target: {item.targetValue} {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => onEditItem(item)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }} title="Edit Item">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => onDeleteItem(item.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', padding: '4px' }} title="Delete Item">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Input controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {item.inputType === 'percentage' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Current: <strong>{pctVal}%</strong>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '110px' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={displayVal}
                              onChange={(e) => {
                                const num = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                setDraftValues((prev) => ({ ...prev, [item.id]: num }));
                              }}
                              className="input-field"
                              style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700 }}
                              placeholder="New %"
                            />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>%</span>
                          </div>
                        </div>

                        <div className="progress-container">
                          <div className={`progress-bar-fill ${item.sector}`} style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }} />
                        </div>

                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginTop: '4px' }}>
                          {[25, 50, 75, 100].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setDraftValues((prev) => ({ ...prev, [item.id]: preset }))}
                              className={`preset-btn ${displayVal === preset || pctVal === preset ? 'active' : ''}`}
                              style={{ flex: 1 }}
                            >
                              {preset}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.inputType === 'number' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Currently logged: <strong>{loggedVal} {item.unit || ''}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            value={displayVal}
                            onChange={(e) => setDraftValues((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 0 }))}
                            className="input-field"
                            placeholder="Enter amount to update..."
                          />
                          {item.unit && (
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {item.inputType === 'boolean' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                          Status: <strong>{loggedVal === true ? 'Completed' : 'Pending'}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setDraftValues((prev) => ({ ...prev, [item.id]: true }))}
                            className={(hasDraft ? displayVal === true : loggedVal === true) ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '6px 14px' }}
                          >
                            <Check size={14} /> Completed
                          </button>
                          <button
                            onClick={() => setDraftValues((prev) => ({ ...prev, [item.id]: false }))}
                            className={(hasDraft ? displayVal === false : loggedVal === false) ? 'btn-danger' : 'btn-secondary'}
                            style={{ padding: '6px 14px' }}
                          >
                            Pending
                          </button>
                        </div>
                      </div>
                    )}

                    {item.addRemark && (
                      <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <MessageSquare size={13} color="var(--text-dim)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                            Remarks {loggedRemark ? `(Current: "${loggedRemark}")` : ''}:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={displayRemark}
                          onChange={(e) => setDraftRemarks((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="input-field"
                          style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                          placeholder="Add new notes or remark..."
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: isJustUpdated ? '#34d399' : 'var(--text-dim)', fontWeight: 600 }}>
                        {isJustUpdated ? '✓ Updated & Reset!' : 'Ready for input'}
                      </span>
                      <button onClick={() => handleUpdateItem(item)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                        <Save size={14} /> Update Value
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Page History & Timeline Log Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#a78bfa" /> Log Breakdown History ({sortedLogs.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Item-wise and date-wise historical breakdown for {sector.toUpperCase()}.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
          {sortedLogs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No recorded logs match the current filter/sort criteria.
            </div>
          ) : (
            sortedLogs.map((log) => {
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
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        {item.period}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Logged Value:</span>
                      {item.inputType === 'percentage' && (
                        <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={14} /> {log.value}% completion
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
                        <MessageSquare size={12} color="#a78bfa" />
                        <em>Remark: "{log.remark}"</em>
                      </div>
                    )}
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
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
