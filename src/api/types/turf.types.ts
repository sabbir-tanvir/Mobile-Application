export interface Turf {
  id: string | number;
  name: string;
  type: string;
  size?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  status: "active" | "maintenance" | "inactive";
  basePrice: number;
  peakPrice?: number;
  nightPrice?: number;
  openingHour: number;
  closingHour: number;
  peakHoursStart?: number;
  peakHoursEnd?: number;
  weekendMultiplier?: number;
  amenities: string[];
  createdAt?: string;
}

export interface TurfFilters {
  type?: string;
  status?: string;
  search?: string;
  limit?: number;
  sort?: string;
}
