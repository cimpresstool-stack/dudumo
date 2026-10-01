import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Save } from 'lucide-react';

export type EditEntityType = 'goal' | 'debt' | 'bill';

interface EditRecordModalProps {
  entityType: EditEntityType | null;
  entityId: string | null;
  onClose: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  entityType,
  entityId,
  onClose,
}) => {
  const {
    state,
    updateGoal,
    deleteGoal,
    updateDebt,
    deleteDebt,
    updateBill,
    deleteBill,
    showToast,
  } = useApp();

  // Local state fields
  const [name, setName] = useState('');
  const [val1, setVal1] = useState(''); // target / balance / amount
  const [val2, setVal2] = useState(''); // saved / apr / day
  const [val3, setVal3] = useState(''); // dateStr / min / paid

  useEffect(() => {
    if (!entityType || !entityId) return;

    if (entityType === 'goal') {
      const g = state.goals.find((x) => x.id === entityId);
      if (g) {
        setName(g.name);
        setVal1(String(g.target));
        setVal2(String(g.saved));
        setVal3(g.date ? new Date(g.date).toISOString().slice(0, 10) : '');
      }
    } else if (entityType === 'debt') {
      const d = state.debts.find((x) => x.id === entityId);
      if (d) {
        setName(d.name);
        setVal1(String(d.balance));
        setVal2(String(d.apr));
        setVal3(String(d.min));
      }
    } else if (entityType === 'bill') {
      const b = state.bills.find((x) => x.id === entityId);
      if (b) {
        setName(b.name);
        setVal1(String(b.amount));
        setVal2(String(b.day));
        setVal3(b.paid ? 'true' : 'false');
      }
    }
  }, [entityType, entityId, state]);

  if (!entityType || !entityId) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'err');
      return;
    }

    if (entityType === 'goal') {
      updateGoal(entityId, {
        name: name.trim(),
        target: Number(val1) || 0,
        saved: Number(val2) || 0,
        date: val3 ? new Date(`${val3}T00:00:00`).getTime() : null,
      });
      showToast('Goal updated successfully');
    } else if (entityType === 'debt') {
      updateDebt(entityId, {
        name: name.trim(),
        balance: Number(val1) || 0,
        apr: Number(val2) || 0,
        min: Number(val3) || 0,
      });
      showToast('Debt details updated');
    } else if (entityType === 'bill') {
      updateBill(entityId, {
        name: name.trim(),
        amount: Number(val1) || 0,
        day: Math.max(1, Math.min(31, Number(val2) || 1)),
        paid: val3 === 'true',
      });
      showToast('Bill updated');
    }

    onClose();
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    if (entityType === 'goal') {
      deleteGoal(entityId);
      showToast('Goal deleted', 'info');
    } else if (entityType === 'debt') {
      deleteDebt(entityId);
      showToast('Debt record removed', 'info');
    } else if (entityType === 'bill') {
      deleteBill(entityId);
      showToast('Bill removed', 'info');
    }

    onClose();
  };

  const getTitle = () => {
    if (entityType === 'goal') return 'Edit Savings Goal';
    if (entityType === 'debt') return 'Edit Debt Item';
    return 'Edit Recurring Bill';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-neutral-900 mb-1">{getTitle()}</h3>
        <p className="text-xs text-neutral-500 mb-5">
          Update the record information or permanently remove it.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Title / Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              required
            />
          </div>

          {entityType === 'goal' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Current Saved
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Target Date
                </label>
                <input
                  type="date"
                  value={val3}
                  onChange={(e) => setVal3(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
            </>
          )}

          {entityType === 'debt' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    APR %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Min Pay
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val3}
                    onChange={(e) => setVal3(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {entityType === 'bill' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val1}
                    onChange={(e) => setVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={val2}
                    onChange={(e) => setVal2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={val3}
                  onChange={(e) => setVal3(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white"
                >
                  <option value="false">Unpaid (Upcoming)</option>
                  <option value="true">Paid (Settled)</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-2.5 mt-6 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2.5 px-3.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
