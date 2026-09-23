export interface ReportQueryParams {
  period?: "monthly" | "yearly" | "daily" | "weekly";
  from?: string;
  to?: string;
  asOf?: string;
}

export interface AccountBreakdownItem {
  accountCode?: string;
  code?: string;
  name: string;
  amount?: number;
  balance?: number;
}

export interface ProfitLossReport {
  period: { from: string; to: string };
  revenue: {
    total: number;
    breakdown: AccountBreakdownItem[];
  };
  cogs: {
    total: number;
    breakdown: AccountBreakdownItem[];
  };
  grossProfit: number;
  expenses: {
    total: number;
    breakdown: AccountBreakdownItem[];
  };
  netProfit: number;
}

export interface CashPositionReport {
  asOf: string;
  total: number;
  accounts: {
    code: string;
    name: string;
    balance: number;
  }[];
}

export interface ReceivableBooking {
  bookingId: string;
  customerName: string;
  totalPrice: number;
  paid: number;
  outstanding: number;
}

export interface ReceivablesReport {
  asOf: string;
  totalOutstanding: number;
  bookings: ReceivableBooking[];
}

export interface PartnerDistributionShare {
  userId?: string;
  partnerId?: string;
  fullName?: string;
  name?: string;
  effectiveBp?: number;
  basisPoints?: number;
  effectivePct: number;
  grossShare: number;
  paidOut: number;
  outstanding: number;
}

export interface PartnerSharesReport {
  period: { from: string; to: string };
  netProfit: number;
  shares: PartnerDistributionShare[];
  message?: string;
}

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
