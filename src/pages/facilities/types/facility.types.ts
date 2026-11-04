// Thông tin cơ sở trong cây địa bàn
export interface Facility {
  id: string;
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;

  // Danh sách cơ sở con
  children?: Facility[];
}

// Dữ liệu form thêm hoặc cập nhật cơ sở
export interface FacilityFormValues {
  facilityCode: string;
  facilityName: string;
  isActive: boolean;
}

// Các thao tác trên cơ sở
export type FacilityAction = "create" | "edit" | "delete";

export type FacilityFormMode = "create" | "edit";

// Các tab trong trang Quản lý cơ sở
export type FacilityTabKey =
  | "info"
  | "users"
  | "devices"
  | "media"
  | "templates"
  | "playlists";

export interface FacilityTab {
  key: FacilityTabKey;
  label: string;
}
