export type DeviceActivityStatus = "active" | "inactive";
export type DeviceConnectionStatus = "connected" | "disconnected";

// Thông tin thiết bị thuộc cơ sở
export interface FacilityDevice {
  id: string;
  facilityId: string;
  identifier: string;
  name: string;
  ipAddress: string;
  facilityName: string;
  activityStatus: DeviceActivityStatus;
  connectionStatus: DeviceConnectionStatus;

  // Thông tin SIM
  provider?: string;
  simPhoneNumber?: string;
  simSerial?: string;
  tag?: string;

  // Vị trí thiết bị
  address?: string;
  longitude?: string;
  latitude?: string;
}

// Dữ liệu form thêm hoặc cập nhật thiết bị
export interface FacilityDeviceFormValues {
  name: string;
  ipAddress: string;
  identifier: string;
  password?: string;
  provider: string;
  simPhoneNumber?: string;
  simSerial?: string;
  tag?: string;
}
