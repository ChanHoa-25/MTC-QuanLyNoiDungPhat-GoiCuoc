export interface Facility {
  id: string;
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
}

export interface FacilityTreeNode {
  id: string;
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  isActive: boolean;
  parentId: string | null;
  children: FacilityTreeNode[];
}

export interface CreateFacilityDto {
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  parentId: string | null;
}

export interface UpdateFacilityDto {
  facilityName: string;
  isActive: boolean;
}
