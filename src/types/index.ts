// Định nghĩa toàn bộ kiểu dữ liệu cho hệ thống MTC theo đặc tả SRS v1.1

export type RoleType = 'Administrator' | 'Creator' | 'IT' | 'Approver' | 'SystemAdmin';

export interface User {
  id: string;
  username: string; // Tên đăng nhập (dạng user@orgCode hoặc sysadmin)
  fullName: string;
  email: string;
  phone: string;
  birthday?: string;
  idCard?: string; // CCCD / CMND
  avatarUrl?: string;
  role: RoleType;
  orgId: string; // Thuộc tổ chức nào
  facilityId: string; // Thuộc cơ sở nào
  isSystemUser: boolean;
  status: 'active' | 'inactive';
  isDelegated: boolean; // Đã phân quyền hay chưa
  lastLogin?: string;
}

export interface TwoFactorSettings {
  isEnabled: boolean;
  enabledDate?: string;
  secretKey: string; // Chuỗi 32 ký tự cố định
  backupCodes: { code: string; used: boolean }[]; // 10 mã dự phòng
  trustedDevices: string[];
}

// 2. Tổ chức (Organization)
export interface Organization {
  id: string;
  orgCode: string;
  name: string;
  currentPackageId: string;
  storageUsedMB: number;
  storageTotalMB: number;
  deviceCount: number;
  maxDevices: number;
  status: 'active' | 'expired' | 'cancelled'; // Còn hạn, Hết hạn, Hủy bỏ tổ chức
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
}

// 3. Cơ sở / Địa bàn (Facility)
export interface Facility {
  id: string;
  orgId: string;
  parentId: string | null; // Cây cha - con
  code: string;
  name: string;
  status: 'active' | 'inactive';
  address: string;
  phone?: string;
}

// 4. Thiết bị (Device)
export type DeviceOS = 'Android' | 'Linux' | 'Windows';
export type DeviceConnectionStatus = 'online' | 'offline';
export type DeviceBroadcastStatus = 'broadcasting' | 'stopped' | 'idle';

export interface Device {
  id: string;
  facilityId: string;
  orgId: string;
  deviceCode: string;
  name: string;
  simPhone: string;
  simSerial: string;
  supplier: string; // Mặc định Alta Media
  os: DeviceOS;
  address: string;
  lat: number;
  lng: number;
  volume: number; // 0 - 100
  status: 'active' | 'inactive'; // Trạng thái hoạt động
  connectionStatus: DeviceConnectionStatus; // Trạng thái kết nối
  broadcastStatus: DeviceBroadcastStatus; // Trạng thái phát
  currentBroadcastTitle?: string;
  oneTimeLoginCode?: string; // Mã QR / 6 số dùng 1 lần
  loginCodeUsed?: boolean;
}

// 5. Nguồn tin / Media
export type MediaType = 'image' | 'audio' | 'video' | 'livestream' | 'frequency';
export type MediaStatus = 'pending' | 'approved' | 'rejected' | 'processing';

export interface MediaItem {
  id: string;
  orgId: string;
  facilityId: string;
  title: string;
  type: MediaType;
  format: string; // mp4, mp3, wav, png, jpg, jpeg, stream, hz
  fileSizeMB: number; // Tối đa 1024 MB (1 GB)
  url: string;
  status: MediaStatus;
  rejectionReason?: string; // Tối đa 510 ký tự
  rejectedAt?: string; // Tự xóa sau 24h
  sharedFromFacilityId?: string; // Đánh dấu nhận từ cơ sở cấp trên
  sharedToFacilityIds?: string[];
  uploaderName: string;
  createdAt: string;
  frequencyHz?: string; // Nếu là loại tần số
  aspectRatio?: string;
}

// 6. Bản mẫu (Template) & Danh sách phát (Playlist)
export interface TemplateItem {
  id: string;
  orgId: string;
  facilityId: string;
  name: string;
  screenRatio: '16:9' | '9:16' | '4:3';
  mediaList: { mediaId: string; title: string; area: string }[];
  isUsed: boolean;
  createdAt: string;
}

export interface PlaylistItem {
  id: string;
  orgId: string;
  facilityId: string;
  name: string;
  mediaItems: { mediaId: string; title: string; durationSec: number }[];
  totalDurationSec: number;
  isUsed: boolean;
  createdAt: string;
}

// 7. Bản tin (Broadcast Campaign)
export type BroadcastType = 'regular' | 'priority'; // Thường, Ưu tiên
export type BroadcastStatus =
  | 'pending' // Chờ duyệt
  | 'rejected' // Từ chối duyệt
  | 'scheduled' // Chưa phát
  | 'upcoming' // Sắp tới lịch (15p trước)
  | 'broadcasting' // Đang phát
  | 'paused' // Tạm ngưng
  | 'waiting' // Chờ phát (phát xong, chờ lịch tiếp)
  | 'completed' // Đã kết thúc
  | 'cancelled'; // Đã hủy

export interface Broadcast {
  id: string;
  orgId: string;
  facilityId: string;
  title: string;
  type: BroadcastType;
  targetMode: 'facility' | 'device'; // Kiểu phát
  targetIds: string[]; // Danh sách ID cơ sở hoặc ID thiết bị
  contentType: 'media' | 'template' | 'playlist';
  contentId: string;
  contentName: string;
  status: BroadcastStatus;
  startDate: string;
  endDate: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  repeatDays: number[]; // 0: CN, 1: T2...
  rejectionReason?: string;
  creatorName: string;
  createdAt: string;
}

// 8. Gói cước (Service Package)
export type PackageStatus = 'active' | 'upcoming' | 'ended' | 'suspended';

export interface ServicePackage {
  id: string;
  name: string;
  storageGB: number;
  durationMonths: number; // 1, 6, 12
  priceVND: number;
  status: PackageStatus;
  startDate: string;
  endDate: string;
  description: string;
  isDefault?: boolean;
}

// 9. Gói nâng cấp (Upgrade Package)
export interface UpgradePackage {
  id: string;
  name: string;
  extraStorageGB: number;
  extraDevices: number;
  durationMonths: number;
  priceVND: number;
  status: 'selling' | 'closed';
  startDate: string;
  endDate: string;
  description: string;
  purchasedCount: number;
}

// 10. Lịch sử giao dịch gói cước
export interface PackageTransaction {
  id: string;
  orgId: string;
  orgName: string;
  packageName: string;
  amountVND: number;
  type: 'buy' | 'renew' | 'upgrade' | 'switch';
  status: 'success' | 'processing' | 'failed' | 'cancelled' | 'unpaid' | 'other';
  createdAt: string;
}

// 11. Thông báo hệ thống & Thông báo nội bộ
export interface SystemNotification {
  id: string;
  code: string; // NTF-01 -> NTF-14
  title: string; // Tối đa 255 ký tự
  content: string; // Tối đa 510 ký tự
  recipientOrgId?: string;
  recipientRole?: RoleType;
  recipientName?: string;
  targetUrl?: string;
  createdAt: string;
  isRead: boolean;
}

// 12. Nhật ký hoạt động (Audit Log)
export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  facilityName: string;
  group: 'Cơ sở' | 'Thiết bị' | 'Media file' | 'Template' | 'Playlist' | 'Bản tin' | 'Người dùng' | 'Vai trò' | 'Lĩnh vực' | 'Gói cước';
  action: string;
  identifier: string; // Tên/mã đối tượng
  oldValue?: string;
  newValue?: string;
}

// 13. Mã lỗi màn hình thiết bị (ERR)
export interface DeviceErrorDefinition {
  code: string; // MTT-CLOCK-001 ...
  type: string;
  title: string;
  condition: string;
  severity: 'error' | 'warning' | 'info';
}

// 14. Thiết bị phản hồi bản tin điện tử (Device Broadcast Feedback)
export type DeviceFeedbackStatus =
  | 'received'    // Đã nhận lịch từ server
  | 'downloading' // Đang tải nội dung
  | 'ready'       // Sẵn sàng phát
  | 'playing'     // Đang phát
  | 'completed'   // Đã phát xong
  | 'failed'      // Phát thất bại / Lỗi
  | 'no_response';// Không phản hồi

export interface DeviceBroadcastFeedback {
  id: string;
  broadcastId: string;
  broadcastTitle: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  facilityId: string;
  facilityName: string;
  feedbackStatus: DeviceFeedbackStatus;
  receivedAt?: string;      // Thời điểm thiết bị nhận được lệnh phát
  startedPlayingAt?: string; // Thời điểm bắt đầu phát thực tế
  completedAt?: string;     // Thời điểm hoàn thành phát
  lastSyncAt: string;       // Lần cuối thiết bị gửi trạng thái về server
  playbackProgress?: number; // % đã phát (0-100)
  errorCode?: string;       // Mã lỗi nếu có (MTT-...)
  errorMessage?: string;    // Mô tả lỗi
  retryCount: number;       // Số lần thử lại
  signalStrength?: number;  // Cường độ tín hiệu (0-100)
  networkType?: '4G' | 'WiFi' | 'LAN' | 'Unknown';
}
