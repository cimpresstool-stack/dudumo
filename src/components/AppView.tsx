import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JarKey, Goal, Debt, Bill } from '../types';
import { JARS, SPLIT_JARS, getJar, formatMoney, formatShortMoney } from '../constants/jars';
import { AdjustJarModal } from './modals/AdjustJarModal';
import { EditRecordModal, EditEntityType } from './modals/EditRecordModal';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  ArrowUpDown,
  BarChart3,
  PieChart,
  Target,
  TrendingDown,
  Calendar,
  Compass,
  Sparkles,
  Sliders,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Edit2,
} from 'lucide-react';

interface AppViewProps {
  onBackToSite: () => void;
}

type TabType =
  | 'dashboard'
  | 'income'
  | 'jars'
  | 'transactions'
  | 'reports'
  | 'budgets'
  | 'goals'
  | 'debts'
  | 'bills'
  | 'networth'
  | 'insights'
  | 'plus'
  | 'settings';

export const AppView: React.FC<AppViewProps> = ({ onBackToSite }) => {
  const {
    state,
    addIncome,
    distributeAmount,
    deleteTransaction,
    clearTransactions,
    addGoal,
    contributeToGoal,
    addDebt,
    setDebtStrategy,
    addBill,
    toggleBillPaid,
    addAsset,
    deleteAsset,
    addLiability,
    deleteLiability,
    updateJarPercent,
    setBudget,
    updatePreferences,
    logoutUser,
    resetAllData,
    exportTransactionsCsv,
    exportSummaryCsv,
    exportGoalsCsv,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [adjustJarKey, setAdjustJarKey] = useState<JarKey | null>(null);
  const [editEntityType, setEditEntityType] = useState<EditEntityType | null>(null);
  const [editEntityId, setEditEntityId] = useState<string | null>(null);

  // Quick form states
  const [quickAmount, setQuickAmount] = useState('');
  const [quickNote, setQuickNote] = useState('');

  // Add Income tab state
  const [cashAmount, setCashAmount] = useState('');
  const [cashNote, setCashNote] = useState('');

  // Goal form state
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalContribAmounts, setGoalContribAmounts] = useState<Record<string, string>>({});

  // Debt form state
  const [debtName, setDebtName] = useState('');
  const [debtBalance, setDebtBalance] = useState('');
  const [debtApr, setDebtApr] = useState('');
  const [debtMin, setDebtMin] = useState('');

  // Bill form state
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDay, setBillDay] = useState('');

  // Asset/Liability forms
  const [assetName, setAssetName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [liabName, setLiabName] = useState('');
  const [liabAmount, setLiabAmount] = useState('');

  // Shared partner email state
  const [partnerEmail, setPartnerEmail] = useState('');

  // Transaction search
  const [txSearch, setTxSearch] = useState('');

  // Quick add income handler
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(quickAmount);
    if (!val || val <= 0) {
      showToast('Enter an income amount greater than 0', 'err');
      return;
    }
    addIncome(val, quickNote.trim() || 'Quick income');
    setQuickAmount('');
    setQuickNote('');
    showToast(`Added ${formatMoney(val, state.currency)} and split into jars ✓`);
  };

  // Dedicated income add handler
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(cashAmount);
    if (!val || val <= 0) {
      showToast('Enter an income amount greater than 0', 'err');
      return;
    }
    addIncome(val, cashNote.trim() || 'Paycheck income');
    setCashAmount('');
    setCashNote('');
    showToast(`Added ${formatMoney(val, state.currency)} and distributed across jars ✓`);
  };

  // Add goal handler
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(goalTarget);
    if (!goalName.trim() || !target || target <= 0) {
      showToast('Please enter a goal title and target amount', 'err');
      return;
    }
    addGoal(goalName.trim(), target, goalDate || undefined);
    setGoalName('');
    setGoalTarget('');
    setGoalDate('');
    showToast('New savings goal created ✓');
  };

  // Add debt handler
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = Number(debtBalance);
    if (!debtName.trim() || !bal || bal <= 0) {
      showToast('Enter debt name and positive balance', 'err');
      return;
    }
    addDebt(debtName.trim(), bal, Number(debtApr) || 0, Number(debtMin) || 0);
    setDebtName('');
    setDebtBalance('');
    setDebtApr('');
    setDebtMin('');
    showToast('Debt added to tracking ✓');
  };

  // Add bill handler
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(billAmount);
    const day = Number(billDay);
    if (!billName.trim() || !amt || amt <= 0 || !day) {
      showToast('Enter bill name, amount, and due day (1-31)', 'err');
      return;
    }
    addBill(billName.trim(), amt, day);
    setBillName('');
    setBillAmount('');
    setBillDay('');
    showToast('Recurring bill added ✓');
  };

  // Calculate live numbers
  const now = new Date();
  const currentMonthIncome = state.transactions
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + (Number(t.amount) || 0), 0);

  const totalGoalsTarget = state.goals.reduce((s, g) => s + (Number(g.target) || 0), 0);
  const totalGoalsSaved = state.goals.reduce((s, g) => s + (Number(g.saved) || 0), 0);
  const goalsProgressPct = totalGoalsTarget > 0 ? Math.round((totalGoalsSaved / totalGoalsTarget) * 100) : 0;

  const totalDebtBalance = state.debts.reduce((s, d) => s + (Number(d.balance) || 0), 0);
  const totalAssetsAmount = state.assets.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const totalLiabAmount = state.liabilities.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const netWorth = totalAssetsAmount - totalLiabAmount;

  // Bills due this week
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const billsDueThisWeek = state.bills.filter((b) => {
    if (b.paid) return false;
    let due = new Date(now.getFullYear(), now.getMonth(), b.day);
    if (due < now) due = new Date(now.getFullYear(), now.getMonth() + 1, b.day);
    return due <= weekFromNow;
  }).length;

  // Percentage total sum validation
  const totalPcts = SPLIT_JARS.reduce((sum, j) => sum + (Number(state.pcts[j.key]) || 0), 0);

  // Filter transactions
  const filteredTransactions = state.transactions.filter((t) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      t.note.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      (t.account && t.account.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-screen bg-[#F7F3EE] text-[#1A1220] overflow-hidden">
      {/* ============ SIDEBAR ============ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#150D1F] text-white flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5 font-black text-xl">
            <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-teal-500/30">
              D
            </div>
            <span>
              Dudumo<span className="text-teal-400">.</span>
            </span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Plan Badge */}
        <div className="mx-4 my-3 p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs">
          <div className="flex items-center justify-between font-bold mb-1">
            <span>Free Complete</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-500 text-[10px] text-white uppercase font-black">
              Forever
            </span>
          </div>
          <span className="text-neutral-400 text-[11px]">All 8 Jars unlocked</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-sm font-medium">
          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
              Money
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('income');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'income'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
                <span>Add Income</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('jars');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'jars'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-teal-400" />
                <span>The 8 Jars</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('transactions');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ArrowUpDown className="w-4 h-4 text-teal-400" />
                <span>Transactions</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reports');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Reports</span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
              Planning
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('budgets');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'budgets'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <PieChart className="w-4 h-4 text-teal-400" />
                <span>Budgets</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('goals');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'goals'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-teal-400" />
                  <span>Goals</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10">
                  {state.goals.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('debts');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'debts'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-teal-400" />
                <span>Debt Payoff</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('bills');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'bills'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span>Bills Calendar</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10">
                  {state.bills.filter((b) => !b.paid).length}
                </span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
              Insights
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('networth');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'networth'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Net Worth</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('insights');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'insights'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Insights</span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
              Account
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setActiveTab('plus');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'plus'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Pro Tools</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4 text-teal-400" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to site</span>
          </button>

          {state.user && (
            <button
              onClick={() => {
                if (window.confirm('Sign out of Dudumo?')) {
                  logoutUser();
                  onBackToSite();
                  showToast('Signed out successfully', 'info');
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* ============ MAIN CONTENT AREA ============ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-neutral-900 capitalize tracking-tight">
                {activeTab === 'plus'
                  ? 'Pro Tools (Free)'
                  : activeTab === 'networth'
                  ? 'Net Worth'
                  : activeTab}
              </h1>
              <p className="text-xs text-neutral-400">
                {activeTab === 'dashboard' && 'Your money at a calm glance'}
                {activeTab === 'income' && 'Add income and watch it split into jars'}
                {activeTab === 'jars' && 'Live balances for all 8 jars'}
                {activeTab === 'transactions' && 'Ledger of all splits & adjustments'}
                {activeTab === 'reports' && 'Distribution breakdown and allocation'}
                {activeTab === 'budgets' && 'Monthly spending limits per jar'}
                {activeTab === 'goals' && 'Named savings targets with progress'}
                {activeTab === 'debts' && 'Track payoff timeline & APR'}
                {activeTab === 'bills' && 'Recurring due dates and one-tap payment'}
                {activeTab === 'networth' && 'Assets minus liabilities'}
                {activeTab === 'insights' && 'Automated money observations'}
                {activeTab === 'plus' && 'Forecaster, detector, shared jars & export'}
                {activeTab === 'settings' && 'Configure split percentages & currency'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('income')}
              className="hidden sm:inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-sm"
              title={state.user ? state.user.name : state.displayName}
            >
              {(state.user?.name || state.displayName || 'ME')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
          </div>
        </header>

        {/* Tab view container */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          {/* ============ TAB: DASHBOARD ============ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-teal-400" />
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Income This Month
                  </span>
                  <b className="block text-2xl font-black text-neutral-900 tracking-tight">
                    {formatMoney(currentMonthIncome, state.currency)}
                  </b>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    All sources recorded
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-purple-400" />
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Unallocated in Inbox
                  </span>
                  <b className="block text-2xl font-black text-neutral-900 tracking-tight">
                    {formatMoney(state.jars.inbox, state.currency)}
                  </b>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Awaiting split
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-400" />
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Goals Progress
                  </span>
                  <b className="block text-2xl font-black text-neutral-900 tracking-tight">
                    {goalsProgressPct}%
                  </b>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    {formatShortMoney(totalGoalsSaved, state.currency)} of{' '}
                    {formatShortMoney(totalGoalsTarget, state.currency)}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-400" />
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Total Tracked Debt
                  </span>
                  <b className="block text-2xl font-black text-neutral-900 tracking-tight">
                    {formatMoney(totalDebtBalance, state.currency)}
                  </b>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    {state.debts.length} active debts
                  </span>
                </div>
              </div>

              {/* Second row 4 KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-neutral-200/70">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Bills Due This Week
                  </span>
                  <b className="text-xl font-black text-neutral-900">{billsDueThisWeek}</b>
                  <span className="block text-[11px] text-amber-600 font-medium">Upcoming due</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200/70">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Active Goals
                  </span>
                  <b className="text-xl font-black text-neutral-900">{state.goals.length}</b>
                  <span className="block text-[11px] text-emerald-600 font-medium">In motion</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200/70">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Net Position
                  </span>
                  <b
                    className={`text-xl font-black ${
                      netWorth >= 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}
                  >
                    {formatShortMoney(netWorth, state.currency)}
                  </b>
                  <span className="block text-[11px] text-neutral-400">Assets − Liabilities</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200/70">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Retirement Jar
                  </span>
                  <b className="text-xl font-black text-indigo-600">
                    {formatShortMoney(state.jars.retirement, state.currency)}
                  </b>
                  <span className="block text-[11px] text-neutral-400">Future you, compounding</span>
                </div>
              </div>

              {/* Quick Add Income Box */}
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">Quick Add Income</h2>
                    <p className="text-xs text-neutral-500">
                      Instantly split across your jars using your formula
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                    Auto-Split Enabled
                  </span>
                </div>

                <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
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
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Source / Note (optional)
                    </label>
                    <input
                      type="text"
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      placeholder="e.g. Salary, freelance design invoice"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add & Split</span>
                    </button>
                  </div>
                </form>

                {/* Live mini distribution preview */}
                {Number(quickAmount) > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                      Live split breakdown
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {SPLIT_JARS.map((j) => {
                        const dist = distributeAmount(Number(quickAmount));
                        const val = dist ? dist[j.key] : 0;
                        return (
                          <div
                            key={j.key}
                            className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-2"
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                              style={{ backgroundColor: j.color }}
                            >
                              {j.letter}
                            </div>
                            <div className="min-w-0">
                              <small className="block text-[10px] text-neutral-400 truncate">
                                {j.short}
                              </small>
                              <b className="block text-xs text-neutral-800">
                                {formatMoney(val, state.currency)}
                              </b>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 8 Jars Gallery */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-neutral-900">Your 8 Jars</h2>
                  <button
                    onClick={() => setActiveTab('jars')}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {JARS.map((j) => {
                    const balance = state.jars[j.key] || 0;
                    const pct = state.pcts[j.key] || j.defaultPct;
                    return (
                      <div
                        key={j.key}
                        className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between"
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: j.color }}
                        />
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-sm"
                              style={{ backgroundColor: j.color }}
                            >
                              {j.letter}
                            </div>
                            <span className="text-[11px] font-bold text-neutral-400">
                              {j.key === 'inbox' ? 'Pass-through' : `${pct}% of split`}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-neutral-900 mb-1">{j.name}</h3>
                          <div className="text-2xl font-black text-neutral-900 tracking-tight">
                            {formatMoney(balance, state.currency)}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <button
                            onClick={() => setAdjustJarKey(j.key)}
                            className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                          >
                            Adjust Funds
                          </button>
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${j.color}15`, color: j.color }}
                          >
                            {j.short}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: ADD INCOME ============ */}
          {activeTab === 'income' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-7 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <h2 className="text-xl font-black text-neutral-900 mb-1">Record Income</h2>
                <p className="text-xs text-neutral-500 mb-6">
                  Every amount entered goes into your staging Inbox and instantly distributes
                  across all 7 funded jars based on your target percentages.
                </p>

                <form onSubmit={handleAddIncome} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3.5 py-3 rounded-xl border border-neutral-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                        Source or Note
                      </label>
                      <input
                        type="text"
                        value={cashNote}
                        onChange={(e) => setCashNote(e.target.value)}
                        placeholder="e.g. Monthly salary, consulting gig, tax refund"
                        className="w-full px-3.5 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add & Auto-Split Across Jars</span>
                  </button>
                </form>

                {/* Distribution preview */}
                <div className="mt-8 pt-6 border-t border-neutral-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Calculated split breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {SPLIT_JARS.map((j) => {
                      const dist = distributeAmount(Number(cashAmount) || state.incomeBaseline || 3200);
                      const share = dist ? dist[j.key] : 0;
                      return (
                        <div
                          key={j.key}
                          className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100"
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white mb-2"
                            style={{ backgroundColor: j.color }}
                          >
                            {j.letter}
                          </div>
                          <span className="block text-[11px] font-semibold text-neutral-600 truncate">
                            {j.short}
                          </span>
                          <b className="block text-sm font-black text-neutral-900 mt-0.5">
                            {formatMoney(share, state.currency)}
                          </b>
                          <small className="text-[10px] text-neutral-400">
                            {state.pcts[j.key] || j.defaultPct}%
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Income History */}
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <h3 className="text-base font-bold text-neutral-900 mb-4">Recent Inflows</h3>
                {state.transactions.filter((t) => t.type === 'income').length === 0 ? (
                  <div className="text-center py-10 text-neutral-400 text-sm">
                    No income logged yet. Use the form above to add your first entry.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Amount</th>
                          <th className="pb-3 pr-4">Source / Note</th>
                          <th className="pb-3">Split Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        {state.transactions
                          .filter((t) => t.type === 'income')
                          .slice(0, 10)
                          .map((t) => (
                            <tr key={t.id} className="hover:bg-neutral-50/50">
                              <td className="py-3 pr-4 whitespace-nowrap text-neutral-500">
                                {new Date(t.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 pr-4 font-bold text-neutral-900 whitespace-nowrap">
                                {formatMoney(t.amount, state.currency)}
                              </td>
                              <td className="py-3 pr-4 font-medium">{t.note}</td>
                              <td className="py-3 whitespace-nowrap">
                                {t.split ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                    <span>Distributed to 7 jars</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                    In Inbox
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ TAB: THE 8 JARS ============ */}
          {activeTab === 'jars' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">All 8 Jars Overview</h2>
                  <p className="text-xs text-neutral-500">
                    Live balance and split allocation across the Dudumo architecture
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {JARS.map((j) => {
                  const bal = state.jars[j.key] || 0;
                  const pct = state.pcts[j.key] || j.defaultPct;
                  return (
                    <div
                      key={j.key}
                      className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: j.color }}
                      />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md"
                            style={{ backgroundColor: j.color }}
                          >
                            {j.letter}
                          </div>
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                            style={{ backgroundColor: `${j.color}15`, color: j.color }}
                          >
                            {j.key === 'inbox' ? 'Inbox' : `${pct}%`}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-neutral-900 mb-1">{j.name}</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed mb-4">{j.desc}</p>
                        <div className="text-3xl font-black text-neutral-900 tracking-tight">
                          {formatMoney(bal, state.currency)}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <button
                          onClick={() => setAdjustJarKey(j.key)}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                        >
                          Deposit / Withdraw
                        </button>
                        <span className="text-[11px] font-semibold text-neutral-400">
                          {j.short}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ TAB: TRANSACTIONS ============ */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Transaction Ledger</h2>
                    <p className="text-xs text-neutral-500">
                      Complete log of income splits, jar deposits, and withdrawals
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportTransactionsCsv}
                      className="py-2 px-3.5 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all transactions? Balances will remain.')) {
                          clearTransactions();
                          showToast('Transaction history cleared', 'info');
                        }
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="Search transactions by note or type..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-sm">
                    No transactions match your query.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Type</th>
                          <th className="pb-3 pr-4">Amount</th>
                          <th className="pb-3 pr-4">Note / Details</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        {filteredTransactions.map((t) => {
                          let typeBadge = 'bg-teal-50 text-teal-700';
                          let typeText = 'Income';
                          if (t.type === 'adjust-add') {
                            typeBadge = 'bg-blue-50 text-blue-700';
                            typeText = 'Deposit';
                          } else if (t.type === 'adjust-sub') {
                            typeBadge = 'bg-rose-50 text-rose-700';
                            typeText = 'Withdrawal';
                          }
                          return (
                            <tr key={t.id} className="hover:bg-neutral-50/50">
                              <td className="py-3 pr-4 whitespace-nowrap text-neutral-500">
                                {new Date(t.date).toLocaleDateString()}{' '}
                                <span className="text-[10px] text-neutral-400">
                                  {new Date(t.date).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </td>
                              <td className="py-3 pr-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${typeBadge}`}
                                >
                                  {typeText}
                                </span>
                              </td>
                              <td className="py-3 pr-4 font-bold text-neutral-900 whitespace-nowrap">
                                {formatMoney(t.amount, state.currency)}
                              </td>
                              <td className="py-3 pr-4 font-medium">{t.note}</td>
                              <td className="py-3 text-right whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    deleteTransaction(t.id);
                                    showToast('Transaction removed', 'info');
                                  }}
                                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ TAB: REPORTS ============ */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    All-Time Inflow
                  </span>
                  <b className="text-2xl font-black text-neutral-900">
                    {formatMoney(
                      state.transactions
                        .filter((t) => t.type === 'income')
                        .reduce((s, t) => s + (Number(t.amount) || 0), 0),
                      state.currency
                    )}
                  </b>
                  <span className="text-xs text-neutral-400 block mt-1">Recorded through system</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Total Goals Saved
                  </span>
                  <b className="text-2xl font-black text-emerald-600">
                    {formatMoney(totalGoalsSaved, state.currency)}
                  </b>
                  <span className="text-xs text-neutral-400 block mt-1">Across all savings goals</span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Total Entries
                  </span>
                  <b className="text-2xl font-black text-neutral-900">{state.transactions.length}</b>
                  <span className="text-xs text-neutral-400 block mt-1">Operations logged</span>
                </div>
              </div>

              {/* Jar breakdown bars */}
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-neutral-900">Split Share Distribution</h3>
                  <button
                    onClick={exportSummaryCsv}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Summary CSV</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {SPLIT_JARS.map((j) => {
                    const balance = state.jars[j.key] || 0;
                    const pct = state.pcts[j.key] || j.defaultPct;
                    return (
                      <div key={j.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: j.color }}
                            />
                            <span>{j.name}</span>
                          </span>
                          <span className="text-neutral-500 font-bold">
                            {formatMoney(balance, state.currency)} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(100, Math.max(5, pct * 2.8))}%`,
                              backgroundColor: j.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: BUDGETS ============ */}
          {activeTab === 'budgets' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">Jar Spending Limits</h2>
                <p className="text-xs text-neutral-500 mb-6">
                  Set a monthly cap for any jar. As you record withdrawals, your progress bar alerts you
                  before overspending occurs.
                </p>

                <div className="space-y-4">
                  {SPLIT_JARS.map((j) => {
                    const limit = state.budgets[j.key] || 0;
                    // Compute month's withdrawals for this jar
                    const monthSpent = state.transactions
                      .filter((t) => {
                        const d = new Date(t.date);
                        return (
                          t.account === j.key &&
                          t.type === 'adjust-sub' &&
                          d.getMonth() === now.getMonth() &&
                          d.getFullYear() === now.getFullYear()
                        );
                      })
                      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

                    const pctUsed = limit > 0 ? Math.min(100, Math.round((monthSpent / limit) * 100)) : 0;
                    let barColor = 'bg-teal-500';
                    if (pctUsed >= 100) barColor = 'bg-rose-500';
                    else if (pctUsed >= 75) barColor = 'bg-amber-500';

                    return (
                      <div
                        key={j.key}
                        className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white"
                              style={{ backgroundColor: j.color }}
                            >
                              {j.letter}
                            </div>
                            <span className="font-bold text-sm text-neutral-900">{j.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500 font-medium">Monthly Cap:</span>
                            <div className="relative w-32">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">
                                {state.currency}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="10"
                                value={limit || ''}
                                onChange={(e) => setBudget(j.key, Number(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              />
                            </div>
                          </div>
                        </div>

                        {limit > 0 ? (
                          <div>
                            <div className="flex justify-between text-xs text-neutral-500 mb-1">
                              <span>
                                Spent {formatMoney(monthSpent, state.currency)} of{' '}
                                {formatMoney(limit, state.currency)}
                              </span>
                              <span className="font-bold text-neutral-700">{pctUsed}%</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${pctUsed}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-400 italic">
                            No limit set for {j.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: GOALS ============ */}
          {activeTab === 'goals' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">Create Savings Goal</h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Set milestones with targets, deadlines, and live monthly requirements
                </p>

                <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="e.g. Vacation in Tokyo, House Downpayment"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Target Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      placeholder="3000.00"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Goal</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Goals Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {state.goals.map((g) => {
                  const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
                  const monthsLeft = g.date
                    ? Math.max(0, Math.ceil((g.date - Date.now()) / (30 * 86400000)))
                    : 0;
                  const monthlyNeeded =
                    monthsLeft > 0 ? Math.max(0, (g.target - g.saved) / monthsLeft) : g.target - g.saved;

                  return (
                    <div
                      key={g.id}
                      className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative flex flex-col justify-between"
                    >
                      <button
                        onClick={() => {
                          setEditEntityType('goal');
                          setEditEntityId(g.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <h3 className="font-bold text-base text-neutral-900 pr-6">{g.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <b className="text-xl font-black text-neutral-900">
                            {formatMoney(g.saved, state.currency)}
                          </b>
                          <span className="text-xs text-neutral-400">
                            / {formatMoney(g.target, state.currency)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-teal-600">{pct}% Complete</span>
                            {monthsLeft > 0 && (
                              <span className="text-neutral-400">
                                ~{formatMoney(monthlyNeeded, state.currency)}/mo
                              </span>
                            )}
                          </div>
                          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {g.date && (
                          <div className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Target: {new Date(g.date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Deposit into goal from goals jar */}
                      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={goalContribAmounts[g.id] || ''}
                          onChange={(e) =>
                            setGoalContribAmounts((prev) => ({
                              ...prev,
                              [g.id]: e.target.value,
                            }))
                          }
                          className="w-24 px-2 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <button
                          onClick={() => {
                            const val = Number(goalContribAmounts[g.id]);
                            if (!val || val <= 0) {
                              showToast('Enter an amount to deposit', 'err');
                              return;
                            }
                            contributeToGoal(g.id, val);
                            setGoalContribAmounts((prev) => ({ ...prev, [g.id]: '' }));
                            showToast(`Deposited ${formatMoney(val, state.currency)} into ${g.name}`);
                          }}
                          className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm cursor-pointer"
                        >
                          Contribute
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ TAB: DEBTS ============ */}
          {activeTab === 'debts' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">Add Tracked Debt</h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Log loans, cards, or financing to compute your debt payoff timeline
                </p>

                <form onSubmit={handleAddDebt} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Debt Name
                    </label>
                    <input
                      type="text"
                      value={debtName}
                      onChange={(e) => setDebtName(e.target.value)}
                      placeholder="e.g. Visa Credit Card"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={debtBalance}
                      onChange={(e) => setDebtBalance(e.target.value)}
                      placeholder="2400.00"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      APR %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={debtApr}
                      onChange={(e) => setDebtApr(e.target.value)}
                      placeholder="18.5"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Min Pay
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={debtMin}
                      onChange={(e) => setDebtMin(e.target.value)}
                      placeholder="75.00"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Strategy Selector & Summary */}
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Payoff Priority Strategy</h3>
                  <p className="text-xs text-neutral-400">Choose how extra funds are allocated</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDebtStrategy('snowball')}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      state.debtStrategy === 'snowball'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Snowball (Smallest First)
                  </button>
                  <button
                    onClick={() => setDebtStrategy('avalanche')}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      state.debtStrategy === 'avalanche'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Avalanche (Highest APR First)
                  </button>
                </div>
              </div>

              {/* Debts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {state.debts.map((d) => {
                  const monthlyRate = (d.apr || 0) / 100 / 12;
                  let monthsLeft: number | null = null;
                  if (d.min > 0 && d.balance > 0) {
                    if (monthlyRate === 0) {
                      monthsLeft = Math.ceil(d.balance / d.min);
                    } else if (d.min > d.balance * monthlyRate) {
                      monthsLeft = Math.ceil(
                        -Math.log(1 - (d.balance * monthlyRate) / d.min) / Math.log(1 + monthlyRate)
                      );
                    }
                  }

                  return (
                    <div
                      key={d.id}
                      className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setEditEntityType('debt');
                          setEditEntityId(d.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Edit debt"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="pr-6">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                          {d.apr}% APR
                        </span>
                        <h3 className="font-bold text-base text-neutral-900 mt-0.5">{d.name}</h3>
                        <div className="text-2xl font-black text-neutral-900 mt-2">
                          {formatMoney(d.balance, state.currency)}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Minimum Monthly:</span>
                          <b className="text-neutral-900">{formatMoney(d.min, state.currency)}</b>
                        </div>
                        <div className="flex justify-between">
                          <span>Payoff Timeline:</span>
                          <b className={monthsLeft ? 'text-teal-600' : 'text-rose-600'}>
                            {monthsLeft ? `${monthsLeft} months` : 'Min pay too low'}
                          </b>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ TAB: BILLS ============ */}
          {activeTab === 'bills' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">Add Recurring Bill</h2>
                <p className="text-xs text-neutral-500 mb-4">
                  Set recurring obligations so they auto-accumulate in your Utilities & Bills jar
                </p>

                <form onSubmit={handleAddBill} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Bill Name
                    </label>
                    <input
                      type="text"
                      value={billName}
                      onChange={(e) => setBillName(e.target.value)}
                      placeholder="e.g. Apartment Rent, Electricity, Internet"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      placeholder="1200.00"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Due Day (1-31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={billDay}
                      onChange={(e) => setBillDay(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bill</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Bills Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {state.bills.map((b) => {
                  let due = new Date(now.getFullYear(), now.getMonth(), b.day);
                  if (due < now) due = new Date(now.getFullYear(), now.getMonth() + 1, b.day);
                  const daysAway = Math.ceil((due.getTime() - now.getTime()) / 86400000);

                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative flex flex-col justify-between"
                    >
                      <button
                        onClick={() => {
                          setEditEntityType('bill');
                          setEditEntityId(b.id);
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Edit bill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              b.paid
                                ? 'bg-emerald-50 text-emerald-700'
                                : daysAway <= 3
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.paid ? 'Settled' : daysAway <= 3 ? 'Due Soon' : 'Upcoming'}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-neutral-900 mt-2 pr-6">{b.name}</h3>
                        <div className="text-2xl font-black text-neutral-900 mt-1">
                          {formatMoney(b.amount, state.currency)}
                        </div>
                        <span className="text-xs text-neutral-400 mt-1 block">
                          Due day {b.day} ({due.toLocaleDateString()})
                        </span>
                      </div>

                      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <button
                          onClick={() => toggleBillPaid(b.id)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            b.paid
                              ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{b.paid ? 'Mark Unpaid' : 'Mark as Paid'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ TAB: NET WORTH ============ */}
          {activeTab === 'networth' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Total Assets
                  </span>
                  <b className="text-2xl font-black text-emerald-600">
                    {formatMoney(totalAssetsAmount, state.currency)}
                  </b>
                  <span className="text-xs text-neutral-400 block mt-1">
                    {state.assets.length} items logged
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Total Liabilities
                  </span>
                  <b className="text-2xl font-black text-rose-600">
                    {formatMoney(totalLiabAmount, state.currency)}
                  </b>
                  <span className="text-xs text-neutral-400 block mt-1">
                    {state.liabilities.length} debt items
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Net Position
                  </span>
                  <b
                    className={`text-2xl font-black ${
                      netWorth >= 0 ? 'text-teal-600' : 'text-rose-600'
                    }`}
                  >
                    {formatMoney(netWorth, state.currency)}
                  </b>
                  <span className="text-xs text-neutral-400 block mt-1">Assets minus liabilities</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets Card */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-neutral-900">Assets (What you own)</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Savings, Investments"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={assetAmount}
                      onChange={(e) => setAssetAmount(e.target.value)}
                      className="w-24 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => {
                        const val = Number(assetAmount);
                        if (!assetName.trim() || !val || val <= 0) return;
                        addAsset(assetName.trim(), val);
                        setAssetName('');
                        setAssetAmount('');
                        showToast('Asset added');
                      }}
                      className="p-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100 text-xs">
                    {state.assets.map((a) => (
                      <div key={a.id} className="py-2.5 flex items-center justify-between">
                        <span className="font-medium text-neutral-800">{a.name}</span>
                        <div className="flex items-center gap-3">
                          <b className="text-neutral-900 font-bold">
                            {formatMoney(a.amount, state.currency)}
                          </b>
                          <button
                            onClick={() => deleteAsset(a.id)}
                            className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities Card */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-neutral-900">
                    Liabilities (What you owe)
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Student Loan, Auto Loan"
                      value={liabName}
                      onChange={(e) => setLiabName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={liabAmount}
                      onChange={(e) => setLiabAmount(e.target.value)}
                      className="w-24 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => {
                        const val = Number(liabAmount);
                        if (!liabName.trim() || !val || val <= 0) return;
                        addLiability(liabName.trim(), val);
                        setLiabName('');
                        setLiabAmount('');
                        showToast('Liability added');
                      }}
                      className="p-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100 text-xs">
                    {state.liabilities.map((l) => (
                      <div key={l.id} className="py-2.5 flex items-center justify-between">
                        <span className="font-medium text-neutral-800">{l.name}</span>
                        <div className="flex items-center gap-3">
                          <b className="text-neutral-900 font-bold">
                            {formatMoney(l.amount, state.currency)}
                          </b>
                          <button
                            onClick={() => deleteLiability(l.id)}
                            className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: INSIGHTS ============ */}
          {activeTab === 'insights' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">
                  Automated Financial Observations
                </h2>
                <p className="text-xs text-neutral-500">
                  Calculated from your current jar balances, savings rate, and recurring obligations.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      Unplanned Emergency Cushion:{' '}
                      {state.bills.length > 0
                        ? `${(
                            state.jars.unplanned /
                            Math.max(
                              1,
                              state.bills.reduce((s, b) => s + b.amount, 0)
                            )
                          ).toFixed(1)} Months Coverage`
                        : `${formatMoney(state.jars.unplanned, state.currency)} Funded`}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      Your Unplanned jar is currently funded at{' '}
                      {formatMoney(state.jars.unplanned, state.currency)}. This provides a dedicated
                      buffer without touching your regular checking or credit cards.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      Guilt-Free Fun Allowance:{' '}
                      {formatMoney(state.jars.enjoyment, state.currency)} Available
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      You have {formatMoney(state.jars.enjoyment, state.currency)} sitting in your Own
                      Enjoyment jar. Because bills, debt, and retirement are already funded, this money
                      is 100% yours to spend without regret.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      Goals & Retirement Pace: {state.pcts.goals + state.pcts.retirement}% of Inflow
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                      Every dollar that lands automatically feeds your future. Currently,{' '}
                      {state.pcts.goals}% goes directly to active goals and {state.pcts.retirement}%
                      funds long-term retirement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: PRO TOOLS ============ */}
          {activeTab === 'plus' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>All Pro Features Included</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">Dudumo Advanced Suite</h2>
                <p className="text-xs text-neutral-200 mt-1">
                  100% unlocked for everyone. No fees, no locked tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forecaster */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-neutral-900">
                    3-Month Paycheck Forecaster
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Estimated balance trajectory based on baseline income of{' '}
                    {formatMoney(state.incomeBaseline, state.currency)}/mo
                  </p>
                  <div className="h-44 flex items-end justify-between gap-2 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    {[-2, -1, 0, 1, 2, 3].map((offset) => {
                      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                      const isFuture = offset > 0;
                      const multiplier = isFuture ? 1 + offset * 0.04 : 0.85 + Math.abs(offset) * 0.08;
                      const val = Math.round(state.incomeBaseline * multiplier);
                      const heightPct = Math.min(100, Math.max(25, (val / 4500) * 100));

                      return (
                        <div key={offset} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-bold text-neutral-700">
                            {formatShortMoney(val, state.currency)}
                          </span>
                          <div
                            className={`w-full rounded-t-lg transition-all ${
                              isFuture
                                ? 'bg-gradient-to-t from-amber-400 to-amber-500'
                                : 'bg-gradient-to-t from-teal-500 to-teal-400'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[10px] text-neutral-400">
                            {d.toLocaleDateString([], { month: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shared Jars Invite */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-neutral-900">Shared Jars & Household</h3>
                  <p className="text-xs text-neutral-500">
                    Invite a partner or family member to sync household categories like Rent, Bills,
                    and Vacation savings.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="partner@example.com"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => {
                        if (!partnerEmail.trim() || !/^\S+@\S+\.\S+$/.test(partnerEmail)) {
                          showToast('Enter a valid email address', 'err');
                          return;
                        }
                        showToast(`Invitation sent to ${partnerEmail} ✓`, 'gold');
                        setPartnerEmail('');
                      }}
                      className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 text-[11px] text-neutral-500 border border-neutral-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>End-to-end client sync enabled. Both partners see real-time splits.</span>
                  </div>
                </div>

                {/* Subscription Detector */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-3">
                  <h3 className="font-bold text-base text-neutral-900">Subscription Detector</h3>
                  <p className="text-xs text-neutral-500">
                    Identifies repeating micro-charges across your recurring list.
                  </p>
                  <div className="space-y-2">
                    {state.bills
                      .filter((b) => /netflix|spotify|subscription|prime|disney|apple|hulu/i.test(b.name))
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs"
                        >
                          <span className="font-semibold text-neutral-800">{sub.name}</span>
                          <b className="text-neutral-900">{formatMoney(sub.amount, state.currency)}/mo</b>
                        </div>
                      ))}
                    {state.bills.filter((b) =>
                      /netflix|spotify|subscription|prime|disney|apple|hulu/i.test(b.name)
                    ).length === 0 && (
                      <div className="text-xs text-neutral-400 py-3 text-center">
                        No subscription charges flagged.
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit trail */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-3">
                  <h3 className="font-bold text-base text-neutral-900">Audit Trail</h3>
                  <p className="text-xs text-neutral-500">
                    Timestamped history of state operations for compliance and verification.
                  </p>
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs">
                    {state.auditLog.map((log) => (
                      <div
                        key={log.id}
                        className="p-2 rounded-xl bg-neutral-50 border border-neutral-100"
                      >
                        <div className="flex items-center justify-between font-bold text-neutral-800">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            {new Date(log.date).toLocaleDateString()}
                          </span>
                        </div>
                        {log.detail && (
                          <div className="text-[11px] text-neutral-500 mt-0.5">{log.detail}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: SETTINGS ============ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Percentages Configuration */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">Jar Split Percentages</h2>
                    <p className="text-xs text-neutral-500">
                      Determine how every incoming dollar divides. Must total exactly 100%.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {SPLIT_JARS.map((j) => {
                      const val = state.pcts[j.key] ?? j.defaultPct;
                      return (
                        <div
                          key={j.key}
                          className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-100"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center font-black text-xs text-white"
                              style={{ backgroundColor: j.color }}
                            >
                              {j.letter}
                            </div>
                            <span className="text-xs font-semibold text-neutral-800">{j.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={val}
                              onChange={(e) => updateJarPercent(j.key, Number(e.target.value) || 0)}
                              className="w-16 px-2 py-1 rounded-lg border border-neutral-200 text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            <span className="text-xs font-bold text-neutral-400">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      Math.abs(totalPcts - 100) < 0.01
                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <span>Total Allocated:</span>
                    <span>
                      {totalPcts.toFixed(1)}% {Math.abs(totalPcts - 100) < 0.01 ? '✓ (Valid)' : '⚠️ (Must equal 100%)'}
                    </span>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-neutral-900">App Preferences</h2>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Currency Symbol
                    </label>
                    <select
                      value={state.currency}
                      onChange={(e) => {
                        updatePreferences({ currency: e.target.value });
                        showToast(`Currency updated to ${e.target.value}`);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (Euro)</option>
                      <option value="£">£ (Pound)</option>
                      <option value="₦">₦ (Naira)</option>
                      <option value="₵">₵ (Cedi)</option>
                      <option value="KSh ">KSh (Kenyan Shilling)</option>
                      <option value="USh ">USh (Ugandan Shilling)</option>
                      <option value="R ">R (Rand)</option>
                      <option value="₹">₹ (Rupee)</option>
                      <option value="¥">¥ (Yen)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={state.displayName}
                      onChange={(e) => updatePreferences({ displayName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Monthly Baseline Income
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      value={state.incomeBaseline}
                      onChange={(e) =>
                        updatePreferences({ incomeBaseline: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.autoSplit}
                        onChange={(e) => {
                          updatePreferences({ autoSplit: e.target.checked });
                          showToast(`Auto-split ${e.target.checked ? 'activated' : 'deactivated'}`);
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Automatically split incoming income on arrival</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Reset all jars, transactions, and goals to initial state? This cannot be undone.'
                          )
                        ) {
                          resetAllData();
                          showToast('Data reset to defaults', 'info');
                        }
                      }}
                      className="w-full py-2 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    >
                      Reset All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Adjust jar modal */}
      <AdjustJarModal jarKey={adjustJarKey} onClose={() => setAdjustJarKey(null)} />

      {/* Edit record modal */}
      <EditRecordModal
        entityType={editEntityType}
        entityId={editEntityId}
        onClose={() => {
          setEditEntityType(null);
          setEditEntityId(null);
        }}
      />
    </div>
  );
};
