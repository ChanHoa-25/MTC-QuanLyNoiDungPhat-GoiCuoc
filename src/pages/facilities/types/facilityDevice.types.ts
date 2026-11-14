export type DeviceActivityStatus = "active" | "inactive";
export type DeviceConnectionStatus = "connected" | "disconnected";
export type DeviceLocationMode = "gps" | "manual";

export interface FacilityDevice {
  id: string;
  facilityId: string;
  identifier: string;
  name: string;
  ipAddress: string;
  facilityName: string;
  activityStatus: DeviceActivityStatus;
  connectionStatus: DeviceConnectionStatus;

  provider?: string;
  simPhoneNumber?: string;
  simSerial?: string;
  tag?: string;

  deviceGroup?: string;
  width?: number;
  height?: number;
  locationMode?: DeviceLocationMode;
  description?: string;

  address?: string;
  longitude?: string;
  latitude?: string;
}

export interface FacilityDeviceFormValues {
  name: string;
  identifier: string;
  osType: string;
  activityStatus: DeviceActivityStatus;
  deviceGroup?: string;
  provider: string;
  simSerial: string;
  simPhoneNumber: string;
  width?: number;
  height?: number;
  locationMode: DeviceLocationMode;
  longitude?: string;
  latitude?: string;
  description?: string;

  ipAddress?: string;
  password?: string;
  tag?: string;
}
