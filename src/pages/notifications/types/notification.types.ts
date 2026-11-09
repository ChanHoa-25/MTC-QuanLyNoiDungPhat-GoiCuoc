export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  status: 'sent' | 'unsent' | string;
  statusLabel: string;
  receivers: string; // Chuỗi hiển thị trên bảng
  receiverList: string[]; // Mảng chi tiết dùng trong Form
  sendTime: string;
  createTime: string;
  creator: string;
}

export interface NotificationFormValues {
  title: string;
  content: string;
  receivers: string[];
  time: string;
  date: string;
  sysNotif: boolean;
  emailNotif: boolean;
}

export type ConfirmModalType = 'DELETE_NOTIF' | null;