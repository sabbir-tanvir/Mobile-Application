import { apiClient } from "./client";
import type {
  AccountItem,
  CreateAccountPayload,
  ExpenseItem,
  CreateExpensePayload,
  IncomeItem,
  CreateIncomePayload,
  JournalEntryItem,
} from "./types/accounting.types";

export const accountingApi = {
  // Accounts
  listAccounts: async (params?: { type?: string; status?: string }): Promise<AccountItem[]> => {
    const res = await apiClient.get<AccountItem[]>("/accounts", { params });
    return res.data;
  },

  createAccount: async (payload: CreateAccountPayload): Promise<AccountItem> => {
    const res = await apiClient.post<AccountItem>("/accounts", payload);
    return res.data;
  },

  updateAccount: async (id: string, payload: Partial<CreateAccountPayload>): Promise<AccountItem> => {
    const res = await apiClient.put<AccountItem>(`/accounts/${id}`, payload);
    return res.data;
  },

  // Expenses
  listExpenses: async (params?: { from?: string; to?: string }): Promise<ExpenseItem[]> => {
    const res = await apiClient.get<ExpenseItem[]>("/expenses", { params });
    return res.data;
  },

  createExpense: async (payload: CreateExpensePayload): Promise<ExpenseItem> => {
    const res = await apiClient.post<ExpenseItem>("/expenses", payload);
    return res.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  // Incomes
  listIncomes: async (params?: { from?: string; to?: string }): Promise<IncomeItem[]> => {
    const res = await apiClient.get<IncomeItem[]>("/incomes", { params });
    return res.data;
  },

  createIncome: async (payload: CreateIncomePayload): Promise<IncomeItem> => {
    const res = await apiClient.post<IncomeItem>("/incomes", payload);
    return res.data;
  },

  deleteIncome: async (id: string): Promise<void> => {
    await apiClient.delete(`/incomes/${id}`);
  },

  // General Ledger
  listJournalEntries: async (params?: { from?: string; to?: string; limit?: number }): Promise<JournalEntryItem[]> => {
    const res = await apiClient.get<JournalEntryItem[]>("/ledger", { params });
    return res.data;
  },
};
