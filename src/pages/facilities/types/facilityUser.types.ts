export type FacilityUserStatus = "active" | "inactive";

export interface FacilityUser {
  id: string;
  facilityId: string;

  username: string;
  fullName: string;
  identityNumber?: string;
  phone?: string;
  email: string;

  // UUID vai trò từ Backend
  // Không bắt buộc để tương thích dữ liệu mock cũ
  roleId?: string | null;

  // Tên vai trò hiển thị trên bảng
  role: string;

  status: FacilityUserStatus;
  avatar?: string;
  updatedAt: string;
}
