export type DeviceActivityType =
  | "upload_success"
  | "upload_failed"
  | "broadcast"
  | "stop_broadcast"
  | "delete_broadcast"
  | "delete_expired"
  | "reconnected"
  | "disconnected"
  | "restart"
  | "volume_changed";

export type DeviceConnectionFilter = "all" | "online" | "offline";

export interface DeviceActivityHistoryItem {
  id: string;
  deviceId: string;
  time: string;
  activity: string;
  type: DeviceActivityType;
  note: string;
}
