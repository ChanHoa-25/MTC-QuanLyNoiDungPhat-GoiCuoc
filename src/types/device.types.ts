export interface Facility {
  id: string;
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  children?: Facility[];
}

export interface FacilityFormValues {
  facilityCode: string;
  facilityName: string;
  isActive: boolean;
}

export type FacilityAction = "create" | "edit" | "delete";

export type FacilityFormMode = "create" | "edit";

export type FacilityTabKey =
  | "info"
  | "users"
  | "devices"
  | "media"
  | "templates"
  | "playlists";

export interface FacilityTab {
  key: FacilityTabKey;
  label: string;
}

export interface DeviceResponse {
  id: string;
  organizationId: string;
  facilityId: string;
  deviceCode: string;
  deviceName: string;
  description: string | null;
  serialNumber: string | null;
  ipAddress: string | null;
  simPhoneNumber: string | null;
  simSerialNumber: string | null;
  tag: string | null;
  osType: string | null;
  vendorName: string | null;
  deviceVendorId: string | null;
  vendorCode: string | null;
  deviceGroupId: string | null;
  deviceGroupName: string | null;
  activeStatus: boolean;
  connectionStatus: string;
  playStatus: string | null;
  volume: number;
  screenshotUrl: string | null;
  screenshotSizeInBytes: number | null;
  lastScreenshotAt: string | null;
  latitude: number | null;
  longitude: number | null;
  installationAddress: string | null;
  isActivated: boolean;
  hasPendingActivation: boolean;
  activationTokenExpiry: string | null;
  activatedAt: string | null;
  lastOnlineAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface GetDevicesParams {
  organizationId?: string;
  facilityId?: string;
  search?: string;
}

export interface CreateDeviceRequest {
  organizationId: string;
  facilityId: string;
  deviceCode: string;
  deviceName: string;

  description?: string | null;
  serialNumber?: string | null;
  ipAddress?: string | null;
  simPhoneNumber?: string | null;
  simSerialNumber?: string | null;
  tag?: string | null;

  osType: string;

  vendorName?: string | null;
  deviceVendorId?: string | null;
  deviceGroupId?: string | null;

  activeStatus?: boolean;
  volume?: number;

  screenshotUrl?: string | null;
  screenshotSizeInBytes?: number;
  lastScreenshotAt?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  installationAddress?: string | null;
}

export interface UpdateDeviceRequest extends CreateDeviceRequest {
  connectionStatus?: string | null;
  playStatus?: string | null;
  lastOnlineAt?: string | null;
}
