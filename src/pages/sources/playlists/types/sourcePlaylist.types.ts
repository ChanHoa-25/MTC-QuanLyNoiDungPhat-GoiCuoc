import type { SourceMediaType } from "../../media/types/sourceMedia.types";

/** Nguồn thông tin của một phần tử trong danh sách phát. */
export type PlaylistSourceType = "media" | "template";

/** Chế độ phát: ngẫu nhiên hoặc theo thứ tự. */
export type PlaylistPlayMode = "random" | "sequential";

/** SRS 4.3.2: Không sửa / xóa danh sách phát đã được sử dụng. */
export type PlaylistUsageStatus = "in_use" | "unused";

/**
 * Loại bản tin của danh sách phát (theo Figma: "bản tin phát thanh" / "bản tin điện tử").
 * [CẦN XÁC NHẬN] Quy tắc xác định loại bản tin chưa có trong SRS. Tạm thời:
 * chỉ gồm media âm thanh -> phát thanh, còn lại -> điện tử (xem sourcePlaylists.store.ts).
 */
export type PlaylistNewsType = "radio" | "electronic";

/** Một nguồn phát nằm trong danh sách phát. */
export interface PlaylistEntry {
  /** Khóa duy nhất của phần tử trong playlist (một nguồn có thể có id khác nhau theo lần thêm). */
  id: string;
  sourceId: string;
  sourceType: PlaylistSourceType;
  name: string;
  /** Thời lượng phát dạng HH:mm:ss */
  duration: string;
  mediaType?: SourceMediaType;
  thumbnail?: string;
}

export interface SourcePlaylistItem {
  id: string;
  name: string;
  category: string;
  newsType: PlaylistNewsType;
  playMode: PlaylistPlayMode;
  description: string;
  createdBy: string;
  /** Định dạng hiển thị: DD/MM/YYYY HH:mm:ss */
  createdAt: string;
  usageStatus: PlaylistUsageStatus;
  entries: PlaylistEntry[];
}

/** Dữ liệu form khi tạo / cập nhật danh sách phát. */
export interface SourcePlaylistFormValues {
  name: string;
  category: string;
  playMode: PlaylistPlayMode;
  description: string;
  entries: PlaylistEntry[];
}

/** Nguồn có thể chọn để thêm vào danh sách phát (media đã duyệt hoặc bản mẫu). */
export interface PlaylistPickableSource {
  sourceId: string;
  sourceType: PlaylistSourceType;
  name: string;
  duration: string;
  category?: string;
  mediaType?: SourceMediaType;
  thumbnail?: string;
  createdBy: string;
  createdAt: string;
}

