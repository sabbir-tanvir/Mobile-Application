export interface PartnerShare {
  userId: string | number;
  fullName: string;
  effectiveBp: number;
  effectivePct: number;
  grossShare: number;
  paidOut: number;
  outstanding: number;
}

export interface DashboardReport {
  period?: { from: string; to: string };
  totalRevenue: number;
  totalExpenses: number;
  cogs: number;
  netProfit: number;
  // Admin fields
  totalCash?: number;
  totalReceivables?: number;
  partnerCount?: number;
  bookingCount?: number;
  orderCount?: number;
  // Partner fields
  myShare?: PartnerShare | null;
}

export interface ReportQueryParams {
  period?: "monthly" | "yearly" | "daily";
  from?: string;
  to?: string;
}
