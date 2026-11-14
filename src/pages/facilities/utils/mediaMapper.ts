import type { MediaApiItem } from "../../../api/mediaApi";
import type { MediaCategoryApiItem } from "../../../api/mediaCategoryApi";

import type {
  FacilityMediaItem,
  MediaStatus,
  MediaType,
  MediaContentType,
} from "../types/facilityMedia.types";

function mapMediaStatus(status: string): MediaStatus {
  switch (status.trim().toLowerCase()) {
    case "đã duyệt":
      return "approved";

    case "chờ duyệt":
      return "pending";

    case "từ chối duyệt":
      return "rejected";

    case "đang xử lý":
      return "processing";

    default:
      return "processing";
  }
}

function mapMediaType(fileType: string | null): MediaType {
  switch (fileType?.trim().toLowerCase()) {
    case "image":
      return "image";

    case "audio":
    case "frequency":
      return "audio";

    case "video":
    case "livestream":
      return "video";

    default:
      return "image";
  }
}

function mapContentType(sourceType: number): MediaContentType | undefined {
  switch (sourceType) {
    case 0:
      return "file";

    case 1:
      return "url";

    case 2:
      return "live";

    case 3:
      return "frequency";

    default:
      return undefined;
  }
}

function mapContentValue(media: MediaApiItem): string | undefined {
  switch (media.sourceType) {
    case 1:
      return media.sourceUrl ?? undefined;

    case 2:
      return media.url ?? undefined;

    case 3:
      return media.frequencyHz != null ? String(media.frequencyHz) : undefined;

    default:
      return undefined;
  }
}

export function mapMediaToFacilityItem(
  media: MediaApiItem,
  categories: MediaCategoryApiItem[],
): FacilityMediaItem {
  const category = categories.find((item) => item.id === media.categoryId);

  return {
    id: media.id,
    facilityId: media.facilityId ?? "",
    title: media.mediaName,

    category: category?.categoryName ?? "Chưa phân loại",
    categoryId: media.categoryId,
    organizationId: media.organizationId,

    type: mapMediaType(media.fileType),
    fileType: media.fileType ?? undefined,

    status: mapMediaStatus(media.approvalStatus),
    approvalStatus: media.approvalStatus,
    rejectionReason: media.rejectionReason,

    // Backend chưa cung cấp trạng thái nguồn.
    // Giá trị tạm để tương thích với giao diện hiện tại.
    sourceStatus: "active",

    createdAt: media.createdAt,
    createdBy: media.createdBy ?? "Không xác định",

    // Backend lưu dung lượng theo bytes.
    sizeMB: Number(((media.fileSize ?? 0) / (1024 * 1024)).toFixed(2)),

    thumbnail: "",
    url: media.url ?? undefined,

    fileName: media.fileName ?? undefined,

    // Không sử dụng fileType thay cho MIME type.
    mimeType: undefined,

    // Chuyển sourceType từ Backend sang loại nội dung Frontend.
    contentType: mapContentType(media.sourceType),

    // Lấy giá trị nội dung tương ứng với từng phương thức.
    contentValue: mapContentValue(media),

    sourceType: media.sourceType,
    sourceUrl: media.sourceUrl,
    durationSeconds: media.durationSeconds,
    frequencyHz: media.frequencyHz,
  };
}
