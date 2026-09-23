import { apiClient } from "./client";
import type {
  DashboardReport,
  ProfitLossReport,
  CashPositionReport,
  ReceivablesReport,
  PartnerSharesReport,
  ReportQueryParams,
} from "./types/report.types";

export const reportsApi = {
  getDashboard: async (params?: ReportQueryParams): Promise<DashboardReport> => {
    const res = await apiClient.get<DashboardReport>("/reports/dashboard", {
      params,
    });
    return res.data;
  },

  getProfitLoss: async (params?: ReportQueryParams): Promise<ProfitLossReport> => {
    const res = await apiClient.get<ProfitLossReport>("/reports/profit-loss", {
      params,
    });
    return res.data;
  },

  getCashPosition: async (params?: ReportQueryParams): Promise<CashPositionReport> => {
    const res = await apiClient.get<CashPositionReport>("/reports/cash-position", {
      params,
    });
    return res.data;
  },

  getReceivables: async (params?: ReportQueryParams): Promise<ReceivablesReport> => {
    const res = await apiClient.get<ReceivablesReport>("/reports/receivables", {
      params,
    });
    return res.data;
  },

  getPartnerShares: async (params?: ReportQueryParams): Promise<PartnerSharesReport> => {
    const res = await apiClient.get<PartnerSharesReport>("/reports/partner-shares", {
      params,
    });
    return res.data;
  },
};
