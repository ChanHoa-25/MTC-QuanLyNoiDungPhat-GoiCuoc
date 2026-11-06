export type FacilityNewsType = "Tin ưu tiên" | "Tin thường";

export type FacilityNewsApprovalStatus =
  | "Chờ duyệt"
  | "Đã duyệt"
  | "Từ chối duyệt";

export type FacilityNewsBroadcastStatus =
  | "Đang phát"
  | "Tạm ngưng"
  | "Chờ phát"
  | "Đã kết thúc"
  | "Chưa phát"
  | "Sắp tới lịch"
  | "Đã hủy";

export type FacilityNewsRepeatType =
  | "Không lặp"
  | "Hàng ngày"
  | "Ngày trong tuần"
  | "Ngày trong tháng";

export interface FacilityPlaylistNews {
  id: string;
  playlistId: string;
  code: string;
  title: string;
  newsType: FacilityNewsType;
  approvalStatus: FacilityNewsApprovalStatus;
  broadcastStatus?: FacilityNewsBroadcastStatus;
  repeatType?: FacilityNewsRepeatType;
  startDate?: string;
  endDate?: string;
  broadcastTime?: string;
  facilityName: string;
  createdBy: string;
}
