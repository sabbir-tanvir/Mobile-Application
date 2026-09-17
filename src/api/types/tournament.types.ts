export interface Tournament {
  id: string | number;
  name: string;
  turfId?: string | number;
  turfName?: string;
  startDate: string;
  endDate: string;
  maxTeams?: number;
  entryFee: number;
  prizePool?: number;
  status: "upcoming" | "ongoing" | "completed";
  format?: string;
  description?: string;
  rules?: string;
  teams?: any[];
  createdAt?: string;
}
