export interface DeviceVendor {
  id: string;
  organizationId: string;
  vendorCode: string;
  vendorName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  address: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface GetDeviceVendorsParams {
  organizationId?: string;
  search?: string;
}
