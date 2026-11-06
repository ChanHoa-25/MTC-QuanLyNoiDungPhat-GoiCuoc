export interface Facility {
  id: string;
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
}
