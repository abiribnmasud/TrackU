import React, { useState, useEffect } from 'react';
import { X, Trash2, PlusCircle, Check } from 'lucide-react';
import type { TrackedItem, SectorType, ItemType, FrequencyPeriod, InputType } from '../types/tracker';

interface ItemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: TrackedItem[];
  itemToEdit?: TrackedItem | null;
  onSaveItem: (item: TrackedItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ItemConfigModal: React.FC<ItemConfigModalProps> = ({
  isOpen,
  onClose,
  items,
  itemToEdit,
  onSaveItem,
  onDeleteItem
}) => {
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState<SectorType>('fitness');
  const [type, setType] = useState<ItemType>('goal');
  const [period, setPeriod] = useState<FrequencyPeriod>('daily');
  const [inputType, setInputType] = useState<InputType>('percentage');
  const [unit, setUnit] = useState('mins');
  const [targetValue, setTargetValue] = useState<number>(30);
  const [addRemark, setAddRemark] = useState<boolean>(true);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setSector(itemToEdit.sector);
      setType(itemToEdit.type);
      setPeriod(itemToEdit.period);
      setInputType(itemToEdit.inputType);
      setUnit(itemToEdit.unit || '');
      setTargetValue(itemToEdit.targetValue || 0);
      setAddRemark(itemToEdit.addRemark);
    } else {
      // Reset form
      setTitle('');
      setSector('fitness');
      setType('goal');
      setPeriod('daily');
      setInputType('percentage');
      setUnit('mins');
      setTargetValue(30);
      setAddRemark(true);
    }
    setConfirmDeleteId(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: TrackedItem = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      sector,
      type,
      period,
      inputType,
      unit: unit.trim() || undefined,
      targetValue: Number(targetValue) || undefined,
      addRemark,
      isDefault: itemToEdit?.isDefault || false,
      createdAt: itemToEdit ? itemToEdit.createdAt : new Date().toISOString()
    };

    onSaveItem(newItem);
    onClose();
  };

  const handleDeleteConfirmed = (id: string) => {
    onDeleteItem(id);
    setConfirmDeleteId(null);
    if (itemToEdit?.id === id) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {itemToEdit ? 'Edit Goal / Expense Item' : 'Add New Tracker Item'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Existing Items List (When not editing a specific item) */}
        {!itemToEdit && items.length > 0 && (
          <div style={{ marginBottom: '24px', background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>
              Manage / Delete Tracked Items ({items.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`sector-badge ${it.sector}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      {it.sector}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{it.title}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>({it.inputType})</span>
                  </div>

                  {confirmDeleteId === it.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>Delete?</span>
                      <button
                        onClick={() => handleDeleteConfirmed(it.id)}
                        className="btn-danger"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(it.id)}
                      className="btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      title="Delete Item"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Item Configuration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Item Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Guitar Practice 30 mins, Workout, Smoking Bill"
              className="input-field"
            />
          </div>

          {/* Sector & Type selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as SectorType)}
                className="input-field"
              >
                <option value="fitness">💪 Fitness</option>
                <option value="growth">🌱 Growth</option>
                <option value="finance">💰 Financial</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Item Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ItemType)}
                className="input-field"
              >
                <option value="goal">Goal</option>
                <option value="habit">Habit</option>
                <option value="expense">Expense</option>
                <option value="saving">Saving</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
          </div>

          {/* Frequency & Input Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Frequency / Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as FrequencyPeriod)}
                className="input-field"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Input Value Type
              </label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as InputType)}
                className="input-field"
              >
                <option value="percentage">Percentage (exact number + presets)</option>
                <option value="number">Number (direct numerical entry)</option>
                <option value="boolean">Yes / No (toggle button)</option>
                <option value="string">Text Entry</option>
              </select>
            </div>
          </div>

          {/* Target Value & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Target Goal Value
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                placeholder="e.g. 30, 5, 100"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Unit / Currency
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. mins, $, km, pages"
                className="input-field"
              />
            </div>
          </div>

          {/* Add Remarks Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.5)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Enable Optional Remarks Field</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Shows an extra notes/remarks box on the daily check-in screen for this item.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAddRemark(!addRemark)}
              className={addRemark ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 16px', fontSize: '0.82rem' }}
            >
              {addRemark ? <Check size={14} /> : null} {addRemark ? 'Yes' : 'No'}
            </button>
          </div>

          {/* Footer Form Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            {itemToEdit ? (
              <button
                type="button"
                onClick={() => handleDeleteConfirmed(itemToEdit.id)}
                className="btn-danger"
              >
                <Trash2 size={16} /> Delete Item
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <PlusCircle size={16} /> {itemToEdit ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
