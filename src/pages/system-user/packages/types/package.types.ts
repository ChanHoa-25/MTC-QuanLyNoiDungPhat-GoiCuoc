export type PackageStatus = "active" | "inactive" | "stopped" | "expired";

export interface PackageItem {
  id: string;
  capacity: string;
  name: string;
  duration: string;
  deviceLimit: string;
  price: number;
  visibility: string;
  registrations: number;
  createdAt: string;
  status: PackageStatus;
}

export interface PackageGroup {
  id: string;
  capacity: string;
  name: string;
  packages: PackageItem[];
}

export const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  active: "Đang kinh doanh",
  inactive: "Chưa kinh doanh",
  stopped: "Ngừng kinh doanh",
  expired: "Đã kết thúc",
};
