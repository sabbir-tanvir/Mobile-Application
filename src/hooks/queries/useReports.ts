import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports.api";
import type { ReportQueryParams } from "@/api/types/report.types";

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: (params?: ReportQueryParams) =>
    [...reportKeys.all, "dashboard", params ?? {}] as const,
  profitLoss: (params?: ReportQueryParams) =>
    [...reportKeys.all, "profitLoss", params ?? {}] as const,
  cashPosition: (params?: ReportQueryParams) =>
    [...reportKeys.all, "cashPosition", params ?? {}] as const,
  receivables: (params?: ReportQueryParams) =>
    [...reportKeys.all, "receivables", params ?? {}] as const,
  partnerShares: (params?: ReportQueryParams) =>
    [...reportKeys.all, "partnerShares", params ?? {}] as const,
};

export function useDashboardReport(
  params?: ReportQueryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: reportKeys.dashboard(params),
    queryFn: () => reportsApi.getDashboard(params),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useProfitLossReport(
  params?: ReportQueryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: reportKeys.profitLoss(params),
    queryFn: () => reportsApi.getProfitLoss(params),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCashPositionReport(
  params?: ReportQueryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: reportKeys.cashPosition(params),
    queryFn: () => reportsApi.getCashPosition(params),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useReceivablesReport(
  params?: ReportQueryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: reportKeys.receivables(params),
    queryFn: () => reportsApi.getReceivables(params),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePartnerSharesReport(
  params?: ReportQueryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: reportKeys.partnerShares(params),
    queryFn: () => reportsApi.getPartnerShares(params),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}
