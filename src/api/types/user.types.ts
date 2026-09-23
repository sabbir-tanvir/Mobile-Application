export type UserRole = "admin" | "partner" | "staff" | "customer" | "user";
export type UserStatus = "active" | "inactive" | "suspended";

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  imageUrl?: string;
  imagePublicId?: string;
  createdAt?: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  imageUrl?: string;
  imagePublicId?: string;
}
