import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "@/api/accounting.api";
import type {
  CreateAccountPayload,
  CreateExpensePayload,
  CreateIncomePayload,
} from "@/api/types/accounting.types";

export const accountingKeys = {
  all: ["accounting"] as const,
  accounts: (params?: { type?: string; status?: string }) => [...accountingKeys.all, "accounts", params ?? {}] as const,
  expenses: (params?: { from?: string; to?: string }) => [...accountingKeys.all, "expenses", params ?? {}] as const,
  incomes: (params?: { from?: string; to?: string }) => [...accountingKeys.all, "incomes", params ?? {}] as const,
  ledger: (params?: { from?: string; to?: string }) => [...accountingKeys.all, "ledger", params ?? {}] as const,
};

// Accounts
export function useAccounts(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: accountingKeys.accounts(params),
    queryFn: () => accountingApi.listAccounts(params),
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => accountingApi.createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAccountPayload> }) =>
      accountingApi.updateAccount(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() });
    },
  });
}

// Expenses
export function useExpenses(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: accountingKeys.expenses(params),
    queryFn: () => accountingApi.listExpenses(params),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => accountingApi.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.ledger() });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.ledger() });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Incomes
export function useIncomes(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: accountingKeys.incomes(params),
    queryFn: () => accountingApi.listIncomes(params),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncomePayload) => accountingApi.createIncome(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.incomes() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.ledger() });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountingApi.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.incomes() });
      queryClient.invalidateQueries({ queryKey: accountingKeys.ledger() });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// General Ledger
export function useLedgerEntries(params?: { from?: string; to?: string; limit?: number }) {
  return useQuery({
    queryKey: accountingKeys.ledger(params),
    queryFn: () => accountingApi.listJournalEntries(params),
  });
}
