export type SiteUserStatus = "active" | "inactive";

export interface SiteUser {
  id: string;
  siteId: string;
  username: string;
  fullName: string;
  identityNumber?: string;
  phone?: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar?: string;
  updatedAt: string;
}
