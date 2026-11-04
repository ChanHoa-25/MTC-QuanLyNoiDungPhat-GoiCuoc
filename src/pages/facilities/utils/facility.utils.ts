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
