export type RoleUserStatus = "active" | "inactive";

export interface RoleUser {
  id: number;
  username: string;
  password?: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  email: string;
  role: string;
  status: RoleUserStatus;
  timezone: string;
  updatedAt: string;
}

export interface RoleUserFormValues {
  username: string;
  password?: string;
  fullName: string;
  identityNumber: string;
  phone: string;
  email: string;
  role: string;
  status: RoleUserStatus;
  timezone: string;
}
