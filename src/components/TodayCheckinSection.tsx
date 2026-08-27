import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Dumbbell, Sprout, DollarSign, Check, X, Edit3, Trash2, MessageSquare, Save } from 'lucide-react';
import type { TrackedItem, LogEntry, SectorType } from '../types/tracker';

interface TodayCheckinSectionProps {
  items: TrackedItem[];
  logs: LogEntry[];
  currentDate: string;
  onSaveLog: (itemId: string, value: number | boolean | string, remark?: string) => void;
  onEditItem: (item: TrackedItem) => void;
  onDeleteItem: (itemId: string) => void;
  forcedSectorFilter?: SectorType | 'all';
}

export const TodayCheckinSection: React.FC<TodayCheckinSectionProps> = ({
  items,
  logs,
  currentDate,
  onSaveLog,
  onEditItem,
  onDeleteItem,
  forcedSectorFilter
}) => {
  const [activeSectorFilter, setActiveSectorFilter] = useState<SectorType | 'all'>(
    forcedSectorFilter || 'all'
  );

  // Local draft states for inputs per item to support explicit Update button & input reset
  const [draftValues, setDraftValues] = useState<Record<string, any>>({});
  const [draftRemarks, setDraftRemarks] = useState<Record<string, string>>({});
  const [updatedToastItemId, setUpdatedToastItemId] = useState<string | null>(null);

  const effectiveFilter = forcedSectorFilter || activeSectorFilter;

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

  const formatTimestampTime = (timestamp: number): string => {
    if (!timestamp) return '12:00 PM';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const renderSectorSection = (sector: SectorType, title: string, Icon: any) => {
    const sectorItems = items.filter((i) => i.sector === sector);
    if (sectorItems.length === 0 && effectiveFilter !== 'all') return null;

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
          <div className="checkin-items-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {sectorItems.map((item) => {
              const currentLog = logsMap.get(item.id);
              const loggedVal = currentLog ? currentLog.value : 0;

              // Fetch recent history logs specifically for this item (up to 5 entries)
              const itemHistoryLogs = logs
                .filter((l) => l.itemId === item.id)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 5);

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
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    position: 'relative',
                    borderColor: isJustUpdated ? '#10b981' : undefined,
                    boxShadow: isJustUpdated ? '0 0 15px rgba(16, 185, 129, 0.3)' : undefined,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {/* Demo Layout Header: Title & Action Badges */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => onEditItem(item)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="Edit Item"
                        >
                          <Edit3 size={17} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                          title="Delete Item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid var(--border-subtle)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                      }}>
                        {item.period} • {item.type}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(255, 255, 255, 0.07)',
                        border: '1px solid var(--border-subtle)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)',
                        fontWeight: 600
                      }}>
                        Target: {item.targetValue ? `${item.targetValue} ${item.unit || ''}` : item.unit || 'BDT'}
                      </span>
                    </div>
                  </div>

                  {/* Demo Layout Middle Section: Inline Log History Entries */}
                  {itemHistoryLogs.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '10px 0',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {itemHistoryLogs.map((log) => (
                        <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.85rem'
                          }}>
                            {/* Value in Bold Gold / Emerald */}
                            <span style={{
                              fontWeight: 800,
                              color: item.sector === 'finance' ? '#fbbf24' : '#34d399',
                              letterSpacing: '0.3px'
                            }}>
                              {item.inputType === 'percentage'
                                ? `${log.value}%`
                                : item.inputType === 'number'
                                ? `${log.value} ${item.unit || 'BDT'}`
                                : log.value === true ? 'Completed' : String(log.value)}
                            </span>

                            {/* Date and Formatted Time */}
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                              <span>{log.date}</span>
                              <span style={{ minWidth: '65px', textAlign: 'right' }}>{formatTimestampTime(log.timestamp)}</span>
                            </div>
                          </div>

                          {/* Optional Remark line */}
                          {log.remark && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MessageSquare size={11} color="var(--text-dim)" />
                              <span>"{log.remark}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Demo Layout Bottom Section: Input Controls & Update Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Currently Logged Text */}
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Currently logged: <strong style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 800 }}>
                        {item.inputType === 'percentage'
                          ? `${pctVal}%`
                          : item.inputType === 'number'
                          ? `${loggedVal} ${item.unit || 'BDT'}`
                          : loggedVal === true ? 'Completed' : String(loggedVal || 'None')}
                      </strong>
                    </div>

                    {/* PERCENTAGE INPUT */}
                    {item.inputType === 'percentage' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                            style={{ flex: 1 }}
                            placeholder="Enter percentage..."
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', paddingRight: '4px' }}>%</span>
                        </div>

                        {/* Animated Dynamic Progress Bar */}
                        <div className="progress-container">
                          <div
                            className={`progress-bar-fill ${item.sector}`}
                            style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                          />
                        </div>

                        {/* Percentage Preset Pill Buttons */}
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginTop: '2px' }}>
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

                    {/* NUMBER INPUT */}
                    {item.inputType === 'number' && (
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={displayVal}
                          onChange={(e) => setDraftValues((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 0 }))}
                          className="input-field"
                          placeholder="Enter amount to update..."
                          style={{ paddingRight: item.unit ? '55px' : '14px' }}
                        />
                        {item.unit && (
                          <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            pointerEvents: 'none'
                          }}>
                            {item.unit}
                          </span>
                        )}
                      </div>
                    )}

                    {/* BOOLEAN INPUT */}
                    {item.inputType === 'boolean' && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                        <button
                          onClick={() => setDraftValues((prev) => ({ ...prev, [item.id]: true }))}
                          className={(hasDraft ? displayVal === true : loggedVal === true) ? 'btn-primary' : 'btn-secondary'}
                          style={{ flex: 1, padding: '8px 14px' }}
                        >
                          <Check size={14} /> Completed
                        </button>
                        <button
                          onClick={() => setDraftValues((prev) => ({ ...prev, [item.id]: false }))}
                          className={(hasDraft ? displayVal === false : loggedVal === false) ? 'btn-danger' : 'btn-secondary'}
                          style={{ flex: 1, padding: '8px 14px' }}
                        >
                          <X size={14} /> Pending
                        </button>
                      </div>
                    )}

                    {/* STRING INPUT */}
                    {item.inputType === 'string' && (
                      <div>
                        <input
                          type="text"
                          value={displayVal}
                          onChange={(e) => setDraftValues((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="input-field"
                          placeholder="Type log entry..."
                        />
                      </div>
                    )}

                    {/* CONDITIONAL REMARKS INPUT */}
                    {item.addRemark && (
                      <div>
                        <input
                          type="text"
                          value={displayRemark}
                          onChange={(e) => setDraftRemarks((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="input-field"
                          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                          placeholder="Add optional notes or remarks..."
                        />
                      </div>
                    )}

                    {/* Bottom Footer Row matching demo layout */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: isJustUpdated ? '#34d399' : 'var(--text-dim)', fontWeight: 600 }}>
                        {isJustUpdated ? '✓ Updated & Reset!' : 'Ready for input'}
                      </span>

                      <button
                        onClick={() => handleUpdateItem(item)}
                        className="btn-primary"
                        style={{ padding: '8px 18px', fontSize: '0.88rem', borderRadius: 'var(--radius-md)' }}
                      >
                        <Save size={16} /> Update Value
                      </button>
                    </div>

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
      {!forcedSectorFilter && (
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
                className={`btn-secondary ${effectiveFilter === sec ? 'active' : ''}`}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  textTransform: 'capitalize',
                  background: effectiveFilter === sec ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  borderColor: effectiveFilter === sec ? 'var(--border-bright)' : 'transparent'
                }}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      )}

      {(effectiveFilter === 'all' || effectiveFilter === 'fitness') &&
        renderSectorSection('fitness', 'Fitness Tracking', Dumbbell)}

      {(effectiveFilter === 'all' || effectiveFilter === 'growth') &&
        renderSectorSection('growth', 'Growth Tracking', Sprout)}

      {(effectiveFilter === 'all' || effectiveFilter === 'finance') &&
        renderSectorSection('finance', 'Financial Tracking', DollarSign)}
    </section>
  );
};
