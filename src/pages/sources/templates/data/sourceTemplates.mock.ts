import type { SourceTemplate } from "../types/sourceTemplate.types";

export function createSourceTemplatesMock(): SourceTemplate[] {
  const names = [
    "Những gì bạn không biết về sức khỏe",
    "Thông báo lịch phát thanh",
    "Bản tin tuyên truyền",
    "Thông tin cộng đồng",
    "Chương trình phát thanh",
  ];

  return Array.from({ length: 35 }, (_, index) => ({
    id: `source-template-${index + 1}`,
    name: names[index % names.length],
    aspectRatio:
      index % 3 === 0 ? "1920 x 1080" : index % 3 === 1 ? "16:9" : "9:16",
    createdAt: new Date(2021, 6, 25 + index, 19).toISOString(),
    createdBy: "Tuyết Nguyễn",
    usageStatus: index % 3 === 0 ? "in_use" : "unused",
  }));
}
