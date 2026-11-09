export type DeviceStatus = "online" | "offline";
export type FilterStatus = "all" | DeviceStatus;

export interface DeviceItem {
  id: number;
  name: string;
  organization: string; // Thêm trường tổ chức theo thiết kế Figma
  address: string;
  lat: number;
  lng: number;
  status: DeviceStatus;
}