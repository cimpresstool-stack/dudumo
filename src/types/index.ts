export type JarKey =
  | 'inbox'
  | 'daily'
  | 'bills'
  | 'debt'
  | 'unplanned'
  | 'goals'
  | 'enjoyment'
  | 'retirement';

export interface JarDefinition {
  key: JarKey;
  letter: string;
  name: string;
  color: string;
  defaultPct: number;
  short: string;
  desc: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'adjust-add' | 'adjust-sub';
  amount: number;
  note: string;
  date: string;
  split?: Record<string, number> | null;
  account?: JarKey;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  date: number | null;
  createdAt: string;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  min: number;
  createdAt: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  day: number;
  paid: boolean;
  createdAt: string;
}

export interface BalanceItem {
  id: string;
  name: string;
  amount: number;
}

export interface User {
  name: string;
  email: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  detail: string;
  date: string;
}

export interface AppState {
  jars: Record<JarKey, number>;
  pcts: Record<JarKey, number>;
  autoSplit: boolean;
  currency: string;
  displayName: string;
  incomeBaseline: number;
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  bills: Bill[];
  assets: BalanceItem[];
  liabilities: BalanceItem[];
  budgets: Record<string, number>;
  debtStrategy: 'snowball' | 'avalanche';
  user: User | null;
  auditLog: AuditLogItem[];
}

export type ToastKind = 'success' | 'err' | 'info' | 'gold';

export interface ToastMessage {
  id: string;
  message: string;
  kind?: ToastKind;
}
