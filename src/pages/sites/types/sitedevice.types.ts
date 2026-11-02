export type DeviceActivityStatus = "active" | "inactive";

export type DeviceConnectionStatus = "connected" | "disconnected";

export interface SiteDevice {
  id: string;
  siteId: string;
  identifier: string;
  name: string;
  ipAddress: string;
  siteName: string;
  activityStatus: DeviceActivityStatus;
  connectionStatus: DeviceConnectionStatus;

  provider?: string;
  simPhoneNumber?: string;
  simSerial?: string;
  tag?: string;

  address?: string;
  longitude?: string;
  latitude?: string;
}

export interface SiteDeviceFormValues {
  name: string;
  ipAddress: string;
  identifier: string;
  password?: string;
  provider: string;
  simPhoneNumber?: string;
  simSerial?: string;
  tag?: string;
}
