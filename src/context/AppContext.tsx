import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AppState, Debt, Goal, Bill, BalanceItem, JarKey, ToastMessage, ToastKind, Transaction, User } from '../types';
import { JARS, SPLIT_JARS, round2, formatMoney } from '../constants/jars';

const STATE_STORAGE_KEY = 'dudumo_state';
const SESSION_STORAGE_KEY = 'dudumo_session';
const USERS_STORAGE_KEY = 'dudumo_users';
const DATA_PREFIX = 'dudumo_data_';

function createDefaultState(): AppState {
  const jars: Record<JarKey, number> = {
    inbox: 0,
    daily: 0,
    bills: 0,
    debt: 0,
    unplanned: 0,
    goals: 0,
    enjoyment: 0,
    retirement: 0,
  };
  const pcts: Record<JarKey, number> = {
    inbox: 0,
    daily: 22,
    bills: 14,
    debt: 13,
    unplanned: 10,
    goals: 17,
    enjoyment: 12,
    retirement: 12,
  };
  return {
    jars,
    pcts,
    autoSplit: true,
    currency: '$',
    displayName: 'My Money',
    incomeBaseline: 3200,
    transactions: [],
    goals: [],
    debts: [],
    bills: [],
    assets: [],
    liabilities: [],
    budgets: {},
    debtStrategy: 'snowball',
    user: null,
    auditLog: [],
  };
}

function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

interface AppContextValue {
  state: AppState;
  toasts: ToastMessage[];
  showToast: (message: string, kind?: ToastKind) => void;
  removeToast: (id: string) => void;
  addIncome: (amount: number, note?: string) => Transaction | null;
  distributeAmount: (amount: number) => Record<string, number> | null;
  adjustJar: (key: JarKey, amount: number, note?: string) => void;
  deleteTransaction: (id: string) => void;
  clearTransactions: () => void;
  addGoal: (name: string, target: number, dateStr?: string) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  addDebt: (name: string, balance: number, apr: number, min: number) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  setDebtStrategy: (strategy: 'snowball' | 'avalanche') => void;
  addBill: (name: string, amount: number, day: number) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;
  addAsset: (name: string, amount: number) => void;
  deleteAsset: (id: string) => void;
  addLiability: (name: string, amount: number) => void;
  deleteLiability: (id: string) => void;
  updateJarPercent: (key: JarKey, pct: number) => void;
  setBudget: (key: string, limit: number) => void;
  updatePreferences: (updates: { currency?: string; displayName?: string; incomeBaseline?: number; autoSplit?: boolean }) => void;
  registerUser: (name: string, email: string, password?: string, income?: number, currency?: string) => boolean;
  loginUser: (email: string, password?: string) => boolean;
  logoutUser: () => void;
  resetAllData: () => void;
  exportTransactionsCsv: () => void;
  exportSummaryCsv: () => void;
  exportGoalsCsv: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const sessionEmail = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionEmail) {
        const userSaved = localStorage.getItem(DATA_PREFIX + sessionEmail.toLowerCase());
        if (userSaved) {
          const parsed = JSON.parse(userSaved);
          return { ...createDefaultState(), ...parsed };
        }
      }
      const raw = localStorage.getItem(STATE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...createDefaultState(), ...parsed };
      }
    } catch {
      // fallback
    }
    return createDefaultState();
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save state effect
  useEffect(() => {
    try {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
      if (state.user?.email) {
        localStorage.setItem(DATA_PREFIX + state.user.email.toLowerCase(), JSON.stringify(state));
      }
    } catch (e) {
      console.error('Failed to save Dudumo state:', e);
    }
  }, [state]);

  const distributeAmount = useCallback(
    (amount: number): Record<string, number> | null => {
      const amt = round2(amount);
      if (amt <= 0) return null;
      let totalPct = 0;
      SPLIT_JARS.forEach((j) => {
        totalPct += Number(state.pcts[j.key]) || 0;
      });
      if (totalPct <= 0) return null;

      const result: Record<string, number> = {};
      let allocated = 0;
      SPLIT_JARS.forEach((j, idx) => {
        const pct = Number(state.pcts[j.key]) || 0;
        let share: number;
        if (idx === SPLIT_JARS.length - 1) {
          share = round2(amt - allocated);
        } else {
          share = round2((amt * pct) / totalPct);
          allocated = round2(allocated + share);
        }
        if (share < 0) share = 0;
        result[j.key] = share;
      });
      return result;
    },
    [state.pcts]
  );

  const addIncome = useCallback(
    (amount: number, note = 'Income'): Transaction | null => {
      const amt = round2(amount);
      if (amt <= 0) return null;

      const txId = uid();
      const dist = state.autoSplit ? distributeAmount(amt) : null;
      const newTx: Transaction = {
        id: txId,
        type: 'income',
        amount: amt,
        note,
        date: new Date().toISOString(),
        split: dist,
      };

      setState((prev) => {
        const nextJars = { ...prev.jars };
        if (state.autoSplit && dist) {
          SPLIT_JARS.forEach((j) => {
            nextJars[j.key] = round2((nextJars[j.key] || 0) + (dist[j.key] || 0));
          });
        } else {
          nextJars.inbox = round2((nextJars.inbox || 0) + amt);
        }

        const nextAudit = [
          {
            id: uid(),
            action: 'Income added',
            detail: `${formatMoney(amt, prev.currency)} · ${note}`,
            date: new Date().toISOString(),
          },
          ...prev.auditLog,
        ].slice(0, 200);

        return {
          ...prev,
          jars: nextJars,
          transactions: [newTx, ...prev.transactions].slice(0, 800),
          auditLog: nextAudit,
        };
      });

      return newTx;
    },
    [state.autoSplit, distributeAmount]
  );

  const adjustJar = useCallback((key: JarKey, amount: number, note?: string) => {
    const amt = round2(amount);
    if (!amt) return;

    setState((prev) => {
      const nextJars = { ...prev.jars };
      nextJars[key] = round2((nextJars[key] || 0) + amt);
      const isAdd = amt >= 0;
      const jarDef = JARS.find((j) => j.key === key);

      const tx: Transaction = {
        id: uid(),
        type: isAdd ? 'adjust-add' : 'adjust-sub',
        amount: Math.abs(amt),
        note: note || `Manual adjustment · ${jarDef?.name || key}`,
        date: new Date().toISOString(),
        account: key,
      };

      const nextAudit = [
        {
          id: uid(),
          action: 'Jar adjusted',
          detail: `${jarDef?.name || key} · ${isAdd ? '+' : '-'}${formatMoney(Math.abs(amt), prev.currency)}`,
          date: new Date().toISOString(),
        },
        ...prev.auditLog,
      ].slice(0, 200);

      return {
        ...prev,
        jars: nextJars,
        transactions: [tx, ...prev.transactions].slice(0, 800),
        auditLog: nextAudit,
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  const clearTransactions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactions: [],
    }));
  }, []);

  const addGoal = useCallback((name: string, target: number, dateStr?: string) => {
    const newGoal: Goal = {
      id: uid(),
      name,
      target: round2(target),
      saved: 0,
      date: dateStr ? new Date(`${dateStr}T00:00:00`).getTime() : null,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      goals: [newGoal, ...prev.goals],
    }));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    const amt = round2(amount);
    if (amt <= 0) return;

    setState((prev) => {
      const targetGoal = prev.goals.find((g) => g.id === id);
      if (!targetGoal) return prev;

      const nextJars = { ...prev.jars };
      if (nextJars.goals >= amt) {
        nextJars.goals = round2(nextJars.goals - amt);
      }

      const tx: Transaction = {
        id: uid(),
        type: 'adjust-sub',
        amount: amt,
        note: `Goal deposit · ${targetGoal.name}`,
        date: new Date().toISOString(),
        account: 'goals',
      };

      return {
        ...prev,
        jars: nextJars,
        goals: prev.goals.map((g) =>
          g.id === id ? { ...g, saved: round2(g.saved + amt) } : g
        ),
        transactions: [tx, ...prev.transactions].slice(0, 800),
      };
    });
  }, []);

  const addDebt = useCallback((name: string, balance: number, apr: number, min: number) => {
    const newDebt: Debt = {
      id: uid(),
      name,
      balance: round2(balance),
      apr: round2(apr),
      min: round2(min),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      debts: [newDebt, ...prev.debts],
    }));
  }, []);

  const updateDebt = useCallback((id: string, updates: Partial<Debt>) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  }, []);

  const setDebtStrategy = useCallback((strategy: 'snowball' | 'avalanche') => {
    setState((prev) => ({ ...prev, debtStrategy: strategy }));
  }, []);

  const addBill = useCallback((name: string, amount: number, day: number) => {
    const newBill: Bill = {
      id: uid(),
      name,
      amount: round2(amount),
      day: Math.max(1, Math.min(31, Math.round(day))),
      paid: false,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      bills: [newBill, ...prev.bills],
    }));
  }, []);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const deleteBill = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
  }, []);

  const toggleBillPaid = useCallback((id: string) => {
    setState((prev) => {
      const targetBill = prev.bills.find((b) => b.id === id);
      if (!targetBill) return prev;
      const nextPaid = !targetBill.paid;
      const nextJars = { ...prev.jars };

      let nextTx = prev.transactions;
      if (nextPaid) {
        nextJars.bills = round2(nextJars.bills - targetBill.amount);
        const tx: Transaction = {
          id: uid(),
          type: 'adjust-sub',
          amount: targetBill.amount,
          note: `Bill paid: ${targetBill.name}`,
          date: new Date().toISOString(),
          account: 'bills',
        };
        nextTx = [tx, ...prev.transactions].slice(0, 800);
      }

      return {
        ...prev,
        jars: nextJars,
        bills: prev.bills.map((b) => (b.id === id ? { ...b, paid: nextPaid } : b)),
        transactions: nextTx,
      };
    });
  }, []);

  const addAsset = useCallback((name: string, amount: number) => {
    const newAsset: BalanceItem = {
      id: uid(),
      name,
      amount: round2(amount),
    };
    setState((prev) => ({
      ...prev,
      assets: [newAsset, ...prev.assets],
    }));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
  }, []);

  const addLiability = useCallback((name: string, amount: number) => {
    const newLiab: BalanceItem = {
      id: uid(),
      name,
      amount: round2(amount),
    };
    setState((prev) => ({
      ...prev,
      liabilities: [newLiab, ...prev.liabilities],
    }));
  }, []);

  const deleteLiability = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((l) => l.id !== id),
    }));
  }, []);

  const updateJarPercent = useCallback((key: JarKey, pct: number) => {
    setState((prev) => ({
      ...prev,
      pcts: {
        ...prev.pcts,
        [key]: Math.max(0, Math.min(100, round2(pct))),
      },
    }));
  }, []);

  const setBudget = useCallback((key: string, limit: number) => {
    setState((prev) => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [key]: round2(limit),
      },
    }));
  }, []);

  const updatePreferences = useCallback(
    (updates: { currency?: string; displayName?: string; incomeBaseline?: number; autoSplit?: boolean }) => {
      setState((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    []
  );

  const registerUser = useCallback(
    (name: string, email: string, password = '', income = 3200, currency = '$'): boolean => {
      const cleanEmail = email.toLowerCase().trim();
      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      if (users.some((u: { email: string }) => u.email === cleanEmail)) {
        return false;
      }
      users.push({
        email: cleanEmail,
        password,
        name,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_STORAGE_KEY, cleanEmail);

      const user: User = {
        name,
        email: cleanEmail,
        createdAt: new Date().toISOString(),
      };

      // Seed initial demo data for new account so it is instantly alive
      const baseState = createDefaultState();
      baseState.user = user;
      baseState.displayName = name.split(' ')[0] || name;
      baseState.currency = currency;
      baseState.incomeBaseline = income;

      // Seed initial income & items
      baseState.jars.daily = 704;
      baseState.jars.bills = 448;
      baseState.jars.debt = 416;
      baseState.jars.unplanned = 320;
      baseState.jars.goals = 544;
      baseState.jars.enjoyment = 384;
      baseState.jars.retirement = 384;

      baseState.transactions = [
        {
          id: uid(),
          type: 'income',
          amount: 3200,
          note: 'Salary · Monthly split',
          date: new Date(Date.now() - 4 * 86400000).toISOString(),
          split: {
            daily: 704,
            bills: 448,
            debt: 416,
            unplanned: 320,
            goals: 544,
            enjoyment: 384,
            retirement: 384,
          },
        },
        {
          id: uid(),
          type: 'income',
          amount: 680,
          note: 'Freelance design gig',
          date: new Date(Date.now() - 2 * 86400000).toISOString(),
          split: {
            daily: 149.6,
            bills: 95.2,
            debt: 88.4,
            unplanned: 68,
            goals: 115.6,
            enjoyment: 81.6,
            retirement: 81.6,
          },
        },
      ];

      baseState.goals = [
        { id: uid(), name: 'Emergency Fund', target: 5000, saved: 1200, date: Date.now() + 180 * 86400000, createdAt: new Date().toISOString() },
        { id: uid(), name: 'Japan Trip', target: 3000, saved: 640, date: Date.now() + 240 * 86400000, createdAt: new Date().toISOString() },
        { id: uid(), name: 'New Laptop', target: 1800, saved: 300, date: Date.now() + 120 * 86400000, createdAt: new Date().toISOString() },
      ];

      baseState.debts = [
        { id: uid(), name: 'Visa Platinum', balance: 2400, apr: 22.5, min: 75, createdAt: new Date().toISOString() },
        { id: uid(), name: 'Student Loan', balance: 11500, apr: 5.2, min: 180, createdAt: new Date().toISOString() },
      ];

      baseState.bills = [
        { id: uid(), name: 'Rent', amount: 1200, day: 1, paid: true, createdAt: new Date().toISOString() },
        { id: uid(), name: 'Electricity', amount: 85, day: 12, paid: false, createdAt: new Date().toISOString() },
        { id: uid(), name: 'High-speed Internet', amount: 60, day: 18, paid: false, createdAt: new Date().toISOString() },
        { id: uid(), name: 'Streaming Services', amount: 18, day: 22, paid: true, createdAt: new Date().toISOString() },
      ];

      baseState.assets = [
        { id: uid(), name: 'Primary Checking', amount: 2400 },
        { id: uid(), name: 'High Yield Savings', amount: 3200 },
        { id: uid(), name: 'Index Fund Investment', amount: 5800 },
      ];

      baseState.liabilities = [
        { id: uid(), name: 'Visa Platinum', amount: 2400 },
        { id: uid(), name: 'Student Loan', amount: 11500 },
      ];

      setState(baseState);
      return true;
    },
    []
  );

  const loginUser = useCallback((email: string, password = ''): boolean => {
    const cleanEmail = email.toLowerCase().trim();
    const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const matched = users.find(
      (u: { email: string; password?: string }) =>
        u.email === cleanEmail && (!password || u.password === password)
    );
    if (!matched) return false;

    localStorage.setItem(SESSION_STORAGE_KEY, cleanEmail);
    const userSaved = localStorage.getItem(DATA_PREFIX + cleanEmail);
    if (userSaved) {
      try {
        setState({ ...createDefaultState(), ...JSON.parse(userSaved) });
      } catch {
        setState((prev) => ({
          ...prev,
          user: { name: matched.name, email: matched.email, createdAt: matched.createdAt },
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        user: { name: matched.name, email: matched.email, createdAt: matched.createdAt },
      }));
    }
    return true;
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setState(createDefaultState());
  }, []);

  const resetAllData = useCallback(() => {
    const reset = createDefaultState();
    if (state.user) {
      reset.user = state.user;
      reset.displayName = state.user.name;
    }
    setState(reset);
  }, [state.user]);

  const downloadCsv = useCallback((filename: string, rows: (string | number)[][]) => {
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell == null ? '' : cell).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const exportTransactionsCsv = useCallback(() => {
    const headers = ['Date', 'Type', 'Amount', 'Note', 'Account'];
    const rows = state.transactions.map((t) => [
      new Date(t.date).toLocaleString(),
      t.type,
      t.amount,
      t.note || '',
      t.account || '',
    ]);
    downloadCsv(`dudumo-transactions-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
    showToast('Transactions exported to CSV', 'gold');
  }, [state.transactions, downloadCsv, showToast]);

  const exportSummaryCsv = useCallback(() => {
    const rows: (string | number)[][] = [
      ['Dudumo — 8 Jars Financial Summary'],
      ['Generated', new Date().toLocaleString()],
      ['Currency', state.currency],
      [''],
      ['Jar', 'Balance', 'Split Percentage'],
      ...JARS.map((j) => [j.name, state.jars[j.key] || 0, `${state.pcts[j.key] || 0}%`]),
      [''],
      ['Active Goals', 'Target', 'Saved'],
      ...state.goals.map((g) => [g.name, g.target, g.saved]),
      [''],
      ['Tracked Debts', 'Balance', 'APR %', 'Minimum Payment'],
      ...state.debts.map((d) => [d.name, d.balance, `${d.apr}%`, d.min]),
    ];
    downloadCsv(`dudumo-summary-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    showToast('Summary report exported', 'gold');
  }, [state, downloadCsv, showToast]);

  const exportGoalsCsv = useCallback(() => {
    const headers = ['Goal Name', 'Saved', 'Target', 'Target Date'];
    const rows = state.goals.map((g) => [
      g.name,
      g.saved,
      g.target,
      g.date ? new Date(g.date).toLocaleDateString() : 'No date',
    ]);
    downloadCsv(`dudumo-goals-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
    showToast('Goals exported to CSV', 'gold');
  }, [state.goals, downloadCsv, showToast]);

  const value = useMemo(
    () => ({
      state,
      toasts,
      showToast,
      removeToast,
      addIncome,
      distributeAmount,
      adjustJar,
      deleteTransaction,
      clearTransactions,
      addGoal,
      updateGoal,
      deleteGoal,
      contributeToGoal,
      addDebt,
      updateDebt,
      deleteDebt,
      setDebtStrategy,
      addBill,
      updateBill,
      deleteBill,
      toggleBillPaid,
      addAsset,
      deleteAsset,
      addLiability,
      deleteLiability,
      updateJarPercent,
      setBudget,
      updatePreferences,
      registerUser,
      loginUser,
      logoutUser,
      resetAllData,
      exportTransactionsCsv,
      exportSummaryCsv,
      exportGoalsCsv,
    }),
    [
      state,
      toasts,
      showToast,
      removeToast,
      addIncome,
      distributeAmount,
      adjustJar,
      deleteTransaction,
      clearTransactions,
      addGoal,
      updateGoal,
      deleteGoal,
      contributeToGoal,
      addDebt,
      updateDebt,
      deleteDebt,
      setDebtStrategy,
      addBill,
      updateBill,
      deleteBill,
      toggleBillPaid,
      addAsset,
      deleteAsset,
      addLiability,
      deleteLiability,
      updateJarPercent,
      setBudget,
      updatePreferences,
      registerUser,
      loginUser,
      logoutUser,
      resetAllData,
      exportTransactionsCsv,
      exportSummaryCsv,
      exportGoalsCsv,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
