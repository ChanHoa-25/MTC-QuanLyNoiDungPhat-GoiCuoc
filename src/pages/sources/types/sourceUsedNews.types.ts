/**
 * Kiểu dữ liệu dùng chung cho tab "Bản tin sử dụng" của các nguồn thông tin
 * (bản mẫu, danh sách phát, ...) trong module Quản lý nguồn thông tin (TV4).
 *
 * Lưu ý: Tên trường hiện tại phục vụ giao diện + mock. Khi backend có API bản tin
 * (thuộc phạm vi TV5 / backend), cần đối chiếu DTO thực tế và viết adapter nếu khác.
 */

export type BroadcastType = "urgent" | "normal";

export type BroadcastApprovalStatus = "approved" | "pending" | "rejected";

export type BroadcastPlayStatus =
  | "playing"
  | "paused"
  | "waiting"
  | "ended"
  | "cancelled";

export type BroadcastRepeatType = "none" | "daily" | "weekly" | "monthly";

export interface SourceUsedNewsItem {
  id: string;
  code: string;
  title: string;
  type: BroadcastType;
  approvalStatus: BroadcastApprovalStatus;
  playStatus: BroadcastPlayStatus;
  repeatType: BroadcastRepeatType;
  /** Định dạng hiển thị: "DD/MM/YYYY - DD/MM/YYYY" hoặc "-" khi chưa có lịch */
  broadcastDate: string;
  broadcastTime: string;
  facilityName: string;
  createdBy: string;
}

/** Thao tác hàng loạt trên danh sách bản tin sử dụng (kích hoạt từ ActionPanel). */
export type SourceUsedNewsAction = "delete" | "cancel";

