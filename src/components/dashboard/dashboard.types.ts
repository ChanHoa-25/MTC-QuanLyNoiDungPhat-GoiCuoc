import type { LucideIcon } from "lucide-react";

// Trạng thái thiết bị
export type DashboardDeviceStatus = "online" | "offline";

export interface DashboardMapDevice {
  id: number;
  name: string;
  organization?: string;
  address: string;
  lat: number;
  lng: number;
  status: DashboardDeviceStatus;
}

// Màu thẻ thống kê
export type DashboardStatVariant =
  | "pink"
  | "green"
  | "cyan"
  | "blue"
  | "light-pink"
  | "orange";

// Props của DashboardStatCard
export interface DashboardStatCardProps {
  variant: DashboardStatVariant;
  icon?: LucideIcon;
  title: string;
  value: number;
  total?: number;
  unit?: string;
  className?: string;
}
