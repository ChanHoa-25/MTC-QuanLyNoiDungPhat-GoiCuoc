import type { SiteMediaItem } from "../types/siteMedia.types";

// Danh sách tên Media
const mediaTitles = [
  "Thông tin buổi sáng",
  "Tin tức trong ngày",
  "Thể dục buổi sáng",
  "Hướng dẫn tập yoga",
  "Thông báo cộng đồng",
  "Chương trình văn nghệ",
  "Bản tin thời sự",
  "Giáo dục sức khỏe",
];

// Danh sách lĩnh vực
const categories = [
  "Tin tức",
  "Thể dục dưỡng sinh",
  "Văn nghệ giải trí",
  "Giáo dục",
];

// Danh sách loại Media
const mediaTypes: SiteMediaItem["type"][] = ["video", "image", "audio"];

// Ảnh đại diện mặc định
const DEFAULT_THUMBNAIL = "/src/assets/images/media.png";

export function createSiteMediaMock(siteId: string): SiteMediaItem[] {
  return Array.from({ length: 48 }, (_, index) => {
    const mediaType = mediaTypes[index % mediaTypes.length];

    return {
      id: `${siteId}-media-${index + 1}`,
      siteId,

      title: mediaTitles[index % mediaTitles.length],

      category: categories[index % categories.length],

      type: mediaType,

      status: index % 4 === 1 ? "pending" : "approved",

      sourceStatus: index % 6 === 0 ? "inactive" : "active",

      createdAt: `2021-08-${String((index % 28) + 1).padStart(
        2,
        "0",
      )}T10:30:00`,

      createdBy: "Tuyết Nguyễn",

      sizeMB: 165,

      thumbnail: DEFAULT_THUMBNAIL,
    };
  });
}
