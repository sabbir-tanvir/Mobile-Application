export type TournamentStatus =
  | "upcoming"
  | "registration_open"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TournamentFormat = "knockout" | "league" | "group_stage";

export interface TournamentTeam {
  name: string;
  captainName: string;
  captainPhone: string;
  paid: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  turfId: string;
  turfName?: string;
  startDate?: string;
  endDate?: string;
  maxTeams: number;
  entryFee: number;
  prizePool: number;
  status: TournamentStatus;
  format: TournamentFormat;
  description?: string;
  rules?: string;
  teams?: TournamentTeam[] | string;
  createdAt?: string;
}

export interface CreateTournamentPayload {
  name: string;
  turfId: string;
  turfName?: string;
  startDate?: string;
  endDate?: string;
  maxTeams?: number;
  entryFee?: number;
  prizePool?: number;
  status?: TournamentStatus;
  format?: TournamentFormat;
  description?: string;
  rules?: string;
  teams?: TournamentTeam[] | string;
}

export interface UpdateTournamentPayload {
  name?: string;
  turfId?: string;
  turfName?: string;
  startDate?: string;
  endDate?: string;
  maxTeams?: number;
  entryFee?: number;
  prizePool?: number;
  status?: TournamentStatus;
  format?: TournamentFormat;
  description?: string;
  rules?: string;
  teams?: TournamentTeam[] | string;
}
