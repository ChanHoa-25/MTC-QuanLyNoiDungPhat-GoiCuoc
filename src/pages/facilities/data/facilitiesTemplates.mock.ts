import type { FacilityTemplate } from "../types/facilityTemplate.types";

export function createFacilityTemplatesMock(
  facilityId: string,
): FacilityTemplate[] {
  const names = [
    "Những gì bạn không biết về sức khỏe",
    "Thông báo lịch phát thanh",
    "Bản tin tuyên truyền",
    "Thông tin cộng đồng",
    "Chương trình phát thanh",
  ];

  return Array.from({ length: 35 }, (_, index) => ({
    id: `${facilityId}-template-${index + 1}`,
    facilityId,
    name: names[index % names.length],
    aspectRatio:
      index % 3 === 0 ? "1920 x 1080" : index % 3 === 1 ? "16:9" : "9:16",
    createdAt: new Date(2021, 6, 25 + index, 19).toISOString(),
    createdBy: "Tuyết Nguyễn",
  }));
}
