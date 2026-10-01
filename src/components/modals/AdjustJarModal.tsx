import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JarKey } from '../../types';
import { getJar, formatMoney } from '../../constants/jars';
import { X, Plus, Minus } from 'lucide-react';

interface AdjustJarModalProps {
  jarKey: JarKey | null;
  onClose: () => void;
}

export const AdjustJarModal: React.FC<AdjustJarModalProps> = ({ jarKey, onClose }) => {
  const { state, adjustJar, showToast } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!jarKey) return null;
  const jarDef = getJar(jarKey);
  const currentBalance = state.jars[jarKey] || 0;

  const handleAction = (isAdd: boolean) => {
    const val = Number(amount);
    if (!val || val <= 0) {
      showToast('Please enter an amount greater than 0', 'err');
      return;
    }

    adjustJar(jarKey, isAdd ? val : -val, note.trim() || undefined);
    showToast(
      `${isAdd ? 'Added' : 'Subtracted'} ${formatMoney(val, state.currency)} ${isAdd ? 'to' : 'from'} ${jarDef.name}`,
      isAdd ? 'success' : 'info'
    );
    onClose();
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

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0"
            style={{ backgroundColor: jarDef.color }}
          >
            {jarDef.letter}
          </div>
          <div>
            <h3 className="text-xl font-black text-neutral-900 leading-tight">
              Adjust {jarDef.name}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Current Balance:{' '}
              <span className="font-bold text-neutral-900">
                {formatMoney(currentBalance, state.currency)}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                {state.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
              Reason / Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Extra grocery top-up, reimbursement"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleAction(false)}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
            <span>Subtract</span>
          </button>
          <button
            type="button"
            onClick={() => handleAction(true)}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>
    </div>
  );
};
