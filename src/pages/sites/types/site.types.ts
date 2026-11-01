/**
 * Trạng thái hoạt động của cơ sở
 */
export type SiteStatus = "active" | "inactive";

/**
 * Thông tin một cơ sở trong cây địa bàn
 */
export interface Site {
  // ID duy nhất của cơ sở
  id: string;

  // Mã cơ sở
  code: string;

  // Tên cơ sở
  name: string;

  // ID cơ sở cha
  // null: cơ sở Root
  // undefined: dữ liệu mock chưa khai báo
  parentId?: string | null;

  // Tên cơ sở cấp trên
  parentName?: string;

  // Trạng thái hoạt động
  status: SiteStatus;

  // Danh sách cơ sở trực thuộc
  children?: Site[];
}

/**
 * Dữ liệu form thêm hoặc cập nhật cơ sở
 */
export interface SiteFormValues {
  code: string;
  name: string;
  status: SiteStatus;
}

/**
 * Các thao tác trên cơ sở
 */
export type SiteAction = "create" | "edit" | "delete";

/**
 * Chế độ của popup thêm / sửa cơ sở
 */
export type SiteFormMode = "create" | "edit";

/**
 * Các tab trong trang Quản lý cơ sở
 */
export type SiteTabKey =
  | "info"
  | "users"
  | "devices"
  | "media"
  | "templates"
  | "playlists";

/**
 * Cấu hình tab
 */
export interface SiteTab {
  key: SiteTabKey;
  label: string;
}
