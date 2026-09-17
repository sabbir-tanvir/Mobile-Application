import { apiClient } from "./client";
import type { DashboardReport, ReportQueryParams } from "./types/report.types";

export const reportsApi = {
  getDashboard: async (params?: ReportQueryParams): Promise<DashboardReport> => {
    const res = await apiClient.get<DashboardReport>("/reports/dashboard", {
      params,
    });
    return res.data;
  },

  getPartnerShares: async (params?: ReportQueryParams): Promise<any> => {
    const res = await apiClient.get("/reports/partner-shares", { params });
    return res.data;
  },

  getCashPosition: async (params?: Record<string, any>): Promise<any> => {
    const res = await apiClient.get("/reports/cash-position", { params });
    return res.data;
  },

  getReceivables: async (params?: Record<string, any>): Promise<any> => {
    const res = await apiClient.get("/reports/receivables", { params });
    return res.data;
  },
};
