import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports.api";
import type { ReportQueryParams } from "@/api/types/report.types";

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: (params?: ReportQueryParams) =>
    [...reportKeys.all, "dashboard", params ?? {}] as const,
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
