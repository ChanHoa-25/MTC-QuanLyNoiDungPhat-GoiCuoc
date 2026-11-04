import type { Facility } from "../types/facility.types";

// Tìm cơ sở theo ID trong cây địa bàn
export function findFacilityById(
  facilities: Facility[],
  id: string,
): Facility | null {
  for (const facility of facilities) {
    if (facility.id === id) {
      return facility;
    }

    const found = findFacilityById(facility.children ?? [], id);

    if (found) {
      return found;
    }
  }

  return null;
}

// Tìm đường dẫn từ cơ sở gốc đến cơ sở được chọn
export function findFacilityPath(
  facilities: Facility[],
  targetId: string,
): Facility[] {
  for (const facility of facilities) {
    if (facility.id === targetId) {
      return [facility];
    }

    const childPath = findFacilityPath(facility.children ?? [], targetId);

    if (childPath.length > 0) {
      return [facility, ...childPath];
    }
  }

  return [];
}

// Chuyển cây cơ sở thành danh sách phẳng
export function flattenFacilities(facilities: Facility[]): Facility[] {
  return facilities.flatMap((facility) => [
    facility,
    ...flattenFacilities(facility.children ?? []),
  ]);
}

// Lấy ID cơ sở được chọn và toàn bộ cơ sở con
export function getFacilityDescendantIds(
  facilities: Facility[],
  facilityId: string,
): string[] {
  const facility = findFacilityById(facilities, facilityId);

  if (!facility) return [];

  return flattenFacilities([facility]).map((item) => item.id);
}
