// Trạng thái tài khoản
export type FacilityUserStatus = "active" | "inactive";

export interface FacilityRole {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
}

export interface FacilityUser {
  id: string;
  facilityId?: string | null;
  facilityName?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  username: string;
  fullName: string;
  identityNumber?: string;
  phone?: string;
  phoneNumber?: string;
  email: string;
  role?: string;
  roleId?: string;
  roleCode?: string;
  roleName?: string;
  isActive?: boolean;
  status?: FacilityUserStatus;
  avatar?: string;
  createdAt?: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastActivityAt?: string | null;
}
