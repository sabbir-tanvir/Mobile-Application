export interface PartnerItem {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  shareBp: number; // e.g. 5000 = 50%
  sharePct: number; // e.g. 50
  createdAt?: string;
}

export interface CreatePartnerPayload {
  fullName: string;
  email: string;
  password?: string;
}

export interface UpdatePartnerPayload {
  fullName?: string;
  email?: string;
  password?: string;
  status?: "active" | "inactive";
}

export interface ReallocateShareItem {
  userId: string;
  shareBp: number;
}

export interface ReallocatePayload {
  shares: ReallocateShareItem[];
  reason: string;
}

export interface PayoutItem {
  id: string;
  userId: string;
  partnerName?: string;
  amount: number; // in Poisha (100 Poisha = 1 BDT)
  paymentMethod: string;
  paymentAccount?: string;
  entryDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface CreatePayoutPayload {
  userId: string;
  amount: number; // in Poisha
  paymentMethod: string;
  notes?: string;
}

export interface ShareHistoryItem {
  id: string;
  version: number;
  changedBy: string;
  reason?: string;
  snapshot?: string;
  createdAt: string;
}
