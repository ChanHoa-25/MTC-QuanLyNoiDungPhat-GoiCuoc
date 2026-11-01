import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import avatarImage from "../../assets/images/avatar.png";

export interface ProfileData {
  lastName: string;
  firstName: string;
  birthday: Dayjs | null;
  phone: string;
  email: string;
  role: string;
  timezone: string;
}

export interface SubscriptionData {
  capacity: string;
  cycle: string;
  expirationDate: string;
  autoRenew: boolean;
}

export const mockProfile: ProfileData = {
  lastName: "Nguyễn",
  firstName: "Chinh",
  birthday: dayjs("1998-02-02"),
  phone: "+84 250 137 008",
  email: "chinhnguyen889@gmail.com",
  role: "organization-admin",
  timezone: "Asia/Ho_Chi_Minh",
};

export const mockAvatar = avatarImage;

export const mockSubscription: SubscriptionData = {
  capacity: "5GB",
  cycle: "/Tháng",
  expirationDate: "01/02/2023",
  autoRenew: false,
};

export const mockRoleOptions = [
  {
    value: "organization-admin",
    label: "Quản trị viên tổ chức",
  },
];

export const mockTimezoneOptions = [
  {
    value: "Asia/Ho_Chi_Minh",
    label: "Hà Nội (GMT+07:00)",
  },
];
