export type DeviceStatus = "active" | "inactive";
export type ConnectionStatus = "online" | "offline";
export type BroadcastStatus = "playing" | "stopped";

export interface Device {
  id: string;
  name: string;
  code: string;
  supplier: string;
  location: string;

  facilityId: string;
  facilityName: string;

  status: DeviceStatus;
  connection: ConnectionStatus;
  broadcast: BroadcastStatus;

  // Thông tin bổ sung cho trang chi tiết
  longitude?: string;
  latitude?: string;
  simPhone?: string;
  simSerial?: string;
  supplierPhone?: string;
  description?: string;
}
