// Trạng thái tài khoản
export type FacilityUserStatus = "active" | "inactive";

export interface FacilityUser {
  id: string;
  facilityId: string; // ID cơ sở
  username: string;
  fullName: string;
  identityNumber?: string;
  phone?: string;
  email: string;
  role: string;
  status: FacilityUserStatus;
  avatar?: string;
  updatedAt: string;
}
