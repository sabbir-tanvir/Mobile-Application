export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "cogs"
  | "expense";

export type NormalSide = "debit" | "credit";

export interface AccountItem {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalSide: NormalSide;
  description?: string;
  isSystem?: number;
  status: "active" | "inactive";
  createdAt?: string;
}

export interface CreateAccountPayload {
  code: string;
  name: string;
  type: AccountType;
  normalSide: NormalSide;
  description?: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number; // Stored in Poisha (100 Poisha = 1 BDT)
  accountCode: string;
  paymentMethod: string;
  paymentStatus: string;
  entryDate: string; // YYYY-MM-DD
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface CreateExpensePayload {
  description: string;
  amount: number; // Sent in Poisha
  accountCode: string;
  paymentMethod: string;
  entryDate: string;
  notes?: string;
}

export interface IncomeItem {
  id: string;
  description: string;
  amount: number; // Stored in Poisha (100 Poisha = 1 BDT)
  accountCode: string;
  paymentMethod: string;
  paymentStatus: string;
  entryDate: string; // YYYY-MM-DD
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface CreateIncomePayload {
  description: string;
  amount: number; // Sent in Poisha
  accountCode: string;
  paymentMethod: string;
  entryDate: string;
  notes?: string;
}

export interface JournalLine {
  accountCode: string;
  accountName?: string;
  debit: number; // in Poisha
  credit: number; // in Poisha
  description?: string;
}

export interface JournalEntryItem {
  id: string;
  entryDate: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  postingEvent?: string;
  totalDebit?: number;
  totalCredit?: number;
  lines?: JournalLine[];
  createdAt?: string;
}
