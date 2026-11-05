import type { LucideIcon } from "lucide-react";

export type DashboardDeviceStatus = "online" | "offline";

export type DashboardFilterStatus = "all" | DashboardDeviceStatus;

export interface DashboardDevice {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: DashboardDeviceStatus;
}

export interface DashboardStat {
  key: string;
  variant: "pink" | "green" | "cyan";
  icon: LucideIcon;
  title: string;
  value: number;
  total?: number;
}

export interface DashboardStorage {
  used: number;
  total: number;
}
